# Staff Management API Documentation

API endpoints để quản lý nhân viên (staffs) cho Manager trong hệ thống AnEat.

## Base URL
```
/api/v1/manager
```

## Authentication
Tất cả các endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

Chỉ Manager (role: ADMIN_SYSTEM, ADMIN_BRAND, hoặc STAFF với quyền manager) mới có thể truy cập các endpoints này.

---

## Endpoints

### 1. Get Staff List (với Pagination, Sorting, Filtering)

**GET** `/api/v1/manager/staffs`

Lấy danh sách nhân viên trong chi nhánh của manager với hỗ trợ phân trang, sắp xếp và tìm kiếm.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Số trang |
| limit | number | 10 | Số lượng items mỗi trang |
| sort | string | createdAt | Trường để sắp xếp (id, name, email, createdAt, etc.) |
| order | string | desc | Thứ tự sắp xếp (asc, desc) |
| search | string | - | Tìm kiếm theo name, email, phone |
| isActive | string | - | Lọc theo trạng thái active (true/false) |

#### Example Request
```bash
GET /api/v1/manager/staffs?page=1&limit=10&sort=name&order=asc&search=john&isActive=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "staff": [
      {
        "id": "clx1abc123",
        "email": "john.doe@aneat.com",
        "name": "John Doe",
        "phone": "0901234567",
        "avatar": "https://example.com/avatar.jpg",
        "isActive": true,
        "createdAt": "2024-12-01T10:00:00.000Z",
        "lastLogin": "2024-12-30T08:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Staff by ID

**GET** `/api/v1/manager/staffs/:id`

Lấy thông tin chi tiết của một nhân viên trong chi nhánh.

#### URL Parameters
- `id` (string, required): Staff ID

#### Example Request
```bash
GET /api/v1/manager/staffs/clx1abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "staff": {
      "id": "clx1abc123",
      "email": "john.doe@aneat.com",
      "name": "John Doe",
      "phone": "0901234567",
      "avatar": "https://example.com/avatar.jpg",
      "role": "STAFF",
      "branchId": "clx1branch1",
      "branch": {
        "id": "clx1branch1",
        "name": "AnEat District 1",
        "code": "Q1"
      },
      "isActive": true,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-30T08:30:00.000Z",
      "lastLogin": "2024-12-30T08:30:00.000Z"
    }
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "status": "error",
  "message": "Staff not found in your branch"
}
```

---

### 3. Create New Staff

**POST** `/api/v1/manager/staffs`

Tạo nhân viên mới trong chi nhánh của manager.

#### Request Body
```json
{
  "email": "newstaff@aneat.com",
  "password": "securepassword123",
  "name": "Jane Smith",
  "phone": "0912345678",
  "avatar": "https://example.com/avatar.jpg"  // optional
}
```

#### Validation Rules
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `name`: 3-255 characters, required
- `phone`: 10-11 digits, required
- `avatar`: Optional URL string

#### Example Request
```bash
POST /api/v1/manager/staffs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "newstaff@aneat.com",
  "password": "securepassword123",
  "name": "Jane Smith",
  "phone": "0912345678"
}
```

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Staff created successfully",
  "data": {
    "staff": {
      "id": "clx1new456",
      "email": "newstaff@aneat.com",
      "name": "Jane Smith",
      "phone": "0912345678",
      "role": "STAFF",
      "avatar": null,
      "branchId": "clx1branch1",
      "branch": {
        "id": "clx1branch1",
        "name": "AnEat District 1",
        "code": "Q1"
      },
      "isActive": true,
      "createdAt": "2024-12-30T10:00:00.000Z"
    }
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "status": "error",
  "message": "Email already exists"
}
```

#### Validation Error Response (400 Bad Request)
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "email": "Please provide a valid email" },
    { "password": "Password must be at least 6 characters" }
  ]
}
```

---

### 4. Update Staff

**PUT** `/api/v1/manager/staffs/:id`

Cập nhật thông tin nhân viên trong chi nhánh.

#### URL Parameters
- `id` (string, required): Staff ID

#### Request Body
```json
{
  "name": "John Updated",
  "phone": "0998877665",
  "avatar": "https://example.com/new-avatar.jpg",
  "isActive": false
}
```

**Note**: Tất cả các fields đều optional, chỉ gửi những fields cần update.

#### Validation Rules
- `name`: 3-255 characters (optional)
- `phone`: 10-11 digits (optional)
- `avatar`: URL string (optional)
- `isActive`: Boolean (optional)

#### Example Request
```bash
PUT /api/v1/manager/staffs/clx1abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "John Updated",
  "isActive": false
}
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Staff updated successfully",
  "data": {
    "staff": {
      "id": "clx1abc123",
      "email": "john.doe@aneat.com",
      "name": "John Updated",
      "phone": "0901234567",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": false,
      "updatedAt": "2024-12-30T10:30:00.000Z"
    }
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "status": "error",
  "message": "Staff not found in your branch"
}
```

---

### 5. Delete Staff (Soft Delete)

**DELETE** `/api/v1/manager/staffs/:id`

Xóa nhân viên khỏi hệ thống (soft delete - không xóa vĩnh viễn).

#### URL Parameters
- `id` (string, required): Staff ID

#### Example Request
```bash
DELETE /api/v1/manager/staffs/clx1abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Staff deleted successfully"
}
```

#### Error Response (404 Not Found)
```json
{
  "status": "error",
  "message": "Staff not found in your branch"
}
```

---

## Error Responses

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## Examples with cURL

### Get Staff List
```bash
curl -X GET "http://localhost:3001/api/v1/manager/staffs?page=1&limit=10&sort=name&order=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Staff
```bash
curl -X POST "http://localhost:3001/api/v1/manager/staffs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstaff@aneat.com",
    "password": "password123",
    "name": "New Staff",
    "phone": "0912345678"
  }'
```

### Update Staff
```bash
curl -X PUT "http://localhost:3001/api/v1/manager/staffs/clx1abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "isActive": true
  }'
```

### Delete Staff
```bash
curl -X DELETE "http://localhost:3001/api/v1/manager/staffs/clx1abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes

1. **Phân quyền**: Manager chỉ có thể quản lý nhân viên trong chi nhánh của mình
2. **Soft Delete**: Khi xóa nhân viên, hệ thống sử dụng soft delete (đánh dấu `deletedAt` và `isActive=false`)
3. **Password**: Khi tạo mới, password sẽ được hash tự động bằng bcrypt
4. **Search**: Tìm kiếm hoạt động trên các trường: name, email, phone (case-insensitive)
5. **Pagination**: Mặc định page=1, limit=10. Có thể tùy chỉnh qua query params

---

## Database Schema

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String
  phone    String
  role     UserRole @default(CUSTOMER)
  avatar   String?
  branchId String?
  branch   Branch?  @relation("staff", fields: [branchId], references: [id])
  
  isActive  Boolean   @default(true)
  lastLogin DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
```
