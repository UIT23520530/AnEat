# Branch Management API Documentation

## Overview
API endpoints for managing branch information, allowing managers to view and update their branch details.

## Base URL
```
/api/v1/manager/branch
```

## Authentication
All endpoints require authentication token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Manager's Branch Information
**GET** `/`

Get the branch information for the authenticated manager.

**Response**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "clx123456",
    "code": "BR001",
    "name": "AnEat - Chi nhánh Quận 1",
    "address": "123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM",
    "phone": "0987654321",
    "email": "branch1@aneat.com",
    "managerId": "clx789012",
    "manager": {
      "id": "clx789012",
      "name": "Nguyễn Văn A",
      "email": "manager@aneat.com",
      "phone": "0901234567",
      "avatar": "https://example.com/avatar.jpg"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "_count": {
      "staff": 12,
      "products": 48,
      "orders": 1523,
      "tables": 15
    }
  }
}
```

### 2. Update Manager's Branch Information
**PATCH** `/`

Update the branch information. Manager can update name, address, phone, and email.

**Request Body**
```json
{
  "name": "AnEat - Chi nhánh Quận 1 (Updated)",
  "address": "456 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM",
  "phone": "0987654321",
  "email": "branch1.updated@aneat.com"
}
```

**Validation Rules**
- `name`: Optional, string, non-empty if provided
- `address`: Optional, string, non-empty if provided
- `phone`: Optional, must be exactly 10 digits
- `email`: Optional, must be valid email format

**Response**
```json
{
  "success": true,
  "code": 200,
  "message": "Branch information updated successfully",
  "data": {
    "id": "clx123456",
    "code": "BR001",
    "name": "AnEat - Chi nhánh Quận 1 (Updated)",
    "address": "456 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM",
    "phone": "0987654321",
    "email": "branch1.updated@aneat.com",
    "managerId": "clx789012",
    "manager": {
      "id": "clx789012",
      "name": "Nguyễn Văn A",
      "email": "manager@aneat.com"
    },
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### 3. Get Branch Statistics
**GET** `/statistics`

Get statistical information about the branch including staff count, orders, products, and revenue.

**Response**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "totalStaff": 12,
    "totalOrders": 1523,
    "totalProducts": 48,
    "totalTables": 15,
    "totalRevenue": 228000000,
    "averageOrderValue": 150000
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "code": 400,
  "message": "Manager is not assigned to any branch"
}
```

```json
{
  "success": false,
  "code": 400,
  "message": "Invalid phone number format"
}
```

### 404 Not Found
```json
{
  "success": false,
  "code": 404,
  "message": "Branch not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "code": 409,
  "message": "Branch with this information already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "code": 500,
  "message": "Failed to update branch information"
}
```

## Usage Example (Frontend)

```typescript
import { branchService } from '@/services/branch.service';

// Get branch information
const getBranchInfo = async () => {
  try {
    const response = await branchService.getManagerBranch();
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching branch:', error);
  }
};

// Update branch information
const updateBranch = async () => {
  try {
    const response = await branchService.updateManagerBranch({
      name: 'New Branch Name',
      phone: '0987654321',
      email: 'newemail@aneat.com'
    });
    console.log('Updated:', response.data);
  } catch (error) {
    console.error('Error updating branch:', error);
  }
};

// Get branch statistics
const getStats = async () => {
  try {
    const response = await branchService.getBranchStatistics();
    console.log('Statistics:', response.data);
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};
```

## Notes
- Only managers can access and update their assigned branch
- Branch code cannot be changed (it's a unique identifier)
- Manager assignment can only be changed by admin
- All monetary values are stored in cents (VND) in the database
- Phone numbers must be exactly 10 digits (Vietnamese format)
