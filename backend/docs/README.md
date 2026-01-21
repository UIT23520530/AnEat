# 📚 AnEat Backend Documentation

Thư mục này chứa toàn bộ tài liệu về backend AnEat.

## 📖 Tài Liệu Có Sẵn

### 🚀 Deployment
- **[RENDER_QUICK.md](./RENDER_QUICK.md)** - ⚡ Quick deploy lên Render (⭐ Bắt đầu đây)
- **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** - 📖 Hướng dẫn deploy Render chi tiết
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 🔧 Giải quyết các lỗi thường gặp khi deploy
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick reference deploy tổng quát
- **[DEPLOY.md](./DEPLOY.md)** - Hướng dẫn deploy chi tiết đầy đủ
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Tổng kết công việc chuẩn bị deploy

### 🔧 API & Development
- **[API_GUIDLINES.md](./API_GUIDLINES.md)** - Tài liệu API endpoints và guidelines
- **[QUICK_LOGIN.md](./QUICK_LOGIN.md)** - Hướng dẫn quick login cho testing

### 📊 Database & Seed Data
- **[SEED_DATA_SUMMARY.md](./SEED_DATA_SUMMARY.md)** - Chi tiết về dữ liệu mẫu (branches, users, products, orders)
- **[IMAGE_MANAGEMENT.md](./IMAGE_MANAGEMENT.md)** - Quản lý hình ảnh cho Products & Banners (cập nhật đồng bộ giữa branches)

## 🎯 Bắt Đầu Nhanh

### Lần Đầu Deploy?
👉 Xem [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) để deploy trong 5 phút!

### Cần Hướng Dẫn Chi Tiết?
👉 Xem [DEPLOY.md](./DEPLOY.md) để có tài liệu đầy đủ

### Muốn Test API?
👉 Xem [API_GUIDLINES.md](./API_GUIDLINES.md) để biết tất cả endpoints

## 📋 Tóm Tắt Nhanh

### Deploy Commands
```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run build
npm start
```

### Test Accounts (sau khi seed)
```
Manager:    manager@aneat.com / manager123
Staff:      staff001@aneat.com / staff123
Logistics:  logistics01@aneat.com / logistics123
```

### Essential Scripts
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm start                # Start production server
npm run prisma:seed      # Seed sample data
npm run db:reset         # Reset database
```

## 🗂️ Cấu Trúc Backend

```
backend/
├── docs/              ← Bạn đang ở đây
│   ├── API_GUIDLINES.md
│   ├── DEPLOY.md
│   ├── DEPLOYMENT_SUMMARY.md
│   ├── QUICK_DEPLOY.md
│   └── QUICK_LOGIN.md
├── prisma/
│   ├── migrations/    ← Database migrations
│   ├── seed.ts        ← Seed data
│   └── schema.prisma  ← Database schema
├── src/               ← Source code
├── scripts/           ← Utility scripts
└── .env               ← Configuration
```

## 🆘 Cần Trợ Giúp?

1. **Deployment issues?** → [DEPLOY.md](./DEPLOY.md#troubleshooting)
2. **API questions?** → [API_GUIDLINES.md](./API_GUIDLINES.md)
3. **Quick testing?** → [QUICK_LOGIN.md](./QUICK_LOGIN.md)

---

**Last Updated:** January 20, 2026  
**Status:** ✅ Production Ready
