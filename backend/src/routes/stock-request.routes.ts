import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getStockRequests,
  getStockRequestById,
  createStockRequest,
  updateStockRequest,
  cancelStockRequest,
  getStockStatistics,
} from '../controllers/manager/stock-request.controller';

const router = Router();

/**
 * @route   GET /api/v1/stock-requests
 * @desc    Get all stock requests
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('productId').optional().isString(),
    query('search').optional().isString(),
  ],
  validate,
  getStockRequests
);

/**
 * @route   GET /api/v1/stock-requests/statistics
 * @desc    Get stock request statistics
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND)
 */
router.get(
  '/statistics',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  getStockStatistics
);

/**
 * @route   GET /api/v1/stock-requests/:id
 * @desc    Get stock request by ID
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND)
 */
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  param('id').isString().notEmpty(),
  validate,
  getStockRequestById
);

/**
 * @route   POST /api/v1/stock-requests
 * @desc    Create new stock request
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    body('type').optional().isString().isIn(['RESTOCK', 'ADJUSTMENT', 'RETURN']),
    body('requestedQuantity')
      .isInt({ min: 1 })
      .withMessage('Requested quantity must be at least 1'),
    body('notes').optional({ nullable: true, checkFalsy: true }),
    body('expectedDate').optional().isISO8601(),
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('branchId').optional().isString(),
  ],
  validate,
  createStockRequest
);

/**
 * @route   PUT /api/v1/stock-requests/:id/cancel
 * @desc    Cancel stock request
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND)
 */
router.put(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  param('id').isString().notEmpty(),
  validate,
  cancelStockRequest
);

/**
 * @route   PUT /api/v1/manager/stock-requests/:id
 * @desc    Update stock request
 * @access  Private (ADMIN_SYSTEM, ADMIN_BRAND, STAFF)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    param('id').isString().notEmpty(),
    body('type').optional().isString().isIn(['RESTOCK', 'ADJUSTMENT', 'RETURN']),
    body('requestedQuantity').optional().isInt({ min: 1 }),
    body('notes').optional({ nullable: true, checkFalsy: true }),
    body('expectedDate').optional().isISO8601(),
    body('productId').optional().isString().notEmpty(),
  ],
  validate,
  updateStockRequest
);

export default router;
