import { Request, Response } from 'express';
import { StockRequestService } from '../../models/stock-request.service';
import { StockRequestStatus, StockRequestType } from '@prisma/client';

/**
 * Get stock request list
 */
export const getStockRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      productId,
      search,
    } = req.query;

    // Branch filtering for ADMIN_BRAND
    let branchId: string | undefined;
    if (req.user && req.user.role === 'ADMIN_BRAND' && req.user.branchId) {
      branchId = req.user.branchId;
    }

    const params = {
      page: Number(page),
      limit: Number(limit),
      status: status as StockRequestStatus | undefined,
      productId: productId as string | undefined,
      branchId,
      search: search as string | undefined,
    };

    const { requests, total } = await StockRequestService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Stock requests retrieved successfully',
      data: requests,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get stock requests error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch stock requests',
    });
  }
};

/**
 * Get stock request by ID
 */
export const getStockRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await StockRequestService.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Stock request not found',
      });
      return;
    }

    // Check branch permission for ADMIN_BRAND
    if (req.user && req.user.role === 'ADMIN_BRAND' && request.branchId !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You do not have permission to access this stock request',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Stock request retrieved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Get stock request by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch stock request',
    });
  }
};

/**
 * Create stock request
 */
export const createStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      type,
      requestedQuantity,
      notes,
      expectedDate,
      productId,
    } = req.body;

    // Auto-assign branchId from user for branch-related roles
    let branchId = req.body.branchId || req.user?.branchId;

    if (!branchId) {
      console.warn('[StockRequest] Create failed: Missing branchId. User:', req.user?.id, 'Role:', req.user?.role);
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    if (!productId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Product ID is required',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    const request = await StockRequestService.create({
      type: type || StockRequestType.RESTOCK,
      requestedQuantity,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      productId,
      branchId,
      requestedById: req.user.id,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Stock request created successfully',
      data: request,
    });
  } catch (error) {
    console.error('Create stock request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create stock request',
    });
  }
};

/**
 * Cancel stock request
 */
export const cancelStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Get cancellation reason from request body

    const request = await StockRequestService.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Stock request not found',
      });
      return;
    }

    // Check permissions
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    // Check branch permission
    if (request.branchId !== req.user.branchId && req.user.role !== 'ADMIN_SYSTEM') {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You do not have permission to cancel this request',
      });
      return;
    }

    // Pass user ID and reason to service
    const updatedRequest = await StockRequestService.cancel(
      id, 
      req.user.id, 
      req.user.branchId || undefined,
      reason // Pass the cancellation reason
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Stock request cancelled successfully',
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Cancel stock request error:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      code: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Failed to cancel stock request',
    });
  }
};

/**
 * Update stock request
 */
export const updateStockRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, type, requestedQuantity, notes, expectedDate } = req.body;
    const userId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!userId || !branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid user information',
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
      message: 'Stock request updated successfully',
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Update stock request error:', error);
    res.status(400).json({
      success: false,
      code: 400,
      message: error.message || 'Failed to update stock request',
    });
  }
};

/**
 * Get stock statistics
 */
export const getStockStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    let branchId: string | undefined;
    if (req.user && req.user.role === 'ADMIN_BRAND') {
      branchId = req.user.branchId || undefined;
    }

    const statistics = await StockRequestService.getStatistics(branchId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Stock statistics retrieved successfully',
      data: statistics,
    });
  } catch (error) {
    console.error('Get stock statistics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch stock statistics',
    });
  }
};
