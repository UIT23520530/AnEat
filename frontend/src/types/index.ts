// User roles
export type UserRole = "ADMIN_SYSTEM" | "ADMIN_BRAND" | "STAFF" | "CUSTOMER"

// User interface
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  branchId?: string // For ADMIN_BRAND and STAFF
  avatar?: string
}

// Product interfaces
export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  discountedPrice?: number
  priceAfterTax: number
  taxPercentage: number
  category: string
  image: string
  isAvailable: boolean
  isPromotion: boolean
}

// Order interfaces
export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"
export type OrderType = "dine-in" | "take-away" | "delivery"
export type PaymentMethod = "cash" | "card" | "transfer" | "e-wallet"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  orderType: OrderType
  paymentMethod: PaymentMethod
  status: OrderStatus
  tableNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  staffId?: string
  branchId: string
}

// Branch interface
export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  isActive: boolean
  managerId?: string
}

// Table interface
export interface Table {
  id: string
  tableNumber: string
  capacity: number
  status: "empty" | "occupied" | "reserved"
  branchId: string
}

// Customer interface
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalOrders: number
  createdAt: string
}

// Promotion interface
export interface Promotion {
  id: string
  code: string
  name: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue?: number
  startDate: string
  endDate: string
  isActive: boolean
}

// Store interface
export interface Store {
  id: string
  name: string
  address: string
  phone: string
  email: string
  manager: string
  status: "active" | "inactive" | "maintenance"
  revenue: number
  orders: number
}

