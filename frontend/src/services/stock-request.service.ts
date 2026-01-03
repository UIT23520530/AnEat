import apiClient from '@/lib/api-client';

export interface StockRequest {
  id: string;
  requestNumber: string;
  type: 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  requestedQuantity: number;
  approvedQuantity?: number;
  notes?: string;
  requestedDate?: string;
  expectedDate?: string;
  completedDate?: string;
  rejectedReason?: string;
  productId: string;
  branchId: string;
  requestedById: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    code: string;
    name: string;
    image?: string;
    quantity: number;
  };
  branch: {
    id: string;
    name: string;
    code: string;
  };
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StockRequestsResponse {
  success: boolean;
  code: number;
  message: string;
  data: StockRequest[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface StockRequestResponse {
  success: boolean;
  code: number;
  message: string;
  data: StockRequest;
}

export interface CreateStockRequestDto {
  type?: 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';
  requestedQuantity: number;
  notes?: string;
  expectedDate?: string;
  productId: string;
  branchId?: string;
}

export interface StockStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
}

export interface StockStatisticsResponse {
  success: boolean;
  code: number;
  message: string;
  data: StockStatistics;
}

export const stockRequestService = {
  // Get all stock requests
  getStockRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    search?: string;
  }): Promise<StockRequestsResponse> => {
    const response = await apiClient.get('/stock-requests', { params });
    return response.data;
  },

  // Get stock request by ID
  getStockRequestById: async (id: string): Promise<StockRequestResponse> => {
    const response = await apiClient.get(`/stock-requests/${id}`);
    return response.data;
  },

  // Create new stock request
  createStockRequest: async (data: CreateStockRequestDto): Promise<StockRequestResponse> => {
    const response = await apiClient.post('/stock-requests', data);
    return response.data;
  },

  // Cancel stock request
  cancelStockRequest: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`/stock-requests/${id}/cancel`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<StockStatisticsResponse> => {
    const response = await apiClient.get('/stock-requests/statistics');
    return response.data;
  },
};
