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
  getCategoryList,
  toggleCategoryVisibilityForBranch,
  getCategoryStats,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductList,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} from '../controllers/manager/manager.controller';
import {
  getManagerTemplates,
  getManagerTemplateStats,
  getManagerTemplateById,
  createManagerTemplate,
  updateManagerTemplate,
  deleteManagerTemplate,
  duplicateManagerTemplate,
} from '../controllers/manager/manager-template.controller';
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
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
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

// ==================== CATEGORY ROUTES ====================

/**
 * @route   GET /api/v1/manager/categories
 * @desc    Get category list
 * @access  Manager only
 */
router.get('/categories', getCategoryList);

/**
 * @route   GET /api/v1/manager/categories/stats
 * @desc    Get category statistics
 * @access  Manager only
 */
router.get('/categories/stats', getCategoryStats);

/**
 * @route   POST /api/v1/manager/categories
 * @desc    Create new category
 * @access  Manager only
 */
router.post('/categories', createCategory);

/**
 * @route   PUT /api/v1/manager/categories/:id
 * @desc    Update category
 * @access  Manager only
 */
router.put('/categories/:id', updateCategory);

/**
 * @route   POST /api/v1/manager/categories/:id/toggle-visibility
 * @desc    Toggle category visibility for branch
 * @access  Manager only
 */
router.post('/categories/:id/toggle-visibility', toggleCategoryVisibilityForBranch);

/**
 * @route   DELETE /api/v1/manager/categories/:id
 * @desc    Delete category
 * @access  Manager only
 */
router.delete('/categories/:id', deleteCategory);

// ==================== PRODUCT ROUTES ====================

/**
 * @route   GET /api/v1/manager/products
 * @desc    Get product list
 * @access  Manager only
 */
router.get('/products', getProductList);

/**
 * @route   GET /api/v1/manager/products/stats
 * @desc    Get product statistics
 * @access  Manager only
 */
router.get('/products/stats', getProductStats);

/**
 * @route   GET /api/v1/manager/products/:id
 * @desc    Get product by ID
 * @access  Manager only
 */
router.get('/products/:id', getProductById);

/**
 * @route   POST /api/v1/manager/products
 * @desc    Create new product
 * @access  Manager only
 */
router.post('/products', createProduct);

/**
 * @route   PUT /api/v1/manager/products/:id
 * @desc    Update product
 * @access  Manager only
 */
router.put('/products/:id', updateProduct);

/**
 * @route   DELETE /api/v1/manager/products/:id
 * @desc    Delete product
 * @access  Manager only
 */
router.delete('/products/:id', deleteProduct);

// ==================== TEMPLATE ROUTES ====================

/**
 * @route   GET /api/v1/manager/templates
 * @desc    Get template list (System + Branch)
 * @access  Manager only
 */
router.get('/templates', getManagerTemplates);

/**
 * @route   GET /api/v1/manager/templates/stats
 * @desc    Get template statistics
 * @access  Manager only
 */
router.get('/templates/stats', getManagerTemplateStats);

/**
 * @route   GET /api/v1/manager/templates/:id
 * @desc    Get template by ID
 * @access  Manager only
 */
router.get('/templates/:id', getManagerTemplateById);

/**
 * @route   POST /api/v1/manager/templates
 * @desc    Create new template (Branch specific)
 * @access  Manager only
 */
router.post('/templates', createManagerTemplate);

/**
 * @route   PUT /api/v1/manager/templates/:id
 * @desc    Update template (Branch specific only)
 * @access  Manager only
 */
router.put('/templates/:id', updateManagerTemplate);

/**
 * @route   DELETE /api/v1/manager/templates/:id
 * @desc    Delete template (Branch specific only)
 * @access  Manager only
 */
router.delete('/templates/:id', deleteManagerTemplate);

/**
 * @route   POST /api/v1/manager/templates/:id/duplicate
 * @desc    Duplicate template (Creates copy in Branch)
 * @access  Manager only
 */
router.post('/templates/:id/duplicate', duplicateManagerTemplate);

export default router;
