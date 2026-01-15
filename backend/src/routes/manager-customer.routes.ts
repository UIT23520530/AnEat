import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getAllCustomers,
  getCustomerById,
  getCustomerStatistics,
  updateCustomer,
  adjustCustomerPoints,
  updateCustomerTier,
  getCustomerOrders,
  searchCustomers,
  createCustomer,
  deleteCustomer,
} from '../controllers/manager/manager-customer.controller';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require manager authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN_BRAND));

/**
 * @route   GET /api/v1/manager/customers/statistics
 * @desc    Get customer statistics
 * @access  Manager only
 */
router.get('/statistics', getCustomerStatistics);

/**
 * @route   GET /api/v1/manager/customers/search
 * @desc    Search customers
 * @access  Manager only
 */
router.get(
  '/search',
  [query('q').notEmpty().withMessage('Search query is required'), validate],
  searchCustomers
);

/**
 * @route   GET /api/v1/manager/customers
 * @desc    Get all customers with pagination and filtering
 * @access  Manager only
 */
router.get('/', getAllCustomers);

/**
 * @route   POST /api/v1/manager/customers
 * @desc    Create new customer
 * @access  Manager only
 */
router.post(
  '/',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be 10 digits'),
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('tier')
      .optional()
      .isIn(['BRONZE', 'SILVER', 'GOLD', 'VIP'])
      .withMessage('Invalid tier value'),
    validate,
  ],
  createCustomer
);

/**
 * @route   GET /api/v1/manager/customers/:id
 * @desc    Get customer by ID
 * @access  Manager only
 */
router.get('/:id', getCustomerById);

/**
 * @route   PATCH /api/v1/manager/customers/:id
 * @desc    Update customer information
 * @access  Manager only
 */
router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be 10 digits'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('tier')
      .optional()
      .isIn(['BRONZE', 'SILVER', 'GOLD', 'VIP'])
      .withMessage('Invalid tier value'),
    body('points').optional().isInt().withMessage('Points must be an integer'),
    validate,
  ],
  updateCustomer
);

/**
 * @route   POST /api/v1/manager/customers/:id/adjust-points
 * @desc    Adjust customer points (for VIP/special customers)
 * @access  Manager only
 */
router.post(
  '/:id/adjust-points',
  [
    body('points')
      .notEmpty()
      .withMessage('Points adjustment amount is required')
      .isInt()
      .withMessage('Points must be an integer')
      .custom((value) => value !== 0)
      .withMessage('Points cannot be zero'),
    body('reason')
      .notEmpty()
      .withMessage('Reason is required')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Reason must be at least 5 characters'),
    validate,
  ],
  adjustCustomerPoints
);

/**
 * @route   PATCH /api/v1/manager/customers/:id/tier
 * @desc    Update customer tier
 * @access  Manager only
 */
router.patch(
  '/:id/tier',
  [
    body('tier')
      .notEmpty()
      .withMessage('Tier is required')
      .isIn(['BRONZE', 'SILVER', 'GOLD', 'VIP'])
      .withMessage('Invalid tier value'),
    body('reason').optional().trim(),
    validate,
  ],
  updateCustomerTier
);

/**
 * @route   GET /api/v1/manager/customers/:id/orders
 * @desc    Get customer order history
 * @access  Manager only
 */
router.get('/:id/orders', getCustomerOrders);

/**
 * @route   DELETE /api/v1/manager/customers/:id
 * @desc    Delete customer (soft delete)
 * @access  Manager only
 */
router.delete('/:id', deleteCustomer);

export default router;
