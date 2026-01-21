# 🚀 Quick Deployment Reference

## ⚡ TL;DR - Deploy Nhanh

```bash
# 1. Clone & Install
git clone <repo> && cd AnEat/backend && npm install

# 2. Setup Environment
cp .env.example .env
# Sửa DATABASE_URL và JWT_SECRET trong .env

# 3. Database Setup
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed  # Optional: dữ liệu mẫu

# 4. Build & Run
npm run build
npm start
```

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:migrate:deploy` | Deploy migrations vào database |
| `npm run prisma:seed` | Tạo dữ liệu mẫu |
| `npm run build` | Build TypeScript |
| `npm start` | Start production server |
| `npm run dev` | Development mode |
| `npm run db:reset` | Reset DB (⚠️ xóa data) |

## 🔑 Test Accounts (Sau khi seed)

```
Manager:    manager@aneat.com / manager123
Staff:      staff001@aneat.com / staff123  
Logistics:  logistics01@aneat.com / logistics123
```

## 🐳 Docker

```bash
docker-compose up -d
```

## 📂 File Structure

```
backend/
├── prisma/
│   ├── migrations/20260120032224_init_production/  ← Migration duy nhất
│   ├── seed.ts                                     ← Seed duy nhất
│   └── schema.prisma
├── src/           ← Source code
├── dist/          ← Build output
└── .env           ← Config (DON'T COMMIT!)
```

## ⚠️ Before Production

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Update `DATABASE_URL` with production DB
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for frontend domain
- [ ] Remove or change default passwords
- [ ] Setup SSL/HTTPS
- [ ] Enable monitoring & logging

## 📖 Full Documentation

- [DEPLOY.md](./DEPLOY.md) - Chi tiết hướng dẫn deploy
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Tổng kết công việc
- [API_GUIDLINES.md](./API_GUIDLINES.md) - Tài liệu API

## 🆘 Troubleshooting

**Database connection error?**
```bash
# Check PostgreSQL is running
pg_isready
# Or create database
createdb aneat_db
```

**Migration error?**
```bash
npm run db:reset  # Reset everything
```

**Build error?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📞 Health Check

```bash
curl http://localhost:3000/api/health
```

---

✅ **Ready to deploy!** Xem [DEPLOY.md](./DEPLOY.md) để biết chi tiết
