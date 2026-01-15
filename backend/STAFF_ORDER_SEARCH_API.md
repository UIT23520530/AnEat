# Staff Order Search API - Hướng Dẫn Sử Dụng 🔍

## 🎯 Tổng Quan

API tìm kiếm thống nhất (unified search) cho trang Order của Staff. Tìm kiếm đồng thời trên cả **Categories** và **Products** bằng một keyword duy nhất.

### Thông Tin Cơ Bản
- **Base URL:** `http://localhost:3001/api/v1/staff`
- **Authentication:** Bearer Token (Role: STAFF)
- **Response Format:** JSON (Level 3 API Standards)
- **Endpoints:** 2 endpoints chính

---

## 📡 Danh Sách Endpoints

### 1. Unified Search (Tìm Kiếm Tổng Hợp) 🔎

```http
GET /api/v1/staff/order/search
```

**Mục đích:** Tìm kiếm đồng thời cả categories và products theo keyword.

**Query Parameters:**

| Tham số | Kiểu   | Mô tả                              | Mặc định | Bắt buộc |
|---------|--------|------------------------------------|----------|----------|
| q       | string | Từ khóa tìm kiếm                   | -        | ✅       |
| page    | number | Số trang (products pagination)     | 1        | ❌       |
| limit   | number | Số products mỗi trang (max: 100)   | 20       | ❌       |

**Response Success (200):**

```json
{
  "success": true,
  "code": 200,
  "message": "Tìm kiếm thành công",
  "data": {
    "categories": [
      {
        "id": "cmk8ch41m00015nu9ccf2efka",
        "code": "GA_RAN",
        "name": "Gà Rán",
        "description": "Gà rán, cánh gà, gà viên",
        "imageUrl": null,
        "productCount": 33,
        "type": "category"
      }
    ],
    "products": [
      {
        "id": "cm5abc123",
        "code": "GA_GION_01",
        "name": "Gà Rán Giòn",
        "description": "2 miếng gà giòn tan",
        "price": 45000,
        "imageUrl": "https://example.com/ga-ran.jpg",
        "prepTime": 15,
        "inStock": true,
        "stockQuantity": 50,
        "category": {
          "id": "cmk8ch41m00015nu9ccf2efka",
          "code": "GA_RAN",
          "name": "Gà Rán"
        },
        "type": "product"
      }
    ],
    "totals": {
      "categories": 1,
      "products": 15,
      "all": 16
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**Response Error (400 - Empty Query):**

```json
{
  "success": false,
  "code": 400,
  "message": "Vui lòng nhập từ khóa tìm kiếm",
  "data": null
}
```

**Tính Năng:**
- ✅ Tìm kiếm trong: name, code, description
- ✅ Case-insensitive (không phân biệt hoa thường)
- ✅ Hỗ trợ tiếng Việt có dấu
- ✅ Partial match (khớp một phần)
- ✅ Pagination cho products
- ✅ Filter theo branch của staff

**Ví Dụ Curl:**

```bash
# Tìm "gà"
curl -X GET "http://localhost:3001/api/v1/staff/order/search?q=gà&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"

# Tìm "burger"
curl -X GET "http://localhost:3001/api/v1/staff/order/search?q=burger" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"

# Tìm "tráng miệng" (Vietnamese with accents)
curl -X GET "http://localhost:3001/api/v1/staff/order/search?q=tráng%20miệng" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"
```

---

### 2. Quick Search (Autocomplete) ⚡

```http
GET /api/v1/staff/order/search/quick
```

**Mục đích:** Tìm kiếm nhanh cho autocomplete dropdown (khi user đang gõ).

**Query Parameters:**

| Tham số | Kiểu   | Mô tả            | Bắt buộc |
|---------|--------|------------------|----------|
| q       | string | Từ khóa tìm kiếm | ✅       |

**Response Success (200):**

```json
{
  "success": true,
  "code": 200,
  "message": "Tìm kiếm nhanh thành công",
  "data": {
    "categories": [
      {
        "id": "cmk8ch41m00015nu9ccf2efka",
        "code": "GA_RAN",
        "name": "Gà Rán",
        "imageUrl": null,
        "type": "category"
      }
    ],
    "products": [
      {
        "id": "cm5abc123",
        "code": "GA_GION_01",
        "name": "Gà Rán Giòn",
        "price": 45000,
        "imageUrl": "https://example.com/ga-ran.jpg",
        "categoryName": "Gà Rán",
        "type": "product"
      }
    ]
  }
}
```

**Đặc Điểm:**
- ⚡ Nhanh (không có pagination)
- 🎯 Limited results: Max **5 categories** + **10 products**
- 📦 Chỉ trả về fields thiết yếu
- 🔄 Tìm trong: name, code (không search description)

**Ví Dụ Curl:**

```bash
curl -X GET "http://localhost:3001/api/v1/staff/order/search/quick?q=gà" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"
```

---

## 🚀 Hướng Dẫn Test Bằng Postman

### Bước 1: Import Collection

1. Mở Postman
2. Click **Import** → Chọn file: `postman/staff-order-search.postman_collection.json`
3. Collection "Staff - Order Search API" sẽ xuất hiện với 5 requests

### Bước 2: Set Staff Token

1. Mở `tokens.json` → Copy token của `staff.BR001.0@aneat.com`
2. Trong Postman: Click Collection → **Variables** tab
3. Set `staff_token` = token đã copy
4. Click **Save**

### Bước 3: Test Các Endpoints

#### ✅ Test 1: Unified Search

1. Chọn request **"1. Unified Search (Categories + Products)"**
2. Query parameter `q` đã có giá trị: `gà`
3. Click **Send**
4. **Kết quả mong đợi:**
   - Status: `200 OK`
   - Response có cả `categories` và `products` arrays
   - Totals shows count của mỗi type

**Thử các keywords khác:**
- `burger` → Burger category + burger products
- `combo` → Combo category + combo products
- `đồ uống` → Beverage category + drinks

#### ✅ Test 2: Quick Search

1. Chọn request **"2. Quick Search (Autocomplete)"**
2. Click **Send**
3. **Kết quả mong đợi:**
   - Fast response
   - Max 5 categories + 10 products
   - Simplified structure

#### ✅ Test 3: Search with Pagination

1. Chọn request **"3. Search with Pagination"**
2. Params: `q=burger`, `page=2`, `limit=10`
3. Click **Send**
4. **Kết quả mong đợi:**
   - Page 2 của burger products

#### ✅ Test 4: Empty Search Validation

1. Chọn request **"4. Empty Search (Validation Error)"**
2. `q` parameter is empty
3. Click **Send**
4. **Kết quả mong đợi:**
   - Status: `400 Bad Request`
   - Message: "Vui lòng nhập từ khóa tìm kiếm"

#### ✅ Test 5: Vietnamese Keywords

1. Chọn request **"5. Search Vietnamese Keywords"**
2. `q=tráng miệng`
3. Click **Send**
4. **Kết quả mong đợi:**
   - Finds "Tráng Miệng" category
   - Vietnamese accents work perfectly

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### 1. 400 Bad Request (Empty Query)

**Lỗi:**
```json
{
  "success": false,
  "code": 400,
  "message": "Vui lòng nhập từ khóa tìm kiếm"
}
```

**Nguyên nhân:** Query parameter `q` bị empty hoặc chỉ có spaces

**Cách fix:**
- Đảm bảo `q` có giá trị
- Minimum 1 ký tự (sau khi trim)

---

### 2. 401 Unauthorized

**Nguyên nhân:** Chưa set Bearer Token

**Cách fix:**
1. Kiểm tra token trong `tokens.json`
2. Set `staff_token` variable trong Postman
3. Hoặc thêm vào Authorization tab

---

### 3. Empty Results

**Response:**
```json
{
  "categories": [],
  "products": [],
  "totals": { "all": 0 }
}
```

**Nguyên nhân:**
- Keyword không match bất kỳ item nào
- Tất cả items matching đều inactive
- Branch của staff không có products

**Không phải lỗi** - đây là kết quả hợp lệ khi không tìm thấy gì

---

## 📊 Use Cases Thực Tế

### Use Case 1: Search Box with Autocomplete

**Flow:**
1. User starts typing: "gà"
2. Call `/order/search/quick?q=gà`
3. Show dropdown with suggestions
4. User clicks suggestion → Navigate to detail

**Code Frontend (React):**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [suggestions, setSuggestions] = useState({ categories: [], products: [] });

const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setSearchQuery(query);
  
  if (query.trim().length === 0) {
    setSuggestions({ categories: [], products: [] });
    return;
  }
  
  // Debounce for better performance
  const response = await fetch(
    `http://localhost:3001/api/v1/staff/order/search/quick?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${staffToken}`
      }
    }
  );
  
  const result = await response.json();
  if (result.success) {
    setSuggestions(result.data);
  }
};

// Render suggestions dropdown
<Dropdown>
  {suggestions.categories.map(cat => (
    <DropdownItem key={cat.id} type="category">
      {cat.name}
    </DropdownItem>
  ))}
  {suggestions.products.map(prod => (
    <DropdownItem key={prod.id} type="product">
      {prod.name} - {prod.price}đ
    </DropdownItem>
  ))}
</Dropdown>
```

---

### Use Case 2: Full Search Results Page

**Flow:**
1. User submits search: "burger"
2. Call `/order/search?q=burger&page=1&limit=20`
3. Display categories section + products grid with pagination

**Code Frontend:**
```typescript
const performSearch = async (query: string, page: number = 1) => {
  const response = await fetch(
    `http://localhost:3001/api/v1/staff/order/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${staffToken}`
      }
    }
  );
  
  const result = await response.json();
  
  if (result.success) {
    // Display categories (if any)
    if (result.data.categories.length > 0) {
      setCategoriesSection(result.data.categories);
    }
    
    // Display products with pagination
    setProducts(result.data.products);
    setPagination(result.data.pagination);
    
    // Show totals
    setTotals(result.data.totals); // "Tìm thấy 16 kết quả (1 danh mục, 15 sản phẩm)"
  }
};
```

---

### Use Case 3: Search Result Navigation

**User clicks on search result:**

```typescript
const handleResultClick = (item: SearchResult) => {
  if (item.type === 'category') {
    // Navigate to category page
    router.push(`/order/category/${item.id}`);
  } else if (item.type === 'product') {
    // Open product detail modal
    showProductDetailModal(item.id);
  }
};
```

---

## 🔧 Technical Notes

### Search Logic

**Categories search in:**
- `name` (e.g., "Gà Rán")
- `code` (e.g., "GA_RAN")
- `description` (unified search only)

**Products search in:**
- `name` (e.g., "Gà Rán Giòn")
- `code` (e.g., "GA_GION_01")
- `description` (unified search only)

**Filters applied:**
- Categories: `isActive = true`
- Products: `isAvailable = true` AND `branchId = staff.branchId`

### Performance Optimization

**Unified Search:**
- Parallel queries (categories + products)
- Pagination on products only
- Full-text search with indexes

**Quick Search:**
- Limited results (5 + 10)
- Simplified queries
- Faster response time
- Ideal for autocomplete

### Response Type Field

Each item has `type` field for easy handling:
- `"type": "category"` → Category result
- `"type": "product"` → Product result

**Frontend can:**
```typescript
if (item.type === 'category') {
  renderCategoryCard(item);
} else {
  renderProductCard(item);
}
```

---

## 📋 Checklist Test

- [ ] Import Postman collection
- [ ] Set staff token variable
- [ ] Test unified search với keyword "gà" → Status 200
- [ ] Test quick search với keyword "burger" → Status 200
- [ ] Test pagination (page 2, limit 10) → Correct page
- [ ] Test empty query → Status 400
- [ ] Test Vietnamese keywords → Works
- [ ] Test với Admin token → Status 403
- [ ] Test without token → Status 401
- [ ] Verify `type` field in results (category/product)

---

## 🔮 Enhancements (Future)

### 1. Search History
- Store recent searches
- Show search suggestions from history

### 2. Popular Searches
- Track most searched keywords
- Show trending searches

### 3. Search Filters
- Filter by price range
- Filter by category
- Sort results

### 4. Fuzzy Search
- Handle typos: "gà" → "ga", "gã"
- Vietnamese diacritics normalization

---

## 📞 Support

**Nếu gặp lỗi:**
1. Server running: `npm run dev` (port 3001)
2. Token còn hạn: check `tokens.json`
3. Database có data: `npx prisma db seed`

**Generate tokens:**
```bash
cd backend
npm run generate-tokens
```

---

**✅ Search API sẵn sàng cho Frontend!** 🔍🎉
