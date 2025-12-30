import { Request, Response } from 'express';
import { BillService, CreateBillInput, UpdateBillInput, BillQueryParams } from '../models/bill.service';
import { BillStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Bill Controller - Handle bill management requests
 * Following API_GUIDELINES.md Level 3 standards
 * - Standard response wrapper
 * - Proper error handling
 * - Data validation
 * - DTO mapping (no raw entity exposure)
 */

// ==================== HELPER FUNCTIONS ====================

/**
 * Send standard success response
 */
const sendSuccess = (
  res: Response,
  code: number,
  message: string,
  data?: any,
  meta?: any
) => {
  res.status(code).json({
    success: true,
    code,
    message,
    data: data || null,
    ...(meta && { meta }),
    errors: null,
  });
};

/**
 * Send standard error response
 */
const sendError = (
  res: Response,
  code: number,
  message: string,
  errors?: any
) => {
  res.status(code).json({
    success: false,
    code,
    message,
    data: null,
    errors: errors || null,
  });
};

// ==================== CONTROLLER METHODS ====================

/**
 * @route   POST /api/v1/manager/bills
 * @desc    Create a new bill from an order
 * @access  Manager/Staff
 */
export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      subtotal,
      taxAmount,
      discountAmount,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod,
      paymentStatus,
      paidAmount,
      notes,
      internalNotes,
    } = req.body;

    // Validation
    if (!orderId || !subtotal) {
      sendError(res, 400, 'Order ID and subtotal are required');
      return;
    }

    if (!req.user?.id) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    if (!req.user?.branchId) {
      sendError(res, 400, 'User is not assigned to any branch');
      return;
    }

    const input: CreateBillInput = {
      orderId,
      subtotal,
      taxAmount,
      discountAmount,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: paymentStatus as PaymentStatus,
      paidAmount,
      notes,
      internalNotes,
      issuedById: req.user.id,
      branchId: req.user.branchId,
    };

    const bill = await BillService.createBill(input);

    sendSuccess(res, 201, 'Bill created successfully', bill);
  } catch (error: any) {
    console.error('Create bill error:', error);
    
    if (error.message === 'Order not found') {
      sendError(res, 404, error.message);
    } else if (error.message === 'Bill already exists for this order') {
      sendError(res, 409, error.message);
    } else {
      sendError(res, 500, 'Failed to create bill');
    }
  }
};

/**
 * @route   GET /api/v1/manager/bills
 * @desc    Get bill list with filters, pagination, and sorting
 * @access  Manager/Staff
 */
export const getBillList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      sendError(res, 400, 'User is not assigned to any branch');
      return;
    }

    // Parse query parameters
    const params: BillQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sort: req.query.sort as string,
      status: req.query.status as BillStatus,
      paymentStatus: req.query.paymentStatus as PaymentStatus,
      search: req.query.search as string,
      branchId: req.user.branchId, // Filter by user's branch
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
    };

    const result = await BillService.getBillList(params);

    sendSuccess(
      res,
      200,
      'Bills retrieved successfully',
      result.data,
      result.meta
    );
  } catch (error: any) {
    console.error('Get bill list error:', error);
    sendError(res, 500, 'Failed to retrieve bills');
  }
};

/**
 * @route   GET /api/v1/manager/bills/:id
 * @desc    Get bill by ID with full details
 * @access  Manager/Staff
 */
export const getBillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bill = await BillService.getBillById(id);

    // Check if bill belongs to user's branch
    if (bill.branch?.id !== req.user?.branchId && req.user?.role !== 'ADMIN_SYSTEM') {
      sendError(res, 403, 'Access denied to this bill');
      return;
    }

    sendSuccess(res, 200, 'Bill retrieved successfully', bill);
  } catch (error: any) {
    console.error('Get bill error:', error);
    
    if (error.message === 'Bill not found') {
      sendError(res, 404, error.message);
    } else {
      sendError(res, 500, 'Failed to retrieve bill');
    }
  }
};

/**
 * @route   PUT /api/v1/manager/bills/:id
 * @desc    Update bill (creates history log)
 * @access  Manager/Staff
 */
export const updateBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      status,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod,
      paymentStatus,
      paidAmount,
      notes,
      internalNotes,
      editReason,
    } = req.body;

    // Validation
    if (!editReason || editReason.trim().length === 0) {
      sendError(res, 400, 'Edit reason is required for audit trail');
      return;
    }

    if (!req.user?.id) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    // Verify bill belongs to user's branch
    const existingBill = await BillService.getBillById(id);
    if (existingBill.branch?.id !== req.user?.branchId && req.user?.role !== 'ADMIN_SYSTEM') {
      sendError(res, 403, 'Access denied to this bill');
      return;
    }

    const input: UpdateBillInput = {
      status: status as BillStatus,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: paymentStatus as PaymentStatus,
      paidAmount,
      notes,
      internalNotes,
      editReason,
      editedById: req.user.id,
    };

    const bill = await BillService.updateBill(id, input);

    sendSuccess(res, 200, 'Bill updated successfully', bill);
  } catch (error: any) {
    console.error('Update bill error:', error);
    
    if (error.message === 'Bill not found') {
      sendError(res, 404, error.message);
    } else {
      sendError(res, 500, 'Failed to update bill');
    }
  }
};

/**
 * @route   GET /api/v1/manager/bills/:id/history
 * @desc    Get bill edit history
 * @access  Manager/Staff
 */
export const getBillHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify bill exists and belongs to user's branch
    const bill = await BillService.getBillById(id);
    if (bill.branch?.id !== req.user?.branchId && req.user?.role !== 'ADMIN_SYSTEM') {
      sendError(res, 403, 'Access denied to this bill');
      return;
    }

    const history = await BillService.getBillHistory(id);

    sendSuccess(res, 200, 'Bill history retrieved successfully', history);
  } catch (error: any) {
    console.error('Get bill history error:', error);
    
    if (error.message === 'Bill not found') {
      sendError(res, 404, error.message);
    } else {
      sendError(res, 500, 'Failed to retrieve bill history');
    }
  }
};

/**
 * @route   POST /api/v1/manager/bills/:id/print
 * @desc    Mark bill as printed and return print data
 * @access  Manager/Staff
 */
export const printBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify bill exists and belongs to user's branch
    const bill = await BillService.getBillById(id);
    if (bill.branch?.id !== req.user?.branchId && req.user?.role !== 'ADMIN_SYSTEM') {
      sendError(res, 403, 'Access denied to this bill');
      return;
    }

    // Mark as printed
    const updatedBill = await BillService.markAsPrinted(id);

    sendSuccess(res, 200, 'Bill marked as printed', {
      bill: updatedBill,
      printMessage: 'Bill data ready for printing. If printer is not connected, printing will fail.',
    });
  } catch (error: any) {
    console.error('Print bill error:', error);
    
    if (error.message === 'Bill not found') {
      sendError(res, 404, error.message);
    } else {
      sendError(res, 500, 'Failed to process print request');
    }
  }
};

/**
 * @route   GET /api/v1/manager/bills/stats
 * @desc    Get bill statistics for manager's branch
 * @access  Manager
 */
export const getBillStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      sendError(res, 400, 'User is not assigned to any branch');
      return;
    }

    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const stats = await BillService.getBranchBillStats(
      req.user.branchId,
      dateFrom,
      dateTo
    );

    sendSuccess(res, 200, 'Bill statistics retrieved successfully', stats);
  } catch (error: any) {
    console.error('Get bill stats error:', error);
    sendError(res, 500, 'Failed to retrieve bill statistics');
  }
};

/**
 * @route   POST /api/v1/manager/bills/batch-create
 * @desc    Batch create bills for multiple completed orders
 * @access  Manager/Staff
 */
export const batchCreateBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      sendError(res, 400, 'Order IDs array is required');
      return;
    }

    if (!req.user?.id || !req.user?.branchId) {
      sendError(res, 401, 'Unauthorized or no branch assigned');
      return;
    }

    // Process each order
    const results = {
      success: [] as any[],
      failed: [] as any[],
    };

    for (const orderId of orderIds) {
      try {
        // This is simplified - you may want to fetch order details first
        const input: CreateBillInput = {
          orderId,
          subtotal: 0, // Should be fetched from order
          issuedById: req.user.id,
          branchId: req.user.branchId,
        };

        const bill = await BillService.createBill(input);
        results.success.push({ orderId, billId: bill.id });
      } catch (error: any) {
        results.failed.push({ orderId, error: error.message });
      }
    }

    sendSuccess(res, 200, 'Batch bill creation completed', results);
  } catch (error: any) {
    console.error('Batch create bills error:', error);
    sendError(res, 500, 'Failed to batch create bills');
  }
};
