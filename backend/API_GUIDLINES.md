API DEVELOPMENT GUIDELINES
Project: AnEet - An platform for everyone order fastfood with at store and delivery from their home. 
Target Level: Level 3 (Optimization, Safety & Consistency) 
Core Objective: Đảm bảo hệ thống chịu tải cao, xử lý đồng bộ (concurrency) chính xác, ngăn chặn lỗi khi nhiều user đặt hàng cùng lúc.

1. Request Dạng Đọc (GET) - Level 3
Mục tiêu: Tối ưu hóa trải nghiệm người dùng (UX), bảo mật dữ liệu và giảm tải cho Database.

1.1. Query Parameters (Input)
API phải hỗ trợ linh hoạt các tham số sau trên URL:

Pagination: Bắt buộc cho các list trả về nhiều bản ghi.

Format: ?page=1&limit=20

Sorting: Cho phép sắp xếp theo trường chỉ định.

Format: ?sort=-created_at (Dấu - là giảm dần, không dấu là tăng dần).

Filtering: Lọc theo các trường cụ thể.

Format: ?status=active&category_id=5

Search: Tìm kiếm theo từ khóa (Full-text search hoặc ILIKE).

Format: ?search=iphone

Field Selection: (Optional) Chỉ lấy các trường cần thiết để giảm payload.

Format: ?fields=id,name,price

1.2. Response DTO (Output)
Nguyên tắc: KHÔNG BAO GIỜ trả về Raw Entity (SELECT *) từ Database.

Data Cleaning: Sử dụng Mapper/DTO để loại bỏ các trường nhạy cảm (password, internal_token, deleted_at).

Standard Format:

JSON

{
  "success": true,
  "code": 200,
  "data": [ ... ], // Array of DTOs
  "meta": {        // Pagination Metadata
    "current_page": 1,
    "total_pages": 10,
    "limit": 20,
    "total_items": 200
  }
}
1.3. Logic Query
Luôn áp dụng điều kiện WHERE deleted_at IS NULL mặc định (trừ API dành riêng cho Admin/Audit).

2. Request Dạng Ghi (POST, PUT, DELETE) - Level 3
Mục tiêu: Đảm bảo tính toàn vẹn dữ liệu (Data Integrity) và xử lý tranh chấp (Race Condition).

2.1. Validation (Lớp bảo vệ đầu tiên)
Sử dụng thư viện Validation (Zod, Joi, Yup) tại tầng Controller/Middleware.

Rule: Từ chối ngay lập tức (400 Bad Request) nếu dữ liệu input không hợp lệ. Không được để dữ liệu rác đi xuống tầng Service.

2.2. Soft Delete
Không xóa vật lý (DELETE FROM).

Sử dụng update cờ: UPDATE table SET deleted_at = NOW() WHERE id = ?.

2.3. Transaction & Concurrency Control (CRITICAL)
Đây là phần quan trọng nhất để xử lý việc "nhiều người mua cùng lúc".

Phạm vi áp dụng: Tất cả các luồng nghiệp vụ tác động đến >1 bảng hoặc cần tính nhất quán (VD: Tạo đơn hàng, Thanh toán).

Cơ chế Locking: Sử dụng Pessimistic Locking (SELECT ... FOR UPDATE) để khóa dòng dữ liệu sản phẩm trong quá trình giao dịch.

Workflow bắt buộc:

Begin Transaction.

Lock: Query lấy thông tin sản phẩm và KHÓA dòng đó lại (FOR UPDATE).

Validate Logic: Kiểm tra tồn kho (stock >= quantity). Nếu sai -> Rollback.

Update: Trừ tồn kho (stock = stock - quantity).

Insert: Tạo bản ghi Order.

Commit Transaction.

3. General Standards - Level 3
Mục tiêu: Chuẩn hóa, bảo mật và dễ dàng debug.

3.1. Authentication & Authorization
AuthN: Xác thực user qua JWT tại Middleware. Inject user_id vào req object.

AuthZ: Kiểm tra quyền (Role-based) trước khi thực thi logic nghiệp vụ.

3.2. Global Error Handling
Không sử dụng try-catch cục bộ để trả response res.status(500) rải rác.

Tất cả lỗi phải được đẩy về Error Handling Middleware cuối cùng bằng next(error).

Phân loại lỗi:

Operational Errors (4xx): Lỗi do user (Input sai, hết hàng, không đủ tiền). Trả message rõ ràng cho user.

System Errors (5xx): Lỗi do code hoặc hạ tầng (DB connect fail). Trả message chung chung "Internal Server Error" nhưng GHI LOG CHI TIẾT (Stack trace) ra server.

3.3. Standard Response Wrapper
Tất cả API (GET/POST/PUT/DELETE) phải trả về cùng một cấu trúc JSON:

JSON

{
  "success": boolean,
  "code": number,      // HTTP Status Code
  "message": string,   // User-friendly message
  "data": object|null, // Payload
  "errors": object|null // Chi tiết lỗi (nếu có, dùng cho debug/validation form)
}
4. Implementation Example (Node.js)
Dưới đây là ví dụ triển khai Transaction với Locking để xử lý Mua hàng:

JavaScript

/**
 * Controller: Create Order
 * Level: 3 (Transaction + Locking + Validation + Standard Response)
 */
const createOrder = async (req, res, next) => {
  // 1. Start Transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { productId, quantity } = req.body; // Đã qua lớp Validation middleware

    // 2. LOCKING & CHECK (Concurrency Safe)
    // "FOR UPDATE" sẽ chặn các request khác đang cố đọc/ghi dòng này
    const productRes = await client.query(
      `SELECT price, stock FROM products WHERE id = $1 FOR UPDATE`, 
      [productId]
    );
    
    const product = productRes.rows[0];

    // 3. Logic Validation
    if (!product) throw new AppError(404, 'Sản phẩm không tồn tại');
    if (product.stock < quantity) throw new AppError(400, 'Hết hàng');

    // 4. Update Stock
    await client.query(
      `UPDATE products SET stock = stock - $1 WHERE id = $2`,
      [quantity, productId]
    );

    // 5. Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, product_id, total) VALUES ($1, $2, $3) RETURNING id`,
      [req.user.id, productId, product.price * quantity]
    );

    // 6. Commit
    await client.query('COMMIT');

    // 7. Success Response
    res.status(201).json({
      success: true,
      code: 201,
      message: 'Đặt hàng thành công',
      data: { orderId: orderRes.rows[0].id }
    });

  } catch (e) {
    // 8. Rollback & Error Handling
    await client.query('ROLLBACK');
    next(e); // Chuyển cho Global Error Handler
  } finally {
    client.release();
  }
};