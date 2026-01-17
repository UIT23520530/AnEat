import { prisma } from '../db';
import { Prisma } from '@prisma/client';

interface UnifiedSearchParams {
  query: string;
  page: number;
  limit: number;
  branchId?: string;
}

/**
 * Service for unified search across categories and products
 */
export class SearchService {
  /**
   * Search both categories and products by keyword
   * Returns combined results with pagination
   */
  static async searchAll(params: UnifiedSearchParams) {
    const { query, page, limit, branchId } = params;
    const skip = (page - 1) * limit;

    // Search categories
    const categoryWhere: Prisma.ProductCategoryWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Search products
    const productWhere: Prisma.ProductWhereInput = {
      isAvailable: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (branchId) {
      productWhere.branchId = branchId;
    }

    // Execute searches in parallel
    const [categories, categoryTotal, products, productTotal] = await Promise.all([
      prisma.productCategory.findMany({
        where: categoryWhere,
        take: Math.ceil(limit / 2), // Split limit between categories and products
        orderBy: { name: 'asc' },
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
      prisma.productCategory.count({ where: categoryWhere }),
      prisma.product.findMany({
        where: productWhere,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
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
        },
      }),
      prisma.product.count({ where: productWhere }),
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
        type: 'category' as const,
      })),
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
        type: 'product' as const,
      })),
      totals: {
        categories: categoryTotal,
        products: productTotal,
        all: categoryTotal + productTotal,
      },
      pagination: {
        page,
        limit,
        total: productTotal,
        totalPages: Math.ceil(productTotal / limit),
      },
    };
  }

  /**
   * Quick search for autocomplete/suggestions
   * Returns limited results without pagination
   */
  static async quickSearch(query: string, branchId?: string) {
    const categoryWhere: Prisma.ProductCategoryWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    };

    const productWhere: Prisma.ProductWhereInput = {
      isAvailable: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (branchId) {
      productWhere.branchId = branchId;
    }

    const [categories, products] = await Promise.all([
      prisma.productCategory.findMany({
        where: categoryWhere,
        take: 5,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          image: true,
        },
      }),
      prisma.product.findMany({
        where: productWhere,
        take: 10,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          price: true,
          image: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      categories: categories.map(cat => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        imageUrl: cat.image,
        type: 'category' as const,
      })),
      products: products.map(product => ({
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        imageUrl: product.image,
        categoryName: product.category?.name,
        type: 'product' as const,
      })),
    };
  }
}
