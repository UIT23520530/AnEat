import apiClient from '@/lib/api-client'

export interface OrderCategory {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductOption {
  id: string
  name: string
  price: number
  type: 'SIZE' | 'TOPPING' | 'SAUCE' | 'OTHER'
}

export interface OrderProduct {
  id: string
  name: string
  code?: string
  description: string | null
  image?: string | null
  price: number
  quantity: number
  costPrice: number
  prepTime: number
  isAvailable: boolean
  categoryId: string
  branchId: string
  category?: OrderCategory
  options?: ProductOption[]
  promotionPrice?: number | null
  createdAt: string
  updatedAt: string
}

export interface OrderCategoriesResponse {
  categories: OrderCategory[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface OrderProductsResponse {
  products: OrderProduct[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SearchResult {
  categories: OrderCategory[]
  products: OrderProduct[]
}

// Order creation types
export interface CreateOrderItem {
  productId: string
  quantity: number
  price: number
  name?: string
  options?: string
}

export interface CreateOrderRequest {
  items: CreateOrderItem[]
  customerId?: string
  promotionCode?: string
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET'
  notes?: string
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  deliveryAddress?: string
}

export interface OrderResponse {
  success: boolean
  code: number
  message: string
  data: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    paymentMethod: string
    subtotal: number
    discountAmount: number
    total: number
    notes?: string
    orderType?: string
    createdAt: string
  }
}

export interface ValidatePromotionResponse {
  success: boolean
  code: number
  message: string
  data?: {
    id: string
    code: string
    type: 'PERCENTAGE' | 'FIXED'
    value: number
    discountAmount: number
    minOrderAmount: number | null
  }
}

const staffOrderService = {
  // Get all categories (no pagination)
  getAllCategories: async (): Promise<{ data: OrderCategory[] }> => {
    const response = await apiClient.get('/staff/order/categories/all')
    return response.data
  },

  // Get categories with pagination
  getCategories: async (params?: {
    page?: number
    limit?: number
  }): Promise<OrderCategoriesResponse> => {
    const response = await apiClient.get('/staff/order/categories', { params })
    return response.data
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<{ data: OrderCategory }> => {
    const response = await apiClient.get(`/staff/order/categories/${id}`)
    return response.data
  },

  // Get all available products
  getProducts: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ data: OrderProductsResponse }> => {
    const response = await apiClient.get('/staff/order/products', { params })
    return response.data
  },

  // Get products by category
  getProductsByCategory: async (
    categoryId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<OrderProductsResponse> => {
    const response = await apiClient.get(`/staff/order/products/category/${categoryId}`, { params })
    return response.data
  },

  // Get product by ID
  getProductById: async (id: string): Promise<{ data: OrderProduct }> => {
    const response = await apiClient.get(`/staff/order/products/${id}`)
    return response.data
  },

  // Quick search (autocomplete)
  quickSearch: async (query: string): Promise<{ data: SearchResult }> => {
    const response = await apiClient.get('/staff/order/quick-search', {
      params: { q: query }
    })
    return response.data
  },

  // Unified search
  search: async (
    query: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<{ data: SearchResult }> => {
    const response = await apiClient.get('/staff/order/search', {
      params: { q: query, ...params }
    })
    return response.data
  },

  // ==================== ORDER MANAGEMENT ====================

  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post('/staff/orders/create', data)
    return response.data
  },

  // Validate promotion code
  validatePromotion: async (
    code: string,
    subtotal?: number
  ): Promise<ValidatePromotionResponse> => {
    const response = await apiClient.post('/staff/orders/validate-promotion', {
      code,
      subtotal
    })
    return response.data
  },

  // Get orders list
  getOrders: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<{
    success: boolean
    data: any[]
    meta: {
      current_page: number
      total_pages: number
      limit: number
      total_items: number
    }
  }> => {
    const response = await apiClient.get('/staff/orders/list', { params })
    return response.data
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<{
    success: boolean
    data: any
  }> => {
    const response = await apiClient.get(`/staff/orders/${orderId}`)
    return response.data
  },

  // Update payment status
  updatePaymentStatus: async (
    orderId: string,
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  ): Promise<{
    success: boolean
    data: any
  }> => {
    const response = await apiClient.put(`/staff/orders/${orderId}/payment-status`, {
      paymentStatus
    })
    return response.data
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<{
    success: boolean
    message: string
  }> => {
    const response = await apiClient.post(`/staff/orders/${orderId}/cancel`)
    return response.data
  }
}

export default staffOrderService
