
# AnEat - Restaurant Management & Ordering System

## Introduction
AnEat là hệ thống quản lý nhà hàng và đặt món trực tuyến, hỗ trợ cả khách hàng, nhân viên, quản lý, admin. Dự án gồm backend (Node.js/Express/Prisma) và frontend (Next.js/React).

## Features
- Đặt món trực tuyến dành cho khách hàng
- Quản lý đơn hàng, hóa đơn, sản phẩm, khuyến mãi
- POS cho nhân viên quầy (hỗ trợ thanh toán MoMo POS, QR)
- Quản lý chi nhánh, kho, vận chuyển
- Đăng nhập nhanh, phân quyền người dùng
- Tích hợp thanh toán MoMo

## User Roles
- **Customer**: Đặt món, thanh toán, xem lịch sử
- **Staff**: Quản lý POS, xác nhận đơn, thanh toán
- **Manager**: Quản lý chi nhánh, sản phẩm, nhân viên
- **Admin**: Quản lý toàn hệ thống
- **Logistic-staff**: Nhân viên phân phối nguyên liệu cho cửa hàng

## Main Function
- Đặt món, thanh toán (MoMo, tiền mặt)
- Quản lý sản phẩm, hóa đơn, khuyến mãi
- Dashboard thống kê, quản lý vận chuyển, kho
- Quản lý người dùng

## Installation
1. **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd AnEat
    ```
2. **Install Dependencies:**
    ```bash
    cd backend && npm install
    cd frontend && yarn install
    ```
3. **Configure environment variables:**
    - Copy `.env.example` thành `.env`
    ```bash
    cp .env.example .env
    ```
    - Sau đó chỉnh sửa .evn với cấu hình:
    ```bash
    # JWT Configuration
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    JWT_EXPIRES_IN=7d

    # CORS Configuration
    CORS_ORIGIN=http://localhost:3000

    # MoMo Payment Gateway
    MOMO_ACCESS_KEY=
    MOMO_SECRET_KEY=
    MOMO_PARTNER_CODE=MOMO
    MOMO_REDIRECT_URL=https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b
    MOMO_IPN_URL=https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b
    MOMO_REQUEST_TYPE=captureWallet
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100

    # Logging
    LOG_LEVEL=info

    ```
## How to run
1. **Development Mode**
    ```bash
    cd frontend
    yarn dev
    ```
    (Tự động khởi động cả backend, frontend, database)
2. **Running Tests**
    - Backend: `cd backend && npm test`
    - Frontend: `cd frontend && yarn test`
3. **Production Build**
    ```bash
    cd frontend
    yarn build
    yarn start
    ```

## Project Structure
```
AnEat/
  backend/
     docker/
     prisma/
     src/
        controllers/
        middleware/
        models/
        routes/
        utils/
     app.ts
     db.ts
     server.ts
  frontend/
     src/
     public/
        icons/
        assets/
     src/
        app/
            admin/
            auth/
            customer/
            logistics-staff/
            manager/
            profile/
            staff/
            layout.tsx
            page.tsx
        components/
        constants/
        contexts/
        hooks/
        lib/
        services/
        styles/
        types/
  docker-compose.yml
```

## Environment Variables
- Backend: DB config, JWT, MoMo keys, CORS, ...
- Frontend: API base URL, ...

## How to Contribute
- Fork repo
- Tạo nhánh mới: `git checkout -b feature/your-feature`
- Commit thay đổi: `git commit -m 'Add some feature`
- Cập nhật nhánh mới: `git push oirgin feature/your-feature`
- Tạo pull request

## License
This project is licenesed under the [MIT License] (LICENSE).