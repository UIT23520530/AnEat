import apiClient from '@/lib/api-client'

export interface OrderCategory {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderProduct {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  costPrice: number
  prepTime: number
  isAvailable: boolean
  categoryId: string
  branchId: string
  category?: OrderCategory
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
  }
}

export default staffOrderService
