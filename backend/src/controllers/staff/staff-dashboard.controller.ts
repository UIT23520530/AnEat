import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../models/dashboard.service';

/**
 * @desc    Get dashboard statistics for staff
 * @route   GET /api/v1/staff/dashboard/stats
 * @access  Staff only
 */
export const getStaffDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    const { dateFrom, dateTo } = req.query;

    const stats = await DashboardService.getStats(
      staffBranchId,
      dateFrom as string,
      dateTo as string
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thống kê dashboard thành công',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get revenue chart data for staff branch
 * @route   GET /api/v1/staff/dashboard/revenue-chart
 * @access  Staff only
 */
export const getStaffRevenueChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    const { dateFrom, dateTo, groupBy } = req.query;

    const revenueData = await DashboardService.getRevenueData(
      staffBranchId,
      (groupBy as 'day' | 'week' | 'month') || 'day',
      dateFrom as string,
      dateTo as string
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy dữ liệu biểu đồ doanh thu thành công',
      data: revenueData,
      meta: {
        total_records: revenueData.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top selling products for staff branch
 * @route   GET /api/v1/staff/dashboard/top-products
 * @access  Staff only
 */
export const getStaffTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    // Parse query params with defaults
    const limit = parseInt(req.query.limit as string) || 10;

    const topProducts = await DashboardService.getTopProducts(
      staffBranchId,
      limit
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách sản phẩm bán chạy thành công',
      data: topProducts,
      meta: {
        total_records: topProducts.length,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory alerts for staff branch
 * @route   GET /api/v1/staff/dashboard/inventory-alerts
 * @access  Staff only
 */
export const getStaffInventoryAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    const inventoryAlerts = await DashboardService.getInventoryAlerts(staffBranchId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy cảnh báo tồn kho thành công',
      data: inventoryAlerts,
      meta: {
        total_alerts: inventoryAlerts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent orders for staff branch
 * @route   GET /api/v1/staff/dashboard/recent-orders
 * @access  Staff only
 */
export const getStaffRecentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    // Parse pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await DashboardService.getRecentOrders(
      staffBranchId,
      page,
      limit,
      status
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách đơn hàng gần đây thành công',
      data: result.orders,
      meta: {
        current_page: page,
        limit,
        total_items: result.total,
        total_pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order statistics by status for staff branch
 * @route   GET /api/v1/staff/dashboard/order-status-stats
 * @access  Staff only
 */
export const getStaffOrderStatusStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffBranchId = (req as any).user?.branchId;
    
    if (!staffBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Staff không thuộc chi nhánh nào',
        data: null,
      });
      return;
    }

    const { dateFrom, dateTo } = req.query;

    const statusStats = await DashboardService.getOrderStatusStats(
      staffBranchId,
      dateFrom as string,
      dateTo as string
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thống kê trạng thái đơn hàng thành công',
      data: statusStats,
    });
  } catch (error) {
    next(error);
  }
};
