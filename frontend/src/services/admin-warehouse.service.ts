import apiClient from '@/lib/api-client';

export interface WarehouseRequest {
  id: string;
  requestNumber: string;
  type: 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  requestedQuantity: number;
  approvedQuantity: number | null;
  notes: string | null;
  requestedDate: string | null;
  expectedDate: string | null;
  completedDate: string | null;
  rejectedReason: string | null;
  branchId: string;
  product: {
    id: string;
    code: string;
    name: string;
    image: string | null;
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
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  shipments?: Array<{
    id: string;
    shipmentNumber: string;
    status: string;
    assignedTo: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    } | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRequestsResponse {
  success: boolean;
  code: number;
  message: string;
  data: WarehouseRequest[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface WarehouseRequestResponse {
  success: boolean;
  code: number;
  message: string;
  data: WarehouseRequest;
}

export interface WarehouseStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
}

export interface WarehouseStatisticsResponse {
  success: boolean;
  code: number;
  message: string;
  data: WarehouseStatistics;
}

export interface LogisticsStaff {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface LogisticsStaffResponse {
  success: boolean;
  code: number;
  message: string;
  data: LogisticsStaff[];
}

export interface ApproveRequestDto {
  approvedQuantity?: number;
  notes?: string;
}

export interface RejectRequestDto {
  rejectedReason: string;
}

export interface AssignLogisticsDto {
  logisticsStaffId: string;
  notes?: string;
}

export interface CancelRequestDto {
  cancelReason: string;
}

export const adminWarehouseService = {
  // Get all warehouse requests
  getWarehouseRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    branchId?: string;
    productId?: string;
    search?: string;
  }): Promise<WarehouseRequestsResponse> => {
    const response = await apiClient.get('/admin/warehouse-requests', { params });
    return response.data;
  },

  // Get warehouse request by ID
  getWarehouseRequestById: async (id: string): Promise<WarehouseRequestResponse> => {
    const response = await apiClient.get(`/admin/warehouse-requests/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (branchId?: string): Promise<WarehouseStatisticsResponse> => {
    const response = await apiClient.get('/admin/warehouse-requests/statistics', {
      params: branchId ? { branchId } : undefined,
    });
    return response.data;
  },

  // Get logistics staff
  getLogisticsStaff: async (branchId?: string): Promise<LogisticsStaffResponse> => {
    const response = await apiClient.get('/admin/warehouse-requests/logistics-staff', {
      params: branchId ? { branchId } : undefined,
    });
    return response.data;
  },

  // Approve request
  approveRequest: async (id: string, data: ApproveRequestDto): Promise<WarehouseRequestResponse> => {
    const response = await apiClient.put(`/admin/warehouse-requests/${id}/approve`, data);
    return response.data;
  },

  // Reject request
  rejectRequest: async (id: string, data: RejectRequestDto): Promise<WarehouseRequestResponse> => {
    const response = await apiClient.put(`/admin/warehouse-requests/${id}/reject`, data);
    return response.data;
  },

  // Assign to logistics
  assignToLogistics: async (id: string, data: AssignLogisticsDto): Promise<any> => {
    const response = await apiClient.post(`/admin/warehouse-requests/${id}/assign-logistics`, data);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (id: string, data: CancelRequestDto): Promise<WarehouseRequestResponse> => {
    const response = await apiClient.put(`/admin/warehouse-requests/${id}/cancel`, data);
    return response.data;
  },
};
