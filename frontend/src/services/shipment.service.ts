import { apiClient } from '@/lib/api-client';

export type ShipmentStatus = 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface Shipment {
  id: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  priority: boolean;
  productName: string;
  quantity: number;
  temperature?: string;
  fromLocation: string;
  toLocation: string;
  branchCode: string;
  assignedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  notes?: string;
  issues: number;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  stockRequest?: {
    id: string;
    requestNumber: string;
    status: string;
  };
}

export interface ShipmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  priority?: boolean;
  sort?: string;
}

export interface ShipmentListResponse {
  success: boolean;
  message: string;
  data: Shipment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShipmentDetailResponse {
  success: boolean;
  message: string;
  data: Shipment;
}

export interface ShipmentStatsResponse {
  success: boolean;
  message: string;
  data: Record<ShipmentStatus, number>;
}

export interface UpdateStatusRequest {
  status: ShipmentStatus;
}

const SHIPMENT_BASE_URL = 'logistics/shipments';

export class ShipmentService {
  /**
   * GET List Shipments - Level 3: Pagination, Sorting, Filtering, Search
   */
  static async getList(params?: ShipmentQueryParams): Promise<ShipmentListResponse> {
    const response = await apiClient.get<ShipmentListResponse>(SHIPMENT_BASE_URL, {
      params,
    });
    return response.data;
  }

  /**
   * GET Shipment Detail by ID
   */
  static async getDetail(id: string): Promise<ShipmentDetailResponse> {
    const response = await apiClient.get<ShipmentDetailResponse>(
      `${SHIPMENT_BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * PATCH Update Shipment Status
   */
  static async updateStatus(
    id: string,
    status: ShipmentStatus
  ): Promise<ShipmentDetailResponse> {
    const response = await apiClient.patch<ShipmentDetailResponse>(
      `${SHIPMENT_BASE_URL}/${id}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * POST Confirm Delivery
   */
  static async confirmDelivery(
    id: string,
    notes?: string
  ): Promise<ShipmentDetailResponse> {
    const response = await apiClient.post<ShipmentDetailResponse>(
      `${SHIPMENT_BASE_URL}/${id}/confirm-delivery`,
      { notes }
    );
    return response.data;
  }

  /**
   * PATCH Update Shipment (notes, issues)
   */
  static async update(
    id: string,
    data: { notes?: string; issues?: number }
  ): Promise<ShipmentDetailResponse> {
    const response = await apiClient.patch<ShipmentDetailResponse>(
      `${SHIPMENT_BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * GET Shipment Stats
   */
  static async getStats(): Promise<ShipmentStatsResponse> {
    const response = await apiClient.get<ShipmentStatsResponse>(
      `${SHIPMENT_BASE_URL}/stats`
    );
    return response.data;
  }
}
