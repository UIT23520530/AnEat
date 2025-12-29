# 🐳 Docker Compose - Frontend, Backend, Database Setup

Hướng dẫn chạy toàn bộ ứng dụng AnEat (Frontend, Backend, Database) bằng Docker Compose.

## 📋 Cấu trúc Docker Compose

```
docker-compose.yml
├── postgres (Database)
│   └── port: 5432
├── backend (Node.js API)
│   └── depends_on: postgres ✓
│   └── port: 3001
├── frontend (Next.js)
│   └── depends_on: backend ✓
│   └── port: 3000
├── pgadmin (Database UI)
│   └── depends_on: postgres
│   └── port: 5050
└── aneat-network (shared network)
```

## 🚀 Hướng dẫn sử dụng

### 1️⃣ Chuẩn bị environment variables

```bash
# Copy từ template
cp backend/docker/config/.env.docker .env
```

### 2️⃣ Cấu hình (tuỳ chọn)

Chỉnh sửa `.env` nếu cần:

```dotenv
# Database
DB_USER=aneat_user
DB_PASSWORD=aneat_password
DB_NAME=aneat_db
DB_PORT=5432

# Backend
BACKEND_PORT=3001
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000

# Frontend (default: http://backend:3001)
# NEXT_PUBLIC_API_URL=http://backend:3001

# pgAdmin
PGADMIN_EMAIL=admin@aneat.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
```

### 3️⃣ Build và khởi động

```bash
# Build lần đầu tiên
docker-compose build

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 4️⃣ Truy cập ứng dụng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Next.js app |
| **Backend** | http://localhost:3001 | API server |
| **Database** | localhost:5432 | PostgreSQL |
| **pgAdmin** | http://localhost:5050 | DB management (admin@aneat.com) |

## 🔄 Chi tiết xử lý Dependencies

### Khởi động sequence:

```
1. postgres (khởi động đầu tiên)
   ↓ (healthcheck: 10s, 5 retries)
2. backend (chờ postgres healthy)
   ↓ (depends_on: service_healthy)
3. frontend (chờ backend started)
   ↓ (depends_on: service_started)
4. pgadmin (chờ postgres khả dụng)
```

### Container health checks:

- **postgres**: `pg_isready` check mỗi 10s
- **backend**: HTTP `/health` check mỗi 30s
- **frontend**: HTTP request mỗi 30s

## 📝 Các lệnh hữu ích

### Start/Stop

```bash
# Khởi động tất cả
docker-compose up -d

# Dừng tất cả
docker-compose down

# Dừng và xóa volumes (reset database)
docker-compose down -v

# Restart một service
docker-compose restart frontend
```

### Logs

```bash
# Xem logs tất cả
docker-compose logs -f

# Xem logs một service
docker-compose logs -f backend

# Xem logs gần đây
docker-compose logs --tail=100 frontend
```

### Database

```bash
# Vào PostgreSQL container
docker-compose exec postgres psql -U aneat_user -d aneat_db

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend node prisma/seed-nationwide.js
```

### Build lại

```bash
# Build lại một image
docker-compose build frontend

# Build lại tất cả
docker-compose build --no-cache
```

## 🔧 Troubleshooting

### Frontend không kết nối backend?

Kiểm tra environment variable:
```bash
# Trong docker-compose.yml
NEXT_PUBLIC_API_URL=http://backend:3001  # ✓ Đúng (tên service)
NEXT_PUBLIC_API_URL=http://localhost:3001  # ✗ Sai (từ container)
```

### Database connection failed?

```bash
# Kiểm tra database container
docker-compose logs postgres

# Test connection
docker-compose exec backend npm run db:test

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy
```

### Port đã bị sử dụng?

Thay đổi trong `.env`:
```dotenv
DB_PORT=5433        # Thay 5432 → 5433
BACKEND_PORT=3002   # Thay 3001 → 3002
```

Hoặc stop service chiếm port:
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Docker
docker ps
docker stop <container_id>
```

## 📦 Dockerfile Details

### Frontend (`frontend/Dockerfile`)

- **Multi-stage build**: Builder stage + Production stage
- **Package manager**: pnpm
- **Health check**: wget HTTP check
- **Port**: 3000

### Backend (`backend/docker/Dockerfile`)

- **Base**: Node.js 20 Alpine
- **Prisma**: Auto generate client
- **Health check**: HTTP health endpoint
- **Port**: 3001

## 🌐 Network Communication

Các services kết nối qua `aneat-network`:

```
Frontend Container (http://localhost:3000)
├─ API calls → http://backend:3001 (nội bộ network)
└─ Browser   → http://localhost:3001 (host network)

Backend Container (http://localhost:3001)
└─ Database  → postgres:5432 (nội bộ network)

Host Machine
├─ Frontend → http://localhost:3000
├─ Backend  → http://localhost:3001
├─ Database → localhost:5432
└─ pgAdmin  → http://localhost:5050
```

## ✨ Best Practices

✅ Luôn sử dụng tên service khi gọi từ container khác  
✅ Sử dụng `depends_on` để quản lý startup order  
✅ Đặt `restart: unless-stopped` để auto-recovery  
✅ Health check để chắc chắn service đã ready  
✅ Sử dụng volumes cho persistent data  
✅ Separate environment config từ code  

## 📚 Tài liệu liên quan

- [Backend Docker Setup](backend/docker/README.md)
- [Database Configuration](DOCKER_DATABASE_SETUP.md)
- [Docker Compose Docs](https://docs.docker.com/compose/)
