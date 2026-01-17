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

export const managerCustomerService = {
  // Get all customers
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    tier?: CustomerTier;
  }): Promise<CustomersResponse> => {
    const response = await apiClient.get('/manager/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.get(`/manager/customers/${id}`);
    return response.data;
  },

  // Get customer statistics
  getStatistics: async (): Promise<CustomerStatisticsResponse> => {
    const response = await apiClient.get('/manager/customers/statistics');
    return response.data;
  },

  // Create customer
  createCustomer: async (data: CreateCustomerDto): Promise<CustomerResponse> => {
    const response = await apiClient.post('/manager/customers', data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<CustomerResponse> => {
    const response = await apiClient.patch(`/manager/customers/${id}`, data);
    return response.data;
  },

  // Adjust customer points
  adjustPoints: async (id: string, data: AdjustPointsDto): Promise<CustomerResponse> => {
    const response = await apiClient.post(`/manager/customers/${id}/adjust-points`, data);
    return response.data;
  },

  // Update customer tier
  updateTier: async (id: string, data: UpdateTierDto): Promise<CustomerResponse> => {
    const response = await apiClient.patch(`/manager/customers/${id}/tier`, data);
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
    const response = await apiClient.get(`/manager/customers/${id}/orders`, { params });
    return response.data;
  },

  // Search customers
  searchCustomers: async (query: string, limit?: number): Promise<CustomersResponse> => {
    const response = await apiClient.get('/manager/customers/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.delete(`/manager/customers/${id}`);
    return response.data;
  },
};
