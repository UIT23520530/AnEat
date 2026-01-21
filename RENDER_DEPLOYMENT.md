# 🚀 Hướng dẫn Deploy Backend lên Render

## 📋 Các bước thực hiện

### Bước 1: Chuẩn bị Repository

1. **Đảm bảo code đã push lên GitHub/GitLab**
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

2. **Kiểm tra các file cần thiết:**
- ✅ `backend/Dockerfile` - Đã có
- ✅ `backend/package.json` - Đã có
- ✅ `backend/prisma/schema.prisma` - Đã có
- ✅ `backend/build.sh` - Script build (vừa tạo)
- ✅ `backend/start.sh` - Script start (vừa tạo)

### Bước 2: Tạo PostgreSQL Database trên Render

1. **Truy cập Render Dashboard**
   - Đăng nhập vào: https://dashboard.render.com/
   - Click **"New +"** → Chọn **"PostgreSQL"**

2. **Cấu hình Database:**
   - **Name**: `aneat-postgres`
   - **Database**: `aneat_db`
   - **User**: `aneat_user` (tự động tạo)
   - **Region**: Singapore (hoặc gần nhất)
   - **Plan**: Free

3. **Tạo Database:**
   - Click **"Create Database"**
   - Đợi vài phút để Render tạo database

4. **Lấy thông tin kết nối:**
   - Sau khi tạo xong, vào tab **"Info"**
   - Copy **"Internal Database URL"** (dùng cho backend)
   - Định dạng: `postgresql://user:password@host:5432/database`

### Bước 3: Tạo Web Service cho Backend

1. **Tạo Web Service:**
   - Click **"New +"** → Chọn **"Web Service"**
   - Connect repository GitHub/GitLab của bạn

2. **Cấu hình Service:**
   - **Name**: `aneat-backend`
   - **Region**: Singapore (cùng region với database)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: Free

3. **Advanced Settings:**

Click **"Advanced"** để cấu hình chi tiết:

#### ⚙️ Build & Deploy Settings

**Nếu dùng Docker (Khuyến nghị):**
```
Environment: Docker
Docker Build Context Directory: .
Dockerfile Path: ./Dockerfile
Docker Command: (để trống - dùng CMD trong Dockerfile)
```

**Nếu dùng Native (không Docker):**
```
Environment: Node
Build Command: npm ci && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && node dist/server.js
```

#### 🏥 Health Check Path
```
Health Check Path: /health
```
✅ **Quan trọng:** Backend của bạn đã có endpoint `/health`, Render sẽ dùng để monitor.

#### 🔐 Secret Files
**Không cần thiết** - Đã dùng Environment Variables (khuyến nghị hơn).

#### 🚀 Pre-Deploy Command
**Tùy chọn:**
```
Pre-Deploy Command: npx prisma migrate deploy
```
Hoặc để trống nếu đã có trong Start Command.

#### 🔄 Auto-Deploy
```
✅ On Commit (Bật)
```
Tự động deploy khi push code lên GitHub.

#### 📁 Build Filters (Tùy chọn - Optimization)
**Chỉ deploy khi có thay đổi trong backend:**

**Included Paths:**
```
backend/**
```

**Ignored Paths:**
```
frontend/**
*.md
.github/**
```

Điều này giúp tiết kiệm build hours khi chỉ thay đổi frontend hoặc docs.

#### 🔑 Registry Credential
**Không cần thiết** - Không dùng private Docker images.

### Bước 4: Cấu hình Environment Variables

Thêm các biến môi trường sau trong **Environment Variables**:

#### 🔴 **BẮT BUỘC - Required:**

```bash
# Database
DATABASE_URL=<Paste Internal Database URL từ bước 2>

# Server
NODE_ENV=production
PORT=10000

# JWT (tạo secret key mới - QUAN TRỌNG!)
JWT_SECRET=<Generate random string - dùng: openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# CORS (URL frontend của bạn)
CORS_ORIGIN=https://your-frontend-domain.onrender.com
```

**⚠️ Nếu CHƯA deploy frontend:**

Dùng tạm một trong các giá trị sau cho `CORS_ORIGIN`:

```bash
# Option 1: Cho phép tất cả origins (CHỈ dùng khi test)
CORS_ORIGIN=*

# Option 2: Localhost để test từ máy local
CORS_ORIGIN=http://localhost:3000

# Option 3: Để URL tạm (sửa lại sau)
CORS_ORIGIN=https://placeholder.com
```

**💡 Sau khi deploy frontend:**
- Vào Render Dashboard → Web Service → Environment → Edit
- Sửa `CORS_ORIGIN` thành URL frontend thực tế
- Service sẽ tự động restart với giá trị mới

**Tạo JWT_SECRET ngẫu nhiên:**
- Mac/Linux: `openssl rand -base64 32`
- Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
- Online: https://generate-random.org/api-token-generator

#### 🟡 **TÙY CHỌN - Optional (nhưng khuyến nghị):**

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### 💳 **MoMo Payment Gateway (nếu có):**

⚠️ **Chỉ thêm nếu bạn đã có tài khoản MoMo Business và credentials:**

```bash
# MoMo Payment Configuration
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_PARTNER_CODE=MOMO
MOMO_REDIRECT_URL=https://aneat-frontend.onrender.com/customer/checkout/success
MOMO_IPN_URL=https://aneat-backend.onrender.com/api/v1/customer/payment/momo-ipn
MOMO_REQUEST_TYPE=captureWallet
```

**⚠️ Nếu CHƯA deploy frontend:**

**Option 1: Dùng webhook.site tạm thời (khuyến nghị để test)**
```bash
MOMO_REDIRECT_URL=https://placeholder.com/customer/checkout/success
MOMO_IPN_URL=https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b  # Để test
```

**Option 2: Dùng backend IPN thực (sau khi deploy backend)**
```bash
MOMO_REDIRECT_URL=https://placeholder.com/customer/checkout/success
MOMO_IPN_URL=https://aneat-backend.onrender.com/api/v1/customer/payment/momo-ipn
```

**💡 Sau khi deploy frontend:**
- `MOMO_REDIRECT_URL` → Đổi thành `https://aneat-frontend.onrender.com/customer/checkout/success`
- `MOMO_IPN_URL` → Đổi thành `https://aneat-backend.onrender.com/api/v1/customer/payment/momo-ipn` (hoặc giữ webhook.site nếu cần debug)

**Lưu ý về MoMo:**
- Cần đăng ký tài khoản **MoMo Business** tại: https://business.momo.vn/
- Sau khi được duyệt, MoMo sẽ cung cấp `ACCESS_KEY` và `SECRET_KEY`
- Nếu chưa có: Bỏ qua không thêm → Payment feature sẽ không hoạt động
- Backend vẫn chạy bình thường ngay cả khi không có MoMo credentials

#### 📋 **Tổng hợp Environment Variables:**

**🎯 Kịch bản 1: CHƯA deploy frontend (khuyến nghị để test backend trước)**

```bash
# === BẮT BUỘC ===
DATABASE_URL=postgresql://user:pass@host.render.com:5432/aneat_db
NODE_ENV=production
PORT=10000
JWT_SECRET=<Generate với openssl rand -base64 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*   # Cho phép tất cả origins tạm thời

# === TÙY CHỌN ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

# === MoMo PAYMENT - Bỏ qua khi chưa có frontend ===
# (Không thêm các biến MoMo)
```

**🚀 Kịch bản 2: ĐÃ deploy frontend**

```bash
# === BẮT BUỘC ===
DATABASE_URL=postgresql://user:pass@host.render.com:5432/aneat_db
NODE_ENV=production
PORT=10000
JWT_SECRET=<Generate với openssl rand -base64 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://aneat-frontend.onrender.com   # URL frontend thực tế

# === TÙY CHỌN ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

# === MoMo PAYMENT (nếu có credentials) ===
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_PARTNER_CODE=MOMO
MOMO_REDIRECT_URL=https://aneat-frontend.onrender.com/customer/checkout/success
MOMO_IPN_URL=https://aneat-backend.onrender.com/api/v1/customer/payment/momo-ipn
MOMO_REQUEST_TYPE=captureWallet
```

### Bước 5: Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone repository
   - Build Docker image
   - Chạy migrations
   - Start server

3. **Theo dõi logs:**
   - Vào tab **"Logs"** để xem quá trình deploy
   - Kiểm tra các bước:
     - ✅ Building...
     - ✅ Running migrations...
     - ✅ Server started on port 10000

### Bước 6: Kiểm tra Deployment

1. **Test Health Endpoint:**
```bash
curl https://aneat-backend.onrender.com/health
```

Response mong đợi:
```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2026-01-20T...",
  "database": "connected"
}
```

2. **Test API Endpoint:**
```bash
curl https://aneat-backend.onrender.com/api/v1
```

### Bước 7: Seed Database (Nếu cần)

⚠️ **QUAN TRỌNG:** 
- **KHÔNG BAO GIỜ** dùng `prisma migrate reset --force` trên production - sẽ XÓA TOÀN BỘ DATA!
- Chỉ dùng `prisma migrate deploy` (áp dụng migrations mới) và `prisma db seed` (thêm data mẫu)

#### Option 1: Tự động seed khi deploy (Khuyến nghị cho lần đầu)

**Sửa file `backend/start.sh`:**
```bash
#!/bin/bash
set -e

echo "🚀 Starting application..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed database (chỉ lần đầu hoặc khi cần)
echo "🌱 Seeding database..."
npm run prisma:seed

# Start the application
echo "🎯 Starting server..."
node dist/server.js
```

Sau đó push code và Render sẽ tự động seed khi deploy.

**Lưu ý:** Sau lần đầu, comment lại dòng seed để tránh chạy lại mỗi lần deploy:
```bash
# echo "🌱 Seeding database..."
# npm run prisma:seed
```

#### Option 2: Seed thủ công qua Render Shell

1. **Vào Render Web Service → tab "Shell"**
2. **Chạy lệnh:**
```bash
cd /app
npm run prisma:seed
```

#### Option 3: Seed từ local machine

```bash
# Copy External Database URL từ Render (tab "Info")
# Set DATABASE_URL trong terminal
export DATABASE_URL="postgresql://user:pass@host.oregon-postgres.render.com/aneat_db"

# Chạy seed từ local
cd backend
npm run prisma:seed
```

#### Option 4: Reset và Seed (CHỈ dùng khi cần thiết!)

⚠️ **Cẩn thận:** Sẽ XÓA toàn bộ data hiện tại!

```bash
# Vào Render Shell
npx prisma migrate reset --force
```

Lệnh này sẽ:
1. Xóa toàn bộ database
2. Chạy lại tất cả migrations
3. Tự động chạy seed

## 🔧 Troubleshooting

### Lỗi Database Connection
```
Error: Can't reach database server
```

**Giải pháp:**
- Kiểm tra `DATABASE_URL` đúng format
- Dùng **Internal Database URL** (không phải External)
- Đảm bảo database và backend cùng region

### Lỗi Prisma Migration
```
Error: Database migration failed
```

**Giải pháp:**
```bash
# Vào Shell của Web Service
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Lỗi Build Timeout
```
Build exceeded 15 minutes
```

**Giải pháp:**
- Nâng cấp lên Starter plan ($7/tháng)
- Hoặc optimize build: xóa `node_modules` trước khi push

### Lỗi CORS
```
Access to fetch blocked by CORS policy
```

**Giải pháp:**
- Cập nhật `CORS_ORIGIN` với URL frontend thực tế
- Hoặc dùng `*` cho development (không khuyến khích production)

## 📊 Monitoring

1. **Logs:**
   - Render Dashboard → Logs tab
   - Real-time logs

2. **Metrics:**
   - CPU/Memory usage
   - Request count
   - Response times

3. **Health Checks:**
   - Tự động kiểm tra `/health` endpoint
   - Restart nếu unhealthy

## 🔄 Auto-Deploy

Render tự động deploy khi:
- Push code lên branch `main`
- Pull request được merge

**Tắt auto-deploy:**
- Settings → Disable "Auto-Deploy"

## 💰 Chi phí

### Free Plan
- ✅ 750 giờ/tháng miễn phí
- ✅ Đủ cho 1 backend service 24/7
- ✅ PostgreSQL 1GB storage
- ❌ Spin down sau 15 phút không hoạt động
- ❌ Cold start ~30 giây

### Starter Plan ($7/month)
- ✅ Always-on (không spin down)
- ✅ Instant response
- ✅ Custom domains

## 🎯 Best Practices

1. **Environment Variables:**
   - Không commit `.env` vào Git
   - Dùng Render Environment Variables

2. **Database Backups:**
   - Render tự động backup PostgreSQL
   - Free plan: 7 ngày retention

3. **Logging:**
   - Dùng `console.log/error` - Render tự động capture
   - Structured logging với JSON

4. **Monitoring:**
   - Setup health checks
   - Monitor response times

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com/
- **Render Docs**: https://render.com/docs
- **PostgreSQL Docs**: https://render.com/docs/databases
- **Troubleshooting**: https://render.com/docs/troubleshooting

## �️ Local Development vs Production

### Local Development
```bash
# Frontend
cd frontend
yarn dev              # Chạy Next.js dev server (port 3000)
### Backend (Deploy trước)
- [ ] Code đã push lên GitHub
- [ ] Tạo PostgreSQL database
- [ ] Tạo Web Service
- [ ] Cấu hình Environment Variables (dùng `CORS_ORIGIN=*` tạm thời)
- [ ] Quyết định có seed database không (sửa `start.sh` nếu cần)
- [ ] Deploy và kiểm tra logs
- [ ] Test health endpoint: `https://aneat-backend.onrender.com/health`
- [ ] Test API endpoints
- [ ] Lưu lại backend URL: `https://aneat-backend.onrender.com`

### Frontend (Deploy sau)
- [ ] Deploy frontend lên Render (hoặc Vercel/Netlify)
- [ ] Lưu lại frontend URL: `https://aneat-frontend.onrender.com`
- [ ] Quay lại Backend → Environment → Edit `CORS_ORIGIN`
- [ ] Cập nhật `CORS_ORIGIN=https://aneat-frontend.onrender.com`
- [ ] Nếu có MoMo: Cập nhật `MOMO_REDIRECT_URL`
- [ ] Service tự động restart
- [ ] Test login/authentication từ frontend
```bash
# Tự động bởi Render khi deploy:
npx prisma migrate deploy    # Chỉ áp dụng migrations MỚI
npm run prisma:seed          # Thêm data mẫu (nếu uncomment trong start.sh)
node dist/server.js          # Start production server

# KHÔNG BAO GIỜ chạy trên production:
❌ npx prisma migrate reset --force   # Sẽ XÓA TOÀN BỘ DATA!
```

## 📝 Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] Tạo PostgreSQL database
- [ ] Tạo Web Service
- [ ] Cấu hình Environment Variables
- [ ] Quyết định có seed database không (sửa `start.sh` nếu cần)
- [ ] Deploy và kiểm tra logs
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Test login với tài khoản seed (nếu có)
- [ ] Cập nhật frontend URL trong CORS
- [ ] Monitor logs và health checks

---

**Lưu ý:** 
- Free plan có giới hạn 750 giờ/tháng (đủ cho 1 service chạy 24/7)
- Service sẽ spin down sau 15 phút không hoạt động
- Cold start mất ~30 giây khi có request đầu tiên

**URLs sau khi deploy:**
- Backend: `https://aneat-backend.onrender.com`
- Health Check: `https://aneat-backend.onrender.com/health`
- API: `https://aneat-backend.onrender.com/api/v1`
