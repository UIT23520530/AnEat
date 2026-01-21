# Local Development vs Production Deployment

## 🖥️ Local Development

### Chạy dự án locally

```bash
# Terminal 1: Frontend
cd frontend
yarn install
yarn dev                    # Port 3000

# Terminal 2: Backend  
cd backend
npm install
npm run dev                 # Port 3001

# Terminal 3: Database (nếu dùng Docker)
docker-compose up postgres
```

### Database Commands (Local)

#### ✅ Reset Database (Xóa data cũ + Seed)
```bash
cd backend
npx prisma migrate reset --force
```
**Tác dụng:**
1. DROP database
2. CREATE database lại
3. Chạy tất cả migrations
4. Tự động chạy seed

#### ✅ Chỉ seed (không xóa data)
```bash
npm run prisma:seed
```

#### ✅ Tạo migration mới
```bash
npx prisma migrate dev --name ten_migration
```

#### ✅ Prisma Studio (GUI)
```bash
npm run prisma:studio
# Mở http://localhost:5555
```

---

## ☁️ Production (Render)

### Các lệnh được chạy tự động khi deploy

File `start.sh` sẽ chạy:
```bash
npx prisma migrate deploy    # Áp dụng migrations MỚI
npm run prisma:seed          # Seed (nếu uncomment)
node dist/server.js          # Start server
```

### ⚠️ KHÔNG BAO GIỜ làm trên Production

```bash
❌ npx prisma migrate reset --force
❌ npx prisma db push --force-reset
❌ DROP DATABASE
```

**Lý do:** Sẽ XÓA TOÀN BỘ DATA thật của người dùng!

### ✅ Safe Commands (Render Shell)

```bash
# Xem logs
tail -f /var/log/app.log

# Seed database (an toàn, không xóa data)
npm run prisma:seed

# Chạy migration cụ thể
npx prisma migrate deploy

# Kiểm tra database status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate
```

---

## 📋 So sánh

| Tác vụ | Local | Production |
|--------|-------|------------|
| **Reset DB** | ✅ `migrate reset --force` | ❌ NGUY HIỂM |
| **Áp dụng migrations** | `migrate dev` | `migrate deploy` |
| **Seed data** | `prisma:seed` | `prisma:seed` (cẩn thận) |
| **Xem DB** | Prisma Studio | Render Dashboard/Shell |
| **Connect DB** | localhost:5432 | Internal URL |
| **Backup** | Không cần | Tự động 7 ngày |

---

## 🎯 Best Practices

### Local Development
1. **Thường xuyên reset** để test seed script
2. Dùng `.env` file (không commit)
3. Dùng `dev` commands
4. Test migrations trước khi push

### Production
1. **KHÔNG BAO GIỜ** reset database
2. Dùng Environment Variables trên Render
3. Chỉ dùng `deploy` commands
4. Test migrations trên staging trước
5. Backup data trước khi migrate

---

## 🔧 Troubleshooting

### Local: "Database not found"
```bash
# Tạo lại database
npx prisma migrate reset --force
```

### Local: "Migration failed"
```bash
# Xóa folder migrations và tạo lại
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Production: "Migration failed"
```bash
# Vào Render Shell
npx prisma migrate resolve --rolled-back "migration_name"
npx prisma migrate deploy
```

### Production: "Cần xóa toàn bộ data và seed lại"
```bash
# Option 1: Xóa database và tạo lại trên Render Dashboard
# Option 2: Vào Shell (NGUY HIỂM!)
npx prisma migrate reset --force
```

---

## 📚 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Seeding**: https://www.prisma.io/docs/guides/migrate/seed-database
