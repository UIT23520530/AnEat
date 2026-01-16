import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getDashboardStats,
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  assignManager,
  getBranchStats,
  getBranchesOverviewStats,
  getAvailableManagers,
} from '../controllers/admin/admin.controller';
import {
  getAllUsers,
  getUserById,
  // createUser, // Removed - Admin cannot create users directly
  updateUser,
  deleteUser,
  getUsersStats,
} from '../controllers/admin/user.controller';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from '../controllers/admin/category.controller';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} from '../controllers/admin/product.controller';
import { authenticate, isAdmin, validate } from '../middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Trang tổng quan hệ thống
 * @access  Admin only
 */
router.get('/dashboard', getDashboardStats);

/**
 * ==================== QUẢN LÝ CHI NHÁNH ====================
 */

/**
 * @route   GET /api/v1/admin/branches
 * @desc    Lấy danh sách tất cả chi nhánh (hỗ trợ phân trang, tìm kiếm, sắp xếp)
 * @access  Admin only
 */
router.get('/branches', getAllBranches);

/**
 * @route   GET /api/v1/admin/branches/overview-stats
 * @desc    Lấy thống kê tổng quan tất cả chi nhánh
 * @access  Admin only
 */
router.get('/branches/overview-stats', getBranchesOverviewStats);

/**
 * @route   GET /api/v1/admin/branches/available-managers
 * @desc    Lấy danh sách quản lý có thể gán (không quản lý chi nhánh nào)
 * @access  Admin only
 */
router.get('/branches/available-managers', getAvailableManagers);

/**
 * @route   GET /api/v1/admin/branches/:id
 * @desc    Lấy thông tin chi tiết một chi nhánh
 * @access  Admin only
 */
router.get(
  '/branches/:id',
  param('id').notEmpty().withMessage('ID chi nhánh không được bỏ trống'),
  validate,
  getBranchById
);

/**
 * @route   POST /api/v1/admin/branches
 * @desc    Tạo mới chi nhánh
 * @access  Admin only
 */
router.post(
  '/branches',
  [
    body('name').notEmpty().withMessage('Tên chi nhánh là bắt buộc'),
    body('address').notEmpty().withMessage('Địa chỉ là bắt buộc'),
    body('phone').notEmpty().withMessage('Số điện thoại là bắt buộc'),
    body('email').notEmpty().isEmail().withMessage('Email là bắt buộc và phải hợp lệ'),
  ],
  validate,
  createBranch
);

/**
 * @route   PUT /api/v1/admin/branches/:id
 * @desc    Cập nhật thông tin chi nhánh
 * @access  Admin only
 */
router.put(
  '/branches/:id',
  param('id').notEmpty().withMessage('ID chi nhánh không được bỏ trống'),
  validate,
  updateBranch
);

/**
 * @route   DELETE /api/v1/admin/branches/:id
 * @desc    Xóa chi nhánh
 * @access  Admin only
 */
router.delete(
  '/branches/:id',
  param('id').notEmpty().withMessage('ID chi nhánh không được bỏ trống'),
  validate,
  deleteBranch
);

/**
 * @route   PUT /api/v1/admin/branches/:id/assign-manager
 * @desc    Gán quản lý cho chi nhánh
 * @access  Admin only
 */
router.put(
  '/branches/:id/assign-manager',
  param('id').notEmpty().withMessage('ID chi nhánh không được bỏ trống'),
  validate,
  assignManager
);

/**
 * @route   GET /api/v1/admin/branches/:id/stats
 * @desc    Lấy thống kê chi nhánh (nhân viên, sản phẩm, đơn hàng, doanh thu)
 * @access  Admin only
 */
router.get(
  '/branches/:id/stats',
  param('id').notEmpty().withMessage('ID chi nhánh không được bỏ trống'),
  validate,
  getBranchStats
);

/**
 * ==================== QUẢN LÝ NGƯỜI DÙNG ====================
 */

/**
 * @route   GET /api/v1/admin/users
 * @desc    Lấy danh sách tất cả người dùng (hỗ trợ phân trang, tìm kiếm, lọc theo role/isActive)
 * @access  Admin only
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/v1/admin/users/stats
 * @desc    Lấy thống kê người dùng
 * @access  Admin only
 */
router.get('/users/stats', getUsersStats);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Lấy thông tin chi tiết một người dùng
 * @access  Admin only
 */
router.get(
  '/users/:id',
  param('id').notEmpty().withMessage('ID người dùng không được bỏ trống'),
  validate,
  getUserById
);

// POST /users route removed - Admin cannot create users directly
// Users can only register themselves or be created through other means

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Cập nhật thông tin người dùng (chỉ role, status, branch assignment)
 * @access  Admin only
 */
router.put(
  '/users/:id',
  param('id').notEmpty().withMessage('ID người dùng không được bỏ trống'),
  validate,
  updateUser
);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Xóa người dùng (soft delete)
 * @access  Admin only
 */
router.delete(
  '/users/:id',
  param('id').notEmpty().withMessage('ID người dùng không được bỏ trống'),
  validate,
  deleteUser
);

/**
 * ==================== QUẢN LÝ DANH MỤC ====================
 */

/**
 * @route   GET /api/v1/admin/categories
 * @desc    Lấy danh sách tất cả danh mục (hỗ trợ phân trang, tìm kiếm, lọc)
 * @access  Admin only
 */
router.get('/categories', getAllCategories);

/**
 * @route   GET /api/v1/admin/categories/stats
 * @desc    Lấy thống kê danh mục
 * @access  Admin only
 */
router.get('/categories/stats', getCategoryStats);

/**
 * @route   GET /api/v1/admin/categories/:id
 * @desc    Lấy thông tin chi tiết một danh mục
 * @access  Admin only
 */
router.get(
  '/categories/:id',
  param('id').notEmpty().withMessage('ID danh mục không được bỏ trống'),
  validate,
  getCategoryById
);

/**
 * @route   POST /api/v1/admin/categories
 * @desc    Tạo mới danh mục
 * @access  Admin only
 */
router.post(
  '/categories',
  [
    body('name').notEmpty().withMessage('Tên danh mục là bắt buộc'),
    body('displayOrder').optional().isInt({ min: 0 }).withMessage('Thứ tự hiển thị phải là số nguyên không âm'),
    body('isActive').optional().isBoolean().withMessage('Trạng thái phải là boolean'),
  ],
  validate,
  createCategory
);

/**
 * @route   PUT /api/v1/admin/categories/:id
 * @desc    Cập nhật thông tin danh mục
 * @access  Admin only
 */
router.put(
  '/categories/:id',
  param('id').notEmpty().withMessage('ID danh mục không được bỏ trống'),
  validate,
  updateCategory
);

/**
 * @route   DELETE /api/v1/admin/categories/:id
 * @desc    Xóa danh mục (soft delete)
 * @access  Admin only
 */
router.delete(
  '/categories/:id',
  param('id').notEmpty().withMessage('ID danh mục không được bỏ trống'),
  validate,
  deleteCategory
);

/**
 * ==================== QUẢN LÝ SẢN PHẨM ====================
 */

/**
 * @route   GET /api/v1/admin/products
 * @desc    Lấy danh sách tất cả sản phẩm (hỗ trợ phân trang, tìm kiếm, lọc)
 * @access  Admin only
 */
router.get('/products', getAllProducts);

/**
 * @route   GET /api/v1/admin/products/stats
 * @desc    Lấy thống kê sản phẩm
 * @access  Admin only
 */
router.get('/products/stats', getProductStats);

/**
 * @route   GET /api/v1/admin/products/:id
 * @desc    Lấy thông tin chi tiết một sản phẩm
 * @access  Admin only
 */
router.get(
  '/products/:id',
  param('id').notEmpty().withMessage('ID sản phẩm không được bỏ trống'),
  validate,
  getProductById
);

/**
 * @route   POST /api/v1/admin/products
 * @desc    Tạo mới sản phẩm
 * @access  Admin only
 */
router.post(
  '/products',
  [
    body('name').notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
    body('price').isFloat({ min: 0 }).withMessage('Giá sản phẩm phải là số không âm'),
    body('categoryId').notEmpty().withMessage('Danh mục là bắt buộc'),
    body('isAvailable').optional().isBoolean().withMessage('Trạng thái phải là boolean'),
  ],
  validate,
  createProduct
);

/**
 * @route   PUT /api/v1/admin/products/:id
 * @desc    Cập nhật thông tin sản phẩm
 * @access  Admin only
 */
router.put(
  '/products/:id',
  param('id').notEmpty().withMessage('ID sản phẩm không được bỏ trống'),
  validate,
  updateProduct
);

/**
 * @route   DELETE /api/v1/admin/products/:id
 * @desc    Xóa sản phẩm (soft delete)
 * @access  Admin only
 */
router.delete(
  '/products/:id',
  param('id').notEmpty().withMessage('ID sản phẩm không được bỏ trống'),
  validate,
  deleteProduct
);

export default router;
