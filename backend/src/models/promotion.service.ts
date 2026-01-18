import { prisma } from '../db';
import { Prisma, PromotionType } from '@prisma/client';

interface PromotionQueryParams {
  page: number;
  limit: number;
  isActive?: boolean;
  type?: PromotionType;
  search?: string;
  branchId?: string;
}

interface CreatePromotionData {
  code: string;
  type: PromotionType;
  value: number;
  maxUses?: number;
  isActive: boolean;
  expiryDate?: Date;
  minOrderAmount?: number;
  applicableProducts?: string;
  branchId?: string;
}

interface UpdatePromotionData {
  code?: string;
  type?: PromotionType;
  value?: number;
  maxUses?: number;
  isActive?: boolean;
  expiryDate?: Date;
  minOrderAmount?: number;
  applicableProducts?: string;
}

export class PromotionService {
  // Get all promotions with filtering and pagination
  static async findAll(params: PromotionQueryParams) {
    const { page, limit, isActive, type, search, branchId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PromotionWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (branchId) {
      where.OR = [
        { branchId: branchId },
        { branchId: null }, // Include global promotions
      ];
    } else {
      where.branchId = null; // System admin sees only global if no branchId requested? 
      // Actually Admin usually should see everything, but let's keep it simple.
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          maxUses: true,
          usedCount: true,
          isActive: true,
          expiryDate: true,
          minOrderAmount: true,
          applicableProducts: true,
          branchId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.promotion.count({ where }),
    ]);

    return { promotions, total };
  }

  // Get promotion by ID
  static async findById(id: string) {
    return prisma.promotion.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        maxUses: true,
        usedCount: true,
        isActive: true,
        expiryDate: true,
        minOrderAmount: true,
        applicableProducts: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Get promotion by code (with Branch awareness)
  static async findByCode(code: string, branchId?: string) {
    // 1. Try to find branch-specific promotion first
    let promotion = null;

    if (branchId) {
      promotion = await prisma.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          branchId: branchId
        },
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          maxUses: true,
          usedCount: true,
          isActive: true,
          expiryDate: true,
          minOrderAmount: true,
          applicableProducts: true,
          branchId: true,
        },
      });
    }

    // 2. If not found or not branch-specific requested, try global
    if (!promotion) {
      promotion = await prisma.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          branchId: null
        },
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          maxUses: true,
          usedCount: true,
          isActive: true,
          expiryDate: true,
          minOrderAmount: true,
          applicableProducts: true,
          branchId: true,
        },
      });
    }

    if (!promotion) {
      return null;
    }

    // Check if promotion is valid
    if (!promotion.isActive) {
      throw new Error('Mã khuyến mãi không còn hiệu lực');
    }

    if (promotion.expiryDate && new Date() > promotion.expiryDate) {
      throw new Error('Mã khuyến mãi đã hết hạn');
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      throw new Error('Mã khuyến mãi đã hết lượt sử dụng');
    }

    return promotion;
  }

  // Create new promotion
  static async create(data: CreatePromotionData) {
    // Check if code already exists for THIS branch
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        code: data.code.toUpperCase(),
        branchId: data.branchId || null
      },
    });

    if (existingPromotion) {
      throw new Error('Mã khuyến mãi đã tồn tại');
    }

    return prisma.promotion.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        isActive: data.isActive,
        expiryDate: data.expiryDate,
        minOrderAmount: data.minOrderAmount,
        applicableProducts: data.applicableProducts,
        branchId: data.branchId,
      },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        maxUses: true,
        usedCount: true,
        isActive: true,
        expiryDate: true,
        minOrderAmount: true,
        applicableProducts: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Update promotion
  static async update(id: string, data: UpdatePromotionData) {
    // Check if promotion exists
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new Error('Không tìm thấy khuyến mãi');
    }

    // If updating code, check if new code already exists
    if (data.code && data.code !== promotion.code) {
      const existingPromotion = await prisma.promotion.findFirst({
        where: {
          code: data.code.toUpperCase(),
          branchId: promotion.branchId // Check in the SAME scope as the existing promotion
        },
      });

      if (existingPromotion) {
        throw new Error('Mã khuyến mãi đã tồn tại');
      }
    }

    return prisma.promotion.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.applicableProducts !== undefined && { applicableProducts: data.applicableProducts }),
      },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        maxUses: true,
        usedCount: true,
        isActive: true,
        expiryDate: true,
        minOrderAmount: true,
        applicableProducts: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Delete promotion (soft delete by setting isActive to false)
  static async delete(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new Error('Không tìm thấy khuyến mãi');
    }

    // Soft delete
    return prisma.promotion.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        code: true,
        isActive: true,
      },
    });
  }

  // Get statistics
  static async getStatistics(branchId?: string) {
    const where: Prisma.PromotionWhereInput = branchId ? { branchId } : {};

    const [totalPromotions, activePromotions, expiredPromotions] = await Promise.all([
      prisma.promotion.count({ where }),
      prisma.promotion.count({
        where: { ...where, isActive: true },
      }),
      prisma.promotion.count({
        where: {
          ...where,
          expiryDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    // Calculate total uses
    const promotions = await prisma.promotion.findMany({
      where,
      select: { usedCount: true },
    });
    const totalUses = promotions.reduce((sum, p) => sum + p.usedCount, 0);

    return {
      totalPromotions,
      activePromotions,
      expiredPromotions,
      totalUses,
    };
  }

  // Increment used count (called when promotion is applied to an order)
  static async incrementUsedCount(id: string) {
    return prisma.promotion.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }
}
