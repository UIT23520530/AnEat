import { PrismaClient, ShipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface ShipmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  assignedToId?: string;
  branchId?: string;
  priority?: boolean;
  sort?: string;
}

export interface CreateShipmentData {
  shipmentNumber: string;
  productName: string;
  quantity: number;
  temperature?: string;
  fromLocation: string;
  toLocation: string;
  branchCode: string;
  branchId: string;
  assignedToId?: string;
  stockRequestId?: string;
  priority?: boolean;
  notes?: string;
}

export interface UpdateShipmentData {
  status?: ShipmentStatus;
  priority?: boolean;
  notes?: string;
  issues?: number;
  startedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
}

export class ShipmentService {
  // Lấy danh sách shipments với filter
  static async getShipments(params: ShipmentQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    
    // Các tham số còn lại lấy bình thường
    const {
      search,
      status,
      assignedToId,
      branchId,
      priority,
      sort = '-createdAt',
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { shipmentNumber: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (assignedToId) {
      where.assignedToId = assignedToId;
    }
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (priority !== undefined) {
      where.priority = priority;
    }

    // Parse sort
    const orderBy: any = {};
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    orderBy[sortField] = sortOrder;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          branch: {
            select: { id: true, name: true, code: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          stockRequest: {
            select: { id: true, requestNumber: true, status: true },
          },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return {
      data: shipments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Lấy chi tiết một shipment
  static async getShipmentById(id: string) {
    return prisma.shipment.findUnique({
      where: { id },
      include: {
        branch: true,
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true },
        },
        stockRequest: {
          include: {
            product: true,
            requestedBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  // Tạo shipment mới
  static async createShipment(data: CreateShipmentData) {
    return prisma.shipment.create({
      data: {
        ...data,
        assignedAt: new Date(),
      },
      include: {
        branch: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Cập nhật shipment
  static async updateShipment(id: string, data: UpdateShipmentData) {
    return prisma.shipment.update({
      where: { id },
      data,
      include: {
        branch: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Cập nhật trạng thái shipment
  static async updateStatus(id: string, status: ShipmentStatus, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Get shipment details first
      const shipment = await tx.shipment.findUnique({
        where: { id },
        include: {
          stockRequest: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      const updateData: any = { status };
      
      if (status === 'IN_TRANSIT') {
        updateData.startedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        
        // ✅ CRITICAL: Update product quantity when delivered
        if (shipment.stockRequest?.product) {
          const productId = shipment.stockRequest.product.id;
          const quantityToAdd = shipment.quantity;

          console.log(`[Shipment ${shipment.shipmentNumber}] Updating product quantity:`, {
            productId,
            productName: shipment.productName,
            currentQuantity: shipment.stockRequest.product.quantity,
            addingQuantity: quantityToAdd,
            newQuantity: shipment.stockRequest.product.quantity + quantityToAdd,
          });

          // Update product quantity
          await tx.product.update({
            where: { id: productId },
            data: {
              quantity: {
                increment: quantityToAdd,
              },
            },
          });

          // Update or create inventory record
          const existingInventory = await tx.inventory.findUnique({
            where: { productId },
          });

          if (existingInventory) {
            await tx.inventory.update({
              where: { productId },
              data: {
                quantity: {
                  increment: quantityToAdd,
                },
                lastRestocked: new Date(),
              },
            });
          } else {
            // Create inventory if not exists
            await tx.inventory.create({
              data: {
                productId,
                quantity: quantityToAdd,
                lastRestocked: new Date(),
              },
            });
          }

          // Create stock transaction record for audit trail
          await tx.stockTransaction.create({
            data: {
              transactionNumber: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              type: 'RESTOCK',
              quantity: quantityToAdd,
              previousQuantity: shipment.stockRequest.product.quantity,
              newQuantity: shipment.stockRequest.product.quantity + quantityToAdd,
              reason: `Nhập hàng từ shipment ${shipment.shipmentNumber}`,
              reference: shipment.shipmentNumber,
              productId,
              branchId: shipment.branchId,
              performedById: userId,
              stockRequestId: shipment.stockRequestId || undefined,
            },
          });

          console.log(`[Shipment ${shipment.shipmentNumber}] ✅ Product quantity updated successfully`);
        }
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      // Update shipment status
      return tx.shipment.update({
        where: { id },
        data: updateData,
        include: {
          branch: true,
          assignedTo: {
            select: { id: true, name: true },
          },
          stockRequest: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // Xóa shipment
  static async deleteShipment(id: string) {
    return prisma.shipment.delete({
      where: { id },
    });
  }

  // Thống kê shipments theo trạng thái
  static async getShipmentStats(assignedToId?: string) {
    const where: any = assignedToId ? { assignedToId } : {};

    const stats = await prisma.shipment.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);
  }
}
