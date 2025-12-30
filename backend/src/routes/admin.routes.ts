import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/admin.controller';
import { authenticate, isAdmin, validate } from '../middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/v1/admin/branches
 * @desc    Get all branches
 * @access  Admin only
 */
router.get('/branches', getAllBranches);

/**
 * @route   POST /api/v1/admin/branches
 * @desc    Create new branch
 * @access  Admin only
 */
router.post(
  '/branches',
  [
    body('code').notEmpty().withMessage('Branch code is required'),
    body('name').notEmpty().withMessage('Branch name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ],
  validate,
  createBranch
);

/**
 * @route   PUT /api/v1/admin/branches/:id
 * @desc    Update branch
 * @access  Admin only
 */
router.put('/branches/:id', updateBranch);

/**
 * @route   DELETE /api/v1/admin/branches/:id
 * @desc    Delete branch
 * @access  Admin only
 */
router.delete('/branches/:id', deleteBranch);

export default router;
