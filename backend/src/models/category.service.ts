import { prisma } from '../db';
import { Prisma } from '@prisma/client';

interface CategoryQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

interface CategoryCreateData {
  code: string;
  name: string;
  description?: string;
  image?: string;
}

interface CategoryUpdateData {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export class CategoryService {
  static async findAll(params: CategoryQueryParams) {
    const { page, limit, sort, order, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductCategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.ProductCategoryOrderByWithRelationInput = {
      [sort]: order,
    };

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    return { categories, total };
  }

  static async findById(id: string) {
    return prisma.productCategory.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  static async findByCode(code: string) {
    return prisma.productCategory.findUnique({
      where: { code },
    });
  }

  static async create(data: CategoryCreateData) {
    return prisma.productCategory.create({
      data,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  static async update(id: string, data: CategoryUpdateData) {
    return prisma.productCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.productCategory.delete({
      where: { id },
    });
  }

  static async countProducts(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return category?._count.products || 0;
  }

  // ==================== STAFF ORDER PAGE METHODS ====================

  /**
   * Get active categories for staff order page with pagination
   */
  static async getActiveCategories(params: CategoryQueryParams) {
    const { page, limit, sort, order, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductCategoryWhereInput = {
      isActive: true, // Chỉ lấy categories active
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProductCategoryOrderByWithRelationInput = {
      [sort]: order,
    };

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          image: true,
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    // Return DTO format
    return {
      categories: categories.map(cat => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image,
        productCount: cat._count.products,
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
   * Get all active categories (no pagination, for quick access)
   */
  static async getAllActiveCategories() {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      take: 100, // Limit to 100 items
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    // Return DTO format
    return categories.map(cat => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.image,
      productCount: cat._count.products,
    }));
  }

  /**
   * Get active category by ID for staff order page
   */
  static async getActiveCategoryById(id: string) {
    const category = await prisma.productCategory.findFirst({
      where: {
        id,
        isActive: true, // Chỉ lấy nếu active
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return null;
    }

    // Return DTO format
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      imageUrl: category.image,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
