# AnEat Database Backend

Backend database và API setup cho hệ thống quản lý nhà hàng AnEat.

## ⚠️ HƯỚNG DẪN CHO CÁC THÀNH VIÊN KHÁC

### **Bước 1: Chuẩn bị Docker PostgreSQL**

```bash
# Chạy PostgreSQL container
docker run -d \
  --name aneat-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=aneat_dev \
  -p 5432:5432 \
  postgres:15
```

**Hoặc dùng Docker Compose** (tạo file `docker-compose.yml` trong dtb):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: aneat_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Rồi chạy:
```bash
docker-compose up -d
```

### **Bước 2: Kiểm tra PostgreSQL đang chạy**

```bash
# Windows - kiểm tra port 5432
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :5432
```

### **Bước 3: Setup Backend dtb**

```bash
# 1. Vào thư mục
cd dtb

# 2. Copy config từ template
cp .env.example .env

# 3. Kiểm tra DATABASE_URL trong .env có chính xác không
# Nếu Docker chạy cùng máy: postgresql://postgres:postgres123@localhost:5432/aneat_dev
```

### **Bước 4: Install Dependencies & Khởi tạo Database**

```bash
# Install packages
npm install

# Tạo database schema
npx prisma migrate deploy

# Load dữ liệu sample (11 chi nhánh, 108 orders, 35 users, 15 customers)
node prisma/seed-nationwide.js
```

### **Bước 5: Xác minh Database**

```bash
# Cách 1: Kiểm tra bằng CLI
node query-db.js

# Cách 2: Mở giao diện Prisma Studio
npx prisma studio
# Truy cập: http://localhost:5555
```

✅ **Nếu thấy 11 branches + 108 orders = Thành công!**

---

## 📋 Yêu cầu

- Node.js (v18+)
- Docker & PostgreSQL
- npm hoặc pnpm
- Git

## 🚀 Quick Start

### 1. Setup Environment
```bash
cd dtb
cp .env.example .env
# Cập nhật DATABASE_URL trong .env nếu cần
```

### 2. Install Dependencies
```bash
npm install
# hoặc
pnpm install
```

### 3. Setup Database
```bash
# Chạy migrations
npx prisma migrate deploy

# Load dữ liệu sample (11 chi nhánh, 108 orders)
node prisma/seed-nationwide.js
```

### 4. Kiểm tra Database
```bash
node query-db.js
```

Hoặc mở Prisma Studio:
```bash
npx prisma studio
```
Truy cập: http://localhost:5555

## 📊 Database Schema

### 12 Bảng chính:
- **User** - Nhân viên, quản lý (4 roles)
- **Branch** - Chi nhánh (11 chi nhánh toàn quốc)
- **Product** - Sản phẩm (16 mỗi chi nhánh)
- **ProductCategory** - Danh mục (Burger, Gà Rán, Thức Uống, v.v.)
- **Order** - Đơn hàng (108 đơn sample)
- **OrderItem** - Chi tiết đơn hàng
- **Customer** - Khách hàng (15 khách sample)
- **Table** - Bàn ăn (111 bàn)
- **Promotion** - Khuyến mãi (4 promotion)
- **Inventory** - Hàng tồn kho
- **PaymentTransaction** - Ghi nhận thanh toán
- **Review** - Đánh giá sản phẩm

### Dữ liệu Sample:

| Item | Số lượng | Liên kết |
|------|---------|---------|
| Branches | 11 | Toàn quốc (HN, HP, ĐN, HCM, CT, v.v.) |
| Users | 35 | 1 Admin + 11 Managers + 23 Staff |
| Customers | 15 | Tiers: Bronze, Silver, Gold, VIP |
| Products | 176 | 16 × 11 branches |
| Tables | 111 | 8-13 bàn mỗi chi nhánh |
| Orders | 108 | Đầy đủ payment + reviews |
| Promotions | 4 | SAVE10, SAVE50K, COMBO20, WELCOME |

## 🔄 Workflow

### Khi thay đổi schema:
```bash
# Tạo migration
npx prisma migrate dev --name your_change_name

# Hoặc deploy migration có sẵn
npx prisma migrate deploy
```

### Khi thêm dữ liệu mẫu:
```bash
node prisma/seed-nationwide.js
```

## 🔐 Security

- ✅ `.env` được thêm vào `.gitignore` (không expose password)
- ✅ Dùng `.env.example` làm template
- ✅ JWT_SECRET cần đổi trong production
- ✅ DATABASE_URL nên dùng credentials an toàn

## 📝 Roles & Permissions

| Role | Quyền | Ghi chú |
|------|-------|--------|
| ADMIN_SYSTEM | Toàn quyền hệ thống | 1 người |
| ADMIN_BRAND | Quản lý chi nhánh | Mỗi chi nhánh 1 người |
| STAFF | Nhân viên (bếp, phục vụ) | Nhiều người mỗi chi nhánh |
| CUSTOMER | Khách hàng | Tích điểm, nhận khuyến mãi |

## 🌏 Branches (11 Chi nhánh)

1. **Hà Nội (2)** - Hoàn Kiếm, Tây Hồ
2. **Hải Phòng (1)** - Ngô Quyền
3. **Đà Nẵng (1)** - Thanh Khê
4. **Huế (1)** - Hai Bà Trưng
5. **TPHCM (2)** - Quận 1, Quận 7
6. **Đồng Nai (1)** - Biên Hòa
7. **Cần Thơ (1)** - Cần Thơ
8. **Bình Định (1)** - Quy Nhơn
9. **Khánh Hòa (1)** - Nha Trang

## 📚 Hữu ích

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Studio](http://localhost:5555)

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aneat_dev?schema=public
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## 📞 Support

Liên hệ: [email/support info]

---

**Last Updated:** October 24, 2025
