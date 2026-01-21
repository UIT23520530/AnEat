# ⚡ Quick Deploy - Render Backend

## 📝 Checklist Nhanh

### 1️⃣ Tạo PostgreSQL Database
- [ ] Đăng nhập Render.com
- [ ] New + → PostgreSQL
- [ ] Name: `aneat-database`
- [ ] Region: Singapore
- [ ] Plan: Free
- [ ] ✅ Copy **Internal Database URL**

### 2️⃣ Push Code lên GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 3️⃣ Tạo Web Service
- [ ] New + → Web Service
- [ ] Chọn GitHub repo
- [ ] Root Directory: `backend`
- [ ] Runtime: Node

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && npm start
```

### 4️⃣ Environment Variables
```env
NODE_ENV=production
DATABASE_URL=<paste-internal-database-url>
JWT_SECRET=<random-secure-string>
PORT=3001
FRONTEND_URL=<your-frontend-url>
```

### 5️⃣ Deploy
- [ ] Click "Create Web Service"
- [ ] Đợi build hoàn tất (~3-5 phút)
- [ ] Check logs không có errors

### 6️⃣ Seed Data (Optional)
```bash
# Trong Render Shell
npm run prisma:seed
```

### 7️⃣ Test
```bash
# Health check
curl https://your-service.onrender.com/health

# API test
curl https://your-service.onrender.com/api
```

## ✅ Done!
Backend URL: `https://your-service-name.onrender.com`

---

## 🔗 Links Quan Trọng
- Render Dashboard: https://dashboard.render.com
- Docs chi tiết: [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
