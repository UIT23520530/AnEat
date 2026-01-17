import { apiClient } from "@/lib/api-client"

export interface Category {
  id: string
  code: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CategoryStats {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  totalProducts?: number
}

export interface CreateCategoryData {
  code: string
  name: string
  description?: string | null
  image?: string | null
  isActive?: boolean
}

export interface UpdateCategoryData {
  code?: string
  name?: string
  description?: string | null
  image?: string | null
  isActive?: boolean
}

class AdminCategoryService {
  /**
   * Get all categories with pagination and filters
   */
  async getCategories(params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }) {
    const response = await apiClient.get("/admin/categories", { params })
    return response.data
  }

  /**
   * Get category statistics
   */
  async getCategoryStats() {
    const response = await apiClient.get("/admin/categories/stats")
    return response.data
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const response = await apiClient.get(`/admin/categories/${id}`)
    return response.data
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryData) {
    const response = await apiClient.post("/admin/categories", data)
    return response.data
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryData) {
    const response = await apiClient.put(`/admin/categories/${id}`, data)
    return response.data
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id: string) {
    const response = await apiClient.delete(`/admin/categories/${id}`)
    return response.data
  }
}

export const adminCategoryService = new AdminCategoryService()
