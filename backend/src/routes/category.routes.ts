import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getCategoryList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/shared/category.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  getCategoryList
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  param('id').isString().notEmpty(),
  validate,
  getCategoryById
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    body('code')
      .isString()
      .notEmpty()
      .withMessage('Code is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Code must be 2-50 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Code must contain only uppercase letters, numbers, hyphens and underscores'),
    body('name')
      .isString()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Name must be 2-255 characters'),
    body('description')
      .optional()
      .isString(),
    body('image')
      .optional()
      .isString()
      .isURL()
      .withMessage('Image must be a valid URL'),
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  [
    param('id').isString().notEmpty(),
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 255 })
      .withMessage('Name must be 2-255 characters'),
    body('description')
      .optional()
      .isString(),
    body('image')
      .optional()
      .isString(),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
  validate,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND),
  param('id').isString().notEmpty(),
  validate,
  deleteCategory
);

export default router;
