import apiClient from '@/lib/api-client';

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    staff: number;
    products: number;
    orders: number;
    tables: number;
  };
}

export interface BranchResponse {
  success: boolean;
  code: number;
  message?: string;
  data: Branch;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface BranchStatistics {
  totalStaff: number;
  totalOrders: number;
  totalProducts: number;
  totalTables: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface BranchStatisticsResponse {
  success: boolean;
  code: number;
  data: BranchStatistics;
}

export const branchService = {
  // Get manager's branch information
  getManagerBranch: async (): Promise<BranchResponse> => {
    const response = await apiClient.get('/manager/branch');
    return response.data;
  },

  // Update manager's branch information
  updateManagerBranch: async (data: UpdateBranchDto): Promise<BranchResponse> => {
    const response = await apiClient.patch('/manager/branch', data);
    return response.data;
  },

  // Get branch statistics
  getBranchStatistics: async (): Promise<BranchStatisticsResponse> => {
    const response = await apiClient.get('/manager/branch/statistics');
    return response.data;
  },
};
