import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createBill,
  getBillList,
  getBillById,
  updateBill,
  getBillHistory,
  printBill,
  getBillStats,
  batchCreateBills,
} from '../controllers/bill.controller';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/manager/bills/stats
 * @desc    Get bill statistics for manager's branch
 * @access  Manager/Staff
 */
router.get(
  '/stats',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  getBillStats
);

/**
 * @route   GET /api/v1/manager/bills
 * @desc    Get bill list with pagination, filtering, and sorting
 * @access  Manager/Staff
 * @query   page, limit, sort, status, paymentStatus, search, dateFrom, dateTo
 */
router.get(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('status').optional().isIn(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'REFUNDED']).withMessage('Invalid status'),
    query('paymentStatus').optional().isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  getBillList
);

/**
 * @route   GET /api/v1/manager/bills/:id
 * @desc    Get bill by ID with full details
 * @access  Manager/Staff
 */
router.get(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    param('id').isString().notEmpty().withMessage('Bill ID is required'),
  ],
  validate,
  getBillById
);

/**
 * @route   POST /api/v1/manager/bills
 * @desc    Create a new bill from an order
 * @access  Manager/Staff
 */
router.post(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    body('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('subtotal').isInt({ min: 0 }).withMessage('Subtotal must be a non-negative integer'),
    body('taxAmount').optional().isInt({ min: 0 }).withMessage('Tax amount must be a non-negative integer'),
    body('discountAmount').optional().isInt({ min: 0 }).withMessage('Discount amount must be a non-negative integer'),
    body('customerName').optional().isString().withMessage('Customer name must be a string'),
    body('customerPhone').optional().isString().withMessage('Customer phone must be a string'),
    body('customerEmail').optional().isEmail().withMessage('Invalid email format'),
    body('customerAddress').optional().isString().withMessage('Customer address must be a string'),
    body('paymentMethod').optional().isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'E_WALLET']).withMessage('Invalid payment method'),
    body('paymentStatus').optional().isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
    body('paidAmount').optional().isInt({ min: 0 }).withMessage('Paid amount must be a non-negative integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('internalNotes').optional().isString().withMessage('Internal notes must be a string'),
  ],
  validate,
  createBill
);

/**
 * @route   PUT /api/v1/manager/bills/:id
 * @desc    Update bill (creates history log)
 * @access  Manager/Staff
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    param('id').isString().notEmpty().withMessage('Bill ID is required'),
    body('editReason').isString().notEmpty().withMessage('Edit reason is required for audit trail'),
    body('status').optional().isIn(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'REFUNDED']).withMessage('Invalid status'),
    body('customerName').optional().isString().withMessage('Customer name must be a string'),
    body('customerPhone').optional().isString().withMessage('Customer phone must be a string'),
    body('customerEmail').optional().isEmail().withMessage('Invalid email format'),
    body('customerAddress').optional().isString().withMessage('Customer address must be a string'),
    body('paymentMethod').optional().isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'E_WALLET']).withMessage('Invalid payment method'),
    body('paymentStatus').optional().isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
    body('paidAmount').optional().isInt({ min: 0 }).withMessage('Paid amount must be a non-negative integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('internalNotes').optional().isString().withMessage('Internal notes must be a string'),
  ],
  validate,
  updateBill
);

/**
 * @route   GET /api/v1/manager/bills/:id/history
 * @desc    Get bill edit history
 * @access  Manager/Staff
 */
router.get(
  '/:id/history',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    param('id').isString().notEmpty().withMessage('Bill ID is required'),
  ],
  validate,
  getBillHistory
);

/**
 * @route   POST /api/v1/manager/bills/:id/print
 * @desc    Mark bill as printed and return print data
 * @access  Manager/Staff
 */
router.post(
  '/:id/print',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    param('id').isString().notEmpty().withMessage('Bill ID is required'),
  ],
  validate,
  printBill
);

/**
 * @route   POST /api/v1/manager/bills/batch-create
 * @desc    Batch create bills for multiple completed orders
 * @access  Manager/Staff
 */
router.post(
  '/batch-create',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF),
  [
    body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
    body('orderIds.*').isString().notEmpty().withMessage('Each order ID must be a non-empty string'),
  ],
  validate,
  batchCreateBills
);

export default router;
