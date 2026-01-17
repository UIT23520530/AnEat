/**
 * Staff Stock Request Service
 * API calls for staff to manage stock requests in their branch
 */

import { apiClient } from '@/lib/api-client';

// Types (reuse from stock-request.service.ts)
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
}

const STAFF_STOCK_REQUEST_BASE_URL = '/staff/stock-requests';

export class StaffStockRequestService {
  /**
   * GET Stock Requests for Staff's Branch
   */
  static async getList(params?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    search?: string;
  }): Promise<StockRequestsResponse> {
    const response = await apiClient.get<StockRequestsResponse>(
      STAFF_STOCK_REQUEST_BASE_URL,
      { params }
    );
    return response.data;
  }

  /**
   * GET Stock Request Detail
   */
  static async getDetail(id: string): Promise<StockRequestResponse> {
    const response = await apiClient.get<StockRequestResponse>(
      `${STAFF_STOCK_REQUEST_BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * POST Create Stock Request
   */
  static async create(data: CreateStockRequestDto): Promise<StockRequestResponse> {
    const response = await apiClient.post<StockRequestResponse>(
      STAFF_STOCK_REQUEST_BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * PUT Cancel Stock Request
   */
  static async cancel(id: string): Promise<StockRequestResponse> {
    const response = await apiClient.put<StockRequestResponse>(
      `${STAFF_STOCK_REQUEST_BASE_URL}/${id}/cancel`
    );
    return response.data;
  }
}

export const staffStockRequestService = StaffStockRequestService;
