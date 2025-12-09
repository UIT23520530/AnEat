# AnEat - Database & Docker Setup Guide

## 📁 Cấu trúc thư mục

```
AnEat/
├── backend/                    # Backend Node.js + API
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js      # Configuration
│   │   │   └── database.js    # PostgreSQL connection (pg)
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Middleware
│   │   ├── utils/             # Utilities
│   │   └── server.js          # Entry point
│   ├── prisma/                # 🔥 Prisma ORM
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed-nationwide.js # Seed data
│   ├── Dockerfile             # Backend Docker image
│   ├── .dockerignore
│   ├── package.json
│   └── README.md
│
├── database/                   # Database utilities (legacy)
│   └── init.sql               # PostgreSQL initialization
│
├── frontend/                   # Next.js frontend
│
├── docker-compose.yml         # 🐳 Docker orchestration
├── .env.docker                # Docker environment template
└── README.md
```

## 🗄️ Database (PostgreSQL)

### Vị trí các file database:

1. **Prisma Schema**: `backend/prisma/schema.prisma`
   - Định nghĩa database schema
   - Models, relations, enums
   
2. **Migrations**: `backend/prisma/migrations/`
   - Database migration history
   - Version control cho schema changes

3. **Seed Data**: `backend/prisma/seed-nationwide.js`
   - Initial data cho development/testing

4. **Init Script**: `database/init.sql`
   - PostgreSQL extensions và functions
   - Chạy tự động khi container khởi động lần đầu

### Database Commands:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed

# Open Prisma Studio (GUI)
npm run prisma:studio

# Reset database
npm run db:reset
```

## 🐳 Docker Setup

### Vị trí các file Docker:

1. **docker-compose.yml** (Root level)
   - Orchestrate tất cả services
   - PostgreSQL, Backend, pgAdmin
   
2. **backend/Dockerfile**
   - Backend container image
   
3. **.env.docker** (Root level)
   - Environment variables cho Docker

### Docker Services:

- **postgres**: PostgreSQL 16 database
  - Port: 5432
  - Volume: persistent data storage
  
- **backend**: Node.js API server
  - Port: 3001
  - Auto-connects to postgres
  
- **pgadmin**: Database management UI
  - Port: 5050
  - URL: http://localhost:5050

### Docker Commands:

```bash
# 1. Copy và configure environment
cp .env.docker .env

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down

# 5. Stop và xóa volumes (reset database)
docker-compose down -v

# 6. Rebuild backend
docker-compose up -d --build backend

# 7. Run migrations in container
docker-compose exec backend npm run prisma:migrate:deploy

# 8. Seed database in container
docker-compose exec backend npm run prisma:seed
```

## 🚀 Quick Start

### Option 1: Local Development (No Docker)

```bash
# 1. Start PostgreSQL locally
# Make sure PostgreSQL is running on localhost:5432

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env với database credentials

# 3. Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 4. Start server
npm run dev
```

### Option 2: Docker Development

```bash
# 1. Configure environment
cp .env.docker .env
# Edit .env nếu cần

# 2. Start services
docker-compose up -d

# 3. Run migrations
docker-compose exec backend npm run prisma:migrate:deploy

# 4. Seed data
docker-compose exec backend npm run prisma:seed

# 5. Check status
docker-compose ps
```

## 📊 Access Points

- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health
- **pgAdmin**: http://localhost:5050
  - Email: admin@aneat.com
  - Password: admin
- **PostgreSQL**: localhost:5432
  - Database: aneat_db
  - User: aneat_user
  - Password: aneat_password

## 🔧 Prisma vs pg module

Project này sử dụng cả 2:

- **Prisma** (`@prisma/client`): 
  - ORM cho type-safe queries
  - Schema management
  - Migrations
  - Recommended cho app logic

- **pg** (`pg` module):
  - Raw SQL queries khi cần
  - Custom complex queries
  - Legacy code support

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aneat_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aneat_db
DB_USER=your_user
DB_PASSWORD=your_password

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_secret
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Docker (.env)
```env
DB_USER=aneat_user
DB_PASSWORD=aneat_password
DB_NAME=aneat_db
DB_PORT=5432
BACKEND_PORT=3001
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Security Notes

- Không commit file `.env` vào Git
- Thay đổi `JWT_SECRET` trong production
- Sử dụng strong passwords cho database
- Review `docker-compose.yml` ports trước khi deploy

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Prisma errors
```bash
# Regenerate client
npm run prisma:generate

# Reset database
npm run db:reset
```

### Port already in use
```bash
# Change ports in .env
BACKEND_PORT=3002
DB_PORT=5433
```
