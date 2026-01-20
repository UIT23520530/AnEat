import apiClient from '@/lib/api-client';

export interface OrderItem {
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  notes: string | null;
  productId: string;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface OrderPromotion {
  id: string;
  code: string;
  description: string | null;
}

export interface TrackingOrder {
  id: string;
  orderNumber: string;
  customer: OrderCustomer | null;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string | null;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  notes: string | null;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  deliveryAddress: string | null;
  promotion: OrderPromotion | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  code: number;
  message: string;
  data: TrackingOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AcceptOrderResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    customer: OrderCustomer | null;
    items: OrderItem[];
    total: number;
    updatedAt: string;
  };
}

export interface EditOrderItemsRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  reason?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

class StaffOrderTrackingService {
  /**
   * Get pending orders waiting for confirmation
   */
  async getPendingOrders(page: number = 1, limit: number = 20): Promise<OrdersResponse> {
    const response = await apiClient.get<OrdersResponse>('/staff/orders-tracking/pending', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get orders being prepared
   */
  async getPreparingOrders(page: number = 1, limit: number = 20): Promise<OrdersResponse> {
    const response = await apiClient.get<OrdersResponse>('/staff/orders-tracking/preparing', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Accept a pending order
   */
  async acceptOrder(orderId: string): Promise<AcceptOrderResponse> {
    const response = await apiClient.post<AcceptOrderResponse>(
      `/staff/orders-tracking/${orderId}/accept`
    );
    return response.data;
  }

  /**
   * Edit order items
   */
  async editOrderItems(orderId: string, data: EditOrderItemsRequest): Promise<any> {
    const response = await apiClient.put(`/staff/orders-tracking/${orderId}/items`, data);
    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, data: CancelOrderRequest): Promise<any> {
    const response = await apiClient.post(`/staff/orders-tracking/${orderId}/cancel`, data);
    return response.data;
  }

  /**
   * Complete an order (mark as ready or completed)
   */
  async completeOrder(orderId: string, paymentMethod?: string): Promise<any> {
    const response = await apiClient.post(`/staff/orders-tracking/${orderId}/complete`, {
      paymentMethod
    });
    return response.data;
  }

  /**
   * Update payment method for an order
   */
  async updatePaymentMethod(orderId: string, paymentMethod: string): Promise<any> {
    const response = await apiClient.patch(`/staff/orders-tracking/${orderId}/payment-method`, {
      paymentMethod
    });
    return response.data;
  }
}

export default new StaffOrderTrackingService();
