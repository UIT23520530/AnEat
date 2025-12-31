# Dashboard API Documentation

## Overview
API endpoints for manager dashboard providing comprehensive statistics, analytics, and reporting capabilities.

## Base URL
```
/api/v1/manager/dashboard
```

## Authentication
All endpoints require authentication token with ADMIN_BRAND role.

## Endpoints

### 1. Get Dashboard Statistics
**GET** `/stats`

Get comprehensive statistics for dashboard overview.

**Query Parameters:**
- `dateFrom` (string, optional): Start date (YYYY-MM-DD)
- `dateTo` (string, optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "revenue": {
      "today": 5000000,
      "week": 35000000,
      "month": 150000000,
      "year": 1800000000
    },
    "orders": {
      "today": 45,
      "week": 320,
      "month": 1250,
      "total": 15000
    },
    "profit": {
      "today": 1500000,
      "week": 10500000,
      "month": 45000000
    },
    "customers": {
      "total": 5000,
      "new": 150
    }
  }
}
```

### 2. Get Revenue Data
**GET** `/revenue`

Get revenue data for charts with flexible period grouping.

**Query Parameters:**
- `period` (string, required): "day" | "week" | "month"
- `dateFrom` (string, optional): Start date
- `dateTo` (string, optional): End date

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "date": "2024-12-01",
      "revenue": 4500000,
      "orders": 52,
      "profit": 1350000
    },
    {
      "date": "2024-12-02",
      "revenue": 5200000,
      "orders": 58,
      "profit": 1560000
    }
  ]
}
```

### 3. Get Top Selling Products
**GET** `/top-products`

Get top selling products ranked by units sold.

**Query Parameters:**
- `limit` (number, optional): Number of products, default 10

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clx123",
      "name": "Combo Gà Rán",
      "image": "https://example.com/combo.jpg",
      "unitsSold": 256,
      "revenue": 12800000,
      "profit": 3840000
    }
  ]
}
```

### 4. Get Inventory Alerts
**GET** `/inventory-alerts`

Get products with low stock or out of stock.

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clxprod1",
      "name": "Hamburger",
      "image": "https://example.com/burger.jpg",
      "currentStock": 5,
      "minStock": 20,
      "status": "low"
    },
    {
      "id": "clxprod2",
      "name": "Pizza",
      "image": null,
      "currentStock": 0,
      "minStock": 15,
      "status": "out"
    }
  ]
}
```

### 5. Get Recent Activities
**GET** `/activities`

Get recent orders and transactions.

**Query Parameters:**
- `limit` (number, optional): Number of activities, default 10

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clxbill1",
      "type": "order",
      "billNumber": "BILL-20241231-001",
      "orderNumber": "ORD-20241231-001",
      "total": 350000,
      "status": "PAID",
      "staffName": "Nguyễn Văn A",
      "createdAt": "2024-12-31T10:30:00.000Z"
    }
  ]
}
```

### 6. Export Report to Excel
**GET** `/export`

Export dashboard report to Excel file.

**Query Parameters:**
- `dateFrom` (string, required): Start date (YYYY-MM-DD)
- `dateTo` (string, required): End date (YYYY-MM-DD)

**Response:**
Binary Excel file (.xlsx) with headers:
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename=BaoCao_DoanhThu_{dateFrom}_{dateTo}.xlsx

**Excel Structure:**
- **Sheet 1 - Tổng quan**: Summary statistics
  - Tổng số hóa đơn
  - Tổng doanh thu
  - Tổng lợi nhuận
  - Giá trị đơn hàng trung bình
  
- **Sheet 2 - Chi tiết hóa đơn**: Detailed bill list
  - Mã HĐ, Mã đơn, Ngày, Giờ
  - Khách hàng, SĐT
  - Số món, Tạm tính, Thuế, Giảm giá
  - Tổng tiền, PT thanh toán, Nhân viên

## Business Logic

### Revenue Calculation
- Revenue = Total from paid bills
- Profit = Revenue × 0.3 (30% profit margin assumption)

### Inventory Alert Logic
- **Low Stock**: currentStock <= minStock && currentStock > 0
- **Out of Stock**: currentStock === 0

### Top Products Ranking
- Based on quantity sold in last 30 days
- Sorted descending by units sold
- Limited to specified number (default 10)

### Period Grouping
- **Day**: Groups by date (YYYY-MM-DD)
- **Week**: Groups by ISO week number
- **Month**: Groups by year-month (YYYY-MM)

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "code": 400,
  "message": "Invalid period. Must be one of: day, week, month"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "code": 401,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "code": 403,
  "message": "Insufficient permissions"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "code": 500,
  "message": "Failed to get dashboard statistics"
}
```

## Usage Examples

### Get Dashboard Stats
```typescript
const response = await dashboardService.getStats();
console.log(response.data.revenue.month); // Monthly revenue
```

### Get Revenue Chart Data
```typescript
const response = await dashboardService.getRevenueData({
  period: "day",
  dateFrom: "2024-12-01",
  dateTo: "2024-12-31",
});
console.log(response.data); // Array of daily revenue data
```

### Export Report
```typescript
const blob = await dashboardService.exportReport("2024-12-01", "2024-12-31");
// Create download link
const url = window.URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "BaoCao_DoanhThu_2024-12-01_2024-12-31.xlsx";
link.click();
```

## Performance Considerations

1. **Caching**: Consider caching statistics for short periods (5-10 minutes)
2. **Indexing**: Ensure indexes on:
   - bills.branchId
   - bills.status
   - bills.createdAt
   - orderItems.productId
3. **Pagination**: Not applicable for analytics endpoints
4. **Aggregation**: Use database aggregation functions for better performance

## Notes
- All monetary values in VND (cents)
- Dates in ISO 8601 format
- Profit margin is configurable (currently 30%)
- Inventory alerts require BranchInventory table setup
- Excel export uses exceljs library for formatting
