# 🚀 Hướng Dẫn Deploy AnEat Backend

## 📋 Tổng Quan

File này hướng dẫn deploy backend AnEat lên production một cách đơn giản và nhanh chóng.

## 📦 Cấu Trúc Đã Được Tối Ưu

### Migrations
- ✅ Đã gộp tất cả migrations thành 1 file duy nhất: `20260120032224_init_production`
- ✅ Migration bao gồm toàn bộ schema database

### Seed Data
- ✅ Đã gộp tất cả seed files thành 1 file: `prisma/seed.ts`
- ✅ Seed bao gồm:
  - Branch (Chi nhánh mẫu)
  - Manager account
  - Staff accounts (3 nhân viên)
  - Logistics staff (5 nhân viên)
  - Categories (6 danh mục)
  - Products (36 sản phẩm)
  - Banners (3 banners)

### Scripts
- ✅ Đã dọn dẹp và đơn giản hóa npm scripts
- ✅ Chỉ giữ lại các scripts cần thiết cho deploy

## 🔧 Yêu Cầu

- Node.js >= 18
- PostgreSQL >= 14
- npm hoặc yarn

## 📝 Các Bước Deploy

### 1. Clone Repository

```bash
git clone <repository-url>
cd AnEat/backend
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aneat_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=production

# CORS (nếu cần)
FRONTEND_URL="https://your-frontend-domain.com"
```

**⚠️ Quan trọng**: Thay đổi các giá trị sau cho production:
- `DATABASE_URL`: Connection string database thực tế
- `JWT_SECRET`: Secret key mạnh và ngẫu nhiên
- `FRONTEND_URL`: Domain frontend thực tế

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Chạy Migrations

```bash
npm run prisma:migrate:deploy
```

Lệnh này sẽ tạo tất cả tables trong database.

### 6. Seed Dữ Liệu Mẫu (Optional)

Nếu muốn có dữ liệu mẫu để test:

```bash
npm run prisma:seed
```

Lệnh này sẽ tạo:
- 1 chi nhánh mẫu (HCM-Q1)
- 1 manager account
- 3 staff accounts
- 5 logistics staff accounts
- 6 categories
- 36 products
- 3 banners

**Test Credentials sau khi seed:**
- Manager: `manager@aneat.com` / `manager123`
- Staff: `staff001@aneat.com` / `staff123`
- Logistics: `logistics01@aneat.com` / `logistics123`

### 7. Build Application

```bash
npm run build
```

### 8. Start Production Server

```bash
npm start
```

Server sẽ chạy tại port được định nghĩa trong `.env` (mặc định: 3000)

## 🐳 Deploy với Docker (Recommended)

### Sử dụng Docker Compose

File `docker-compose.yml` đã có sẵn ở root project:

```bash
# Từ thư mục root của project
docker-compose up -d
```

Hoặc build riêng backend:

```bash
# Từ thư mục backend
docker build -t aneat-backend .
docker run -p 3000:3000 --env-file .env aneat-backend
```

## 📊 Quản Lý Database

### Xem Database với Prisma Studio

```bash
npm run prisma:studio
```

Prisma Studio sẽ mở tại `http://localhost:5555`

### Reset Database (⚠️ Cẩn thận - Xóa toàn bộ dữ liệu)

```bash
npm run db:reset
```

Lệnh này sẽ:
1. Xóa database
2. Chạy lại migrations
3. Tự động chạy seed

## 🔍 Kiểm Tra Health

Sau khi deploy, kiểm tra server:

```bash
curl http://localhost:3000/api/health
```

## 📁 Cấu Trúc Thư Mục Sau Khi Dọn Dẹp

```
backend/
├── prisma/
│   ├── migrations/
│   │   └── 20260120032224_init_production/  # Migration duy nhất
│   ├── archive/                              # Các file cũ đã lưu trữ
│   ├── schema.prisma                         # Database schema
│   └── seed.ts                               # Seed file duy nhất
├── src/                                      # Source code
├── dist/                                     # Compiled code (sau build)
├── .env                                      # Environment variables
├── package.json
└── tsconfig.json
```

## 🛠️ Các Scripts Có Sẵn

```bash
# Development
npm run dev              # Chạy development server với hot reload

# Build & Production
npm run build           # Build TypeScript sang JavaScript
npm start              # Chạy production server

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate:deploy  # Deploy migrations
npm run prisma:seed           # Seed dữ liệu mẫu
npm run prisma:studio         # Mở Prisma Studio
npm run db:reset              # Reset database + migrations + seed

# Code Quality
npm run lint            # Kiểm tra lỗi code
npm run lint:fix        # Tự động sửa lỗi code
npm run format          # Format code

# Testing
npm test               # Chạy tests
npm run test:watch     # Chạy tests với watch mode
npm run test:coverage  # Chạy tests với coverage report

# Utilities
npm run generate-tokens  # Generate JWT tokens cho testing
npm run quick-login     # Quick login helper
```

## 🚨 Troubleshooting

### Lỗi Database Connection

Kiểm tra:
1. PostgreSQL đang chạy
2. Thông tin kết nối trong `.env` đúng
3. Database đã được tạo

```bash
# Tạo database nếu chưa có
createdb aneat_db
```

### Lỗi Migration

Nếu có lỗi với migrations:

```bash
# Xóa và tạo lại database
npm run db:reset
```

### Lỗi Build

```bash
# Xóa cache và node_modules
rm -rf node_modules dist
npm install
npm run build
```

## 🔐 Security Checklist Trước Khi Deploy

- [ ] Thay đổi `JWT_SECRET` thành giá trị ngẫu nhiên và mạnh
- [ ] Đảm bảo `.env` không được commit vào git
- [ ] Cấu hình CORS đúng cho frontend domain
- [ ] Bật HTTPS trong production
- [ ] Giới hạn rate limiting cho API
- [ ] Đổi passwords mặc định của các accounts mẫu
- [ ] Backup database thường xuyên
- [ ] Monitor logs và errors

## 📞 Support

Nếu gặp vấn đề khi deploy, vui lòng:
1. Kiểm tra logs: `docker logs <container-id>` (nếu dùng Docker)
2. Kiểm tra database connection
3. Review file `.env`
4. Xem [API_GUIDLINES.md](./API_GUIDLINES.md) để biết thêm chi tiết về API

## 📚 Tài Liệu Khác

- [API Guidelines](./API_GUIDLINES.md) - Hướng dẫn API chi tiết
- [Quick Login Guide](./QUICK_LOGIN.md) - Hướng dẫn quick login
- [Quick Deploy](./QUICK_DEPLOY.md) - Quick reference card
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md) - Tổng kết deploy
- [Database Schema](../prisma/schema.prisma) - Schema database

---

**Chúc bạn deploy thành công! 🎉**
