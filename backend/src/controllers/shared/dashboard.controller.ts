import { Request, Response } from 'express';
import { DashboardService } from '../../models/dashboard.service';
import ExcelJS from 'exceljs';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    const stats = await DashboardService.getStats(
      branchId,
      dateFrom as string,
      dateTo as string
    );

    res.status(200).json({
      success: true,
      code: 200,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get dashboard statistics',
    });
  }
};

export const getRevenueData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, dateFrom, dateTo } = req.query;
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    if (!period || !['day', 'week', 'month'].includes(period as string)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid period. Must be one of: day, week, month',
      });
      return;
    }

    const data = await DashboardService.getRevenueData(
      branchId,
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
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get revenue data',
    });
  }
};

export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    const products = await DashboardService.getTopProducts(
      branchId,
      limit ? parseInt(limit as string) : 10
    );

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
    });
  }
};

export const getInventoryAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    const alerts = await DashboardService.getInventoryAlerts(branchId);

    res.status(200).json({
      success: true,
      code: 200,
      data: alerts,
    });
  } catch (error: any) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get inventory alerts',
    });
  }
};

export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    const activities = await DashboardService.getRecentActivities(
      branchId,
      limit ? parseInt(limit as string) : 10
    );

    res.status(200).json({
      success: true,
      code: 200,
      data: activities,
    });
  } catch (error: any) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to get recent activities',
    });
  }
};

export const exportReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;
    const branchId = (req as any).user.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    if (!dateFrom || !dateTo) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'dateFrom and dateTo are required',
      });
      return;
    }

    const reportData = await DashboardService.getReportData(
      branchId,
      dateFrom as string,
      dateTo as string
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AnEat System';
    workbook.created = new Date();

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Tổng quan');
    
    summarySheet.columns = [
      { header: 'Chỉ số', key: 'metric', width: 30 },
      { header: 'Giá trị', key: 'value', width: 20 },
    ];

    summarySheet.addRows([
      { metric: 'Tổng số hóa đơn', value: reportData.summary.totalBills },
      { metric: 'Tổng doanh thu (VNĐ)', value: reportData.summary.totalRevenue },
      { metric: 'Tổng lợi nhuận (VNĐ)', value: reportData.summary.totalProfit },
      { metric: 'Giá trị đơn hàng TB (VNĐ)', value: Math.round(reportData.summary.averageOrderValue) },
      { metric: 'Từ ngày', value: dateFrom },
      { metric: 'Đến ngày', value: dateTo },
    ]);

    // Style summary sheet
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add details sheet
    const detailsSheet = workbook.addWorksheet('Chi tiết hóa đơn');
    
    detailsSheet.columns = [
      { header: 'Mã HĐ', key: 'billNumber', width: 15 },
      { header: 'Mã đơn', key: 'orderNumber', width: 15 },
      { header: 'Ngày', key: 'date', width: 12 },
      { header: 'Giờ', key: 'time', width: 10 },
      { header: 'Khách hàng', key: 'customerName', width: 20 },
      { header: 'SĐT', key: 'customerPhone', width: 12 },
      { header: 'Số món', key: 'items', width: 10 },
      { header: 'Tạm tính', key: 'subtotal', width: 15 },
      { header: 'Thuế', key: 'tax', width: 12 },
      { header: 'Giảm giá', key: 'discount', width: 12 },
      { header: 'Tổng tiền', key: 'total', width: 15 },
      { header: 'PT thanh toán', key: 'paymentMethod', width: 15 },
      { header: 'Nhân viên', key: 'staff', width: 20 },
    ];

    detailsSheet.addRows(reportData.data);

    // Style details sheet
    detailsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    detailsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Format currency columns
    ['subtotal', 'tax', 'discount', 'total'].forEach((col) => {
      const column = detailsSheet.getColumn(col);
      column.numFmt = '#,##0';
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=BaoCao_DoanhThu_${dateFrom}_${dateTo}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to export report',
    });
  }
};
