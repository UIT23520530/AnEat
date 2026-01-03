/**
 * Custom Hook: useStaff
 * Hook để quản lý Staff data với API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { StaffService } from '@/services/staff.service';
import {
  StaffDTO,
  StaffQueryParams,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '@/types/staff';

interface UseStaffResult {
  staffList: StaffDTO[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  fetchStaffList: (params?: StaffQueryParams) => Promise<void>;
  createStaff: (data: CreateStaffRequest) => Promise<boolean>;
  updateStaff: (id: string, data: UpdateStaffRequest) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshList: () => Promise<void>;
}

export function useStaff(initialParams?: StaffQueryParams): UseStaffResult {
  const [staffList, setStaffList] = useState<StaffDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<StaffQueryParams>(
    initialParams || { page: 1, limit: 10 }
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  /**
   * Fetch staff list từ API
   */
  const fetchStaffList = useCallback(async (params?: StaffQueryParams) => {
    setLoading(true);
    setError(null);

    const queryParams = params || currentParams;
    setCurrentParams(queryParams);

    try {
      const response = await StaffService.getList(queryParams);

      if (response.success) {
        setStaffList(response.data);
        setPagination({
          current: response.meta.currentPage,
          pageSize: response.meta.limit,
          total: response.meta.totalItems,
          totalPages: response.meta.totalPages,
        });
        return response; // Return response for external use
      } else {
        throw new Error(response.message || 'Failed to fetch staff list');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch staff';
      setError(errorMessage);
      // Component sẽ xử lý hiển thị error thông qua error state
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  /**
   * Create new staff
   */
  const createStaff = async (data: CreateStaffRequest): Promise<boolean> => {
    try {
      const response = await StaffService.create(data);

      if (response.success) {
        await fetchStaffList(currentParams); // Refresh list
        return true;
      }
      return false;
    } catch (err: any) {
      return false;
    }
  };

  /**
   * Update existing staff
   */
  const updateStaff = async (
    id: string,
    data: UpdateStaffRequest
  ): Promise<boolean> => {
    try {
      const response = await StaffService.update(id, data);

      if (response.success) {
        await fetchStaffList(currentParams); // Refresh list
        return true;
      }
      return false;
    } catch (err: any) {
      return false;
    }
  };

  /**
   * Delete staff (soft delete)
   */
  const deleteStaff = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await StaffService.delete(id);

      if (response.success) {
        await fetchStaffList(currentParams); // Refresh list
        return { success: true, message: 'Xóa nhân viên thành công!' };
      }
      return { success: false, message: response.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Xóa nhân viên thất bại';
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Refresh list với params hiện tại
   */
  const refreshList = useCallback(async () => {
    await fetchStaffList(currentParams);
  }, [currentParams, fetchStaffList]);

  // Initial fetch
  useEffect(() => {
    fetchStaffList(initialParams);
  }, []); 

  return {
    staffList,
    loading,
    error,
    pagination,
    fetchStaffList,
    createStaff,
    updateStaff,
    deleteStaff,
    refreshList,
  };
}
