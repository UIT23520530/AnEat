import { apiClient } from "@/lib/api-client"
import { Category, CategoryStats, CreateCategoryData, UpdateCategoryData } from "./admin-category.service"

class ManagerCategoryService {
    /**
     * Get all categories with pagination and filters
     * Note: Managers see all global categories, but can hide them specifically for their branch
     */
    async getCategories(params?: {
        page?: number
        limit?: number
        search?: string
        isActive?: boolean
    }) {
        // For now, managers use the same categories as admin but we use a manager-specific endpoint
        // to potentially filter by branch-specific status in the future.
        const response = await apiClient.get("/manager/categories", { params })
        return response.data
    }

    /**
     * Get category statistics for manager's branch
     */
    async getCategoryStats() {
        const response = await apiClient.get("/manager/categories/stats")
        return response.data
    }

    /**
     * Create new category (Managers can also create categories, but usually admin does)
     */
    async createCategory(data: CreateCategoryData) {
        const response = await apiClient.post("/manager/categories", data)
        return response.data
    }

    /**
     * Update category
     */
    async updateCategory(id: string, data: UpdateCategoryData) {
        const response = await apiClient.put(`/manager/categories/${id}`, data)
        return response.data
    }

    /**
     * Toggle branch-specific visibility
     * This is the "ẩn món này ở cửa hàng" requirement.
     */
    async toggleBranchVisibility(id: string, isActive: boolean) {
        const response = await apiClient.post(`/manager/categories/${id}/toggle-visibility`, { isActive })
        return response.data
    }

    /**
     * Delete category
     */
    async deleteCategory(id: string) {
        const response = await apiClient.delete(`/manager/categories/${id}`)
        return response.data
    }
}

export const managerCategoryService = new ManagerCategoryService()
