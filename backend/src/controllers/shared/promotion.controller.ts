import { Request, Response } from 'express';
import { PromotionService } from '../../models/promotion.service';
import { PromotionType } from '@prisma/client';

// Get all promotions
export const getPromotions = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const type = req.query.type as PromotionType | undefined;
    const search = req.query.search as string | undefined;

    const branchId = req.user.role === 'ADMIN_SYSTEM' ? undefined : req.user.branchId || undefined;

    const { promotions, total } = await PromotionService.findAll({
      page,
      limit,
      isActive,
      type,
      search,
      branchId,
    });

    res.status(200).json({
      success: true,
      code: 200,
      data: promotions,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        totalItems: total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching promotions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải danh sách khuyến mãi',
    });
  }
};

// Get promotion by ID
export const getPromotionById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const promotion = await PromotionService.findById(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi',
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: promotion,
    });
  } catch (error: any) {
    console.error('Error fetching promotion:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải thông tin khuyến mãi',
    });
  }
};

// Validate promotion code (for customer use)
export const validatePromotionCode = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { code } = req.params;

    const promotion = await PromotionService.findByCode(code);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Mã khuyến mãi không tồn tại',
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: promotion,
    });
  } catch (error: any) {
    console.error('Error validating promotion code:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Mã khuyến mãi không hợp lệ',
    });
  }
};

// Create promotion
export const createPromotion = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { code, type, value, maxUses, isActive, expiryDate, minOrderAmount, applicableProducts } = req.body;

    const branchId = req.user.role === 'ADMIN_SYSTEM' ? undefined : (req.user.branchId || undefined);

    const promotion = await PromotionService.create({
      code,
      type,
      value,
      maxUses,
      isActive,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      minOrderAmount,
      applicableProducts,
      branchId,
    });

    res.status(201).json({
      success: true,
      code: 201,
      data: promotion,
      message: 'Tạo khuyến mãi thành công',
    });
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể tạo khuyến mãi',
    });
  }
};

// Update promotion
export const updatePromotion = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const { code, type, value, maxUses, isActive, expiryDate, minOrderAmount, applicableProducts } = req.body;

    // Check if permission allowed
    if (req.user.role !== 'ADMIN_SYSTEM') {
      const existing = await PromotionService.findById(id);
      if (existing && !existing.branchId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa khuyến mãi của hệ thống',
        });
      }
      if (existing && existing.branchId !== req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa khuyến mãi này',
        });
      }
    }

    const promotion = await PromotionService.update(id, {
      code,
      type,
      value,
      maxUses,
      isActive,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      minOrderAmount,
      applicableProducts,
    });

    res.status(200).json({
      success: true,
      code: 200,
      data: promotion,
      message: 'Cập nhật khuyến mãi thành công',
    });
  } catch (error: any) {
    console.error('Error updating promotion:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể cập nhật khuyến mãi',
    });
  }
};

// Delete promotion
export const deletePromotion = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    await PromotionService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Xóa khuyến mãi thành công',
    });
  } catch (error: any) {
    console.error('Error deleting promotion:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể xóa khuyến mãi',
    });
  }
};

// Get statistics
export const getPromotionStatistics = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const branchId = req.user.role === 'ADMIN_SYSTEM' ? undefined : (req.user.branchId || undefined);
    const statistics = await PromotionService.getStatistics(branchId);

    res.status(200).json({
      success: true,
      code: 200,
      data: statistics,
    });
  } catch (error: any) {
    console.error('Error fetching promotion statistics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải thống kê',
    });
  }
};
