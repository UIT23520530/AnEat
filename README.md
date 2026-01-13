# AnEat – Restaurant Management & Online Ordering System

## Introduction
**AnEat** is a comprehensive restaurant management and online ordering system designed to serve multiple user roles, including customers, staff, managers, logistics staff, and system administrators.

The project is built with a modern technology stack:
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: Next.js, React, Tailwind CSS

AnEat supports online ordering, POS operations, branch management, inventory tracking, logistics coordination, and MoMo payment integration.

---

## Features
- Online food ordering for customers
- Order, invoice, product, and promotion management
- POS system for counter staff (MoMo POS, QR code payments)
- Branch, inventory, and logistics management
- Role-based authentication and authorization
- MoMo payment gateway integration (Online, POS, QR)
- Dashboards and statistical reports

---

## User Roles
- **Customer**: Place orders, make payments, and view order history
- **Staff**: Operate POS, confirm orders, and process payments
- **Manager**: Manage branches, products, and employees
- **Admin**: Manage the entire system
- **Logistics Staff**: Distribute ingredients and supplies to branches

---

## Core Functions
- Order placement and payment (MoMo, cash)
- Product, invoice, and promotion management
- Inventory and logistics tracking
- User and role management
- Analytics and reporting dashboards

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/UIT23520530/AnEat.git
cd AnEat
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
yarn install
```

### 3. Configure Environment Variables
Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your own configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aneat_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# MoMo Payment Gateway
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
MOMO_PARTNER_CODE=MOMO
MOMO_REDIRECT_URL=https://webhook.site/your-redirect-url
MOMO_IPN_URL=https://webhook.site/your-ipn-url
MOMO_REQUEST_TYPE=captureWallet

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## How to Run

### Development Mode
```bash
cd frontend
yarn dev
```

This command will automatically start:
- Backend server (Node.js)
- Frontend application (Next.js)
- Database (PostgreSQL via Docker)

### Running Tests
**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
yarn test
```

### Production Build
```bash
cd frontend
yarn build
yarn start
```

---

## Project Structure
```
AnEat/
├── backend/
│   ├── docker/
│   │   ├── Dockerfile
│   │   ├── config/
│   │   └── database/
│   │       └── init.sql
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed-*.ts
│   ├── scripts/
│   ├── src/
│   │   ├── app.ts
│   │   ├── db.ts
│   │   ├── server.ts
│   │   ├── controllers/
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   ├── manager/
│   │   │   ├── staff/
│   │   │   ├── logistics-staff/
│   │   │   └── shared/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   ├── assets/
│   │   └── manifest.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── logistics-staff/
│   │   │   ├── manager/
│   │   │   ├── staff/
│   │   │   ├── profile/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   ├── constants/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

### Backend
- **Database**: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN`
- **CORS**: `CORS_ORIGIN`
- **MoMo Payment**: `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_PARTNER_CODE`, etc.
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- **Logging**: `LOG_LEVEL`, `NODE_ENV`

### Frontend
- **API Base URL**: Backend server address (e.g., `http://localhost:3001`)

---

## Contributing

We welcome contributions! Follow these steps:

1. **Fork the repository**

2. **Create a new feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Commit your changes:**
   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to your branch:**
   ```bash
   git push origin feature/your-feature
   ```

5. **Open a Pull Request**

---

## License
This project is licensed under the [MIT License](LICENSE).