import { Request, Response } from 'express';
import { StockRequestService } from '../../models/stock-request.service';
import { StockRequestStatus } from '@prisma/client';
import { prisma } from '../../db';

/**
 * Get all warehouse/stock requests for admin
 */
export const getWarehouseRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      branchId,
      productId,
      search,
    } = req.query;

    const params = {
      page: Number(page),
      limit: Number(limit),
      status: status as StockRequestStatus | undefined,
      type: type as any,
      branchId: branchId as string | undefined,
      productId: productId as string | undefined,
      search: search as string | undefined,
    };

    const { requests, total } = await StockRequestService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse requests retrieved successfully',
      data: requests,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get warehouse requests error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch warehouse requests',
    });
  }
};

/**
 * Get warehouse request by ID
 */
export const getWarehouseRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await StockRequestService.findById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Warehouse request not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse request retrieved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Get warehouse request by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch warehouse request',
    });
  }
};

/**
 * Approve warehouse request
 */
export const approveWarehouseRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvedQuantity, notes } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    // Check if request exists and is pending
    const existingRequest = await StockRequestService.findById(id);
    if (!existingRequest) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Warehouse request not found',
      });
      return;
    }

    if (existingRequest.status !== StockRequestStatus.PENDING) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Only pending requests can be approved',
      });
      return;
    }

    const request = await StockRequestService.update(id, {
      status: StockRequestStatus.APPROVED,
      approvedQuantity: approvedQuantity || existingRequest.requestedQuantity,
      approvedById: req.user.id,
    });

    // Optional: Update notes if provided
    if (notes) {
      await prisma.stockRequest.update({
        where: { id },
        data: { notes: `${existingRequest.notes || ''}\n[Admin approved] ${notes}`.trim() },
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse request approved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Approve warehouse request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to approve warehouse request',
    });
  }
};

/**
 * Reject warehouse request
 */
export const rejectWarehouseRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectedReason } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    if (!rejectedReason || rejectedReason.trim() === '') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Rejected reason is required',
      });
      return;
    }

    // Check if request exists and is pending
    const existingRequest = await StockRequestService.findById(id);
    if (!existingRequest) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Warehouse request not found',
      });
      return;
    }

    if (existingRequest.status !== StockRequestStatus.PENDING) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Only pending requests can be rejected',
      });
      return;
    }

    const request = await StockRequestService.update(id, {
      status: StockRequestStatus.REJECTED,
      rejectedReason,
      approvedById: req.user.id,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse request rejected successfully',
      data: request,
    });
  } catch (error) {
    console.error('Reject warehouse request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to reject warehouse request',
    });
  }
};

/**
 * Assign warehouse request to logistics staff
 */
export const assignToLogistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { logisticsStaffId, notes } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    if (!logisticsStaffId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Logistics staff ID is required',
      });
      return;
    }

    // Check if request exists and is approved
    const existingRequest = await StockRequestService.findById(id);
    if (!existingRequest) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Warehouse request not found',
      });
      return;
    }

    if (existingRequest.status !== StockRequestStatus.APPROVED) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Only approved requests can be assigned to logistics',
      });
      return;
    }

    // Check if logistics staff exists
    const logisticsStaff = await prisma.user.findUnique({
      where: { id: logisticsStaffId },
    });

    if (!logisticsStaff || logisticsStaff.role !== 'LOGISTICS_STAFF') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid logistics staff',
      });
      return;
    }

    // Create shipment for logistics
    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber: await generateShipmentNumber(),
        status: 'READY',
        priority: false,
        productName: existingRequest.product.name,
        quantity: existingRequest.approvedQuantity || existingRequest.requestedQuantity,
        fromLocation: 'Kho Trung Tâm',
        toLocation: existingRequest.branch.name,
        branchCode: existingRequest.branch.code,
        notes: notes || `Warehouse request: ${existingRequest.requestNumber}`,
        assignedAt: new Date(),
        branchId: existingRequest.branchId,
        assignedToId: logisticsStaffId,
        stockRequestId: existingRequest.id,
      },
      include: {
        branch: true,
        assignedTo: true,
        stockRequest: true,
      },
    });

    // Update stock request status to COMPLETED
    const updatedRequest = await StockRequestService.update(id, {
      status: StockRequestStatus.COMPLETED,
      completedDate: new Date(),
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Warehouse request assigned to logistics successfully',
      data: {
        request: updatedRequest,
        shipment,
      },
    });
  } catch (error) {
    console.error('Assign to logistics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to assign to logistics',
    });
  }
};

/**
 * Get warehouse statistics for admin
 */
export const getWarehouseStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query;

    const whereClause: any = {};
    if (branchId) {
      whereClause.branchId = branchId as string;
    }

    const stats = await prisma.stockRequest.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    const statistics = {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      completedRequests: 0,
      rejectedRequests: 0,
      cancelledRequests: 0,
    };

    stats.forEach((stat) => {
      statistics.totalRequests += stat._count;
      
      switch (stat.status) {
        case StockRequestStatus.PENDING:
          statistics.pendingRequests = stat._count;
          break;
        case StockRequestStatus.APPROVED:
          statistics.approvedRequests = stat._count;
          break;
        case StockRequestStatus.COMPLETED:
          statistics.completedRequests = stat._count;
          break;
        case StockRequestStatus.REJECTED:
          statistics.rejectedRequests = stat._count;
          break;
        case StockRequestStatus.CANCELLED:
          statistics.cancelledRequests = stat._count;
          break;
      }
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse statistics retrieved successfully',
      data: statistics,
    });
  } catch (error) {
    console.error('Get warehouse statistics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch warehouse statistics',
    });
  }
};

/**
 * Get all logistics staff
 */
export const getLogisticsStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query;

    const whereClause: any = {
      role: 'LOGISTICS_STAFF',
      deletedAt: null,
    };

    // Filter by branchId if provided
    if (branchId) {
      whereClause.branchId = branchId as string;
    }

    const logisticsStaff = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Logistics staff retrieved successfully',
      data: logisticsStaff,
    });
  } catch (error) {
    console.error('Get logistics staff error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch logistics staff',
    });
  }
};

/**
 * Cancel warehouse request (Admin can cancel any request)
 */
export const cancelWarehouseRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    // Check if request exists
    const existingRequest = await StockRequestService.findById(id);
    if (!existingRequest) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Warehouse request not found',
      });
      return;
    }

    // Admin can cancel PENDING or APPROVED requests
    if (existingRequest.status !== StockRequestStatus.PENDING && 
        existingRequest.status !== StockRequestStatus.APPROVED) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Only pending or approved requests can be cancelled',
      });
      return;
    }

    const request = await StockRequestService.update(id, {
      status: StockRequestStatus.CANCELLED,
    });

    // Add cancel reason to notes if provided
    if (cancelReason) {
      await prisma.stockRequest.update({
        where: { id },
        data: { 
          notes: `${existingRequest.notes || ''}\n[Admin cancelled] ${cancelReason}`.trim() 
        },
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Warehouse request cancelled successfully',
      data: request,
    });
  } catch (error) {
    console.error('Cancel warehouse request error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to cancel warehouse request',
    });
  }
};

// Helper function to generate shipment number
async function generateShipmentNumber(): Promise<string> {
  const today = new Date();
  const prefix = `SH${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const lastShipment = await prisma.shipment.findFirst({
    where: {
      shipmentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      shipmentNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastShipment) {
    const lastSequence = parseInt(lastShipment.shipmentNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}
