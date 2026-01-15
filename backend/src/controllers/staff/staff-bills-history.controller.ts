import { Request, Response } from 'express';
import { BillService } from '../../models/bill.service';
import { BillStatus } from '@prisma/client';

/**
 * Get all bills with pagination, search, filtering
 * Level 3: Pagination, search, sorting, filtering
 */
export const getAllBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const status = req.query.status as BillStatus | undefined;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
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

    // Call service layer
    const { bills, total } = await BillService.findAll({
      page,
      limit,
      search,
      status,
      branchId,
      sort: sortField,
      order: sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách hóa đơn thành công',
      data: bills,
      meta: {
        current_page: page,
        total_pages: totalPages,
        limit,
        total_items: total,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách hóa đơn',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Get bill by ID with full details and history
 */
export const getBillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId ?? undefined;

    const bill = await BillService.findById(id, branchId);

    if (!bill) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy hóa đơn',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thông tin hóa đơn thành công',
      data: bill,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy thông tin hóa đơn',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Get bill history (all versions)
 */
export const getBillHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId ?? undefined;

    // Check if bill exists and belongs to staff's branch
    const bill = await BillService.findById(id, branchId);
    if (!bill) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy hóa đơn',
        data: null,
      });
      return;
    }

    const histories = await BillService.getBillHistory(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy lịch sử hóa đơn thành công',
      data: histories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy lịch sử hóa đơn',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Update bill when there is a complaint
 * Level 3: Transaction, saves history before update
 */
export const updateBillForComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      editReason,
      subtotal,
      taxAmount,
      discountAmount,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      internalNotes,
    } = req.body;

    const userId = req.user?.id;
    const branchId = req.user?.branchId ?? undefined;

    if (!userId) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Không tìm thấy thông tin người dùng',
        data: null,
      });
      return;
    }

    // Check if bill exists and belongs to staff's branch
    const existingBill = await BillService.findById(id, branchId);
    if (!existingBill) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy hóa đơn',
        data: null,
      });
      return;
    }

    // Update bill via service (with transaction and history tracking)
    const updatedBill = await BillService.updateWithHistory(id, {
      editReason,
      subtotal,
      taxAmount,
      discountAmount,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      internalNotes,
      editedById: userId,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật hóa đơn thành công',
      data: updatedBill,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật hóa đơn',
      data: null,
      errors: error.message,
    });
  }
};
