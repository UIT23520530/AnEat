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
    // NOTE: Inventory is NOT updated here. It will be updated when shipment status changes to DELIVERED
    // This ensures proper flow: APPROVED → ASSIGNED → IN_TRANSIT → DELIVERED (inventory update)
    const updatedRequest = await StockRequestService.update(id, {
      status: StockRequestStatus.COMPLETED,
      completedDate: new Date(),
    });

    console.log(`[Stock Request ${existingRequest.requestNumber}] Assigned to logistics. Shipment ${shipment.shipmentNumber} created. Inventory will be updated upon delivery.`);

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
/**
 * Get all logistics staff
 */
export const getLogisticsStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    const whereClause: any = {
      role: 'LOGISTICS_STAFF',
      deletedAt: null,
    };

    // Filter by availability if date is provided
    if (date) {
      const checkDate = new Date(date as string);
      // Assume a delivery takes 2 hours (1 hour before and 1 hour after)
      const startWindow = new Date(checkDate.getTime() - 2 * 60 * 60 * 1000);
      const endWindow = new Date(checkDate.getTime() + 2 * 60 * 60 * 1000);

      const busyShipments = await prisma.shipment.findMany({
        where: {
          assignedToId: { not: null },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'DELIVERED'] }, // Filter out finished tasks
          stockRequest: {
            expectedDate: {
              gte: startWindow,
              lte: endWindow,
            },
          },
        },
        select: {
          assignedToId: true,
        },
      });

      const busyStaffIds = busyShipments
        .map((s) => s.assignedToId)
        .filter((id): id is string => id !== null);

      if (busyStaffIds.length > 0) {
        whereClause.id = { notIn: busyStaffIds };
      }
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

    // Update status to CANCELLED and store who cancelled it + reason
    const request = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: StockRequestStatus.CANCELLED,
        approvedById: req.user.id, // Store the admin who cancelled
        rejectedReason: cancelReason || 'Đã hủy bởi admin', // Store cancellation reason
      },
      include: {
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            image: true,
          },
        },
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
          },
        },
      },
    });

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

/**
 * Create quick shipment (Admin pushes stock to branch)
 */
export const createQuickShipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, items, logisticsStaffId, notes, deliveryDate } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized',
      });
      return;
    }

    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch and at least one item are required',
      });
      return;
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    const createdShipments: any[] = [];

    // Process each item
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) continue;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) continue;

      // 1. Create StockRequest (Auto Approved)
      // Generate request number
      const today = new Date();
      const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
      const count = await prisma.stockRequest.count();
      const requestNumber: string = `REQ${dateStr}${String(count + 1 + createdShipments.length).padStart(4, '0')}`;

      const stockRequest = await prisma.stockRequest.create({
        data: {
          requestNumber,
          type: 'RESTOCK',
          status: StockRequestStatus.COMPLETED, // Since we are shipping immediately
          requestedQuantity: quantity,
          approvedQuantity: quantity,
          notes: notes || 'Quick shipment created by Admin',
          requestedDate: new Date(),
          expectedDate: deliveryDate ? new Date(deliveryDate) : undefined,
          productId: productId,
          branchId: branchId,
          requestedById: req.user.id, // Admin is requester
          approvedById: req.user.id,  // Admin is approver
          completedDate: new Date(),
        },
      });

      // 2. Create Shipment if logistics staff is selected
      if (logisticsStaffId) {
        const shipment = await prisma.shipment.create({
          data: {
            shipmentNumber: await generateShipmentNumber(),
            status: 'READY',
            priority: false,
            productName: product.name,
            quantity: quantity,
            fromLocation: 'Kho Trung Tâm',
            toLocation: branch.name,
            branchCode: branch.code,
            notes: notes ? `${notes} (Delivery: ${deliveryDate || 'N/A'})` : `Delivery: ${deliveryDate || 'N/A'}`,
            assignedAt: new Date(),
            branchId: branchId,
            assignedToId: logisticsStaffId,
            stockRequestId: stockRequest.id,
          },
          include: {
            assignedTo: true,
          },
        });
        createdShipments.push(shipment);
      }
    }

    res.status(201).json({
      success: true,
      code: 201,
      message: `Created ${createdShipments.length} shipments successfully`,
      data: createdShipments,
    });
  } catch (error) {
    console.error('Create quick shipment error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create quick shipment',
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

  // Add random component to avoid collision in loop if needed, but sequential await should handle it
  // Just to be safe in loop
  // Actually in loop await generateShipmentNumber() might get same number if transaction not committed?
  // Prisma operations are awaited sequentially in the loop, so it should be fine.

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}
