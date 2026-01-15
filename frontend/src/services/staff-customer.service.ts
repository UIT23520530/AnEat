/**
 * Staff Customer Service
 * API calls for staff to manage customers during order creation
 */

import { apiClient } from '@/lib/api-client';

// Types
export interface CustomerDTO {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  avatar: string | null;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';
  points: number;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  code: number;
  message: string;
  data: CustomerDTO[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: CustomerDTO;
}

export interface CreateCustomerRequest {
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';
  sort?: string;
  order?: 'asc' | 'desc';
}

const STAFF_CUSTOMER_BASE_URL = '/staff/order/customers';

export class StaffCustomerService {
  /**
   * GET All Customers - Level 3: Pagination, Search, Filter, Sort
   */
  static async getList(params?: CustomerQueryParams): Promise<CustomerListResponse> {
    const response = await apiClient.get<CustomerListResponse>(
      STAFF_CUSTOMER_BASE_URL,
      { params }
    );
    return response.data;
  }

  /**
   * GET Customer by Phone (Quick search for order creation)
   */
  static async searchByPhone(phone: string): Promise<CustomerDetailResponse> {
    const response = await apiClient.get<CustomerDetailResponse>(
      `${STAFF_CUSTOMER_BASE_URL}/search`,
      { params: { phone } }
    );
    return response.data;
  }

  /**
   * GET Customer Detail by ID
   */
  static async getDetail(id: string): Promise<CustomerDetailResponse> {
    const response = await apiClient.get<CustomerDetailResponse>(
      `${STAFF_CUSTOMER_BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * POST Create Customer
   */
  static async create(data: CreateCustomerRequest): Promise<CustomerDetailResponse> {
    const response = await apiClient.post<CustomerDetailResponse>(
      STAFF_CUSTOMER_BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * PUT Update Customer
   */
  static async update(
    id: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerDetailResponse> {
    const response = await apiClient.put<CustomerDetailResponse>(
      `${STAFF_CUSTOMER_BASE_URL}/${id}`,
      data
    );
    return response.data;
  }
}

export const staffCustomerService = StaffCustomerService;
