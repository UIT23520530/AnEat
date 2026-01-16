/**
 * Staff Warehouse Service
 * API calls for staff to view inventory with low stock alerts
 */

import { apiClient } from '@/lib/api-client';

// Types
export interface InventoryItemDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  quantity: number;
  costPrice: number;
  prepTime: number;
  isAvailable: boolean;
  hasAlert: boolean; // True if quantity < 50
  category: {
    id: string;
    code: string;
    name: string;
  } | null;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryListResponse {
  success: boolean;
  code: number;
  message: string;
  data: InventoryItemDTO[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export interface InventoryStatsResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalQuantity: number;
  };
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  alertOnly?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

const STAFF_WAREHOUSE_BASE_URL = '/staff/warehouse';

export class StaffWarehouseService {
  /**
   * GET Inventory List - Level 3: Pagination, Search, Filter, Sort, Alert Detection
   */
  static async getInventoryList(params?: InventoryQueryParams): Promise<InventoryListResponse> {
    const response = await apiClient.get<InventoryListResponse>(
      STAFF_WAREHOUSE_BASE_URL,
      { params }
    );
    return response.data;
  }

  /**
   * GET Inventory Statistics
   * Returns total products, low stock count, out of stock count, total quantity
   */
  static async getInventoryStats(): Promise<InventoryStatsResponse> {
    const response = await apiClient.get<InventoryStatsResponse>(
      `${STAFF_WAREHOUSE_BASE_URL}/stats`
    );
    return response.data;
  }
}

export const staffWarehouseService = StaffWarehouseService;
