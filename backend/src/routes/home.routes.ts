import { Router } from 'express';
import { query, body, param } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  getBanners,
  getFeaturedProducts,
  getPublicCategories,
  getPublicProducts,
  getPublicPromotions,
  getPublicOrders,
  createTempOrder,
  trackOrder,
  getAboutUs,
  getPublicBranches,
} from '../controllers/shared/home.controller';

const router = Router();

/**
 * @route   GET /api/v1/home/banners
 * @desc    Get active banners for homepage
 * @access  Public
 */
router.get('/banners', getBanners);

/**
 * @route   GET /api/v1/home/featured-products
 * @desc    Get featured products (top selling)
 * @access  Public
 * @query   limit (optional, default 10), branchId (optional)
 */
router.get(
  '/featured-products',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('branchId').optional().isString(),
  ],
  validate,
  getFeaturedProducts
);

/**
 * @route   GET /api/v1/home/categories
 * @desc    Get all active categories
 * @access  Public
 */
router.get('/categories', getPublicCategories);

/**
 * @route   GET /api/v1/home/products
 * @desc    Get products for menu (requires branchId)
 * @access  Public
 * @query   branchId (required), categoryId (optional), search (optional), page (optional), limit (optional)
 */
router.get(
  '/products',
  [
    query('branchId').notEmpty().withMessage('Branch ID is required'),
    query('categoryId').optional().isString(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isString(),
  ],
  validate,
  getPublicProducts
);

/**
 * @route   GET /api/v1/home/promotions
 * @desc    Get active promotions
 * @access  Public
 * @query   page (optional), limit (optional)
 */
router.get(
  '/promotions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getPublicPromotions
);

/**
 * @route   GET /api/v1/home/orders
 * @desc    Get orders list (requires orderNumber or authentication)
 * @access  Public (with orderNumber) or Private (authenticated)
 * @query   orderNumber (optional if authenticated), status (optional), page (optional), limit (optional)
 */
router.get(
  '/orders',
  // authenticate is optional - check in controller
  [
    query('orderNumber')
      .optional()
      .custom((value) => {
        if (value === undefined || value === '' || typeof value === 'string') {
          return true;
        }
        return false;
      })
      .withMessage('Order number must be a string'),
    query('status')
      .optional()
      .custom((value) => {
        if (value === undefined || value === '') {
          return true;
        }
        return ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].includes(value);
      })
      .withMessage('Status must be one of: PENDING, PREPARING, READY, COMPLETED, CANCELLED'),
    query('page')
      .optional()
      .custom((value) => {
        if (value === undefined || value === '') {
          return true;
        }
        const num = Number(value);
        return !isNaN(num) && num >= 1;
      })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .custom((value) => {
        if (value === undefined || value === '') {
          return true;
        }
        const num = Number(value);
        return !isNaN(num) && num >= 1 && num <= 50;
      })
      .withMessage('Limit must be between 1 and 50'),
  ],
  validate,
  getPublicOrders
);

/**
 * @route   POST /api/v1/home/orders/temp
 * @desc    Create temporary order (save to localStorage/cookie on frontend)
 * @access  Public
 */
router.post(
  '/orders/temp',
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('customerInfo').optional().isObject(),
    body('promotionCode')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return typeof value === 'string';
      })
      .withMessage('Promotion code must be a string'),
    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return typeof value === 'string';
      })
      .withMessage('Notes must be a string'),
  ],
  validate,
  createTempOrder
);

/**
 * @route   GET /api/v1/home/orders/:orderNumber/tracking
 * @desc    Track order status by orderNumber
 * @access  Public
 */
router.get(
  '/orders/:orderNumber/tracking',
  [
    param('orderNumber').notEmpty().withMessage('Order number is required'),
  ],
  validate,
  trackOrder
);

/**
 * @route   GET /api/v1/home/about-us
 * @desc    Get about us information (company story)
 * @access  Public
 */
router.get('/about-us', getAboutUs);

/**
 * @route   GET /api/v1/home/branches
 * @desc    Get all branches (public)
 * @access  Public
 * @query   page (optional), limit (optional), search (optional)
 */
router.get(
  '/branches',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('sort').optional().isString(),
  ],
  validate,
  getPublicBranches
);

export default router;
