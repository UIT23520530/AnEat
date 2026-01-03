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
}
