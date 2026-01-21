import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

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
  role: UserRole;
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface GrowthMetrics {
  revenueGrowth: {
    mom: number; // Month over Month
    yoy: number; // Year over Year
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
  type: 'revenue' | 'staff' | 'inventory' | 'branch';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  branchId?: string;
  branchName?: string;
  createdAt: Date;
}

// ==================== ADMIN DASHBOARD SERVICE ====================

export class AdminDashboardService {
  /**
   * Get system-wide statistics
   */
  static async getSystemStats(): Promise<SystemStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    // Revenue stats (all branches, PAID bills only)
    const [todayRevenue, weekRevenue, monthRevenue, yearRevenue, allTimeRevenue] = await Promise.all([
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: weekAgo } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: monthAgo } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: yearAgo } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    // Order stats (all branches)
    const [todayOrders, weekOrders, monthOrders, totalOrders] = await Promise.all([
      prisma.bill.count({ where: { createdAt: { gte: today } } }),
      prisma.bill.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.bill.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.bill.count(),
    ]);

    // Branch stats
    const [activeBranches, inactiveBranches, totalBranches] = await Promise.all([
      prisma.branch.count({ where: { isActive: true } }),
      prisma.branch.count({ where: { isActive: false } }),
      prisma.branch.count(),
    ]);

    // User stats by role
    const [
      totalUsers,
      adminSystemCount,
      adminBrandCount,
      staffCount,
      customerCount,
      logisticsStaffCount,
      activeUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN_SYSTEM', deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN_BRAND', deletedAt: null } }),
      prisma.user.count({ where: { role: 'STAFF', deletedAt: null } }),
      prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'LOGISTICS_STAFF', deletedAt: null } }),
      prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo }, deletedAt: null } }),
    ]);

    // Customer stats
    const [totalCustomers, newCustomers, bronzeCount, silverCount, goldCount, vipCount] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.customer.count({ where: { tier: 'BRONZE' } }),
      prisma.customer.count({ where: { tier: 'SILVER' } }),
      prisma.customer.count({ where: { tier: 'GOLD' } }),
      prisma.customer.count({ where: { tier: 'VIP' } }),
    ]);

    // Product stats
    const [totalProducts, availableProducts, unavailableProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.product.count({ where: { isAvailable: false } }),
    ]);

    return {
      totalRevenue: {
        today: todayRevenue._sum.total || 0,
        week: weekRevenue._sum.total || 0,
        month: monthRevenue._sum.total || 0,
        year: yearRevenue._sum.total || 0,
        allTime: allTimeRevenue._sum.total || 0,
      },
      totalOrders: {
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
        total: totalOrders,
      },
      totalBranches: {
        active: activeBranches,
        inactive: inactiveBranches,
        total: totalBranches,
      },
      totalUsers: {
        total: totalUsers,
        byRole: {
          ADMIN_SYSTEM: adminSystemCount,
          ADMIN_BRAND: adminBrandCount,
          STAFF: staffCount,
          CUSTOMER: customerCount,
          LOGISTICS_STAFF: logisticsStaffCount,
        },
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
      },
      totalCustomers: {
        total: totalCustomers,
        new: newCustomers,
        byTier: {
          BRONZE: bronzeCount,
          SILVER: silverCount,
          GOLD: goldCount,
          VIP: vipCount,
        },
      },
      totalProducts: {
        total: totalProducts,
        available: availableProducts,
        unavailable: unavailableProducts,
      },
    };
  }

  /**
   * Get branch performance comparison
   */
  static async getBranchPerformance(limit?: number): Promise<BranchPerformance[]> {
    const branches = await prisma.branch.findMany({
      include: {
        manager: {
          select: { name: true },
        },
        orders: {
          where: { 
            status: 'COMPLETED'
          },
          select: { 
            total: true,
            items: {
              select: {
                quantity: true,
                price: true,
                product: {
                  select: {
                    costPrice: true,
                  },
                },
              },
            },
          },
        },
        staff: {
          where: { deletedAt: null },
        },
        products: true,
      },
      orderBy: { createdAt: 'asc' },
      ...(limit && { take: limit }),
    });

    // Get customer count per branch (via completed orders)
    const branchCustomerCounts = await Promise.all(
      branches.map(async (branch) => {
        const customerCount = await prisma.order.findMany({
          where: { 
            branchId: branch.id,
            status: 'COMPLETED'
          },
          distinct: ['customerId'],
          select: { customerId: true },
        });
        return { branchId: branch.id, customerCount: customerCount.length };
      })
    );

    const customerMap = new Map(branchCustomerCounts.map((item) => [item.branchId, item.customerCount]));

    return branches.map((branch) => {
      const revenue = branch.orders.reduce((sum: number, order: any) => sum + order.total, 0);
      
      // Calculate profit: revenue - total cost
      const profit = branch.orders.reduce((sum: number, order: any) => {
        const orderCost = order.items.reduce((itemSum: number, item: any) => {
          const itemCost = item.quantity * item.product.costPrice;
          return itemSum + itemCost;
        }, 0);
        return sum + (order.total - orderCost);
      }, 0);
      
      const orders = branch.orders.length;
      const staff = branch.staff.length;
      const products = branch.products.length;
      const customers = customerMap.get(branch.id) || 0;
      const averageOrderValue = orders > 0 ? revenue / orders : 0;

      return {
        id: branch.id,
        code: branch.code,
        name: branch.name,
        managerName: branch.manager?.name || null,
        revenue,
        profit,
        orders,
        staff,
        products,
        customers,
        averageOrderValue,
        isActive: branch.isActive,
      };
    });
  }

  /**
   * Get top branches by revenue or orders
   */
  static async getTopBranches(metric: 'revenue' | 'orders' = 'revenue', limit: number = 10): Promise<TopBranch[]> {
    const branches = await prisma.branch.findMany({
      include: {
        manager: {
          select: { name: true },
        },
        bills: {
          where: { status: 'PAID' },
          select: { total: true },
        },
      },
    });

    const branchMetrics = branches.map((branch) => {
      const revenue = branch.bills.reduce((sum, bill) => sum + bill.total, 0);
      const orders = branch.bills.length;

      return {
        id: branch.id,
        code: branch.code,
        name: branch.name,
        managerName: branch.manager?.name || null,
        metric: metric === 'revenue' ? revenue : orders,
        revenue,
        orders,
      };
    });

    // Sort by metric and return top N
    return branchMetrics.sort((a, b) => b.metric - a.metric).slice(0, limit);
  }

  /**
   * Get system-wide revenue data for charts
   */
  static async getSystemRevenueData(
    period: 'day' | 'week' | 'month',
    dateFrom?: string,
    dateTo?: string
  ): Promise<SystemRevenueData[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 56); // Last 8 weeks
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
        break;
    }

    if (dateFrom) startDate = new Date(dateFrom);
    const endDate = dateTo ? new Date(dateTo) : now;

    // Get all PAID bills in date range (system-wide)
    const bills = await prisma.bill.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        total: true,
        branchId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group data by period
    const dataMap = new Map<
      string,
      { revenue: number; orders: number; branches: Set<string>; totalRevenue: number }
    >();

    bills.forEach((bill) => {
      let key: string;
      const date = new Date(bill.createdAt);

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      const existing = dataMap.get(key) || { revenue: 0, orders: 0, branches: new Set<string>(), totalRevenue: 0 };

      dataMap.set(key, {
        revenue: existing.revenue + bill.total,
        orders: existing.orders + 1,
        branches: existing.branches.add(bill.branchId),
        totalRevenue: existing.totalRevenue + bill.total,
      });
    });

    // Convert to array and calculate metrics
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        branches: data.branches.size,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top selling products system-wide
   */
  static async getTopProductsSystemWide(limit: number = 10): Promise<SystemTopProduct[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get order items with product and branch info
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Get product details with branch info
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        // Get all order items for this product to calculate revenue correctly
        const orderItems = await prisma.orderItem.findMany({
          where: {
            productId: item.productId,
            order: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
          select: {
            quantity: true,
            price: true,
          },
        });

        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            image: true,
            costPrice: true,
            branch: {
              select: {
                name: true,
              },
            },
          },
        });

        // Calculate revenue: sum of (quantity × price) for each order item
        const revenue = orderItems.reduce((sum, orderItem) => {
          return sum + (orderItem.quantity * orderItem.price);
        }, 0);

        // Calculate profit: revenue - (quantity × costPrice)
        const totalQuantity = item._sum.quantity || 0;
        const costPrice = product?.costPrice || 0;
        const profit = revenue - (totalQuantity * costPrice);

        return {
          id: product?.id || '',
          name: product?.name || 'Unknown',
          branchName: product?.branch?.name || 'Unknown',
          image: product?.image || null,
          unitsSold: totalQuantity,
          revenue,
          profit,
        };
      })
    );

    return productsWithDetails.filter((p) => p.id);
  }

  /**
   * Get user statistics by role
   */
  static async getUserStatsByRole(): Promise<UserStatsByRole[]> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const roles: UserRole[] = ['ADMIN_SYSTEM', 'ADMIN_BRAND', 'STAFF', 'CUSTOMER', 'LOGISTICS_STAFF'];

    const stats = await Promise.all(
      roles.map(async (role) => {
        const [total, active, inactive, newThisMonth] = await Promise.all([
          prisma.user.count({ where: { role, deletedAt: null } }),
          prisma.user.count({ where: { role, isActive: true, deletedAt: null } }),
          prisma.user.count({ where: { role, isActive: false, deletedAt: null } }),
          prisma.user.count({ where: { role, createdAt: { gte: monthAgo }, deletedAt: null } }),
        ]);

        return {
          role,
          total,
          active,
          inactive,
          newThisMonth,
        };
      })
    );

    return stats;
  }

  /**
   * Get growth metrics (MoM, YoY)
   */
  static async getGrowthMetrics(): Promise<GrowthMetrics> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    // Revenue growth
    const [thisMonthRevenue, lastMonthRevenue, thisYearRevenue, lastYearRevenue] = await Promise.all([
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: thisMonthStart } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: thisYearStart } },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: lastYearStart, lte: lastYearEnd } },
        _sum: { total: true },
      }),
    ]);

    const thisMonthRev = thisMonthRevenue._sum.total || 0;
    const lastMonthRev = lastMonthRevenue._sum.total || 1; // Avoid division by zero
    const thisYearRev = thisYearRevenue._sum.total || 0;
    const lastYearRev = lastYearRevenue._sum.total || 1;

    const revenueMoM = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
    const revenueYoY = ((thisYearRev - lastYearRev) / lastYearRev) * 100;

    // Order growth
    const [thisMonthOrders, lastMonthOrders, thisYearOrders, lastYearOrders] = await Promise.all([
      prisma.bill.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.bill.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.bill.count({ where: { createdAt: { gte: thisYearStart } } }),
      prisma.bill.count({ where: { createdAt: { gte: lastYearStart, lte: lastYearEnd } } }),
    ]);

    const orderMoM = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    const orderYoY = lastYearOrders > 0 ? ((thisYearOrders - lastYearOrders) / lastYearOrders) * 100 : 0;

    // Customer growth
    const [thisMonthCustomers, lastMonthCustomers, thisYearCustomers, lastYearCustomers] = await Promise.all([
      prisma.customer.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.customer.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.customer.count({ where: { createdAt: { gte: thisYearStart } } }),
      prisma.customer.count({ where: { createdAt: { gte: lastYearStart, lte: lastYearEnd } } }),
    ]);

    const customerMoM =
      lastMonthCustomers > 0 ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;
    const customerYoY =
      lastYearCustomers > 0 ? ((thisYearCustomers - lastYearCustomers) / lastYearCustomers) * 100 : 0;

    // Branch growth
    const [thisMonthBranches, lastMonthBranches, thisYearBranches, lastYearBranches] = await Promise.all([
      prisma.branch.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.branch.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.branch.count({ where: { createdAt: { gte: thisYearStart } } }),
      prisma.branch.count({ where: { createdAt: { gte: lastYearStart, lte: lastYearEnd } } }),
    ]);

    const branchMoM = lastMonthBranches > 0 ? ((thisMonthBranches - lastMonthBranches) / lastMonthBranches) * 100 : 0;
    const branchYoY = lastYearBranches > 0 ? ((thisYearBranches - lastYearBranches) / lastYearBranches) * 100 : 0;

    return {
      revenueGrowth: {
        mom: parseFloat(revenueMoM.toFixed(2)),
        yoy: parseFloat(revenueYoY.toFixed(2)),
      },
      orderGrowth: {
        mom: parseFloat(orderMoM.toFixed(2)),
        yoy: parseFloat(orderYoY.toFixed(2)),
      },
      customerGrowth: {
        mom: parseFloat(customerMoM.toFixed(2)),
        yoy: parseFloat(customerYoY.toFixed(2)),
      },
      branchGrowth: {
        mom: parseFloat(branchMoM.toFixed(2)),
        yoy: parseFloat(branchYoY.toFixed(2)),
      },
    };
  }

  /**
   * Get system alerts (branches with issues)
   * @param thresholds - Configurable alert thresholds
   */
  static async getSystemAlerts(thresholds?: {
    revenuePercent?: number;
    minStaff?: number;
    minStock?: number;
  }): Promise<SystemAlert[]> {
    const alerts: SystemAlert[] = [];
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Use provided thresholds or defaults
    const revenuePercentThreshold = thresholds?.revenuePercent || 50;
    const minStaffThreshold = thresholds?.minStaff || 3;
    const minStockThreshold = thresholds?.minStock || 10;

    // Get all branches with their stats (including inactive)
    const branches = await prisma.branch.findMany({
      include: {
        orders: {
          where: {
            status: 'COMPLETED',
            createdAt: { gte: monthAgo },
          },
          select: { total: true },
        },
        staff: {
          where: { deletedAt: null },
        },
        manager: {
          select: { name: true },
        },
        products: {
          select: {
            id: true,
            name: true,
            quantity: true,
          },
        },
      },
    });

    // Calculate average revenue from all branches
    const totalRevenue = branches.reduce((sum, b) => sum + b.orders.reduce((s: number, order: any) => s + order.total, 0), 0);
    const avgRevenue = totalRevenue / branches.length;
    const revenueThreshold = avgRevenue * (revenuePercentThreshold / 100);

    // Check each branch for issues (including inactive)
    branches.forEach((branch) => {
      const revenue = branch.orders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Revenue alert: below configured % of average
      if (revenue < revenueThreshold) {
        alerts.push({
          id: `revenue-${branch.id}`,
          type: 'revenue',
          severity: 'warning',
          title: `Doanh thu thấp: ${branch.name}${!branch.isActive ? ' (Không hoạt động)' : ''}`,
          message: `Chi nhánh có doanh thu thấp hơn ${revenuePercentThreshold}% mức trung bình (${new Intl.NumberFormat('vi-VN').format(
            revenue
          )}đ). Ngưỡng: ${new Intl.NumberFormat('vi-VN').format(revenueThreshold)}đ`,
          branchId: branch.id,
          branchName: branch.name,
          createdAt: new Date(),
        });
      }

      // Manager alert: no manager assigned
      if (!branch.manager) {
        alerts.push({
          id: `manager-${branch.id}`,
          type: 'branch',
          severity: 'critical',
          title: `Thiếu quản lý: ${branch.name}${!branch.isActive ? ' (Không hoạt động)' : ''}`,
          message: `Chi nhánh chưa có quản lý được chỉ định`,
          branchId: branch.id,
          branchName: branch.name,
          createdAt: new Date(),
        });
      }

      // Staff alert: below minimum threshold
      if (branch.staff.length < minStaffThreshold) {
        alerts.push({
          id: `staff-${branch.id}`,
          type: 'staff',
          severity: 'warning',
          title: `Thiếu nhân viên: ${branch.name}`,
          message: `Chi nhánh chỉ có ${branch.staff.length} nhân viên (ngưỡng tối thiểu: 3)`,
          branchId: branch.id,
          branchName: branch.name,
          createdAt: new Date(),
        });
      }

      // Inventory alerts: check stock levels
      const lowStockProducts = branch.products.filter((p) => p.quantity <= minStockThreshold && p.quantity > 0);
      const outOfStockProducts = branch.products.filter((p) => p.quantity === 0);

      if (outOfStockProducts.length > 0) {
        alerts.push({
          id: `inventory-out-${branch.id}`,
          type: 'inventory',
          severity: 'critical',
          title: `Hết hàng: ${branch.name}${!branch.isActive ? ' (Không hoạt động)' : ''}`,
          message: `${outOfStockProducts.length} sản phẩm đã hết hàng (${outOfStockProducts
            .slice(0, 3)
            .map((p) => p.name)
            .join(', ')}${outOfStockProducts.length > 3 ? '...' : ''})`,
          branchId: branch.id,
          branchName: branch.name,
          createdAt: new Date(),
        });
      }

      if (lowStockProducts.length > 0) {
        alerts.push({
          id: `inventory-low-${branch.id}`,
          type: 'inventory',
          severity: 'warning',
          title: `Tồn kho thấp: ${branch.name}${!branch.isActive ? ' (Không hoạt động)' : ''}`,
          message: `${lowStockProducts.length} sản phẩm sắp hết (tồn ≤ ${minStockThreshold}): ${lowStockProducts
            .slice(0, 3)
            .map((p) => `${p.name} (${p.quantity})`)
            .join(', ')}${lowStockProducts.length > 3 ? '...' : ''}`,
          branchId: branch.id,
          branchName: branch.name,
          createdAt: new Date(),
        });
      }
    });

    // Sort by severity (critical first, then warning, then info)
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Export system-wide report data
   */
  static async getSystemReportData(dateFrom: string, dateTo: string) {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Get all PAID bills in period (system-wide)
    const bills = await prisma.bill.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        branch: {
          select: { name: true, code: true },
        },
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        issuedBy: {
          select: { name: true, role: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format data for Excel
    const reportData = bills.map((bill) => ({
      branchCode: bill.branch.code,
      branchName: bill.branch.name,
      billNumber: bill.billNumber,
      orderNumber: bill.order?.orderNumber || '',
      date: bill.createdAt.toISOString().split('T')[0],
      time: bill.createdAt.toISOString().split('T')[1].split('.')[0],
      customerName: bill.customerName || '',
      customerPhone: bill.customerPhone || '',
      items: bill.order?.items.length || 0,
      subtotal: bill.subtotal,
      tax: bill.taxAmount,
      discount: bill.discountAmount,
      total: bill.total,
      paymentMethod: bill.paymentMethod,
      staff: bill.issuedBy?.name || '',
      staffRole: bill.issuedBy?.role || '',
    }));

    // Calculate summary by branch
    const branchSummary = new Map<string, { name: string; revenue: number; orders: number }>();
    bills.forEach((bill) => {
      const existing = branchSummary.get(bill.branch.code) || { name: bill.branch.name, revenue: 0, orders: 0 };
      branchSummary.set(bill.branch.code, {
        name: bill.branch.name,
        revenue: existing.revenue + bill.total,
        orders: existing.orders + 1,
      });
    });

    // Calculate overall summary
    const summary = {
      totalBills: bills.length,
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
      totalProfit: bills.reduce((sum, b) => sum + b.total * 0.3, 0), // 30% profit margin
      averageOrderValue: bills.length > 0 ? bills.reduce((sum, b) => sum + b.total, 0) / bills.length : 0,
      branchCount: branchSummary.size,
      branches: Array.from(branchSummary.entries()).map(([code, data]) => ({
        code,
        name: data.name,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      })),
    };

    return {
      data: reportData,
      summary,
    };
  }
}
