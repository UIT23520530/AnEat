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
  getSystemStats,
  getBranchPerformance,
  getTopBranches,
  getSystemRevenueData,
  getTopProductsSystemWide,
  getUserStatsByRole,
  getGrowthMetrics,
  getSystemAlerts,
  exportSystemReport,
} from '../controllers/admin/admin-dashboard.controller';
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
import {
  getAllCustomers as getAdminCustomers,
  getCustomerById as getAdminCustomerById,
  getCustomerStatistics as getAdminCustomerStatistics,
  updateCustomer as updateAdminCustomer,
  adjustCustomerPoints as adjustAdminCustomerPoints,
  updateCustomerTier as updateAdminCustomerTier,
  getCustomerOrders as getAdminCustomerOrders,
  searchCustomers as searchAdminCustomers,
  createCustomer as createAdminCustomer,
  getCustomerStats as getAdminCustomerStats,
  deleteCustomer as deleteAdminCustomer,
} from '../controllers/admin/customer.controller';
import {
  getAllBills as getAdminBills,
  getBillById as getAdminBillById,
  getBillStats as getAdminBillStats,
  updateBill as updateAdminBill,
  printBill as printAdminBill,
  getBillHistory as getAdminBillHistory,
} from '../controllers/admin/bill.controller';
import { authenticate, isAdmin, validate } from '../middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Trang tổng quan hệ thống (legacy - simple stats)
 * @access  Admin only
 */
router.get('/dashboard', getDashboardStats);

/**
 * ==================== ADMIN DASHBOARD ROUTES (NEW) ====================
 */

/**
 * @route   GET /api/v1/admin/dashboard/system-stats
 * @desc    Lấy thống kê toàn hệ thống (revenue, orders, branches, users, customers, products)
 * @access  Admin only
 */
router.get('/dashboard/system-stats', getSystemStats);

/**
 * @route   GET /api/v1/admin/dashboard/branch-performance
 * @desc    Lấy so sánh hiệu suất giữa các chi nhánh
 * @access  Admin only
 * @query   limit - Giới hạn số lượng chi nhánh (optional)
 */
router.get('/dashboard/branch-performance', getBranchPerformance);

/**
 * @route   GET /api/v1/admin/dashboard/top-branches
 * @desc    Lấy danh sách top chi nhánh theo doanh thu hoặc đơn hàng
 * @access  Admin only
 * @query   metric - 'revenue' hoặc 'orders' (default: revenue)
 * @query   limit - Số lượng top branches (default: 10)
 */
router.get('/dashboard/top-branches', getTopBranches);

/**
 * @route   GET /api/v1/admin/dashboard/revenue-data
 * @desc    Lấy dữ liệu doanh thu toàn hệ thống theo thời gian
 * @access  Admin only
 * @query   period - 'day', 'week', hoặc 'month'
 * @query   dateFrom - Ngày bắt đầu (optional)
 * @query   dateTo - Ngày kết thúc (optional)
 */
router.get('/dashboard/revenue-data', getSystemRevenueData);

/**
 * @route   GET /api/v1/admin/dashboard/top-products
 * @desc    Lấy top sản phẩm bán chạy nhất toàn hệ thống
 * @access  Admin only
 * @query   limit - Số lượng sản phẩm (default: 10)
 */
router.get('/dashboard/top-products', getTopProductsSystemWide);

/**
 * @route   GET /api/v1/admin/dashboard/user-stats
 * @desc    Lấy thống kê người dùng theo role
 * @access  Admin only
 */
router.get('/dashboard/user-stats', getUserStatsByRole);

/**
 * @route   GET /api/v1/admin/dashboard/growth-metrics
 * @desc    Lấy các chỉ số tăng trưởng (MoM, YoY)
 * @access  Admin only
 */
router.get('/dashboard/growth-metrics', getGrowthMetrics);

/**
 * @route   GET /api/v1/admin/dashboard/alerts
 * @desc    Lấy các cảnh báo hệ thống (chi nhánh có vấn đề)
 * @access  Admin only
 */
router.get('/dashboard/alerts', getSystemAlerts);

/**
 * @route   GET /api/v1/admin/dashboard/export
 * @desc    Xuất báo cáo toàn hệ thống ra file Excel
 * @access  Admin only
 * @query   dateFrom - Ngày bắt đầu (required)
 * @query   dateTo - Ngày kết thúc (required)
 */
router.get('/dashboard/export', exportSystemReport);

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

/**
 * ==================== QUẢN LÝ KHÁCH HÀNG ====================
 */

/**
 * @route   GET /api/v1/admin/customers
 * @desc    Lấy danh sách tất cả khách hàng (hỗ trợ phân trang, tìm kiếm, lọc theo tier/branch)
 * @access  Admin only
 */
router.get('/customers', getAdminCustomers);

/**
 * @route   GET /api/v1/admin/customers/statistics
 * @desc    Lấy thống kê khách hàng (toàn hệ thống hoặc theo chi nhánh)
 * @access  Admin only
 */
router.get('/customers/statistics', getAdminCustomerStatistics);

/**
 * @route   GET /api/v1/admin/customers/stats
 * @desc    Lấy thống kê khách hàng chi tiết
 * @access  Admin only
 */
router.get('/customers/stats', getAdminCustomerStats);

/**
 * @route   GET /api/v1/admin/customers/search
 * @desc    Tìm kiếm khách hàng
 * @access  Admin only
 */
router.get(
  '/customers/search',
  [body('q').notEmpty().withMessage('Search query is required'), validate],
  searchAdminCustomers
);

/**
 * @route   GET /api/v1/admin/customers/:id
 * @desc    Lấy thông tin chi tiết một khách hàng
 * @access  Admin only
 */
router.get(
  '/customers/:id',
  param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
  validate,
  getAdminCustomerById
);

/**
 * @route   POST /api/v1/admin/customers
 * @desc    Tạo mới khách hàng
 * @access  Admin only
 */
router.post(
  '/customers',
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
  createAdminCustomer
);

/**
 * @route   PATCH /api/v1/admin/customers/:id
 * @desc    Cập nhật thông tin khách hàng
 * @access  Admin only
 */
router.patch(
  '/customers/:id',
  [
    param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
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
  updateAdminCustomer
);

/**
 * @route   POST /api/v1/admin/customers/:id/adjust-points
 * @desc    Điều chỉnh điểm tích lũy khách hàng
 * @access  Admin only
 */
router.post(
  '/customers/:id/adjust-points',
  [
    param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
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
  adjustAdminCustomerPoints
);

/**
 * @route   PATCH /api/v1/admin/customers/:id/tier
 * @desc    Cập nhật hạng thành viên khách hàng
 * @access  Admin only
 */
router.patch(
  '/customers/:id/tier',
  [
    param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
    body('tier')
      .notEmpty()
      .withMessage('Tier is required')
      .isIn(['BRONZE', 'SILVER', 'GOLD', 'VIP'])
      .withMessage('Invalid tier value'),
    body('reason').optional().trim(),
    validate,
  ],
  updateAdminCustomerTier
);

/**
 * @route   GET /api/v1/admin/customers/:id/orders
 * @desc    Lấy lịch sử đơn hàng của khách hàng
 * @access  Admin only
 */
router.get(
  '/customers/:id/orders',
  param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
  validate,
  getAdminCustomerOrders
);

/**
 * @route   DELETE /api/v1/admin/customers/:id
 * @desc    Xóa khách hàng
 * @access  Admin only
 */
router.delete(
  '/customers/:id',
  param('id').notEmpty().withMessage('ID khách hàng không được bỏ trống'),
  validate,
  deleteAdminCustomer
);

// ==================== BILL MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/v1/admin/bills/stats
 * @desc    Lấy thống kê hóa đơn (system-wide hoặc theo chi nhánh)
 * @access  Admin only
 */
router.get('/bills/stats', getAdminBillStats);

/**
 * @route   GET /api/v1/admin/bills
 * @desc    Lấy danh sách tất cả hóa đơn (system-wide)
 * @access  Admin only
 */
router.get('/bills', getAdminBills);

/**
 * @route   GET /api/v1/admin/bills/:id
 * @desc    Lấy chi tiết hóa đơn
 * @access  Admin only
 */
router.get(
  '/bills/:id',
  param('id').notEmpty().withMessage('ID hóa đơn không được bỏ trống'),
  validate,
  getAdminBillById
);

/**
 * @route   PUT /api/v1/admin/bills/:id
 * @desc    Cập nhật hóa đơn
 * @access  Admin only
 */
router.put(
  '/bills/:id',
  param('id').notEmpty().withMessage('ID hóa đơn không được bỏ trống'),
  body('editReason').notEmpty().withMessage('Lý do chỉnh sửa là bắt buộc'),
  validate,
  updateAdminBill
);

/**
 * @route   GET /api/v1/admin/bills/:id/history
 * @desc    Lấy lịch sử chỉnh sửa hóa đơn
 * @access  Admin only
 */
router.get(
  '/bills/:id/history',
  param('id').notEmpty().withMessage('ID hóa đơn không được bỏ trống'),
  validate,
  getAdminBillHistory
);

/**
 * @route   POST /api/v1/admin/bills/:id/print
 * @desc    Đánh dấu hóa đơn đã in
 * @access  Admin only
 */
router.post(
  '/bills/:id/print',
  param('id').notEmpty().withMessage('ID hóa đơn không được bỏ trống'),
  validate,
  printAdminBill
);

// ==================== TEMPLATE ROUTES ====================

import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  getDefaultTemplate,
  getTemplateStats,
} from '../controllers/admin/template.controller';

/**
 * @route   GET /api/v1/admin/templates/stats
 * @desc    Lấy thống kê templates
 * @access  Admin only
 */
router.get('/templates/stats', getTemplateStats);

/**
 * @route   GET /api/v1/admin/templates
 * @desc    Lấy danh sách tất cả templates
 * @access  Admin only
 */
router.get('/templates', getAllTemplates);

/**
 * @route   GET /api/v1/admin/templates/default/:category
 * @desc    Lấy template mặc định theo category
 * @access  Admin only
 */
router.get('/templates/default/:category', getDefaultTemplate);

/**
 * @route   GET /api/v1/admin/templates/:id
 * @desc    Lấy chi tiết template
 * @access  Admin only
 */
router.get('/templates/:id', getTemplateById);

/**
 * @route   POST /api/v1/admin/templates
 * @desc    Tạo template mới
 * @access  Admin only
 */
router.post('/templates', createTemplate);

/**
 * @route   PUT /api/v1/admin/templates/:id
 * @desc    Cập nhật template
 * @access  Admin only
 */
router.put('/templates/:id', updateTemplate);

/**
 * @route   DELETE /api/v1/admin/templates/:id
 * @desc    Xóa template
 * @access  Admin only
 */
router.delete('/templates/:id', deleteTemplate);

/**
 * @route   POST /api/v1/admin/templates/:id/duplicate
 * @desc    Sao chép template
 * @access  Admin only
 */
router.post('/templates/:id/duplicate', duplicateTemplate);

export default router;
