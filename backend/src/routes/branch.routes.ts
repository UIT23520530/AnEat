import { Router } from 'express';
import { body } from 'express-validator';
import {
  getManagerBranch,
  updateManagerBranch,
  getBranchStatistics,
} from '../controllers/shared/branch.controller';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require manager authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN_BRAND));

/**
 * @route   GET /api/manager/branch
 * @desc    Get manager's branch information
 * @access  Manager only
 */
router.get('/', getManagerBranch);

/**
 * @route   PATCH /api/manager/branch
 * @desc    Update manager's branch information
 * @access  Manager only
 */
router.patch(
  '/',
  [
    body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
    body('address')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Address cannot be empty'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be 10 digits'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    validate,
  ],
  updateManagerBranch
);

/**
 * @route   GET /api/manager/branch/statistics
 * @desc    Get branch statistics
 * @access  Manager only
 */
router.get('/statistics', getBranchStatistics);

export default router;
