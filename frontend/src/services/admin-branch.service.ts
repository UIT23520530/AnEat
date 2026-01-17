import { apiClient } from '@/lib/api-client';

export interface BranchManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface BranchCount {
  staff: number;
  products: number;
  orders: number;
  tables: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
  managerId?: string | null;
  manager?: BranchManager | null;
  createdAt: string;
  updatedAt: string;
  _count?: BranchCount;
}

export interface CreateBranchData {
  code?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  isActive?: boolean;
}

export interface UpdateBranchData {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string | null;
  isActive?: boolean;
}

export interface BranchStats {
  branchId: string;
  staffCount: number;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
}

export interface BranchesOverviewStats {
  totalBranches: number;
  activeBranches: number;
  averageStaff: number;
  averageRevenue: number;
}

export interface BranchesResponse {
  data: Branch[];
  meta: {
    total_items: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  };
}

export const adminBranchService = {
  /**
   * Get all branches with pagination, searching, and sorting
   */
  async getBranches(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<BranchesResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.sort) params.append('sort', options.sort);
    if (options?.order) params.append('order', options.order);

    const response = await apiClient.get(`/admin/branches?${params.toString()}`);
    return response.data;
  },

  /**
   * Get branch by ID
   */
  async getBranchById(id: string): Promise<{ data: Branch }> {
    const response = await apiClient.get(`/admin/branches/${id}`);
    return response.data;
  },

  /**
   * Create new branch
   */
  async createBranch(data: CreateBranchData): Promise<{ data: Branch }> {
    const response = await apiClient.post('/admin/branches', data);
    return response.data;
  },

  /**
   * Update branch
   */
  async updateBranch(id: string, data: UpdateBranchData): Promise<{ data: Branch }> {
    const response = await apiClient.put(`/admin/branches/${id}`, data);
    return response.data;
  },

  /**
   * Delete branch
   */
  async deleteBranch(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/branches/${id}`);
    return response.data;
  },

  /**
   * Assign manager to branch
   */
  async assignManager(
    branchId: string,
    managerId: string | null
  ): Promise<{ data: Branch }> {
    const response = await apiClient.put(`/admin/branches/${branchId}/assign-manager`, {
      managerId,
    });
    return response.data;
  },

  /**
   * Get branch statistics
   */
  async getBranchStats(branchId: string): Promise<{ data: BranchStats }> {
    const response = await apiClient.get(`/admin/branches/${branchId}/stats`);
    return response.data;
  },

  /**
   * Get overview statistics for all branches
   */
  async getOverviewStats(): Promise<{ data: BranchesOverviewStats }> {
    const response = await apiClient.get('/admin/branches/overview-stats');
    return response.data;
  },

  /**
   * Get available managers (not managing any branch)
   */
  async getAvailableManagers(currentManagerId?: string): Promise<{ data: BranchManager[] }> {
    const params = currentManagerId ? { currentManagerId } : {};
    const response = await apiClient.get('/admin/branches/available-managers', { params });
    return response.data;
  },
};
