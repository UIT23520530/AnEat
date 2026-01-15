# 🔧 FIX LỖI "Invalid Token"

## ❌ Nguyên Nhân

Token trong file `tokens.json` đã **HẾT HẠN**.

Token được generate lúc: `1767194648` (30 Dec 2024)  
Token expiry: `1767799448` (7 days later - 6 Jan 2025)  
Hôm nay: **15 Jan 2026** → Token đã hết hạn từ lâu!

## ✅ Giải Pháp: Generate Token Mới

### Bước 1: Generate Tokens Mới

```powershell
cd backend
npm run generate-tokens
```

Script này sẽ:
- Tạo token mới cho **TẤT CẢ** users trong database
- Lưu vào file `tokens.json`
- Token valid trong **7 ngày**

### Bước 2: Copy Token Staff

Sau khi chạy xong, mở file `backend/tokens.json` và tìm user có **role: "STAFF"**:

```json
{
  "name": "Nhân viên BR001",
  "email": "staff.BR001.0@aneat.com",
  "role": "STAFF",
  "branch": "AnEat - Hoàn Kiếm",
  "branchCode": "BR001",
  "userId": "...",
  "branchId": "...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // ← COPY CÁI NÀY
}
```

Copy giá trị của **"token"**

### Bước 3: Test Lại API

#### A. Test bằng PowerShell:

```powershell
$token = "PASTE_TOKEN_VỪA_COPY"
$headers = @{"Authorization" = "Bearer $token"}

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/staff/dashboard/stats" `
    -Headers $headers -Method Get | ConvertTo-Json
```

#### B. Test bằng PowerShell Script:

```powershell
.\test-staff-dashboard.ps1 -Token "PASTE_TOKEN_VỪA_COPY"
```

#### C. Test bằng Postman:

1. Mở Postman
2. Import collection: `postman/staff-dashboard.postman_collection.json`
3. Vào Environment variables
4. Sửa `staff_token`: `PASTE_TOKEN_VỪA_COPY`
5. Test lại

---

## 🎯 Quick Test - One Liner

```powershell
# Generate tokens và lấy staff token
cd backend; npm run generate-tokens

# Sau đó copy token staff từ tokens.json và chạy:
.\test-staff-dashboard.ps1 -Token "YOUR_NEW_TOKEN"
```

---

## 🔍 Kiểm Tra Token

### Check Token Expiry

```powershell
cd backend
node -e "console.log(JSON.parse(Buffer.from('PASTE_TOKEN_PART_GIUA_2_DẤU_CHẤM', 'base64').toString()))"
```

Hoặc dùng website: https://jwt.io/

### Debug Token Script

```powershell
cd backend
npx ts-node scripts/debug-token.ts YOUR_TOKEN
```

---

## 📝 Lưu Ý

### Token Expiry
- Token mặc định valid trong **7 ngày** (setting trong `.env`)
- Sau 7 ngày phải generate lại
- Production nên set ngắn hơn (1-2 giờ)

### JWT_SECRET
Đảm bảo `.env` có:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Tìm Staff User

Nếu không có staff user trong database:

```sql
-- Xem tất cả staff users
SELECT id, email, name, role, "branchId" 
FROM "User" 
WHERE role = 'STAFF';

-- Hoặc tạo mới
INSERT INTO "User" (id, email, password, name, phone, role, "branchId", "isActive")
VALUES (
  'new-staff-id',
  'staff.test@aneat.com',
  '$2b$10$hashed_password',
  'Test Staff',
  '0123456789',
  'STAFF',
  'branch_id_here',
  true
);
```

---

## ✅ Checklist Fix

- [ ] Chạy `npm run generate-tokens`
- [ ] Mở `backend/tokens.json`
- [ ] Copy token của user có role "STAFF"
- [ ] Update token trong Postman/Script
- [ ] Test lại endpoint: `http://localhost:3001/api/v1/staff/dashboard/stats`
- [ ] Verify response có `success: true`

---

## 🚨 Nếu Vẫn Lỗi

### Error: "No token provided"
→ Thiếu header `Authorization: Bearer <token>`

### Error: "User not found or inactive"
→ User đã bị xóa hoặc `isActive = false`

```sql
UPDATE "User" SET "isActive" = true WHERE email = 'staff@email.com';
```

### Error: "Invalid token" (vẫn sau khi generate mới)
→ Kiểm tra `JWT_SECRET` trong `.env` có đúng không

### Error: "Staff không thuộc chi nhánh nào"
→ Staff user cần có `branchId`

```sql
UPDATE "User" SET "branchId" = 'branch_id' WHERE role = 'STAFF';
```

---

## 💡 Quick Commands

```powershell
# 1. Generate tokens
cd backend; npm run generate-tokens

# 2. Xem staff tokens
cat tokens.json | Select-String -Pattern '"role": "STAFF"' -Context 3,3

# 3. Test ngay
# Copy token từ output trên, sau đó:
.\test-staff-dashboard.ps1 -Token "YOUR_TOKEN"
```

---

**Sau khi generate token mới, tất cả API sẽ hoạt động bình thường! ✅**
