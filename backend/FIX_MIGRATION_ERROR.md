# 🔧 Khắc phục lỗi Migration P3006

## Vấn đề
Khi chạy `npm run prisma:migrate`, gặp lỗi:
```
Error: P3006
Migration `20251230170513_add_bill_management` failed to apply cleanly to the shadow database. 
Error: ERROR: index "StockRequest_branchId_idx" does not exist
```

## Nguyên nhân
Migration file đang cố gắng drop các index không tồn tại trong shadow database (database tạm để Prisma kiểm tra migration).

## Giải pháp đã áp dụng
Đã sửa file migration để sử dụng `DROP INDEX IF EXISTS` thay vì `DROP INDEX`.

## Các bước tiếp theo

### Cách 1: Chạy lại migration (Khuyến nghị)
```bash
cd backend
npm run prisma:migrate
```

Khi được hỏi tên migration, nhập: `add_banner_and_branch_status`

### Cách 2: Nếu vẫn lỗi, sử dụng db push (Tạm thời)
Nếu migration vẫn lỗi, có thể dùng `db push` để apply schema changes trực tiếp:

```bash
cd backend
npm run db:push
```

**Lưu ý:** `db push` không tạo migration file, chỉ apply schema changes trực tiếp. Sau đó vẫn cần tạo migration file mới.

### Cách 3: Bỏ qua shadow database (Không khuyến nghị)
Có thể set environment variable để bỏ qua shadow database, nhưng không khuyến nghị vì mất đi tính năng kiểm tra migration:

```bash
# Thêm vào .env
PRISMA_MIGRATE_SKIP_SEED=true
```

## Sau khi migration thành công

1. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

2. **Restart server:**
```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

3. **Test API:**
```bash
# Test banner API
curl http://localhost:3001/api/v1/home/banners

# Test featured products
curl "http://localhost:3001/api/v1/home/featured-products?limit=10"
```

## Kiểm tra migration status
```bash
npx prisma migrate status
```

Nếu tất cả migrations đã được apply, bạn sẽ thấy:
```
Database schema is up to date!
```
