import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getProductList,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

const router = Router();

// All product routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/products
 * Get product list with pagination, sorting and filtering
 */
router.get(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  getProductList
);

/**
 * GET /api/v1/products/:id
 * Get product by ID
 */
router.get(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  getProductById
);

/**
 * POST /api/v1/products
 * Create new product
 */
router.post(
  '/',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    body('code')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Code must be between 2-50 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Code must contain only uppercase letters, numbers, hyphens and underscores'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Name must be between 2-255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('price')
      .isInt({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('categoryId')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Category ID must not be empty'),
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a positive number'),
    body('costPrice')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Cost price must be a positive number'),
    body('prepTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Prep time must be a positive number'),
    body('isAvailable')
      .optional()
      .isBoolean()
      .withMessage('isAvailable must be a boolean'),
  ],
  createProduct
);

/**
 * PUT /api/v1/products/:id
 * Update product
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Name must be between 2-255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('price')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('categoryId')
      .optional()
      .trim(),
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a positive number'),
    body('costPrice')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Cost price must be a positive number'),
    body('prepTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Prep time must be a positive number'),
    body('isAvailable')
      .optional()
      .isBoolean()
      .withMessage('isAvailable must be a boolean'),
  ],
  updateProduct
);

/**
 * DELETE /api/v1/products/:id
 * Delete product
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  deleteProduct
);

export default router;
