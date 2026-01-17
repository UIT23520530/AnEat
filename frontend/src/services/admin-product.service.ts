import { apiClient } from "@/lib/api-client"

export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  price: number // Price in cents
  image: string | null
  categoryId: string
  category: {
    id: string
    code: string
    name: string
  }
  branchId: string | null
  quantity: number
  costPrice: number
  prepTime: number // Default 15 minutes
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductStats {
  totalProducts: number
  availableProducts: number
  unavailableProducts: number
  productsByCategory: {
    categoryId: string
    categoryName: string
    count: number
  }[]
}

export interface CreateProductData {
  code: string
  name: string
  description?: string | null
  price: number // Price in dollars (will be converted to cents)
  image?: string | null
  categoryId: string
  branchId?: string | null
  quantity?: number
  costPrice?: number
  prepTime?: number // Minutes, default 15
  isAvailable?: boolean
}

export interface UpdateProductData {
  code?: string
  name?: string
  description?: string | null
  price?: number // Price in dollars (will be converted to cents)
  image?: string | null
  categoryId?: string
  branchId?: string | null
  quantity?: number
  costPrice?: number
  prepTime?: number // Minutes, default 15
  isAvailable?: boolean
}

class AdminProductService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    branchId?: string
    isAvailable?: boolean
  }) {
    const response = await apiClient.get("/admin/products", { params })
    return response.data
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const response = await apiClient.get("/admin/products/stats")
    return response.data
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const response = await apiClient.get(`/admin/products/${id}`)
    return response.data
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData) {
    const response = await apiClient.post("/admin/products", data)
    return response.data
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData) {
    const response = await apiClient.put(`/admin/products/${id}`, data)
    return response.data
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/admin/products/${id}`)
    return response.data
  }
}

export const adminProductService = new AdminProductService()
