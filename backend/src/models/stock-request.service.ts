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
  static async cancel(id: string, userId: string) {
    const request = await prisma.stockRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Stock request not found');
    }

    if (request.requestedById !== userId) {
      throw new Error('Only the requester can cancel this request');
    }

    if (request.status !== StockRequestStatus.PENDING) {
      throw new Error('Can only cancel pending requests');
    }

    return prisma.stockRequest.update({
      where: { id },
      data: {
        status: StockRequestStatus.CANCELLED,
      },
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
