import { Request, Response } from 'express';
import { BillService, UpdateBillInput, BillQueryParams } from '../../models/bill.service';
import { BillStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Admin Bill Controller - System-wide bill management
 */

// ==================== HELPER FUNCTIONS ====================

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
 * @route   GET /api/v1/admin/bills
 * @desc    Get all bills (system-wide) with filters
 * @access  Admin only
 */
export const getAllBills = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters
    const params: BillQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sort: req.query.sort as string || '-createdAt',
      status: req.query.status as BillStatus,
      paymentStatus: req.query.paymentStatus as PaymentStatus,
      paymentMethod: req.query.paymentMethod as PaymentMethod,
      search: req.query.search as string,
      branchId: req.query.branchId as string, // Admin can filter by branch
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
    console.error('Get bills error:', error);
    sendError(res, 500, 'Failed to retrieve bills');
  }
};

/**
 * @route   GET /api/v1/admin/bills/:id
 * @desc    Get bill by ID with full details (system-wide access)
 * @access  Admin only
 */
export const getBillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bill = await BillService.getBillById(id);

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
 * @route   GET /api/v1/admin/bills/stats
 * @desc    Get bill statistics (system-wide or by branch)
 * @access  Admin only
 */
export const getBillStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const stats = await BillService.getBillStats(branchId, dateFrom, dateTo);

    sendSuccess(res, 200, 'Bill statistics retrieved successfully', stats);
  } catch (error: any) {
    console.error('Get bill stats error:', error);
    sendError(res, 500, 'Failed to retrieve bill statistics');
  }
};

/**
 * @route   PUT /api/v1/admin/bills/:id
 * @desc    Update bill (admin has full access)
 * @access  Admin only
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
      items,
      discount,
      subtotal,
      tax,
      totalAmount,
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
      items,
      discount,
      subtotal,
      tax,
      totalAmount,
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
 * @route   GET /api/v1/admin/bills/:id/history
 * @desc    Get bill edit history
 * @access  Admin only
 */
export const getBillHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

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
 * @route   POST /api/v1/admin/bills/:id/print
 * @desc    Mark bill as printed (increment print count)
 * @access  Admin only
 */
export const printBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bill = await BillService.printBill(id);

    sendSuccess(res, 200, 'Bill marked as printed', bill);
  } catch (error: any) {
    console.error('Print bill error:', error);
    
    if (error.message === 'Bill not found') {
      sendError(res, 404, error.message);
    } else {
      sendError(res, 500, 'Failed to print bill');
    }
  }
};
