# Seed Data Summary

## Overview
This document provides a comprehensive overview of the seed data created for the AnEat application. The data is designed to demonstrate all features and provide realistic demo/testing scenarios for dashboard metrics.

## Database Structure

### 🏢 Branches (3)
| Branch Name | Code | Location | Manager |
|-------------|------|----------|---------|
| AnEat Quận 1 | HCM-Q1 | 123 Nguyễn Huệ, Q1, HCM | Trần Thị Quản Lý Q1 |
| AnEat Quận 3 | HCM-Q3 | 456 Võ Văn Tần, Q3, HCM | Lê Văn Quản Lý Q3 |
| AnEat Thủ Đức | HCM-TD | 789 Võ Nguyên Giáp, TD, HCM | Phạm Thị Quản Lý TD |

### 👥 Users by Role

#### ADMIN_SYSTEM (1)
- **Nguyễn Văn Admin**
  - Email: `admin@aneat.com`
  - Password: `admin123`
  - Role: Full system administrator

#### ADMIN_BRAND (3 - Managers)
| Name | Email | Password | Branch |
|------|-------|----------|--------|
| Trần Thị Quản Lý Q1 | manager.q1@aneat.com | manager123 | AnEat Quận 1 |
| Lê Văn Quản Lý Q3 | manager.q3@aneat.com | manager123 | AnEat Quận 3 |
| Phạm Thị Quản Lý TD | manager.td@aneat.com | manager123 | AnEat Thủ Đức |

#### STAFF (9 - 3 per branch)
| Name | Email | Password | Branch |
|------|-------|----------|--------|
| Nguyễn Văn A | staff.q1.01@aneat.com | staff123 | AnEat Quận 1 |
| Trần Thị B | staff.q1.02@aneat.com | staff123 | AnEat Quận 1 |
| Lê Văn C | staff.q1.03@aneat.com | staff123 | AnEat Quận 1 |
| Phạm Thị D | staff.q3.01@aneat.com | staff123 | AnEat Quận 3 |
| Hoàng Văn E | staff.q3.02@aneat.com | staff123 | AnEat Quận 3 |
| Vũ Thị F | staff.q3.03@aneat.com | staff123 | AnEat Quận 3 |
| Đặng Văn G | staff.td.01@aneat.com | staff123 | AnEat Thủ Đức |
| Bùi Thị H | staff.td.02@aneat.com | staff123 | AnEat Thủ Đức |
| Trương Văn I | staff.td.03@aneat.com | staff123 | AnEat Thủ Đức |

#### LOGISTICS_STAFF (5)
| Name | Email | Password |
|------|-------|----------|
| Nguyễn Văn Giao | logistics01@aneat.com | logistics123 |
| Trần Thị Vận | logistics02@aneat.com | logistics123 |
| Lê Văn Chuyển | logistics03@aneat.com | logistics123 |
| Phạm Văn Tải | logistics04@aneat.com | logistics123 |
| Hoàng Văn Kho | logistics05@aneat.com | logistics123 |

### 🛍️ Customers (5)
| Name | Email | Phone |
|------|-------|-------|
| Khách Hàng A | customer01@gmail.com | 0901234501 |
| Khách Hàng B | customer02@gmail.com | 0901234502 |
| Khách Hàng C | customer03@gmail.com | 0901234503 |
| Khách Hàng D | customer04@gmail.com | 0901234504 |
| Khách Hàng E | customer05@gmail.com | 0901234505 |

## Product Categories (6)

| Category | Code | Description |
|----------|------|-------------|
| 🍔 Burger | BURGER | Burger các loại |
| 🍗 Gà Rán | FRIED_CHICKEN | Gà rán giòn tan |
| 🍟 Món Ăn Kèm | SIDE_DISHES | Khoai tây chiên, salad... |
| 🥤 Thức Uống | BEVERAGES | Nước ngọt, trà, cà phê |
| 🍰 Tráng Miệng | DESSERTS | Kem, bánh ngọt |
| 🎁 Combo | COMBO | Combo tiết kiệm |

## Products

### Overview
- **Total Products:** 105 (35 base products × 3 branches)
- **Products per Branch:** 35
- **All products include:**
  - Product name
  - Description
  - Price (15,000đ - 189,000đ)
  - Image path
  - Category
  - Branch-specific product codes (e.g., `BURGER-001-HCM-Q1`)

### Sample Products (Base Products - Replicated per Branch)

#### Burgers (8 items)
1. Burger Bò Phô Mai - 69,000đ
2. Burger Gà Giòn - 59,000đ
3. Burger Tôm - 75,000đ
4. Burger Cá - 65,000đ
5. Double Burger Bò - 89,000đ
6. Whopper Burger - 79,000đ
7. BBQ Bacon Burger - 85,000đ
8. Mushroom Swiss Burger - 72,000đ

#### Gà Rán (6 items)
1. Gà Rán 1 Miếng - 35,000đ
2. Gà Rán 2 Miếng - 65,000đ
3. Gà Rán 3 Miếng - 95,000đ
4. Cánh Gà Cay 4 Miếng - 45,000đ
5. Gà Phi Lê 3 Miếng - 55,000đ
6. Gà Que 6 Miếng - 48,000đ

#### Món Ăn Kèm (7 items)
1. Khoai Tây Chiên Vừa - 25,000đ
2. Khoai Tây Chiên Lớn - 35,000đ
3. Khoai Tây Lắc Phô Mai - 38,000đ
4. Salad Trộn - 32,000đ
5. Súp Rong Biển - 22,000đ
6. Thanh Cua - 28,000đ
7. Xúc Xích Que - 18,000đ

#### Thức Uống (6 items)
1. Coca Cola - 15,000đ
2. Pepsi - 15,000đ
3. 7Up - 15,000đ
4. Trà Đào - 28,000đ
5. Cà Phê Đen - 25,000đ
6. Cà Phê Sữa - 28,000đ

#### Tráng Miệng (3 items)
1. Kem Vani - 20,000đ
2. Kem Socola - 22,000đ
3. Bánh Flan - 18,000đ

#### Combo (5 items)
1. Combo Burger + Gà - 129,000đ
2. Combo Gia Đình - 189,000đ
3. Combo Tiết Kiệm - 99,000đ
4. Combo Nhóm Bạn - 159,000đ
5. Combo Sinh Viên - 79,000đ

## Orders

### Overview
- **Total Orders Created:** ~15-30 (varies per seed run)
- **Orders per Branch:** 5-10 (randomized)
- **Order Date Range:** Last 7 days
- **Order Time:** Random throughout the day

### Order Statuses (Diverse for Dashboard)
Each branch receives orders with varied statuses:
- ⏳ **PENDING** - Orders waiting to be confirmed
- 👨‍🍳 **PREPARING** - Orders being prepared
- ✅ **READY** - Orders ready for pickup/delivery
- 🎉 **COMPLETED** - Successfully completed orders (with bills)
- ❌ **CANCELLED** - Cancelled orders

### Order Details
Each order includes:
- Unique order number
- Customer assignment
- Staff assignment (from branch staff)
- 1-4 random products from branch
- Random quantities (1-3 per product)
- Total amount calculation
- Delivery address
- Creation timestamp (last 7 days)

### Bills
- **Bills Created:** Only for COMPLETED orders
- **Bill Details:**
  - Unique bill number
  - Subtotal amount
  - Tax amount (0 in seed data)
  - Discount amount (0 in seed data)
  - Total amount
  - Payment method (CASH or CARD - random)
  - Payment status: PAID
  - Issued by assigned staff member

## Banners (3)

1. **NỞ CÀNG BỤNG VUI BẤT MOOD**
   - Image: `/assets/banners/banner-1.png`
   - Link: `/promotions`

2. **BURGER PHÔ MAI MỚI**
   - Image: `/assets/banners/banner-2.png`
   - Link: `/products/burgers`

3. **MỲ Ý THƯỢNG HẠNG**
   - Image: `/assets/banners/banner-3.png`
   - Link: `/products/pasta`

## Dashboard Metrics

The seeded data provides comprehensive metrics for dashboard displays:

### Branch Performance
- ✅ Orders distributed across 3 branches
- ✅ Staff assignments per branch
- ✅ Product availability per branch
- ✅ Revenue data per branch (from completed orders)

### Order Analytics
- ✅ Orders by status (PENDING, PREPARING, READY, COMPLETED, CANCELLED)
- ✅ Orders by time (last 7 days with random distribution)
- ✅ Orders by staff member
- ✅ Orders by customer

### Revenue Metrics
- ✅ Total revenue from completed orders
- ✅ Revenue by branch
- ✅ Revenue by payment method
- ✅ Average order value

### Product Insights
- ✅ Products by category
- ✅ Products by branch
- ✅ Product prices and images

## Testing Scenarios

### Login Testing
You can test the application with different user roles:

```bash
# Admin System
Email: admin@aneat.com
Password: admin123

# Branch Managers
Email: manager.q1@aneat.com | manager.q3@aneat.com | manager.td@aneat.com
Password: manager123

# Staff Members
Email: staff.q1.01@aneat.com (or any staff email)
Password: staff123

# Logistics Staff
Email: logistics01@aneat.com (or any logistics email)
Password: logistics123
```

### Dashboard Testing
1. **Login as Admin** to see system-wide metrics
2. **Login as Manager** to see branch-specific data
3. **Login as Staff** to see orders assigned to them
4. **Check Order Statistics** - verify diverse status distribution
5. **Check Revenue Reports** - verify bills for completed orders

## Running the Seed

To reset the database and run the seed:

```bash
npm run db:reset
```

To run seed only (without reset):

```bash
npm run prisma:seed
```

## Notes

- All passwords are hashed using bcrypt
- Product codes are branch-specific for inventory tracking
- Orders are randomly distributed to simulate real usage
- Customer data is minimal for privacy
- All monetary values are in Vietnamese Dong (VND)
- Images are referenced but not included in seed (must exist in frontend)

## Future Enhancements

Consider adding:
- [ ] More diverse order statuses (in-transit, delayed, etc.)
- [ ] Product reviews and ratings
- [ ] Promotion and discount codes
- [ ] Stock levels and inventory transactions
- [ ] Customer order history and preferences
- [ ] More detailed delivery tracking
