# 🚀 Hướng Dẫn Deploy Backend Lên Render

## 📋 Tổng Quan
Guide chi tiết để deploy AnEat Backend lên Render.com với PostgreSQL database.

---

## BƯỚC 1: Tạo PostgreSQL Database

1. Truy cập [render.com](https://render.com) và đăng nhập
2. Click **"New +"** → chọn **"PostgreSQL"**
3. Điền thông tin:
   - **Name**: `aneat-database`
   - **Database**: `aneat_db`
   - **Region**: `Singapore` (gần VN nhất)
   - **PostgreSQL Version**: 16 (hoặc mới nhất)
   - **Plan**: `Free` (hoặc Starter nếu cần)
4. Click **"Create Database"**
5. ⚠️ **QUAN TRỌNG**: Sau khi tạo xong:
   - Vào tab **"Info"**
   - Copy **"Internal Database URL"** (dạng: `postgresql://aneat_user:...@...`)
   - Lưu lại để dùng ở bước 3

---

## BƯỚC 2: Push Code Lên GitHub

1. Tạo repository trên GitHub (nếu chưa có)
2. Push code lên GitHub:

```bash
cd backend
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## BƯỚC 3: Deploy Web Service

### 3.1. Tạo Web Service

1. Trên Render Dashboard, click **"New +"** → **"Web Service"**
2. Chọn repository GitHub của bạn
3. Điền thông tin:

**Basic Settings:**
- **Name**: `aneat-backend`
- **Region**: `Singapore`
- **Branch**: `main` (hoặc branch bạn muốn)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**:
  ```bash
  npx prisma migrate deploy && npm start
  ```

### 3.2. Cấu Hình Environment Variables

Scroll xuống phần **"Environment Variables"** và thêm:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste **Internal Database URL** từ Bước 1 |
| `JWT_SECRET` | Tạo secret key mạnh (ví dụ: dùng [password generator](https://passwordsgenerator.net/)) |
| `PORT` | `3001` |
| `FRONTEND_URL` | URL frontend của bạn (ví dụ: `https://aneat-frontend.vercel.app`) |

⚠️ **Lưu ý**: `DATABASE_URL` phải là **Internal Database URL**, không phải External.

### 3.3. Advanced Settings (Optional)

- **Instance Type**: `Free` hoặc `Starter`
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (tự động deploy khi push code mới)

### 3.4. Deploy

Click **"Create Web Service"** → Render sẽ bắt đầu build và deploy

---

## BƯỚC 4: Seed Dữ Liệu (Optional)

Sau khi deploy thành công, nếu muốn có dữ liệu mẫu:

### Cách 1: Qua Render Shell
1. Vào Web Service → tab **"Shell"**
2. Chạy lệnh:
```bash
npm run prisma:seed
```

### Cách 2: Qua Local (kết nối remote DB)
1. Copy **External Database URL** từ PostgreSQL service
2. Tạo file `.env.production` local:
```env
DATABASE_URL="external-database-url-here"
```
3. Chạy:
```bash
npx dotenv -e .env.production -- npm run prisma:seed
```

---

## BƯỚC 5: Kiểm Tra Deployment

### 5.1. Kiểm tra Health
Truy cập: `https://your-service-name.onrender.com/health`

Kết quả mong đợi:
```json
{
  "status": "ok",
  "message": "Server is healthy",
  "timestamp": "2026-01-21T..."
}
```

### 5.2. Kiểm tra API endpoints
```bash
# Test API root
curl https://your-service-name.onrender.com/api

# Test một endpoint cụ thể (ví dụ: branches)
curl https://your-service-name.onrender.com/api/branches
```

---

## 📊 Monitoring và Logs

### Xem Logs Real-time
1. Vào Web Service trên Render
2. Tab **"Logs"** → xem real-time logs
3. Tab **"Metrics"** → xem CPU, Memory usage

### Common Issues

**❌ Build failed: "Cannot find module '@prisma/client'"**
- **Fix**: Đảm bảo build command có `npx prisma generate`

**❌ Database connection error**
- **Fix**: Kiểm tra `DATABASE_URL` đã đúng **Internal URL** chưa

**❌ Migrations failed**
- **Fix**: Check logs để xem lỗi chi tiết
- Có thể cần reset database và chạy lại migrations

**❌ Service crashed after deploy**
- **Fix**: Check logs → thường là thiếu environment variables

---

## 🔧 Cấu Hình Bổ Sung

### Custom Domain (Optional)
1. Vào Web Service → tab **"Settings"**
2. Section **"Custom Domain"**
3. Add domain của bạn
4. Follow DNS setup instructions

### CORS Configuration
Đảm bảo `FRONTEND_URL` trong environment variables trỏ đúng domain frontend.

File `src/app.ts` đã có CORS config sẵn.

---

## 🎯 Checklist Sau Deploy

- [ ] Health endpoint hoạt động (`/health`)
- [ ] Database connected thành công
- [ ] Migrations đã chạy xong
- [ ] Seed data (nếu cần)
- [ ] API endpoints hoạt động
- [ ] CORS configured đúng
- [ ] Logs không có errors
- [ ] Update FRONTEND_URL trỏ về backend URL này

---

## 📝 Lưu Ý Quan Trọng

### Free Plan Limitations
- **Sleep after inactivity**: Service sẽ sleep sau 15 phút không active
- **Cold start**: Request đầu tiên có thể mất 30-60s để wake up
- **Limited resources**: 512MB RAM, shared CPU

### Upgrade Plan
Nếu app có traffic cao, nên upgrade lên **Starter plan** ($7/month):
- No sleep
- Dedicated resources
- Better performance

---

## 🆘 Troubleshooting

### Reset Database
Nếu cần reset hoàn toàn:
```bash
# Trong Render Shell
npx prisma migrate reset --force
npm run prisma:seed
```

### View Database
Sử dụng Prisma Studio local kết nối remote DB:
```bash
# Local terminal với .env.production
npx dotenv -e .env.production -- npx prisma studio
```

---

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)

---

## ✅ Done!

Backend của bạn đã được deploy thành công lên Render! 🎉

**Backend URL**: `https://your-service-name.onrender.com`

Nhớ cập nhật URL này vào frontend để connect API.
