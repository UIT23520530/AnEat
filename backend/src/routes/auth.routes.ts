import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, systemLogin, getCurrentUser, logout } from '../controllers/shared/auth.controller';
import { authenticate } from '../middleware';
import { validate } from '../middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ],
  validate,
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login for CUSTOMER only
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

/**
 * @route   POST /api/v1/auth/system/login
 * @desc    System login for STAFF, ADMIN_BRAND, ADMIN_SYSTEM, LOGISTICS_STAFF
 * @access  Public
 */
router.post(
  '/system/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  systemLogin
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

export default router;
