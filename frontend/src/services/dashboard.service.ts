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
  /**
   * Get dashboard statistics
   */
  async getStats(params?: { dateFrom?: string; dateTo?: string }): Promise<{ data: DashboardStats }> {
    const response = await apiClient.get("/manager/dashboard/stats", { params });
    return response.data;
  },

  /**
   * Get revenue data for charts
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
   * Get top selling products
   */
  async getTopProducts(limit: number = 10): Promise<{ data: TopProduct[] }> {
    const response = await apiClient.get("/manager/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get inventory alerts
   */
  async getInventoryAlerts(): Promise<{ data: InventoryAlert[] }> {
    const response = await apiClient.get("/manager/dashboard/inventory-alerts");
    return response.data;
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<{ data: RecentActivity[] }> {
    const response = await apiClient.get("/manager/dashboard/activities", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Export report to Excel
   */
  async exportReport(dateFrom: string, dateTo: string): Promise<Blob> {
    const response = await apiClient.get("/manager/dashboard/export", {
      params: { dateFrom, dateTo },
      responseType: "blob",
    });
    return response.data;
  },
};
