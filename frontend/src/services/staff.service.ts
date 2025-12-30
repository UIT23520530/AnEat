/**
 * Staff Service - API calls
 * Service layer để gọi Staff Management APIs
 */

import { apiClient } from '@/lib/api-client';
import {
  StaffListResponse,
  StaffDetailResponse,
  StaffQueryParams,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '@/types/staff';

const STAFF_BASE_URL = '/manager/staffs';

export class StaffService {
  /**
   * GET List Staffs - Level 3: Pagination, Sorting, Filtering, Search
   */
  static async getList(params?: StaffQueryParams): Promise<StaffListResponse> {
    const response = await apiClient.get<StaffListResponse>(STAFF_BASE_URL, {
      params,
    });
    return response.data;
  }

  /**
   * GET Staff Detail by ID
   */
  static async getDetail(id: string): Promise<StaffDetailResponse> {
    const response = await apiClient.get<StaffDetailResponse>(
      `${STAFF_BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * POST Create Staff
   */
  static async create(data: CreateStaffRequest): Promise<StaffDetailResponse> {
    const response = await apiClient.post<StaffDetailResponse>(
      STAFF_BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * PUT Update Staff
   */
  static async update(
    id: string,
    data: UpdateStaffRequest
  ): Promise<StaffDetailResponse> {
    const response = await apiClient.put<StaffDetailResponse>(
      `${STAFF_BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * DELETE Staff (Soft Delete)
   */
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${STAFF_BASE_URL}/${id}`
    );
    return response.data;
  }
}

export default StaffService;
