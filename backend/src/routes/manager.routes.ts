import { Router } from 'express';
import { body } from 'express-validator';
import {
  getBranchStats,
  getBranchStaff,
  getBranchOrders,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffList,
} from '../controllers/manager/manager.controller';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require manager authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND, UserRole.STAFF));

/**
 * @route   GET /api/v1/manager/stats
 * @desc    Get branch statistics
 * @access  Manager only
 */
router.get('/stats', getBranchStats);

/**
 * @route   GET /api/v1/manager/staff
 * @desc    Get staff in manager's branch (simple list)
 * @access  Manager only
 */
router.get('/staff', getBranchStaff);

/**
 * @route   GET /api/v1/manager/orders
 * @desc    Get orders in manager's branch
 * @access  Manager only
 */
router.get('/orders', getBranchOrders);

// ==================== STAFF CRUD ROUTES ====================

/**
 * @route   GET /api/v1/manager/staffs
 * @desc    Get staff list with pagination, sorting and filtering
 * @access  Manager only
 */
router.get('/staffs', getStaffList);

/**
 * @route   GET /api/v1/manager/staffs/:id
 * @desc    Get staff by ID
 * @access  Manager only
 */
router.get('/staffs/:id', getStaffById);

/**
 * @route   POST /api/v1/manager/staffs
 * @desc    Create new staff
 * @access  Manager only
 */
router.post(
  '/staffs',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Name must be between 3 and 255 characters'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Phone must be 10-11 digits'),
  ],
  validate,
  createStaff
);

/**
 * @route   PUT /api/v1/manager/staffs/:id
 * @desc    Update staff
 * @access  Manager only
 */
router.put(
  '/staffs/:id',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Name must be between 3 and 255 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Phone must be 10-11 digits'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  validate,
  updateStaff
);

/**
 * @route   DELETE /api/v1/manager/staffs/:id
 * @desc    Delete staff (soft delete)
 * @access  Manager only
 */
router.delete('/staffs/:id', deleteStaff);

export default router;
