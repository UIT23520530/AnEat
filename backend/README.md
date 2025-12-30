# AnEat Backend API

Backend server cho ứng dụng AnEat được xây dựng với Node.js, Express, TypeScript và PostgreSQL.

## 🚀 Công nghệ sử dụng

- **Node.js** v20+
- **TypeScript** 
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Docker** - Containerization

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server entry point
│   ├── db.ts                  # Database connection
│   ├── controllers/           # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── manager.controller.ts
│   │   ├── staff.controller.ts
│   │   └── customer.controller.ts
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── manager.routes.ts
│   │   ├── staff.routes.ts
│   │   └── customer.routes.ts
│   └── middleware/            # Custom middleware
│       ├── auth.middleware.ts
│       ├── validation.middleware.ts
│       └── index.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── Dockerfile                 # Docker configuration
├── package.json
└── tsconfig.json
```

## 🔧 Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Copy file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=aneat_user
DB_PASSWORD=aneat_password
DB_NAME=aneat_db
DATABASE_URL=postgresql://aneat_user:aneat_password@localhost:5432/aneat_db?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Khởi chạy database với Docker

```bash
# Từ thư mục root của project
docker-compose up postgres -d
```

### 4. Chạy migrations và seed data

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Khởi động server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 🐳 Sử dụng Docker

### Khởi động toàn bộ hệ thống (backend + database)

```bash
# Từ thư mục root của project
docker-compose up backend postgres -d
```

### Xem logs

```bash
docker-compose logs -f backend
```

### Dừng services

```bash
docker-compose down
```

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại
- `POST /api/v1/auth/logout` - Đăng xuất

### Admin Routes (ADMIN_SYSTEM, ADMIN_BRAND)

- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/branches` - Danh sách chi nhánh
- `POST /api/v1/admin/branches` - Tạo chi nhánh mới
- `PUT /api/v1/admin/branches/:id` - Cập nhật chi nhánh
- `DELETE /api/v1/admin/branches/:id` - Xóa chi nhánh

### Manager Routes

- `GET /api/v1/manager/stats` - Thống kê chi nhánh
- `GET /api/v1/manager/staff` - Danh sách nhân viên
- `GET /api/v1/manager/orders` - Danh sách đơn hàng

### Staff Routes

- `GET /api/v1/staff/orders` - Đơn hàng được giao
- `PUT /api/v1/staff/orders/:orderId` - Cập nhật trạng thái đơn
- `GET /api/v1/staff/tables` - Danh sách bàn

### Customer Routes

- `GET /api/v1/customer/profile` - Thông tin cá nhân
- `GET /api/v1/customer/orders` - Lịch sử đơn hàng
- `POST /api/v1/customer/orders` - Tạo đơn hàng mới
- `GET /api/v1/customer/menu` - Xem menu

### User Management (Admin only)

- `GET /api/v1/users` - Danh sách users
- `GET /api/v1/users/:id` - Chi tiết user
- `PUT /api/v1/users/:id` - Cập nhật user
- `DELETE /api/v1/users/:id` - Xóa user (soft delete)

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) để xác thực. Để truy cập các endpoints được bảo vệ, bạn cần:

1. Đăng nhập để nhận token
2. Gửi token trong header của request:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **ADMIN_SYSTEM** - Quản trị hệ thống
- **ADMIN_BRAND** - Quản trị thương hiệu
- **STAFF** - Nhân viên (có quyền manager)
- **CUSTOMER** - Khách hàng

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Chạy production server
- `npm test` - Chạy tests
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:studio` - Mở Prisma Studio
- `npm run lint` - Lint code
- `npm run format` - Format code

## 🔍 Health Check

Server có endpoint health check tại:

```
GET /health
```

Response:
```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2024-12-30T10:00:00.000Z",
  "database": "connected"
}
```

## 📚 API Documentation

API documentation có thể được truy cập tại:

- Development: `http://localhost:3001/api/v1/docs`
- Production: Theo cấu hình của bạn

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC
