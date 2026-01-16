import { prisma } from '../db';
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreateStaffOrderData {
  customerId?: string;
  staffId: string;
  branchId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  promotionId?: string;
  promotionCode?: string;
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  notes?: string;
  orderType?: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
  deliveryAddress?: string;
}

export interface StaffOrderResponse {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: Date;
  items: any[];
  customer?: any;
  promotion?: any;
}

/**
 * Staff Order Service - Xử lý tạo đơn hàng từ POS/Staff
 */
export class StaffOrderService {
  /**
   * Tạo mã đơn hàng
   */
  private static generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Tạo đơn hàng mới từ staff/POS
   */
  static async createOrder(data: CreateStaffOrderData): Promise<StaffOrderResponse> {
    // Calculate subtotal
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = data.discountAmount || 0;
    const total = subtotal - discountAmount;

    // Use transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // 1. Validate and lock products (FOR UPDATE)
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, quantity: true, isAvailable: true, name: true }
        });

        if (!product) {
          throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
        }

        if (!product.isAvailable) {
          throw new Error(`Sản phẩm "${product.name}" hiện không khả dụng`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" không đủ số lượng (còn ${product.quantity})`);
        }
      }

      // 2. Update stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // 3. If promotion is used, increment used count
      if (data.promotionId) {
        await tx.promotion.update({
          where: { id: data.promotionId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });
      }

      // 4. Create order
      const orderNumber = this.generateOrderNumber();
      
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          total,
          status: OrderStatus.PENDING,
          notes: data.notes,
          customerId: data.customerId || null,
          staffId: data.staffId,
          branchId: data.branchId,
          promotionId: data.promotionId || null,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
          discountAmount,
          deliveryAddress: data.deliveryAddress || null,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  price: true,
                  image: true,
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          },
          promotion: {
            select: {
              id: true,
              code: true,
              type: true,
              value: true,
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      });

      return createdOrder;
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal,
      discountAmount: order.discountAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items,
      customer: order.customer,
      promotion: order.promotion,
    };
  }

  /**
   * Lấy đơn hàng theo ID
   */
  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                price: true,
                image: true,
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
        promotion: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });
  }

  /**
   * Lấy đơn hàng theo orderNumber
   */
  static async getOrderByNumber(orderNumber: string) {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        promotion: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  static async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const updateData: any = { paymentStatus };
    
    // Nếu thanh toán thành công, cập nhật status đơn hàng sang PREPARING
    if (paymentStatus === PaymentStatus.PAID) {
      updateData.status = OrderStatus.PREPARING;
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const updateData: any = { status };
    
    if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  /**
   * Lấy danh sách đơn hàng
   */
  static async getOrders(params: {
    page?: number;
    limit?: number;
    branchId?: string;
    status?: OrderStatus;
    staffId?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { page = 1, limit = 20, branchId, status, staffId, search, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (staffId) where.staffId = staffId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Hủy đơn hàng
   */
  static async cancelOrder(orderId: string) {
    return await prisma.$transaction(async (tx) => {
      // Get order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new Error('Không thể hủy đơn hàng đã hoàn thành');
      }

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Update order status
      return await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED,
        },
      });
    });
  }
}
