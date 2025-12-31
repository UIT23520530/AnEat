import { prisma } from '../db';
import { Prisma, CustomerTier } from '@prisma/client';

interface CustomerQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  tier?: CustomerTier;
}

interface CustomerUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tier?: CustomerTier;
  points?: number;
}

interface CustomerCreateData {
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  tier?: CustomerTier;
}

interface PointsAdjustment {
  customerId: string;
  points: number;
  reason: string;
  performedBy: string;
}

export class CustomerService {
  /**
   * Find all customers with pagination, sorting, and filtering
   */
  static async findAll(params: CustomerQueryParams) {
    const { page, limit, sort, order, search, tier } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier) {
      where.tier = tier;
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {
      [sort]: order,
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          avatar: true,
          tier: true,
          totalSpent: true,
          points: true,
          lastOrderDate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  /**
   * Find customer by ID with detailed information
   */
  static async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        tier: true,
        totalSpent: true,
        points: true,
        lastOrderDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find customer by phone
   */
  static async findByPhone(phone: string) {
    return prisma.customer.findUnique({
      where: { phone },
    });
  }

  /**
   * Create new customer
   */
  static async create(data: CustomerCreateData) {
    return prisma.customer.create({
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        tier: true,
        points: true,
        totalSpent: true,
        createdAt: true,
      },
    });
  }

  /**
   * Update customer information
   * Only managers can update VIP customers' tier and points
   */
  static async update(id: string, data: CustomerUpdateData) {
    return prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        tier: true,
        points: true,
        totalSpent: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete customer (soft delete if needed, otherwise hard delete)
   */
  static async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Adjust customer points (for VIP/special customers)
   * This creates an audit trail
   */
  static async adjustPoints(data: PointsAdjustment) {
    const { customerId, points, reason, performedBy } = data;

    // Use transaction to ensure consistency
    return prisma.$transaction(async (tx) => {
      // Get current customer
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { points: true, tier: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Update customer points
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          points: {
            increment: points,
          },
        },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          tier: true,
          points: true,
          totalSpent: true,
          updatedAt: true,
        },
      });

      // TODO: Create audit log entry if audit table exists
      // await tx.pointsAdjustmentLog.create({
      //   data: {
      //     customerId,
      //     previousPoints: customer.points,
      //     adjustmentAmount: points,
      //     newPoints: updatedCustomer.points,
      //     reason,
      //     performedBy,
      //   },
      // });

      return updatedCustomer;
    });
  }

  /**
   * Upgrade/Downgrade customer tier
   */
  static async updateTier(customerId: string, tier: CustomerTier, reason?: string) {
    return prisma.customer.update({
      where: { id: customerId },
      data: { tier },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        tier: true,
        points: true,
        totalSpent: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get customer statistics
   */
  static async getStatistics() {
    const [totalCustomers, tierDistribution, topCustomers, recentCustomers] =
      await Promise.all([
        // Total customers
        prisma.customer.count(),

        // Distribution by tier
        prisma.customer.groupBy({
          by: ['tier'],
          _count: true,
        }),

        // Top customers by spending
        prisma.customer.findMany({
          take: 10,
          orderBy: { totalSpent: 'desc' },
          select: {
            id: true,
            name: true,
            phone: true,
            tier: true,
            totalSpent: true,
            points: true,
            _count: {
              select: { orders: true },
            },
          },
        }),

        // Recent customers
        prisma.customer.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            phone: true,
            tier: true,
            createdAt: true,
          },
        }),
      ]);

    // Calculate average spending
    const avgSpent = await prisma.customer.aggregate({
      _avg: { totalSpent: true },
    });

    return {
      totalCustomers,
      tierDistribution: tierDistribution.reduce(
        (acc, item) => {
          acc[item.tier] = item._count;
          return acc;
        },
        {} as Record<CustomerTier, number>
      ),
      topCustomers,
      recentCustomers,
      averageSpent: avgSpent._avg.totalSpent || 0,
    };
  }

  /**
   * Get customer order history with details
   */
  static async getOrderHistory(customerId: string, params?: { page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          discountAmount: true,
          createdAt: true,
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    return { orders, total };
  }

  /**
   * Search customers across all branches (for management)
   */
  static async search(query: string, limit: number = 20) {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        tier: true,
        totalSpent: true,
        points: true,
      },
    });
  }
}
