import { momoPosPayment } from '../controllers/staff/staff.controller';
import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAssignedOrders,
  updateOrderStatus,
} from '../controllers/staff/staff.controller';
import {
  getStaffDashboardStats,
  getStaffRevenueChart,
  getStaffTopProducts,
  getStaffInventoryAlerts,
  getStaffRecentOrders,
  getStaffOrderStatusStats,
} from '../controllers/staff/staff-dashboard.controller';
import {
  getOrderCategories,
  getAllOrderCategories,
  getOrderCategoryById,
} from '../controllers/staff/staff-order.controller';
import {
  getOrderProducts,
  getOrderProductDetail,
  getProductsByCategory,
} from '../controllers/staff/staff-product.controller';
import {
  searchAll,
  quickSearch,
} from '../controllers/staff/staff-search.controller';
import {
  getAllCustomers,
  searchCustomerByPhone,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/staff/staff-customer.controller';
import {
  getAllBills,
  getBillById,
  getBillHistory,
  updateBillForComplaint,
} from '../controllers/staff/staff-bills-history.controller';
import {
  getInventoryList,
  getInventoryStats,
} from '../controllers/staff/staff-warehouse.controller';
import {
  getStaffStockRequests,
  getStaffStockRequestById,
  createStaffStockRequest,
  cancelStaffStockRequest,
} from '../controllers/staff/staff-stock-request.controller';
import {
  createStaffOrder,
  getStaffOrderById,
  getStaffOrders,
  updateStaffOrderPaymentStatus,
  cancelStaffOrder,
  validatePromotionCode,
} from '../controllers/staff/staff-order-management.controller';
import { authenticate, isStaff, validate } from '../middleware';

const router = Router();

// MoMo POS cho staff (không cần đăng nhập)
router.post('/payment-pos', momoPosPayment);

// All routes require staff authentication
router.use(authenticate);
router.use(isStaff);

// ==================== DASHBOARD ROUTES ====================

/**
 * @route   GET /api/v1/staff/dashboard/stats
 * @desc    Get dashboard statistics (revenue, orders, profit, customers)
 * @query   dateFrom (optional) - Start date for filtering (ISO 8601)
 * @query   dateTo (optional) - End date for filtering (ISO 8601)
 * @access  Staff only
 */
router.get('/dashboard/stats', getStaffDashboardStats);

/**
 * @route   GET /api/v1/staff/dashboard/revenue-chart
 * @desc    Get revenue chart data grouped by day/week/month
 * @query   dateFrom (optional) - Start date (ISO 8601)
 * @query   dateTo (optional) - End date (ISO 8601)
 * @query   groupBy (optional) - 'day' | 'week' | 'month' (default: 'day')
 * @access  Staff only
 */
router.get('/dashboard/revenue-chart', getStaffRevenueChart);

/**
 * @route   GET /api/v1/staff/dashboard/top-products
 * @desc    Get top selling products
 * @query   limit (optional) - Number of products to return (default: 10)
 * @query   dateFrom (optional) - Start date (ISO 8601)
 * @query   dateTo (optional) - End date (ISO 8601)
 * @access  Staff only
 */
router.get('/dashboard/top-products', getStaffTopProducts);

/**
 * @route   GET /api/v1/staff/dashboard/inventory-alerts
 * @desc    Get inventory alerts for low/out of stock products
 * @access  Staff only
 */
router.get('/dashboard/inventory-alerts', getStaffInventoryAlerts);

/**
 * @route   GET /api/v1/staff/dashboard/recent-orders
 * @desc    Get recent orders with pagination
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 10)
 * @query   status (optional) - Filter by order status
 * @access  Staff only
 */
router.get('/dashboard/recent-orders', getStaffRecentOrders);

/**
 * @route   GET /api/v1/staff/dashboard/order-status-stats
 * @desc    Get order statistics grouped by status
 * @query   dateFrom (optional) - Start date (ISO 8601)
 * @query   dateTo (optional) - End date (ISO 8601)
 * @access  Staff only
 */
router.get('/dashboard/order-status-stats', getStaffOrderStatusStats);

// ==================== ORDER PAGE ROUTES ====================

/**
 * @route   GET /api/v1/staff/order/categories/all
 * @desc    Get all active categories (no pagination, for quick access)
 * @access  Staff only
 * @note    MUST be defined BEFORE /:id route to avoid conflict
 */
router.get('/order/categories/all', getAllOrderCategories);

/**
 * @route   GET /api/v1/staff/order/categories
 * @desc    Get all active categories for order page (with pagination)
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 50)
 * @query   search (optional) - Search by name or code
 * @query   sort (optional) - Sort field (default: 'name')
 * @query   order (optional) - Sort order: 'asc' | 'desc' (default: 'asc')
 * @access  Staff only
 */
router.get('/order/categories', getOrderCategories);

/**
 * @route   GET /api/v1/staff/order/categories/:id
 * @desc    Get category by ID
 * @access  Staff only
 * @note    MUST be defined AFTER /all route to avoid conflict
 */
router.get(
  '/order/categories/:id',
  [param('id').isString().notEmpty().withMessage('Category ID is required')],
  validate,
  getOrderCategoryById
);

/**
 * @route   GET /api/v1/staff/order/products
 * @desc    Get all available products for order page (with pagination)
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 20, max: 100)
 * @query   search (optional) - Search by name, code, or description
 * @query   categoryId (optional) - Filter by category ID
 * @query   sort (optional) - Sort field: name, price, prepTime (default: 'name')
 * @query   order (optional) - Sort order: 'asc' | 'desc' (default: 'asc')
 * @access  Staff only
 */
router.get('/order/products', getOrderProducts);

/**
 * @route   GET /api/v1/staff/order/products/category/:categoryId
 * @desc    Get products by category (quick filter)
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 20)
 * @query   search (optional) - Search products in this category
 * @access  Staff only
 * @note    MUST be defined BEFORE /:id route to avoid conflict
 */
router.get('/order/products/category/:categoryId', getProductsByCategory);

/**
 * @route   GET /api/v1/staff/order/products/:id
 * @desc    Get product detail with options (upsize, types, sauces)
 * @access  Staff only
 */
router.get(
  '/order/products/:id',
  [param('id').isString().notEmpty().withMessage('Product ID is required')],
  validate,
  getOrderProductDetail
);

/**
 * @route   GET /api/v1/staff/order/search
 * @desc    Unified search across categories and products
 * @query   q (required) - Search keyword
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 20, max: 100)
 * @access  Staff only
 */
router.get('/order/search', searchAll);

/**
 * @route   GET /api/v1/staff/order/search/quick
 * @desc    Quick search for autocomplete (max 5 categories + 10 products)
 * @query   q (required) - Search keyword
 * @access  Staff only
 */
router.get('/order/search/quick', quickSearch);

// ==================== CUSTOMER MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/v1/staff/order/customers
 * @desc    Get all customers with pagination, search, and filtering
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 20)
 * @query   search (optional) - Search by name, phone, or email
 * @query   tier (optional) - Filter by tier (MEMBER, VIP, DIAMOND)
 * @query   sort (optional) - Sort field (default: createdAt)
 * @query   order (optional) - Sort order: asc or desc (default: desc)
 * @access  Staff only
 */
router.get('/order/customers', getAllCustomers);

/**
 * @route   GET /api/v1/staff/order/customers/search
 * @desc    Search customer by phone number (quick lookup)
 * @query   phone (required) - Phone number to search
 * @access  Staff only
 */
router.get('/order/customers/search', searchCustomerByPhone);

/**
 * @route   GET /api/v1/staff/order/customers/:id
 * @desc    Get customer detail by ID
 * @access  Staff only
 */
router.get(
  '/order/customers/:id',
  [param('id').isString().notEmpty().withMessage('Customer ID is required')],
  validate,
  getCustomerById
);

/**
 * @route   POST /api/v1/staff/order/customers
 * @desc    Create new customer
 * @body    { phone, name, email?, avatar? }
 * @access  Staff only
 */
router.post(
  '/order/customers',
  [
    body('phone')
      .isString()
      .notEmpty()
      .withMessage('Số điện thoại là bắt buộc')
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ (10-11 chữ số)'),
    body('name')
      .isString()
      .notEmpty()
      .withMessage('Tên khách hàng là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email không hợp lệ'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar phải là URL hợp lệ'),
  ],
  validate,
  createCustomer
);

/**
 * @route   PUT /api/v1/staff/order/customers/:id
 * @desc    Update customer information (name, email, avatar)
 * @body    { name?, email?, avatar? }
 * @access  Staff only
 */
router.put(
  '/order/customers/:id',
  [
    param('id').isString().notEmpty().withMessage('Customer ID is required'),
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email không hợp lệ'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar phải là URL hợp lệ'),
  ],
  validate,
  updateCustomer
);

/**
 * @route   DELETE /api/v1/staff/order/customers/:id
 * @desc    Delete customer (only if no orders exist)
 * @access  Staff only
 */
router.delete(
  '/order/customers/:id',
  [
    param('id').isString().notEmpty().withMessage('Customer ID is required'),
  ],
  validate,
  deleteCustomer
);

// ==================== BILLS HISTORY ROUTES ====================

/**
 * @route   GET /api/v1/staff/bills-history
 * @desc    Get all bills with pagination, search, and filtering
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Items per page (default: 20)
 * @query   search (optional) - Search by bill number, customer name, phone
 * @query   status (optional) - Filter by status (DRAFT, ISSUED, PAID, CANCELLED, REFUNDED)
 * @query   sort (optional) - Sort field (default: createdAt)
 * @query   order (optional) - Sort order: asc or desc (default: desc)
 * @access  Staff only
 */
router.get('/bills-history', getAllBills);

/**
 * @route   GET /api/v1/staff/bills-history/:id
 * @desc    Get bill detail by ID with history
 * @access  Staff only
 */
router.get(
  '/bills-history/:id',
  [param('id').isString().notEmpty().withMessage('Bill ID is required')],
  validate,
  getBillById
);

/**
 * @route   GET /api/v1/staff/bills-history/:id/history
 * @desc    Get all edit history of a bill
 * @access  Staff only
 */
router.get(
  '/bills-history/:id/history',
  [param('id').isString().notEmpty().withMessage('Bill ID is required')],
  validate,
  getBillHistory
);

/**
 * @route   PUT /api/v1/staff/bills-history/:id/complaint
 * @desc    Update bill when there is a complaint (saves old version to history)
 * @body    { editReason, subtotal?, taxAmount?, discountAmount?, customerName?, customerPhone?, customerEmail?, customerAddress?, notes?, internalNotes? }
 * @access  Staff only
 */
router.put(
  '/bills-history/:id/complaint',
  [
    param('id').isString().notEmpty().withMessage('Bill ID is required'),
    body('editReason')
      .isString()
      .notEmpty()
      .withMessage('Lý do chỉnh sửa là bắt buộc')
      .isLength({ min: 10, max: 500 })
      .withMessage('Lý do chỉnh sửa phải từ 10-500 ký tự'),
    body('subtotal')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Subtotal phải là số nguyên dương'),
    body('taxAmount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Tax amount phải là số nguyên dương'),
    body('discountAmount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Discount amount phải là số nguyên dương'),
    body('customerName')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Tên khách hàng tối đa 100 ký tự'),
    body('customerPhone')
      .optional()
      .isString()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ'),
    body('customerEmail')
      .optional()
      .isEmail()
      .withMessage('Email không hợp lệ'),
  ],
  validate,
  updateBillForComplaint
);

// ==================== WAREHOUSE/INVENTORY ROUTES ====================
/**
 * @route   GET /api/v1/staff/warehouse
 * @desc    Get inventory list with alert detection
 * @access  Staff only
 * @features Pagination, search (name, code), filter (category, alert), sorting
 */
router.get('/warehouse', getInventoryList);

/**
 * @route   GET /api/v1/staff/warehouse/stats
 * @desc    Get inventory statistics
 * @access  Staff only
 */
router.get('/warehouse/stats', getInventoryStats);

// ==================== ORDER MANAGEMENT ROUTES ====================

/**
 * @route   POST /api/v1/staff/orders/create
 * @desc    Create new order from Staff POS
 * @body    { items, customerId?, promotionCode?, paymentMethod, notes?, orderType?, deliveryAddress? }
 * @access  Staff only
 */
router.post(
  '/orders/create',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Đơn hàng phải có ít nhất một sản phẩm'),
    body('items.*.productId')
      .isString()
      .notEmpty()
      .withMessage('Product ID là bắt buộc'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Số lượng phải >= 1'),
    body('items.*.price')
      .isInt({ min: 0 })
      .withMessage('Giá phải >= 0'),
    body('paymentMethod')
      .isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'E_WALLET'])
      .withMessage('Phương thức thanh toán không hợp lệ'),
    body('customerId').optional().isString(),
    body('promotionCode').optional().isString(),
    body('notes').optional().isString(),
    body('orderType').optional().isIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
    body('deliveryAddress').optional().isString(),
  ],
  validate,
  createStaffOrder
);

/**
 * @route   POST /api/v1/staff/orders/validate-promotion
 * @desc    Validate promotion code
 * @body    { code, subtotal? }
 * @access  Staff only
 */
router.post(
  '/orders/validate-promotion',
  [
    body('code').isString().notEmpty().withMessage('Mã giảm giá là bắt buộc'),
    body('subtotal').optional().isInt({ min: 0 }),
  ],
  validate,
  validatePromotionCode
);

/**
 * @route   GET /api/v1/staff/orders/list
 * @desc    Get list of orders for staff's branch
 * @query   page, limit, status, search, dateFrom, dateTo
 * @access  Staff only
 */
router.get('/orders/list', getStaffOrders);

/**
 * @route   GET /api/v1/staff/orders/:orderId
 * @desc    Get order detail by ID
 * @access  Staff only
 */
router.get(
  '/orders/:orderId',
  [param('orderId').isString().notEmpty().withMessage('Order ID is required')],
  validate,
  getStaffOrderById
);

/**
 * @route   PUT /api/v1/staff/orders/:orderId/payment-status
 * @desc    Update payment status
 * @body    { paymentStatus }
 * @access  Staff only
 */
router.put(
  '/orders/:orderId/payment-status',
  [
    param('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('paymentStatus')
      .isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
      .withMessage('Trạng thái thanh toán không hợp lệ'),
  ],
  validate,
  updateStaffOrderPaymentStatus
);

/**
 * @route   POST /api/v1/staff/orders/:orderId/cancel
 * @desc    Cancel order (restore stock)
 * @access  Staff only
 */
router.post(
  '/orders/:orderId/cancel',
  [param('orderId').isString().notEmpty().withMessage('Order ID is required')],
  validate,
  cancelStaffOrder
);

/**
 * @route   GET /api/v1/staff/orders
 * @desc    Get assigned orders (legacy)
 * @access  Staff only
 */
router.get('/orders', getAssignedOrders);

/**
 * @route   PUT /api/v1/staff/orders/:orderId
 * @desc    Update order status
 * @access  Staff only
 */
router.put(
  '/orders/:orderId',
  [
    body('status')
      .isIn(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid order status'),
  ],
  validate,
  updateOrderStatus
);

// ==================== STOCK REQUEST ROUTES ====================

/**
 * @route   GET /api/v1/staff/stock-requests
 * @desc    Get stock requests for staff's branch
 * @access  Staff only
 */
router.get('/stock-requests', getStaffStockRequests);

/**
 * @route   GET /api/v1/staff/stock-requests/:id
 * @desc    Get stock request by ID
 * @access  Staff only
 */
router.get('/stock-requests/:id', getStaffStockRequestById);

/**
 * @route   POST /api/v1/staff/stock-requests
 * @desc    Create new stock request
 * @access  Staff only
 */
router.post(
  '/stock-requests',
  [
    body('type').optional().isString().isIn(['RESTOCK', 'ADJUSTMENT', 'RETURN']),
    body('requestedQuantity')
      .isInt({ min: 1 })
      .withMessage('Requested quantity must be at least 1'),
    body('notes').optional().isString(),
    body('expectedDate').optional().isISO8601(),
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
  ],
  validate,
  createStaffStockRequest
);

/**
 * @route   PUT /api/v1/staff/stock-requests/:id/cancel
 * @desc    Cancel stock request
 * @access  Staff only
 */
router.put('/stock-requests/:id/cancel', cancelStaffStockRequest);

export default router;
