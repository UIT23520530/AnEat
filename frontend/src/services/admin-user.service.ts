import { apiClient } from "@/lib/api-client"

export type UserRole = "ADMIN_SYSTEM" | "ADMIN_BRAND" | "STAFF" | "CUSTOMER" | "LOGISTICS_STAFF"

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: UserRole
  avatar: string | null
  branchId: string | null
  branch?: {
    id: string
    code: string
    name: string
  } | null
  managedBranches?: {
    id: string
    code: string
    name: string
  } | null
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  totalManagers: number
  totalStaff: number
  usersByRole: Record<UserRole, number>
}

export interface CreateUserData {
  email: string
  name: string
  phone: string
  role: UserRole
  branchId?: string | null
  isActive?: boolean
  avatar?: string | null
  password?: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  role?: UserRole
  branchId?: string | null
  isActive?: boolean
  avatar?: string | null
  password?: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  isActive?: boolean
  branchId?: string
}

class AdminUserService {
  private baseUrl = "/users"

  async getUsers(params?: GetUsersParams) {
    const response = await apiClient.get(this.baseUrl, { params })
    return response.data
  }

  async getUserById(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createUser(data: CreateUserData) {
    const response = await apiClient.post(this.baseUrl, data)
    return response.data
  }

  async updateUser(id: string, data: UpdateUserData) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  async getUsersStats(branchId?: string) {
    const params = branchId ? { branchId } : undefined
    const response = await apiClient.get(`${this.baseUrl}/stats`, { params })
    return response.data
  }
}

export const adminUserService = new AdminUserService()
