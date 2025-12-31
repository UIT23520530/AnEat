# Customer Management API Documentation

## Overview
API endpoints for managing customers and loyalty program, allowing managers to view, update customer information, adjust points, and manage tier levels.

## Base URL
```
/api/v1/manager/customers
```

## Authentication
All endpoints require authentication token in header:
```
Authorization: Bearer <token>
```
**Authorization**: Manager role (ADMIN_BRAND) required

## Customer Tiers
- **BRONZE**: Default tier for new customers
- **SILVER**: Upgraded tier
- **GOLD**: Premium tier
- **VIP**: Highest tier with special privileges (bulk orders, partnerships)

## Endpoints

### 1. Get All Customers
**GET** `/`

Get paginated list of customers with filtering and sorting options.

**Query Parameters:**
- `page` (number, optional): Page number, default 1
- `limit` (number, optional): Items per page, default 10
- `sort` (string, optional): Sort field, default 'createdAt'
- `order` ('asc'|'desc', optional): Sort order, default 'desc'
- `search` (string, optional): Search by name, phone, email
- `tier` (CustomerTier, optional): Filter by tier

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clx123456",
      "phone": "0987654321",
      "name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "tier": "VIP",
      "totalSpent": 5000000,
      "points": 1500,
      "lastOrderDate": "2024-12-30T10:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-12-30T10:00:00.000Z",
      "_count": {
        "orders": 45,
        "reviews": 12
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "limit": 10,
    "total_items": 98
  }
}
```

### 2. Get Customer Statistics
**GET** `/statistics`

Get comprehensive customer statistics including tier distribution and top customers.

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "totalCustomers": 512,
    "tierDistribution": {
      "BRONZE": 300,
      "SILVER": 150,
      "GOLD": 50,
      "VIP": 12
    },
    "topCustomers": [
      {
        "id": "clx123",
        "name": "Nguyễn Văn A",
        "phone": "0987654321",
        "tier": "VIP",
        "totalSpent": 10000000,
        "points": 3000,
        "_count": {
          "orders": 120
        }
      }
    ],
    "recentCustomers": [
      {
        "id": "clx456",
        "name": "Trần Thị B",
        "phone": "0912345678",
        "tier": "BRONZE",
        "createdAt": "2024-12-31T08:00:00.000Z"
      }
    ],
    "averageSpent": 975000
  }
}
```

### 3. Search Customers
**GET** `/search`

Quick search customers across all branches.

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (number, optional): Max results, default 20

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clx123",
      "phone": "0987654321",
      "name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "tier": "VIP",
      "totalSpent": 5000000,
      "points": 1500
    }
  ]
}
```

### 4. Get Customer by ID
**GET** `/:id`

Get detailed customer information including recent orders.

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "clx123",
    "phone": "0987654321",
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "avatar": null,
    "tier": "VIP",
    "totalSpent": 5000000,
    "points": 1500,
    "lastOrderDate": "2024-12-30T10:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-12-30T10:00:00.000Z",
    "_count": {
      "orders": 45,
      "reviews": 12
    },
    "orders": [
      {
        "id": "clxord123",
        "orderNumber": "ORD-20241230-001",
        "total": 350000,
        "status": "COMPLETED",
        "createdAt": "2024-12-30T10:00:00.000Z",
        "branch": {
          "id": "clxbr1",
          "name": "Chi nhánh Quận 1"
        }
      }
    ]
  }
}
```

### 5. Create Customer
**POST** `/`

Manually register a new customer.

**Request Body:**
```json
{
  "phone": "0987654321",
  "name": "Nguyễn Văn A",
  "email": "customer@example.com",
  "tier": "BRONZE"
}
```

**Validation Rules:**
- `phone`: Required, exactly 10 digits
- `name`: Required, non-empty
- `email`: Optional, valid email format
- `tier`: Optional, one of [BRONZE, SILVER, GOLD, VIP]

**Response:**
```json
{
  "success": true,
  "code": 201,
  "message": "Customer created successfully",
  "data": {
    "id": "clx123",
    "phone": "0987654321",
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "tier": "BRONZE",
    "points": 0,
    "totalSpent": 0,
    "createdAt": "2024-12-31T10:00:00.000Z"
  }
}
```

### 6. Update Customer
**PATCH** `/:id`

Update customer information. Managers can update VIP customer details.

**Request Body:**
```json
{
  "name": "Nguyễn Văn A (Updated)",
  "email": "newemail@example.com",
  "tier": "GOLD",
  "points": 2000
}
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Customer updated successfully",
  "data": {
    "id": "clx123",
    "phone": "0987654321",
    "name": "Nguyễn Văn A (Updated)",
    "email": "newemail@example.com",
    "tier": "GOLD",
    "points": 2000,
    "totalSpent": 5000000,
    "updatedAt": "2024-12-31T10:00:00.000Z"
  }
}
```

### 7. Adjust Customer Points
**POST** `/:id/adjust-points`

Adjust points for VIP/special customers. Creates audit trail.

**Request Body:**
```json
{
  "points": 500,
  "reason": "Compensation for service issue"
}
```

**Validation Rules:**
- `points`: Required, integer, cannot be zero (positive to add, negative to subtract)
- `reason`: Required, minimum 5 characters

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Customer points adjusted successfully",
  "data": {
    "id": "clx123",
    "phone": "0987654321",
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "tier": "VIP",
    "points": 2000,
    "totalSpent": 5000000,
    "updatedAt": "2024-12-31T10:00:00.000Z"
  }
}
```

### 8. Update Customer Tier
**PATCH** `/:id/tier`

Upgrade or downgrade customer tier level.

**Request Body:**
```json
{
  "tier": "VIP",
  "reason": "Bulk order partnership agreement"
}
```

**Validation Rules:**
- `tier`: Required, one of [BRONZE, SILVER, GOLD, VIP]
- `reason`: Optional

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Customer tier updated successfully",
  "data": {
    "id": "clx123",
    "phone": "0987654321",
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "tier": "VIP",
    "points": 1500,
    "totalSpent": 5000000,
    "updatedAt": "2024-12-31T10:00:00.000Z"
  }
}
```

### 9. Get Customer Orders
**GET** `/:id/orders`

Get order history for a specific customer.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "clxord123",
      "orderNumber": "ORD-20241230-001",
      "total": 350000,
      "status": "COMPLETED",
      "paymentMethod": "CASH",
      "paymentStatus": "PAID",
      "discountAmount": 0,
      "createdAt": "2024-12-30T10:00:00.000Z",
      "branch": {
        "id": "clxbr1",
        "name": "Chi nhánh Quận 1",
        "address": "123 Nguyễn Huệ, Q.1"
      },
      "items": [
        {
          "id": "clxitem1",
          "quantity": 2,
          "price": 175000,
          "product": {
            "id": "clxprod1",
            "name": "Combo Gà Rán",
            "image": "https://example.com/combo.jpg"
          }
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "limit": 10,
    "total_items": 45
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "code": 400,
  "message": "Invalid phone number format (must be 10 digits)"
}
```

### 404 Not Found
```json
{
  "success": false,
  "code": 404,
  "message": "Customer not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "code": 409,
  "message": "Customer with this phone number already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "code": 500,
  "message": "Failed to update customer"
}
```

## Usage Example (Frontend)

```typescript
import { managerCustomerService } from '@/services/manager-customer.service';

// Get customers list
const getCustomers = async () => {
  const response = await managerCustomerService.getCustomers({
    page: 1,
    limit: 10,
    tier: 'VIP',
    search: 'Nguyễn'
  });
  console.log(response.data);
};

// Adjust VIP customer points
const adjustPoints = async (customerId: string) => {
  const response = await managerCustomerService.adjustPoints(customerId, {
    points: 500,
    reason: 'Compensation for delayed delivery'
  });
  console.log('Updated:', response.data);
};

// Upgrade to VIP tier
const upgradeToVIP = async (customerId: string) => {
  const response = await managerCustomerService.updateTier(customerId, {
    tier: 'VIP',
    reason: 'Bulk order partnership agreement'
  });
  console.log('Upgraded:', response.data);
};

// Get statistics
const getStats = async () => {
  const response = await managerCustomerService.getStatistics();
  console.log('Stats:', response.data);
};
```

## Business Rules

### Loyalty Program
- **Points Earning**: Customers earn points based on spending
- **Tier Benefits**: Higher tiers get better discounts and privileges
- **VIP Customers**: Special handling for bulk orders and partnerships

### Manager Capabilities
- View all customers across branches
- Manually adjust points for special cases
- Upgrade/downgrade customer tiers
- Create customer records manually
- View complete order history

### Data Sharing
- Customer information shared across all branches in the chain
- VIP customers identified system-wide
- Special exceptions for partnership customers
- Manager can edit VIP customer details with audit trail

## Notes
- All monetary values are stored in cents (VND)
- Phone numbers must be exactly 10 digits (Vietnamese format)
- Points adjustments create audit trail (TODO: implement audit log table)
- Customer tier changes should be documented with reasons
- VIP customers require manager approval for modifications
