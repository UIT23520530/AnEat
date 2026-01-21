import apiClient from "@/lib/api-client";

// ==================== INTERFACES ====================

export interface SystemStats {
  totalRevenue: {
    today: number;
    week: number;
    month: number;
    year: number;
    allTime: number;
  };
  totalOrders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  totalBranches: {
    active: number;
    inactive: number;
    total: number;
  };
  totalUsers: {
    total: number;
    byRole: {
      ADMIN_SYSTEM: number;
      ADMIN_BRAND: number;
      STAFF: number;
      CUSTOMER: number;
      LOGISTICS_STAFF: number;
    };
    active: number;
    newThisMonth: number;
  };
  totalCustomers: {
    total: number;
    new: number;
    byTier: {
      BRONZE: number;
      SILVER: number;
      GOLD: number;
      VIP: number;
    };
  };
  totalProducts: {
    total: number;
    available: number;
    unavailable: number;
  };
}

export interface BranchPerformance {
  id: string;
  code: string;
  name: string;
  managerName: string | null;
  revenue: number;
  profit: number;
  orders: number;
  staff: number;
  products: number;
  customers: number;
  averageOrderValue: number;
  isActive: boolean;
}

export interface TopBranch {
  id: string;
  code: string;
  name: string;
  managerName: string | null;
  metric: number;
  orders: number;
}

export interface SystemRevenueData {
  date: string;
  revenue: number;
  orders: number;
  branches: number;
  averageOrderValue: number;
}

export interface SystemTopProduct {
  id: string;
  name: string;
  branchName: string;
  image: string | null;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface UserStatsByRole {
  role: string;
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface GrowthMetrics {
  revenueGrowth: {
    mom: number;
    yoy: number;
  };
  orderGrowth: {
    mom: number;
    yoy: number;
  };
  customerGrowth: {
    mom: number;
    yoy: number;
  };
  branchGrowth: {
    mom: number;
    yoy: number;
  };
}

export interface SystemAlert {
  id: string;
  type: "revenue" | "staff" | "inventory" | "branch";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
}

// ==================== SERVICE ====================

export const adminDashboardService = {
  /**
   * Get system-wide statistics
   */
  async getSystemStats(): Promise<{ data: SystemStats }> {
    const response = await apiClient.get("/admin/dashboard/system-stats");
    return response.data;
  },

  /**
   * Get branch performance comparison
   */
  async getBranchPerformance(params?: { limit?: number }): Promise<{ data: BranchPerformance[] }> {
    const response = await apiClient.get("/admin/dashboard/branch-performance", { params });
    return response.data;
  },

  /**
   * Get top branches by revenue or orders
   */
  async getTopBranches(params?: {
    metric?: "revenue" | "orders";
    limit?: number;
  }): Promise<{ data: TopBranch[] }> {
    const response = await apiClient.get("/admin/dashboard/top-branches", { params });
    return response.data;
  },

  /**
   * Get system-wide revenue data for charts
   */
  async getSystemRevenueData(params: {
    period: "day" | "week" | "month";
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: SystemRevenueData[] }> {
    const response = await apiClient.get("/admin/dashboard/revenue-data", { params });
    return response.data;
  },

  /**
   * Get top selling products system-wide
   */
  async getTopProductsSystemWide(limit: number = 10): Promise<{ data: SystemTopProduct[] }> {
    const response = await apiClient.get("/admin/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get user statistics by role
   */
  async getUserStatsByRole(): Promise<{ data: UserStatsByRole[] }> {
    const response = await apiClient.get("/admin/dashboard/user-stats");
    return response.data;
  },

  /**
   * Get growth metrics (MoM, YoY)
   */
  async getGrowthMetrics(): Promise<{ data: GrowthMetrics }> {
    const response = await apiClient.get("/admin/dashboard/growth-metrics");
    return response.data;
  },

  /**
   * Get system alerts
   */
  async getSystemAlerts(thresholds?: {
    revenuePercent?: number;
    minStaff?: number;
    minStock?: number;
  }): Promise<{ data: SystemAlert[] }> {
    // Add timestamp to prevent caching (fix 304 Not Modified)
    const response = await apiClient.get("/admin/dashboard/alerts", {
      params: { 
        _t: Date.now(),
        ...thresholds,
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  },

  /**
   * Export system report to Excel
   */
  async exportSystemReport(dateFrom: string, dateTo: string): Promise<Blob> {
    const response = await apiClient.get("/admin/dashboard/export", {
      params: { dateFrom, dateTo },
      responseType: "blob",
    });
    return response.data;
  },
};
