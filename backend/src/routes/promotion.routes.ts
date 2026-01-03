import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { UserRole } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as promotionController from '../controllers/shared/promotion.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics - must be before /:id route
router.get(
  '/statistics',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  promotionController.getPromotionStatistics
);

// Get all promotions
router.get(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('isActive').optional().isBoolean(),
    query('type').optional().isIn(['PERCENTAGE', 'FIXED']),
    query('search').optional().isString(),
  ],
  promotionController.getPromotions
);

// Validate promotion code (available for customers)
router.get(
  '/validate/:code',
  param('code').notEmpty().withMessage('Mã khuyến mãi không được để trống'),
  promotionController.validatePromotionCode
);

// Get promotion by ID
router.get(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  param('id').notEmpty().withMessage('ID không được để trống'),
  promotionController.getPromotionById
);

// Create promotion
router.post(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    body('code')
      .notEmpty()
      .withMessage('Mã khuyến mãi không được để trống')
      .isLength({ min: 3, max: 20 })
      .withMessage('Mã khuyến mãi phải từ 3-20 ký tự'),
    body('type')
      .notEmpty()
      .withMessage('Loại khuyến mãi không được để trống')
      .isIn(['PERCENTAGE', 'FIXED'])
      .withMessage('Loại khuyến mãi không hợp lệ'),
    body('value')
      .notEmpty()
      .withMessage('Giá trị khuyến mãi không được để trống')
      .isInt({ min: 0 })
      .withMessage('Giá trị khuyến mãi phải là số nguyên dương'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Số lượt sử dụng phải lớn hơn 0'),
    body('isActive')
      .notEmpty()
      .withMessage('Trạng thái không được để trống')
      .isBoolean()
      .withMessage('Trạng thái phải là boolean'),
    body('expiryDate').optional().isISO8601().withMessage('Ngày hết hạn không hợp lệ'),
    body('minOrderAmount').optional().isInt({ min: 0 }).withMessage('Giá trị đơn hàng tối thiểu không hợp lệ'),
    body('applicableProducts').optional().isString(),
  ],
  promotionController.createPromotion
);

// Update promotion
router.put(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    param('id').notEmpty().withMessage('ID không được để trống'),
    body('code')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Mã khuyến mãi phải từ 3-20 ký tự'),
    body('type').optional().isIn(['PERCENTAGE', 'FIXED']).withMessage('Loại khuyến mãi không hợp lệ'),
    body('value').optional().isInt({ min: 0 }).withMessage('Giá trị khuyến mãi phải là số nguyên dương'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Số lượt sử dụng phải lớn hơn 0'),
    body('isActive').optional().isBoolean().withMessage('Trạng thái phải là boolean'),
    body('expiryDate').optional().isISO8601().withMessage('Ngày hết hạn không hợp lệ'),
    body('minOrderAmount').optional().isInt({ min: 0 }).withMessage('Giá trị đơn hàng tối thiểu không hợp lệ'),
    body('applicableProducts').optional().isString(),
  ],
  promotionController.updatePromotion
);

// Delete promotion (soft delete)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  param('id').notEmpty().withMessage('ID không được để trống'),
  promotionController.deletePromotion
);

export default router;
