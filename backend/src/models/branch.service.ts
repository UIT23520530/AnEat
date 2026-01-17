import { prisma } from '../db';
import { Prisma } from '@prisma/client';

interface BranchQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

interface BranchUpdateData {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string | null;
}

interface BranchCreateData {
  code?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface BranchDTO {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    staff: number;
    products: number;
    orders: number;
    tables: number;
  };
}

export class BranchService {
  /**
   * Generate next available branch code
   */
  static async generateBranchCode(): Promise<string> {
    const lastBranch = await prisma.branch.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    if (!lastBranch) {
      return 'BR001';
    }

    const lastNumber = parseInt(lastBranch.code.replace('BR', ''), 10);
    const nextNumber = lastNumber + 1;
    return `BR${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Find all branches with pagination, sorting, and filtering
   */
  static async findAll(params: BranchQueryParams) {
    const { page, limit, sort, order, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BranchWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const orderBy: Prisma.BranchOrderByWithRelationInput = {
      [sort]: order,
    };

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          isActive: true,
          managerId: true,
          manager: {
            where: {
              deletedAt: null, // 🔥 CRITICAL FIX: Only show managers that are not deleted
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              staff: true,
              products: true,
              orders: true,
              tables: true,
            },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return { branches, total };
  }

  /**
   * Find branch by ID with detailed information
   */
  static async findById(id: string) {
    return prisma.branch.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        managerId: true,
        manager: {
          where: {
            deletedAt: null, // 🔥 CRITICAL FIX: Only show manager that is not deleted
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            staff: true,
            products: true,
            orders: true,
            tables: true,
          },
        },
      },
    });
  }

  /**
   * Find branch by code
   */
  static async findByCode(code: string) {
    return prisma.branch.findUnique({
      where: { code },
    });
  }

  /**
   * Create new branch
   */
  static async create(data: BranchCreateData) {
    const code = data.code || await this.generateBranchCode();
    
    return prisma.branch.create({
      data: {
        code,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        managerId: data.managerId,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update branch information
   */
  static async update(id: string, data: BranchUpdateData) {
    return prisma.branch.update({
      where: { id },
      data,
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            staff: true,
            products: true,
            orders: true,
          },
        },
      },
    });
  }

  /**
   * Delete branch
   */
  static async delete(id: string) {
    return prisma.branch.delete({
      where: { id },
    });
  }

  /**
   * Assign manager to branch
   */
  static async assignManager(branchId: string, managerId: string | null) {
    return prisma.branch.update({
      where: { id: branchId },
      data: { managerId },
      select: {
        id: true,
        code: true,
        name: true,
        managerId: true,
        manager: {
          where: {
            deletedAt: null, // 🔥 CRITICAL FIX: Only show manager that is not deleted
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get branch statistics
   */
  static async getStatistics(branchId: string) {
    const [totalStaff, totalOrders, totalProducts, totalTables, revenueStats] =
      await Promise.all([
        prisma.user.count({
          where: { branchId, deletedAt: null },
        }),
        prisma.order.count({
          where: { branchId },
        }),
        prisma.product.count({
          where: { branchId },
        }),
        prisma.table.count({
          where: { branchId },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          _avg: { total: true },
          where: {
            branchId,
            status: 'COMPLETED',
          },
        }),
      ]);

    return {
      totalStaff,
      totalOrders,
      totalProducts,
      totalTables,
      totalRevenue: revenueStats._sum.total || 0,
      averageOrderValue: revenueStats._avg.total || 0,
    };
  }
}
