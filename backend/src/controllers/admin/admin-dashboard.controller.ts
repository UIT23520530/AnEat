import { Request, Response } from 'express';
import { AdminDashboardService } from '../../models/admin-dashboard.service';
import ExcelJS from 'exceljs';

/**
 * Get system-wide dashboard statistics
 */
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AdminDashboardService.getSystemStats();

    res.status(200).json({
      success: true,
      code: 200,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get system statistics',
      error: error.message,
    });
  }
};

/**
 * Get branch performance comparison
 */
export const getBranchPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const performance = await AdminDashboardService.getBranchPerformance(
      limit ? parseInt(limit as string) : undefined
    );

    res.status(200).json({
      success: true,
      code: 200,
      data: performance,
    });
  } catch (error: any) {
    console.error('Get branch performance error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get branch performance',
      error: error.message,
    });
  }
};

/**
 * Get top branches by revenue or orders
 */
export const getTopBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { metric = 'revenue', limit = 10 } = req.query;

    if (!['revenue', 'orders'].includes(metric as string)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid metric. Must be one of: revenue, orders',
      });
      return;
    }

    const topBranches = await AdminDashboardService.getTopBranches(
      metric as 'revenue' | 'orders',
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      code: 200,
      data: topBranches,
    });
  } catch (error: any) {
    console.error('Get top branches error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get top branches',
      error: error.message,
    });
  }
};

/**
 * Get system-wide revenue data for charts
 */
export const getSystemRevenueData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, dateFrom, dateTo } = req.query;

    if (!period || !['day', 'week', 'month'].includes(period as string)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid period. Must be one of: day, week, month',
      });
      return;
    }

    const data = await AdminDashboardService.getSystemRevenueData(
      period as 'day' | 'week' | 'month',
      dateFrom as string,
      dateTo as string
    );

    res.status(200).json({
      success: true,
      code: 200,
      data,
    });
  } catch (error: any) {
    console.error('Get system revenue data error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get system revenue data',
      error: error.message,
    });
  }
};

/**
 * Get top selling products system-wide
 */
export const getTopProductsSystemWide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const products = await AdminDashboardService.getTopProductsSystemWide(parseInt(limit as string));

    res.status(200).json({
      success: true,
      code: 200,
      data: products,
    });
  } catch (error: any) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get top products',
      error: error.message,
    });
  }
};

/**
 * Get user statistics by role
 */
export const getUserStatsByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AdminDashboardService.getUserStatsByRole();

    res.status(200).json({
      success: true,
      code: 200,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get user stats by role error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get user statistics',
      error: error.message,
    });
  }
};

/**
 * Get growth metrics (MoM, YoY)
 */
export const getGrowthMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await AdminDashboardService.getGrowthMetrics();

    res.status(200).json({
      success: true,
      code: 200,
      data: metrics,
    });
  } catch (error: any) {
    console.error('Get growth metrics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get growth metrics',
      error: error.message,
    });
  }
};

/**
 * Get system alerts
 */
export const getSystemAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { revenuePercent, minStaff, minStock } = req.query;
    
    const thresholds = {
      revenuePercent: revenuePercent ? Number(revenuePercent) : undefined,
      minStaff: minStaff ? Number(minStaff) : undefined,
      minStock: minStock ? Number(minStock) : undefined,
    };
    
    const alerts = await AdminDashboardService.getSystemAlerts(thresholds);

    res.status(200).json({
      success: true,
      code: 200,
      data: alerts,
    });
  } catch (error: any) {
    console.error('Get system alerts error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get system alerts',
      error: error.message,
    });
  }
};

/**
 * Export system-wide report to Excel
 */
export const exportSystemReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'dateFrom and dateTo are required',
      });
      return;
    }

    const { data, summary } = await AdminDashboardService.getSystemReportData(
      dateFrom as string,
      dateTo as string
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AnEat Admin System';
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Tổng quan');
    summarySheet.columns = [
      { header: 'Chỉ số', key: 'metric', width: 30 },
      { header: 'Giá trị', key: 'value', width: 20 },
    ];

    summarySheet.addRows([
      { metric: 'Khoảng thời gian', value: `${dateFrom} đến ${dateTo}` },
      { metric: 'Tổng số hóa đơn', value: summary.totalBills },
      { metric: 'Tổng doanh thu', value: summary.totalRevenue },
      { metric: 'Tổng lợi nhuận (ước tính)', value: summary.totalProfit },
      { metric: 'Giá trị đơn hàng trung bình', value: summary.averageOrderValue },
      { metric: 'Số chi nhánh có hoạt động', value: summary.branchCount },
    ]);

    // Style summary header
    summarySheet.getRow(1).font = { bold: true, size: 12 };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    summarySheet.getRow(1).font = { ...summarySheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

    // Sheet 2: Branch Summary
    const branchSheet = workbook.addWorksheet('Tổng hợp theo chi nhánh');
    branchSheet.columns = [
      { header: 'Mã chi nhánh', key: 'code', width: 15 },
      { header: 'Tên chi nhánh', key: 'name', width: 30 },
      { header: 'Doanh thu', key: 'revenue', width: 20 },
      { header: 'Số đơn hàng', key: 'orders', width: 15 },
      { header: 'Giá trị TB', key: 'averageOrderValue', width: 20 },
    ];

    branchSheet.addRows(summary.branches);

    // Style branch header
    branchSheet.getRow(1).font = { bold: true, size: 12 };
    branchSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    branchSheet.getRow(1).font = { ...branchSheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

    // Sheet 3: Detailed Bills
    const detailSheet = workbook.addWorksheet('Chi tiết hóa đơn');
    detailSheet.columns = [
      { header: 'Mã CN', key: 'branchCode', width: 10 },
      { header: 'Tên chi nhánh', key: 'branchName', width: 25 },
      { header: 'Số hóa đơn', key: 'billNumber', width: 15 },
      { header: 'Số đơn hàng', key: 'orderNumber', width: 15 },
      { header: 'Ngày', key: 'date', width: 12 },
      { header: 'Giờ', key: 'time', width: 10 },
      { header: 'Khách hàng', key: 'customerName', width: 20 },
      { header: 'SĐT', key: 'customerPhone', width: 15 },
      { header: 'Số món', key: 'items', width: 10 },
      { header: 'Tạm tính', key: 'subtotal', width: 15 },
      { header: 'Thuế', key: 'tax', width: 12 },
      { header: 'Giảm giá', key: 'discount', width: 12 },
      { header: 'Tổng', key: 'total', width: 15 },
      { header: 'Thanh toán', key: 'paymentMethod', width: 15 },
      { header: 'Nhân viên', key: 'staff', width: 20 },
      { header: 'Vai trò', key: 'staffRole', width: 15 },
    ];

    detailSheet.addRows(data);

    // Style detail header
    detailSheet.getRow(1).font = { bold: true, size: 11 };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' },
    };
    detailSheet.getRow(1).font = { ...detailSheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

    // Set response headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=BaoCaoHeThong_${dateFrom}_${dateTo}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Export system report error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to export system report',
      error: error.message,
    });
  }
};
