# 📁 Category Management API

## 📋 Tổng Quan

API quản lý danh mục sản phẩm (Categories) trong hệ thống AnEat. Các danh mục được sử dụng để phân loại sản phẩm và giúp khách hàng dễ dàng tìm kiếm món ăn.

## 🔑 Authorization

Tất cả endpoints yêu cầu authentication và chỉ dành cho:
- **ADMIN_SYSTEM**: Toàn quyền
- **ADMIN_BRAND** (Manager): Quản lý categories của chi nhánh

## 📍 Endpoints

### 1. Get All Categories

**GET** `/api/v1/categories`

Lấy danh sách tất cả categories với pagination và filtering.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Trang hiện tại |
| limit | number | No | 10 | Số items mỗi trang |
| sort | string | No | createdAt | Trường để sort (createdAt, name, code) |
| order | string | No | desc | Thứ tự sort (asc, desc) |
| search | string | No | - | Tìm kiếm theo name hoặc code |
| isActive | boolean | No | - | Lọc theo trạng thái (true/false) |

**Example Request:**
```bash
GET /api/v1/categories?page=1&limit=10&isActive=true&search=Burger
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Category list retrieved successfully",
  "data": [
    {
      "id": "clabcd1234567890",
      "code": "BURGER",
      "name": "Burger",
      "description": "Các loại bánh burger",
      "image": "https://example.com/burger.jpg",
      "isActive": true,
      "createdAt": "2024-12-30T10:00:00.000Z",
      "updatedAt": "2024-12-30T10:00:00.000Z",
      "_count": {
        "products": 7
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "limit": 10,
    "totalItems": 6
  }
}
```

---

### 2. Get Category by ID

**GET** `/api/v1/categories/:id`

Lấy thông tin chi tiết của một category.

**URL Parameters:**
- `id` (string): Category ID

**Example Request:**
```bash
GET /api/v1/categories/clabcd1234567890
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Category retrieved successfully",
  "data": {
    "id": "clabcd1234567890",
    "code": "BURGER",
    "name": "Burger",
    "description": "Các loại bánh burger",
    "image": "https://example.com/burger.jpg",
    "isActive": true,
    "createdAt": "2024-12-30T10:00:00.000Z",
    "updatedAt": "2024-12-30T10:00:00.000Z",
    "_count": {
      "products": 7
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "code": 404,
  "message": "Category not found"
}
```

---

### 3. Create Category

**POST** `/api/v1/categories`

Tạo category mới.

**Request Body:**
```json
{
  "code": "SANDWICH",
  "name": "Bánh Mì Sandwich",
  "description": "Các loại bánh mì sandwich",
  "image": "https://example.com/sandwich.jpg"
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| code | string | ✅ Yes | 2-50 ký tự, chỉ chữ HOA, số, gạch ngang, gạch dưới |
| name | string | ✅ Yes | 2-255 ký tự |
| description | string | No | Mô tả về category |
| image | string | No | URL hợp lệ |

**Success Response (201 Created):**
```json
{
  "success": true,
  "code": 201,
  "message": "Category created successfully",
  "data": {
    "id": "clnew1234567890",
    "code": "SANDWICH",
    "name": "Bánh Mì Sandwich",
    "description": "Các loại bánh mì sandwich",
    "image": "https://example.com/sandwich.jpg",
    "isActive": true,
    "createdAt": "2024-12-30T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request - Duplicate Code):**
```json
{
  "success": false,
  "code": 400,
  "message": "Category code already exists"
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "success": false,
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "code",
      "message": "Code must contain only uppercase letters, numbers, hyphens and underscores"
    }
  ]
}
```

---

### 4. Update Category

**PUT** `/api/v1/categories/:id`

Cập nhật thông tin category. **Lưu ý:** Không thể thay đổi `code`.

**URL Parameters:**
- `id` (string): Category ID

**Request Body (Partial Update):**
```json
{
  "name": "Bánh Mì & Sandwich",
  "description": "Các loại bánh mì sandwich ngon",
  "image": "https://example.com/new-sandwich.jpg",
  "isActive": true
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| name | string | No | 2-255 ký tự |
| description | string | No | Mô tả mới |
| image | string | No | URL hợp lệ |
| isActive | boolean | No | true/false để ẩn/hiện category |

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Category updated successfully",
  "data": {
    "id": "clnew1234567890",
    "code": "SANDWICH",
    "name": "Bánh Mì & Sandwich",
    "description": "Các loại bánh mì sandwich ngon",
    "image": "https://example.com/new-sandwich.jpg",
    "isActive": true,
    "updatedAt": "2024-12-30T11:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "code": 404,
  "message": "Category not found"
}
```

---

### 5. Toggle Category Status

**PUT** `/api/v1/categories/:id`

Ẩn/hiện category bằng cách update `isActive`.

**URL Parameters:**
- `id` (string): Category ID

**Request Body:**
```json
{
  "isActive": false
}
```

**Use Cases:**
- `isActive: false` → Ẩn category khỏi menu khách hàng
- `isActive: true` → Hiện lại category

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Category updated successfully",
  "data": {
    "id": "clabcd1234567890",
    "code": "BURGER",
    "name": "Burger",
    "isActive": false,
    "updatedAt": "2024-12-30T11:30:00.000Z"
  }
}
```

---

### 6. Delete Category

**DELETE** `/api/v1/categories/:id`

Xóa category vĩnh viễn. **Chỉ xóa được nếu category không có sản phẩm.**

**URL Parameters:**
- `id` (string): Category ID

**Example Request:**
```bash
DELETE /api/v1/categories/clnew1234567890
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Category deleted successfully"
}
```

**Error Response (400 Bad Request - Has Products):**
```json
{
  "success": false,
  "code": 400,
  "message": "Cannot delete category with existing products"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "code": 404,
  "message": "Category not found"
}
```

---

## 🎯 Common Use Cases

### 1. Tạo Category Mới
```bash
POST /api/v1/categories
{
  "code": "PIZZA",
  "name": "Pizza",
  "description": "Các loại pizza Ý"
}
```

### 2. Ẩn Category (không xóa)
```bash
PUT /api/v1/categories/clabcd1234567890
{
  "isActive": false
}
```

### 3. Tìm Categories Đang Hiển Thị
```bash
GET /api/v1/categories?isActive=true
```

### 4. Tìm Categories Có Từ Khóa
```bash
GET /api/v1/categories?search=burger
```

### 5. Lấy Categories Đã Ẩn
```bash
GET /api/v1/categories?isActive=false
```

---

## 📊 Database Schema

```prisma
model ProductCategory {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  description String?
  image       String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    Product[]
}
```

---

## 🚨 Error Codes

| HTTP Code | Error Code | Message | Description |
|-----------|------------|---------|-------------|
| 200 | 200 | Success | Request thành công |
| 201 | 201 | Created | Category đã được tạo |
| 400 | 400 | Bad Request | Validation error hoặc duplicate code |
| 401 | 401 | Unauthorized | Chưa đăng nhập hoặc token không hợp lệ |
| 403 | 403 | Forbidden | Không có quyền truy cập |
| 404 | 404 | Not Found | Category không tồn tại |
| 500 | 500 | Server Error | Lỗi server |

---

## 🧪 Testing với Postman

### Setup
1. Import collection: `AnEat_Product_API.postman_collection.json`
2. Login để lấy token: **Auth → Login as Manager**
3. Token tự động lưu vào `{{accessToken}}`

### Test Flow
1. **Get All Categories** → Xem danh sách
2. **Create Category** → Tạo mới (tự động lưu ID)
3. **Get Category by ID** → Xem chi tiết
4. **Update Category** → Sửa thông tin
5. **Toggle Status** → Ẩn/hiện
6. **Delete Category** → Xóa (nếu chưa có products)

---

## 💡 Best Practices

### 1. Category Code Naming
```
✅ GOOD:
- BURGER
- FRIED_CHICKEN
- SIDE_DISHES
- BEVERAGES

❌ BAD:
- burger (không uppercase)
- Burger123! (có ký tự đặc biệt)
- brg (quá ngắn, không rõ nghĩa)
```

### 2. Soft Delete vs Hard Delete
- **Ẩn category** (`isActive: false`): Khuyến khích dùng khi tạm thời không bán
- **Xóa category**: Chỉ dùng khi chắc chắn không dùng nữa

### 3. Tìm kiếm hiệu quả
```bash
# Tìm theo tên (case-insensitive)
GET /categories?search=burger

# Kết hợp filter và search
GET /categories?search=burger&isActive=true&limit=20
```

### 4. Pagination cho UX tốt
```bash
# Trang đầu
GET /categories?page=1&limit=10

# Trang tiếp theo
GET /categories?page=2&limit=10
```

---

## 🔧 Frontend Integration

### Service Methods
```typescript
// category.service.ts
categoryService.getCategories({ page: 1, limit: 10, isActive: true })
categoryService.getCategoryById(id)
categoryService.createCategory(data)
categoryService.updateCategory(id, data)
categoryService.deleteCategory(id)
```

### Page Location
```
/manager/categories
```

### Features
- ✅ Danh sách categories với pagination
- ✅ Tìm kiếm theo tên/mã
- ✅ Thêm category mới
- ✅ Chỉnh sửa category
- ✅ Ẩn/hiện category
- ✅ Xóa category (nếu chưa có products)
- ✅ Hiển thị số lượng sản phẩm trong mỗi category
- ✅ Statistics: Tổng/Đang hiển thị/Đã ẩn

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra backend logs
2. Xem Postman Console (View → Show Postman Console)
3. Verify database: `npx prisma studio`
4. Check authentication token
