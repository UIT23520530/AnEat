import { prisma } from '../db';
import { Prisma } from '@prisma/client';

// Types for query parameters
export interface WarehouseQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  alertOnly?: boolean;
  branchId: string;
}

// DTO for inventory item
export interface InventoryItemDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  quantity: number;
  costPrice: number;
  prepTime: number;
  isAvailable: boolean;
  hasAlert: boolean; // True if quantity < 50
  category: {
    id: string;
    code: string;
    name: string;
  } | null;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service layer for Warehouse/Inventory operations
 * Level 3: Pagination, Search, Filter, Sorting, DTO mapping
 */
export class WarehouseService {
  /**
   * Get inventory list with alert detection
   * Alert triggered when quantity < 50
   */
  static async getInventoryList(params: WarehouseQueryParams) {
    const { page, limit, sort, order, search, categoryId, alertOnly, branchId } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      branchId, // Filter by staff's branch
    };

    // Search filter (product name, code)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Alert filter (quantity < 50)
    if (alertOnly) {
      where.quantity = { lt: 50 };
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sort] = order;

    // Query products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          price: true,
          image: true,
          quantity: true,
          costPrice: true,
          prepTime: true,
          isAvailable: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          branchId: true,
          branch: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Map to DTO with alert flag (filter out products without branch)
    const inventoryItems: InventoryItemDTO[] = products
      .filter(product => product.branch !== null)
      .map((product) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: product.quantity,
        costPrice: product.costPrice,
        prepTime: product.prepTime,
        isAvailable: product.isAvailable,
        hasAlert: product.quantity < 50, // Alert flag
        category: product.category,
        branch: product.branch!,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return { inventoryItems, total };
  }

  /**
   * Get alert count (products with quantity < 50)
   */
  static async getAlertCount(branchId: string): Promise<number> {
    return await prisma.product.count({
      where: {
        branchId,
        quantity: { lt: 50 },
      },
    });
  }

  /**
   * Get inventory statistics for branch
   */
  static async getInventoryStats(branchId: string) {
    const [totalProducts, lowStockCount, outOfStockCount, totalValue] = await Promise.all([
      // Total products in branch
      prisma.product.count({
        where: { branchId },
      }),
      // Products with quantity < 50
      prisma.product.count({
        where: {
          branchId,
          quantity: { lt: 50 },
        },
      }),
      // Products out of stock
      prisma.product.count({
        where: {
          branchId,
          quantity: 0,
        },
      }),
      // Total inventory value (quantity * costPrice)
      prisma.product.aggregate({
        where: { branchId },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalQuantity: totalValue._sum.quantity || 0,
    };
  }
}
