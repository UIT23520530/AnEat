import apiClient from "@/lib/api-client";

export interface DashboardStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  orders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  profit: {
    today: number;
    week: number;
    month: number;
  };
  customers: {
    total: number;
    new: number;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string | null;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface InventoryAlert {
  id: string;
  name: string;
  image: string | null;
  currentStock: number;
  minStock: number;
  status: 'low' | 'out';
}

export interface RecentActivity {
  id: string;
  type: string;
  billNumber: string;
  orderNumber: string;
  total: number;
  status: string;
  staffName: string;
  createdAt: string;
}

export const dashboardService = {
  // ==================== MANAGER DASHBOARD ====================
  /**
   * Get dashboard statistics (Manager)
   */
  async getStats(params?: { dateFrom?: string; dateTo?: string }): Promise<{ data: DashboardStats }> {
    const response = await apiClient.get("/manager/dashboard/stats", { params });
    return response.data;
  },

  /**
   * Get revenue data for charts (Manager)
   */
  async getRevenueData(params: {
    period: "day" | "week" | "month";
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: RevenueData[] }> {
    const response = await apiClient.get("/manager/dashboard/revenue", { params });
    return response.data;
  },

  /**
   * Get top selling products (Manager)
   */
  async getTopProducts(limit: number = 10): Promise<{ data: TopProduct[] }> {
    const response = await apiClient.get("/manager/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get inventory alerts (Manager)
   */
  async getInventoryAlerts(): Promise<{ data: InventoryAlert[] }> {
    const response = await apiClient.get("/manager/dashboard/inventory-alerts");
    return response.data;
  },

  /**
   * Get recent activities (Manager)
   */
  async getRecentActivities(limit: number = 10): Promise<{ data: RecentActivity[] }> {
    const response = await apiClient.get("/manager/dashboard/activities", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Export report to Excel (Manager)
   */
  async exportReport(dateFrom: string, dateTo: string): Promise<Blob> {
    const response = await apiClient.get("/manager/dashboard/export", {
      params: { dateFrom, dateTo },
      responseType: "blob",
    });
    return response.data;
  },

  // ==================== STAFF DASHBOARD ====================
  /**
   * Get dashboard statistics (Staff)
   */
  async getStaffStats(params?: { dateFrom?: string; dateTo?: string }): Promise<{ data: DashboardStats }> {
    const response = await apiClient.get("/staff/dashboard/stats", { params });
    return response.data;
  },

  /**
   * Get revenue chart data (Staff)
   */
  async getStaffRevenueChart(params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<{ data: RevenueData[] }> {
    const response = await apiClient.get("/staff/dashboard/revenue-chart", { params });
    return response.data;
  },

  /**
   * Get top selling products (Staff)
   */
  async getStaffTopProducts(limit: number = 10): Promise<{ data: TopProduct[] }> {
    const response = await apiClient.get("/staff/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get inventory alerts (Staff)
   */
  async getStaffInventoryAlerts(): Promise<{ data: InventoryAlert[] }> {
    const response = await apiClient.get("/staff/dashboard/inventory-alerts");
    return response.data;
  },

  /**
   * Get recent orders (Staff)
   */
  async getStaffRecentOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: any[] }> {
    const response = await apiClient.get("/staff/dashboard/recent-orders", { params });
    return response.data;
  },

  /**
   * Get order status statistics (Staff)
   */
  async getStaffOrderStatusStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: any }> {
    const response = await apiClient.get("/staff/dashboard/order-status-stats", { params });
    return response.data;
  },
};
