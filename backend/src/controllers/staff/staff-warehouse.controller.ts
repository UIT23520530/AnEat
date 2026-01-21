import { Request, Response } from 'express';
import { WarehouseService } from '../../models/warehouse.service';

/**
 * Get inventory list with alert detection
 * Level 3: Pagination, search, filter, sorting, standard response
 */
export const getInventoryList = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const categoryId = req.query.categoryId as string | undefined;
    const alertOnly = req.query.alertOnly === 'true';
    const sortField = (req.query.sort as string) || 'name';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
    const branchId = req.user?.branchId;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID không hợp lệ',
        data: null,
      });
    }

    // Call service layer
    const { inventoryItems, total } = await WarehouseService.getInventoryList({
      page,
      limit,
      search,
      categoryId,
      alertOnly,
      branchId,
      sort: sortField,
      order: sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    // Standard response format (API_GUIDELINES Level 3)
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách kho thành công',
      data: inventoryItems,
      meta: {
        current_page: page,
        total_pages: totalPages,
        limit: limit,
        total_items: total,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách kho',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Get inventory statistics
 * Returns total products, low stock count, out of stock count
 */
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    const branchId = req.user?.branchId;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID không hợp lệ',
        data: null,
      });
    }

    const stats = await WarehouseService.getInventoryStats(branchId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thống kê kho thành công',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy thống kê kho',
      data: null,
      errors: error.message,
    });
  }
};
