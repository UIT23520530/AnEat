import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueData,
  getTopProducts,
  getInventoryAlerts,
  getRecentActivities,
  exportReport,
} from '../controllers/shared/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and ADMIN_BRAND role
router.use(authenticate);
router.use(authorize('ADMIN_BRAND'));

/**
 * GET /api/v1/manager/dashboard/stats
 * Get dashboard statistics (revenue, orders, profit, customers)
 * Query: dateFrom, dateTo (optional)
 */
router.get('/stats', getDashboardStats);

/**
 * GET /api/v1/manager/dashboard/revenue
 * Get revenue data for charts
 * Query: period (day|week|month), dateFrom, dateTo (optional)
 */
router.get('/revenue', getRevenueData);

/**
 * GET /api/v1/manager/dashboard/top-products
 * Get top selling products
 * Query: limit (optional, default 10)
 */
router.get('/top-products', getTopProducts);

/**
 * GET /api/v1/manager/dashboard/inventory-alerts
 * Get inventory alerts (low stock, out of stock)
 */
router.get('/inventory-alerts', getInventoryAlerts);

/**
 * GET /api/v1/manager/dashboard/activities
 * Get recent activities
 * Query: limit (optional, default 10)
 */
router.get('/activities', getRecentActivities);

/**
 * GET /api/v1/manager/dashboard/export
 * Export dashboard report to Excel
 * Query: dateFrom, dateTo (required)
 */
router.get('/export', exportReport);

export default router;
