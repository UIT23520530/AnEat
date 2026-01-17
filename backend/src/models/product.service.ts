import { prisma } from '../db';
import { Prisma } from '@prisma/client';

// Types for query parameters
export interface ProductQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  branchId?: string;
}

// Types for create data
export interface ProductCreateData {
  code: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: string;
  quantity?: number;
  costPrice?: number;
  prepTime?: number;
  isAvailable?: boolean;
  branchId: string;
}

// Types for update data
export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  quantity?: number;
  costPrice?: number;
  prepTime?: number;
  isAvailable?: boolean;
}

/**
 * Service layer for Product operations
 * Encapsulates all database access logic
 */
export class ProductService {
  /**
   * Find all products with pagination, sorting, filtering
   */
  static async findAll(params: ProductQueryParams) {
    const { page, limit, sort, order, search, categoryId, isAvailable, branchId } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.ProductWhereInput = {
      // Soft delete: Only get non-deleted products
      deletedAt: null,
    } as any;

    // Filter by branch if provided
    if (branchId) {
      where.branchId = branchId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Availability filter
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sort] = order;

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
          options: {
            where: { isAvailable: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              type: true,
              isRequired: true,
              isAvailable: true,
              order: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * Find product by ID
   */
  static async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
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
        options: {
          where: { isAvailable: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            type: true,
            isRequired: true,
            isAvailable: true,
            order: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find product by code
   */
  static async findByCode(code: string) {
    return await prisma.product.findUnique({
      where: { code },
    });
  }

  /**
   * Create new product
   */
  static async create(data: ProductCreateData) {
    return await prisma.product.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        quantity: data.quantity || 0,
        costPrice: data.costPrice || 0,
        prepTime: data.prepTime || 15,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        branchId: data.branchId,
      },
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
        createdAt: true,
      },
    });
  }

  /**
   * Update product
   */
  static async update(id: string, data: ProductUpdateData) {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.prepTime !== undefined && { prepTime: data.prepTime }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
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
        updatedAt: true,
      },
    });
  }

  /**
   * Delete product
   */
  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Check if product has orders
   */
  static async hasOrders(id: string): Promise<boolean> {
    const count = await prisma.orderItem.count({
      where: { productId: id },
    });
    return count > 0;
  }

  // ==================== STAFF ORDER PAGE METHODS ====================

  /**
   * Get available products for staff order page with pagination
   * Only returns products that are available (isAvailable = true)
   */
  static async getAvailableProducts(params: ProductQueryParams) {
    const { page, limit, sort, order, search, categoryId, branchId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isAvailable: true, // Chỉ lấy products available
    };

    // Filter by branch (required for staff)
    if (branchId) {
      where.branchId = branchId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sort]: order,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          price: true,
          image: true,
          prepTime: true,
          quantity: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          options: {
            where: { isAvailable: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              type: true,
              isRequired: true,
              isAvailable: true,
              order: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Return DTO format
    return {
      products: products.map(product => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.image,
        prepTime: product.prepTime,
        inStock: product.quantity > 0,
        stockQuantity: product.quantity,
        category: product.category ? {
          id: product.category.id,
          code: product.category.code,
          name: product.category.name,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product detail with options for staff order page
   * Returns full product info including potential options
   */
  static async getProductDetailForOrder(id: string, branchId?: string) {
    const where: Prisma.ProductWhereInput = {
      id,
      isAvailable: true,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const product = await prisma.product.findFirst({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        price: true,
        image: true,
        prepTime: true,
        quantity: true,
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
        options: {
          where: { isAvailable: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            type: true,
            isRequired: true,
            isAvailable: true,
            order: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return null;
    }

    // Group options by type
    const sizes = product.options.filter(opt => opt.type === 'SIZE');
    const sauces = product.options.filter(opt => opt.type === 'SAUCE');
    const types = product.options.filter(opt => opt.type === 'OTHER');

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image,
      prepTime: product.prepTime,
      inStock: product.quantity > 0,
      stockQuantity: product.quantity,
      category: product.category ? {
        id: product.category.id,
        code: product.category.code,
        name: product.category.name,
      } : null,
      branch: {
        id: product.branch.id,
        code: product.branch.code,
        name: product.branch.name,
      },
      // Options grouped by type
      options: {
        sizes: sizes.map(opt => ({
          id: opt.id,
          name: opt.name,
          priceAdjustment: opt.price / 100, // Convert from cents to VND
        })),
        types: types.map(opt => ({
          id: opt.id,
          name: opt.name,
          priceAdjustment: opt.price / 100,
        })),
        sauces: sauces.map(opt => ({
          id: opt.id,
          name: opt.name,
          priceAdjustment: opt.price / 100,
        })),
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
