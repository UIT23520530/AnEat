import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
    totalRevenue: number;
    averageBillAmount: number;
  };
}

export interface BillQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

class BillService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get bill list with filters, pagination, and sorting
   */
  async getBillList(params?: BillQueryParams): Promise<BillListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

      const url = `${API_URL}/manager/bills${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await axios.get<BillListResponse>(url, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Get bill list error:', error);
      throw error;
    }
  }

  /**
   * Get bill by ID with full details
   */
  async getBillById(id: string): Promise<BillDetailResponse> {
    try {
      const response = await axios.get<BillDetailResponse>(
        `${API_URL}/manager/bills/${id}`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Get bill by ID error:', error);
      throw error;
    }
  }

  /**
   * Print bill (mark as printed)
   */
  async printBill(id: string): Promise<BillDetailResponse> {
    try {
      const response = await axios.post<BillDetailResponse>(
        `${API_URL}/manager/bills/${id}/print`,
        {},
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Print bill error:', error);
      throw error;
    }
  }

  /**
   * Get bill statistics
   */
  async getBillStats(dateFrom?: string, dateTo?: string): Promise<BillStatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const url = `${API_URL}/manager/bills/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await axios.get<BillStatsResponse>(url, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Get bill stats error:', error);
      throw error;
    }
  }

  /**
   * Update bill
   */
  async updateBill(id: string, data: {
    editReason: string;
    status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET';
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paidAmount?: number;
    notes?: string;
  }): Promise<BillDetailResponse> {
    try {
      const response = await axios.put<BillDetailResponse>(
        `${API_URL}/manager/bills/${id}`,
        data,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Update bill error:', error);
      throw error;
    }
  }

  /**
   * Get bill edit history
   */
  async getBillHistory(id: string): Promise<{
    success: boolean;
    code: number;
    message: string;
    data: any[];
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/manager/bills/${id}/history`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Get bill history error:', error);
      throw error;
    }
  }
}

export const billService = new BillService();
