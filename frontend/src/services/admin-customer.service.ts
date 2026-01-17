import apiClient from '@/lib/api-client';

export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  tier: CustomerTier;
  totalSpent: number;
  points: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    reviews: number;
  };
  orders?: CustomerOrder[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  discountAmount: number;
  createdAt: string;
  branch: {
    id: string;
    name: string;
    address?: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface CustomersResponse {
  success: boolean;
  code: number;
  message?: string;
  data: Customer[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  code: number;
  message?: string;
  data: Customer;
}

export interface CustomerStatistics {
  totalCustomers: number;
  totalOrders: number;
  tierDistribution: Record<CustomerTier, number>;
  topCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    tier: CustomerTier;
    totalSpent: number;
    points: number;
    _count: {
      orders: number;
    };
  }>;
  recentCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    tier: CustomerTier;
    createdAt: string;
  }>;
  averageSpent: number;
}

export interface CustomerStatisticsResponse {
  success: boolean;
  code: number;
  data: CustomerStatistics;
}

export interface CreateCustomerDto {
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  tier?: CustomerTier;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tier?: CustomerTier;
  points?: number;
}

export interface AdjustPointsDto {
  points: number;
  reason: string;
}

export interface UpdateTierDto {
  tier: CustomerTier;
  reason?: string;
}

export interface CustomerOrdersResponse {
  success: boolean;
  code: number;
  data: CustomerOrder[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export const adminCustomerService = {
  // Get all customers (system-wide with branch filter)
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    tier?: CustomerTier;
    branchId?: string; // Admin can filter by branch
  }): Promise<CustomersResponse> => {
    const response = await apiClient.get('/admin/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Get customer statistics (system-wide or by branch)
  getStatistics: async (branchId?: string): Promise<CustomerStatisticsResponse> => {
    const response = await apiClient.get('/admin/customers/statistics', {
      params: branchId ? { branchId } : undefined,
    });
    return response.data;
  },

  // Get customer stats
  getStats: async (branchId?: string): Promise<CustomerStatisticsResponse> => {
    const response = await apiClient.get('/admin/customers/stats', {
      params: branchId ? { branchId } : undefined,
    });
    return response.data;
  },

  // Create customer
  createCustomer: async (data: CreateCustomerDto): Promise<CustomerResponse> => {
    const response = await apiClient.post('/admin/customers', data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<CustomerResponse> => {
    const response = await apiClient.patch(`/admin/customers/${id}`, data);
    return response.data;
  },

  // Adjust customer points
  adjustPoints: async (id: string, data: AdjustPointsDto): Promise<CustomerResponse> => {
    const response = await apiClient.post(`/admin/customers/${id}/adjust-points`, data);
    return response.data;
  },

  // Update customer tier
  updateTier: async (id: string, data: UpdateTierDto): Promise<CustomerResponse> => {
    const response = await apiClient.patch(`/admin/customers/${id}/tier`, data);
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async (
    id: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<CustomerOrdersResponse> => {
    const response = await apiClient.get(`/admin/customers/${id}/orders`, { params });
    return response.data;
  },

  // Search customers
  searchCustomers: async (query: string, limit?: number): Promise<CustomersResponse> => {
    const response = await apiClient.get('/admin/customers/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/admin/customers/${id}`);
    return response.data;
  },
};
