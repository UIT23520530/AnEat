import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  products?: {
    total: number;
    active: number;
    lowStock: number;
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

export class DashboardService {
  /**
   * Get dashboard statistics for manager's branch
   */
  static async getStats(branchId: string, dateFrom?: string, dateTo?: string): Promise<DashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    // Revenue stats
    const [todayRevenue, weekRevenue, monthRevenue, yearRevenue] = await Promise.all([
      prisma.bill.aggregate({
        where: {
          branchId,
          status: 'PAID',
          createdAt: { gte: today },
        },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: {
          branchId,
          status: 'PAID',
          createdAt: { gte: weekAgo },
        },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: {
          branchId,
          status: 'PAID',
          createdAt: { gte: monthAgo },
        },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: {
          branchId,
          status: 'PAID',
          createdAt: { gte: yearAgo },
        },
        _sum: { total: true },
      }),
    ]);

    // Order stats
    const [todayOrders, weekOrders, monthOrders, totalOrders] = await Promise.all([
      prisma.bill.count({
        where: {
          branchId,
          createdAt: { gte: today },
        },
      }),
      prisma.bill.count({
        where: {
          branchId,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.bill.count({
        where: {
          branchId,
          createdAt: { gte: monthAgo },
        },
      }),
      prisma.bill.count({
        where: {
          branchId,
        },
      }),
    ]);

    // Calculate profit (revenue - cost)
    // Assuming 30% profit margin for simplification
    const profitMargin = 0.3;
    const todayProfit = (todayRevenue._sum.total || 0) * profitMargin;
    const weekProfit = (weekRevenue._sum.total || 0) * profitMargin;
    const monthProfit = (monthRevenue._sum.total || 0) * profitMargin;

    // Customer stats
    const [totalCustomers, newCustomers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          createdAt: { gte: monthAgo },
        },
      }),
    ]);

    // Product stats
    const [totalProducts, activeProducts] = await Promise.all([
      prisma.product.count({
        where: {
          branchId,
        },
      }),
      prisma.product.count({
        where: {
          branchId,
          isAvailable: true,
        },
      }),
    ]);

    // Low stock products (quantity < 5)
    const lowStockProducts = await prisma.product.count({
      where: {
        branchId,
        quantity: {
          lt: 5,
        },
      },
    });

    return {
      revenue: {
        today: todayRevenue._sum.total || 0,
        week: weekRevenue._sum.total || 0,
        month: monthRevenue._sum.total || 0,
        year: yearRevenue._sum.total || 0,
      },
      orders: {
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
        total: totalOrders,
      },
      profit: {
        today: todayProfit,
        week: weekProfit,
        month: monthProfit,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
      },
    };
  }

  /**
   * Get revenue data for charts (daily, weekly, monthly)
   */
  static async getRevenueData(
    branchId: string,
    period: 'day' | 'week' | 'month',
    dateFrom?: string,
    dateTo?: string
  ): Promise<RevenueData[]> {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'day';
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 56); // 8 weeks
        groupBy = 'week';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
        groupBy = 'month';
        break;
    }

    if (dateFrom) startDate = new Date(dateFrom);
    const endDate = dateTo ? new Date(dateTo) : now;

    // Get bills grouped by date
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        total: true,
        subtotal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group data by period
    const dataMap = new Map<string, { revenue: number; orders: number; profit: number }>();

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

      const existing = dataMap.get(key) || { revenue: 0, orders: 0, profit: 0 };
      const profit = bill.total * 0.3; // 30% profit margin

      dataMap.set(key, {
        revenue: existing.revenue + bill.total,
        orders: existing.orders + 1,
        profit: existing.profit + profit,
      });
    });

    // Convert to array and sort
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(branchId: string, limit: number = 10): Promise<TopProduct[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all order items in the period with product details
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          branchId,
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            costPrice: true,
          },
        },
      },
    });

    // Group by product and calculate stats
    const productMap = new Map<string, {
      id: string;
      name: string;
      image: string | null;
      unitsSold: number;
      revenue: number;
      profit: number;
    }>();

    orderItems.forEach((item) => {
      if (!item.product) return;

      const existing = productMap.get(item.productId) || {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
      };

      // Calculate revenue and profit for this order item
      // Example: 7 Up - costPrice: 7k, sellingPrice: 17k, quantity: 4
      // - Revenue: 17k × 4 = 68k
      // - Profit: (17k - 7k) × 4 = 40k
      
      const sellingPricePerUnit = item.product.price; // Original selling price from Product table (e.g., 17k)
      const costPricePerUnit = item.product.costPrice || 0; // Cost price from Product table (e.g., 7k)
      const itemRevenue = sellingPricePerUnit * item.quantity; // 17k × 4 = 68k
      const itemProfit = (sellingPricePerUnit - costPricePerUnit) * item.quantity; // (17k - 7k) × 4 = 40k

      productMap.set(item.productId, {
        ...existing,
        unitsSold: existing.unitsSold + item.quantity, // Add 4 cans
        revenue: existing.revenue + itemRevenue, // Add 68k
        profit: existing.profit + itemProfit, // Add 40k
      });
    });

    // Convert to array, sort by units sold, and take top N
    return Array.from(productMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }

  /**
   * Get inventory alerts (low stock, out of stock)
   */
  static async getInventoryAlerts(branchId: string): Promise<InventoryAlert[]> {
    // Get all inventory items for the branch
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        product: {
          branchId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    // Define minimum stock threshold (e.g., 10 units)
    const minStockThreshold = 10;

    // Filter items with low stock or out of stock
    const alerts = inventoryItems.filter(
      (item) => item.quantity <= minStockThreshold || item.quantity === 0
    );

    return alerts.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      currentStock: item.quantity,
      minStock: minStockThreshold,
      status: item.quantity === 0 ? ('out' as const) : ('low' as const),
    }));
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(branchId: string, limit: number = 10) {
    const activities = await prisma.bill.findMany({
      where: {
        branchId,
      },
      include: {
        issuedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      type: 'order',
      billNumber: activity.billNumber,
      orderNumber: activity.order?.orderNumber,
      total: activity.total,
      status: activity.status,
      staffName: activity.issuedBy?.name || 'Unknown',
      createdAt: activity.createdAt,
    }));
  }

  /**
   * Get recent orders with pagination
   */
  static async getRecentOrders(
    branchId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      branchId,
    };

    if (status) {
      whereClause.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        customer: order.customer
          ? {
              id: order.customer.id,
              name: order.customer.name,
              phone: order.customer.phone,
            }
          : null,
        staff: order.staff
          ? {
              id: order.staff.id,
              name: order.staff.name,
            }
          : null,
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
      total,
    };
  }

  /**
   * Get order status statistics
   */
  static async getOrderStatusStats(branchId: string, dateFrom?: string, dateTo?: string) {
    const whereClause: any = {
      branchId,
    };

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    });

    const stats: Record<string, number> = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((item) => {
      stats[item.status] = item._count.status;
    });

    return stats;
  }

  /**
   * Export dashboard report to Excel-compatible data
   */
  static async getReportData(branchId: string, dateFrom: string, dateTo: string) {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Get all bills in period
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        issuedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format data for Excel
    const reportData = bills.map((bill) => ({
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
    }));

    // Calculate summary
    const summary = {
      totalBills: bills.length,
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
      totalProfit: bills.reduce((sum, b) => sum + b.total * 0.3, 0),
      averageOrderValue: bills.length > 0 ? bills.reduce((sum, b) => sum + b.total, 0) / bills.length : 0,
    };

    return {
      data: reportData,
      summary,
    };
  }
}
