import { apiClient } from "@/lib/api-client"
import { Product, ProductStats, CreateProductData, UpdateProductData } from "./admin-product.service"

class ManagerProductService {
    /**
     * Get all products with pagination and filters
     * Scoped to manager's branch
     */
    async getProducts(params?: {
        page?: number
        limit?: number
        search?: string
        categoryId?: string
        status?: string
    }) {
        const response = await apiClient.get("/manager/products", { params })
        return response.data
    }

    /**
     * Get product statistics for manager's branch
     */
    async getProductStats() {
        const response = await apiClient.get("/manager/products/stats")
        return response.data
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string) {
        const response = await apiClient.get(`/manager/products/${id}`)
        return response.data
    }

    /**
     * Create new product (auto-assigned to manager's branch)
     */
    async createProduct(data: CreateProductData) {
        // Note: branchId being auto-assigned backend, but we can pass it if needed
        const response = await apiClient.post("/manager/products", data)
        return response.data
    }

    /**
     * Update product
     */
    async updateProduct(id: string, data: UpdateProductData) {
        const response = await apiClient.put(`/manager/products/${id}`, data)
        return response.data
    }

    /**
     * Delete product
     */
    async deleteProduct(id: string) {
        const response = await apiClient.delete(`/manager/products/${id}`)
        return response.data
    }
}

export const managerProductService = new ManagerProductService()
