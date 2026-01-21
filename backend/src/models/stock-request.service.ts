import { prisma } from '../db';
import { Prisma, StockRequestStatus, StockRequestType } from '@prisma/client';

interface StockRequestQueryParams {
  page: number;
  limit: number;
  status?: StockRequestStatus;
  type?: StockRequestType;
  productId?: string;
  branchId?: string;
  search?: string;
}

interface CreateStockRequestData {
  type: StockRequestType;
  requestedQuantity: number;
  notes?: string;
  expectedDate?: Date;
  productId: string;
  branchId: string;
  requestedById: string;
}

interface UpdateStockRequestData {
  approvedQuantity?: number;
  status?: StockRequestStatus;
  rejectedReason?: string;
  completedDate?: Date;
  approvedById?: string;
}

export class StockRequestService {
  // Tạo request number tự động
  static async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const prefix = `SR${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastRequest = await prisma.stockRequest.findFirst({
      where: {
        requestNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        requestNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.requestNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  // Get all stock requests
  static async findAll(params: StockRequestQueryParams) {
    const { page, limit, status, type, productId, branchId, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (productId) {
      where.productId = productId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.stockRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              image: true,
              quantity: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.stockRequest.count({ where }),
    ]);

    return { requests, total };
  }

  // Get request by ID
  static async findById(id: string) {
    return prisma.stockRequest.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            image: true,
            quantity: true,
            costPrice: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shipments: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  // Create stock request
  static async create(data: CreateStockRequestData) {
    const requestNumber = await this.generateRequestNumber();

    return prisma.stockRequest.create({
      data: {
        ...data,
        requestNumber,
        requestedDate: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            image: true,
            quantity: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Update stock request (approve, reject, cancel)
  static async update(id: string, data: UpdateStockRequestData) {
    return prisma.stockRequest.update({
      where: { id },
      data,
      include: {
        product: true,
        branch: true,
        requestedBy: true,
        approvedBy: true,
      },
    });
  }

  // Cancel request
  static async cancel(id: string, userId: string, branchId?: string, reason?: string) {
    const request = await prisma.stockRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Stock request not found');
    }

    // Permission check: Branch level
    if (branchId && request.branchId !== branchId) {
      throw new Error('Bạn không có quyền hủy yêu cầu của chi nhánh khác');
    }

    if (request.status !== StockRequestStatus.PENDING && request.status !== StockRequestStatus.APPROVED) {
      throw new Error('Chỉ có thể hủy yêu cầu đang chờ hoặc đã duyệt');
    }

    // Update status to CANCELLED and store who cancelled it + reason
    return prisma.stockRequest.update({
      where: { id },
      data: {
        status: StockRequestStatus.CANCELLED,
        approvedById: userId, // Store the user who cancelled (reuse approvedById field)
        rejectedReason: reason || 'Đã hủy bởi quản lý', // Store cancellation reason
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
  }

  // Edit request (while not completed/rejected/cancelled)
  static async edit(id: string, userId: string, branchId: string, data: Partial<CreateStockRequestData>) {
    const request = await prisma.stockRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Không tìm thấy yêu cầu nhập kho');
    }

    // Security check: Must be in the same branch
    if (request.branchId !== branchId) {
      throw new Error('Bạn không có quyền chỉnh sửa yêu cầu của chi nhánh khác');
    }

    // Status check: Only allow editing if not completed, rejected, or cancelled
    if (
      request.status === StockRequestStatus.COMPLETED ||
      request.status === StockRequestStatus.REJECTED ||
      request.status === StockRequestStatus.CANCELLED
    ) {
      throw new Error(`Không thể chỉnh sửa yêu cầu đã ${request.status === StockRequestStatus.COMPLETED ? 'hoàn thành' : 'bị từ chối hoặc hủy'}`);
    }

    const updateData: any = {
      productId: data.productId,
      type: data.type,
      requestedQuantity: data.requestedQuantity,
      notes: data.notes,
      expectedDate: data.expectedDate,
    };

    // If an APPROVED request is edited, reset it to PENDING for re-approval
    if (request.status === StockRequestStatus.APPROVED) {
      updateData.status = StockRequestStatus.PENDING;
      updateData.approvedById = null;
      updateData.approvedQuantity = null;
    }

    return prisma.stockRequest.update({
      where: { id },
      data: updateData,
    });
  }

  // Get statistics
  static async getStatistics(branchId?: string) {
    const where: Prisma.StockRequestWhereInput = branchId ? { branchId } : {};

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      rejectedRequests,
      cancelledRequests,
    ] = await Promise.all([
      prisma.stockRequest.count({ where }),
      prisma.stockRequest.count({ where: { ...where, status: StockRequestStatus.PENDING } }),
      prisma.stockRequest.count({ where: { ...where, status: StockRequestStatus.APPROVED } }),
      prisma.stockRequest.count({ where: { ...where, status: StockRequestStatus.COMPLETED } }),
      prisma.stockRequest.count({ where: { ...where, status: StockRequestStatus.REJECTED } }),
      prisma.stockRequest.count({ where: { ...where, status: StockRequestStatus.CANCELLED } }),
    ]);

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      rejectedRequests,
      cancelledRequests,
    };
  }
}
