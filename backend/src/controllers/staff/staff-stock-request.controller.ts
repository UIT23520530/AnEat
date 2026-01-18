import { Request, Response } from 'express';
import { StockRequestService } from '../../models/stock-request.service';
import { StockRequestType } from '@prisma/client';

/**
 * Get staff's branch stock requests
 * Staff can only see requests from their branch
 */
export const getStaffStockRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      productId,
      search,
    } = req.query;

    const branchId = req.user?.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID không hợp lệ',
        data: null,
      });
      return;
    }

    const params = {
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      productId: productId as string | undefined,
      branchId,
      search: search as string | undefined,
    };

    const { requests, total } = await StockRequestService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách yêu cầu thành công',
      data: requests,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get staff stock requests error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách yêu cầu',
    });
  }
};

/**
 * Get stock request by ID (staff's branch only)
 */
export const getStaffStockRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID không hợp lệ',
        data: null,
      });
      return;
    }

    const request = await StockRequestService.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy yêu cầu',
      });
      return;
    }

    // Check if request belongs to staff's branch
    if (request.branchId !== branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền xem yêu cầu này',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy chi tiết yêu cầu thành công',
      data: request,
    });
  } catch (error) {
    console.error('Get stock request by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy chi tiết yêu cầu',
    });
  }
};

/**
 * Create new stock request (staff)
 */
export const createStaffStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, type, requestedQuantity, notes, expectedDate } = req.body;
    const requestedById = req.user?.id;
    const branchId = req.user?.branchId;

    if (!requestedById || !branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Thông tin người dùng không hợp lệ',
        data: null,
      });
      return;
    }

    const newRequest = await StockRequestService.create({
      productId,
      branchId,
      requestedById,
      type: type || StockRequestType.RESTOCK,
      requestedQuantity,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Tạo yêu cầu thành công',
      data: newRequest,
    });
  } catch (error: any) {
    console.error('Create stock request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi tạo yêu cầu',
      errors: error.message,
    });
  }
};

/**
 * Cancel stock request (staff can only cancel their own pending requests)
 */
export const cancelStaffStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!userId || !branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Thông tin người dùng không hợp lệ',
        data: null,
      });
      return;
    }

    const request = await StockRequestService.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy yêu cầu',
      });
      return;
    }

    // Check if request belongs to staff's branch
    if (request.branchId !== branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền hủy yêu cầu này',
      });
      return;
    }

    // Check if request is in pending or approved status
    if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Chỉ có thể hủy yêu cầu đang chờ duyệt hoặc đã duyệt',
      });
      return;
    }

    const updatedRequest = await StockRequestService.cancel(id, userId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Hủy yêu cầu thành công',
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Cancel stock request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi hủy yêu cầu',
      errors: error.message,
    });
  }
};

/**
 * Get staff's branch stock request statistics
 */
export const getStaffStockRequestStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID không hợp lệ',
        data: null,
      });
      return;
    }

    const statistics = await StockRequestService.getStatistics(branchId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thống kê yêu cầu thành công',
      data: statistics,
    });
  } catch (error) {
    console.error('Get staff stock request stats error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy thống kê yêu cầu',
    });
  }
};

/**
 * Update stock request (staff can only edit their own pending requests)
 */
export const updateStaffStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, type, requestedQuantity, notes, expectedDate } = req.body;
    const userId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!userId || !branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Thông tin người dùng không hợp lệ',
        data: null,
      });
      return;
    }

    const updatedRequest = await StockRequestService.edit(id, userId, branchId, {
      productId,
      type,
      requestedQuantity,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật yêu cầu thành công',
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Update stock request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message || 'Lỗi khi cập nhật yêu cầu',
    });
  }
};
