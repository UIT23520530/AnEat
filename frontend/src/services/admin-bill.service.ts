import apiClient from '@/lib/api-client';

// Types matching backend responses
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
        image?: string;
      };
    }[];
  };
  branch?: {
    id: string;
    code: string;
    name: string;
    address?: string;
  };
  issuedBy?: {
    id: string;
    name: string;
    email: string;
  };
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

export interface BillStatsResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    cancelledBills: number;
    refundedBills: number;
    totalRevenue: number;
    averageBillAmount: number;
  };
}

export interface BillHistoryItem {
  id: string;
  version: number;
  billNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  paidAmount: number;
  changeAmount: number;
  notes: string | null;
  internalNotes: string | null;
  editReason: string;
  changedFields: string;
  editedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface BillHistoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: BillHistoryItem[];
}

export interface UpdateBillDto {
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAmount?: number;
  notes?: string;
  internalNotes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount?: number;
  subtotal?: number;
  tax?: number;
  totalAmount?: number;
  editReason: string;
}

export interface BillQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string; // Admin can filter by branch
}

export const adminBillService = {
  // Get all bills (system-wide with branch filter)
  getBills: async (params?: BillQueryParams): Promise<BillListResponse> => {
    const response = await apiClient.get('/admin/bills', { params });
    return response.data;
  },

  // Get bill by ID
  getBillById: async (id: string): Promise<BillDetailResponse> => {
    const response = await apiClient.get(`/admin/bills/${id}`);
    return response.data;
  },

  // Get bill statistics (system-wide or by branch)
  getBillStats: async (branchId?: string, dateFrom?: string, dateTo?: string): Promise<BillStatsResponse> => {
    const response = await apiClient.get('/admin/bills/stats', {
      params: { branchId, dateFrom, dateTo },
    });
    return response.data;
  },

  // Update bill
  updateBill: async (id: string, data: UpdateBillDto): Promise<BillDetailResponse> => {
    const response = await apiClient.put(`/admin/bills/${id}`, data);
    return response.data;
  },

  // Get bill history
  getBillHistory: async (id: string): Promise<BillHistoryResponse> => {
    const response = await apiClient.get(`/admin/bills/${id}/history`);
    return response.data;
  },

  // Mark bill as printed
  printBill: async (id: string): Promise<BillDetailResponse> => {
    const response = await apiClient.post(`/admin/bills/${id}/print`);
    return response.data;
  },
};
