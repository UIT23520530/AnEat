/**
 * Staff Bills History Service
 * API calls for staff to view and update bills with complaint handling
 */

import { apiClient } from '@/lib/api-client';

// Types
export interface BillDTO {
  id: string;
  billNumber: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET' | null;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAmount: number;
  changeAmount: number;
  notes: string | null;
  internalNotes: string | null;
  isEdited: boolean;
  editCount: number;
  lastEditedAt: string | null;
  printedCount: number;
  lastPrintedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items?: {
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        price: number;
      };
    }[];
  };
  branch?: {
    id: string;
    code: string;
    name: string;
  };
  issuedBy?: {
    id: string;
    name: string;
    email: string;
  };
  histories?: BillHistoryDTO[];
}

export interface BillHistoryDTO {
  id: string;
  billId: string;
  version: number;
  editReason: string;
  changedFields: string[];
  // Snapshot of bill data at time of edit
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  notes: string | null;
  internalNotes: string | null;
  editedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface BillListResponse {
  success: boolean;
  code: number;
  message: string;
  data: BillDTO[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export interface BillDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: BillDTO;
}

export interface BillHistoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: BillHistoryDTO[];
}

export interface BillQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UpdateBillForComplaintRequest {
  editReason: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  internalNotes?: string;
}

const STAFF_BILLS_HISTORY_BASE_URL = '/staff/bills-history';

export class StaffBillsHistoryService {
  /**
   * GET All Bills - Level 3: Pagination, Search, Filter, Sort
   */
  static async getList(params?: BillQueryParams): Promise<BillListResponse> {
    const response = await apiClient.get<BillListResponse>(
      STAFF_BILLS_HISTORY_BASE_URL,
      { params }
    );
    return response.data;
  }

  /**
   * GET Bill Detail by ID (with edit history)
   */
  static async getDetail(id: string): Promise<BillDetailResponse> {
    const response = await apiClient.get<BillDetailResponse>(
      `${STAFF_BILLS_HISTORY_BASE_URL}/${id}`
    );
    return response.data;
  }

  /**
   * GET Bill Edit History (all versions)
   */
  static async getHistory(id: string): Promise<BillHistoryResponse> {
    const response = await apiClient.get<BillHistoryResponse>(
      `${STAFF_BILLS_HISTORY_BASE_URL}/${id}/history`
    );
    return response.data;
  }

  /**
   * PUT Update Bill for Complaint
   * Saves old version to history before updating
   */
  static async updateForComplaint(
    id: string,
    data: UpdateBillForComplaintRequest
  ): Promise<BillDetailResponse> {
    const response = await apiClient.put<BillDetailResponse>(
      `${STAFF_BILLS_HISTORY_BASE_URL}/${id}/complaint`,
      data
    );
    return response.data;
  }
}

export const staffBillsHistoryService = StaffBillsHistoryService;
