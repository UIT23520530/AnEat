import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db';
import { OrderStatus } from '@prisma/client';

/**
 * @desc    Get pending orders waiting for staff confirmation (from customer web orders)
 * @route   GET /api/v1/staff/orders/pending
 * @access  Staff only
 */
export const getPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = (req as any).user?.branchId;
    const { page = 1, limit = 20 } = req.query;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không xác định được chi nhánh',
        data: null,
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          branchId,
          status: OrderStatus.PENDING,
          // Only show customer orders (not staff-created orders)
          customer: {
            isNot: null,
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                  isAvailable: true,
                  quantity: true,
                },
              },
            },
          },
          promotion: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.PENDING,
          customer: {
            isNot: null,
          },
        },
      }),
    ]);

    const formattedOrders = orders.map(order => {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          productId: item.productId,
          isAvailable: item.product.isAvailable,
          stockQuantity: item.product.quantity,
        })),
        subtotal,
        discountAmount: order.discountAmount,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        orderType: order.orderType,
        deliveryAddress: order.deliveryAddress,
        promotion: order.promotion,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách đơn hàng chờ xác nhận thành công',
      data: formattedOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders being prepared (accepted by staff)
 * @route   GET /api/v1/staff/orders/preparing
 * @access  Staff only
 */
export const getPreparingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = (req as any).user?.branchId;
    const { page = 1, limit = 20 } = req.query;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không xác định được chi nhánh',
        data: null,
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          branchId,
          status: OrderStatus.PREPARING,
        },
        skip,
        take,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                  isAvailable: true,
                  quantity: true,
                },
              },
            },
          },
          promotion: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.PREPARING,
        },
      }),
    ]);

    const formattedOrders = orders.map(order => {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          productId: item.productId,
          isAvailable: item.product.isAvailable,
          stockQuantity: item.product.quantity,
        })),
        subtotal,
        discountAmount: order.discountAmount,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        orderType: order.orderType,
        deliveryAddress: order.deliveryAddress,
        promotion: order.promotion,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách đơn hàng đang chuẩn bị thành công',
      data: formattedOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a pending order (move to PREPARING status)
 * @route   POST /api/v1/staff/orders/:orderId/accept
 * @access  Staff only
 */
export const acceptOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const branchId = (req as any).user?.branchId;
    const staffId = (req as any).user?.id;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không xác định được chi nhánh',
        data: null,
      });
      return;
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        data: null,
      });
      return;
    }

    if (order.branchId !== branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền xử lý đơn hàng này',
        data: null,
      });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({
        success: false,
        code: 400,
        message: `Đơn hàng không ở trạng thái chờ xác nhận (hiện tại: ${order.status})`,
        data: null,
      });
      return;
    }

    // Check product availability
    for (const item of order.items) {
      if (!item.product.isAvailable) {
        res.status(400).json({
          success: false,
          code: 400,
          message: `Sản phẩm "${item.product.name}" hiện không khả dụng. Vui lòng chỉnh sửa đơn hàng.`,
          data: null,
        });
        return;
      }

      if (item.product.quantity < item.quantity) {
        res.status(400).json({
          success: false,
          code: 400,
          message: `Sản phẩm "${item.product.name}" không đủ số lượng (còn ${item.product.quantity}). Vui lòng chỉnh sửa đơn hàng.`,
          data: null,
        });
        return;
      }
    }

    // Update order status to PREPARING
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PREPARING,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Đã chấp nhận đơn hàng',
      data: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        customer: updatedOrder.customer,
        items: updatedOrder.items.map(item => ({
          id: item.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        total: updatedOrder.total,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit order items (adjust quantities, remove items)
 * @route   PUT /api/v1/staff/orders/:orderId/items
 * @access  Staff only
 */
export const editOrderItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { items, reason } = req.body; // items: Array<{ productId: string, quantity: number }>
    const branchId = (req as any).user?.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không xác định được chi nhánh',
        data: null,
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Danh sách sản phẩm không hợp lệ',
        data: null,
      });
      return;
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        data: null,
      });
      return;
    }

    if (order.branchId !== branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền chỉnh sửa đơn hàng này',
        data: null,
      });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Chỉ có thể chỉnh sửa đơn hàng ở trạng thái chờ xác nhận',
        data: null,
      });
      return;
    }

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Restore old quantities back to stock
      for (const oldItem of order.items) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: {
            quantity: {
              increment: oldItem.quantity,
            },
          },
        });
      }

      // 2. Delete old items
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // 3. Validate and create new items
      let newSubtotal = 0;
      const newOrderItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            isAvailable: true,
          },
        });

        if (!product) {
          throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
        }

        if (!product.isAvailable) {
          throw new Error(`Sản phẩm "${product.name}" hiện không khả dụng`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Sản phẩm "${product.name}" không đủ số lượng (còn ${product.quantity})`
          );
        }

        // Deduct from stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // Create new order item
        const orderItem = await tx.orderItem.create({
          data: {
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        });

        newOrderItems.push(orderItem);
        newSubtotal += product.price * item.quantity;
      }

      // 4. Recalculate order totals
      const discountAmount = order.discountAmount || 0;
      const newTotal = newSubtotal - discountAmount;

      // 5. Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          total: newTotal,
          notes: reason
            ? `${order.notes || ''}\n[Chỉnh sửa bởi nhân viên: ${reason}]`.trim()
            : order.notes,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      return {
        order: updatedOrder,
        items: newOrderItems,
      };
    });

    const responseSubtotal = result.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Đã cập nhật đơn hàng thành công',
      data: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        customer: result.order.customer,
        items: result.items.map(item => ({
          id: item.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: responseSubtotal,
        discountAmount: result.order.discountAmount,
        total: result.order.total,
        notes: result.order.notes,
        updatedAt: result.order.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        code: 400,
        message: error.message,
        data: null,
      });
      return;
    }
    next(error);
  }
};

/**
 * @desc    Cancel an order (with reason)
 * @route   POST /api/v1/staff/orders/:orderId/cancel
 * @access  Staff only
 */
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const branchId = (req as any).user?.branchId;

    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không xác định được chi nhánh',
        data: null,
      });
      return;
    }

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Vui lòng nhập lý do hủy đơn',
        data: null,
      });
      return;
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        data: null,
      });
      return;
    }

    if (order.branchId !== branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền hủy đơn hàng này',
        data: null,
      });
      return;
    }

    if (order.status === OrderStatus.CANCELLED) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Đơn hàng đã bị hủy trước đó',
        data: null,
      });
      return;
    }

    if (order.status === OrderStatus.COMPLETED) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Không thể hủy đơn hàng đã hoàn thành',
        data: null,
      });
      return;
    }

    // Use transaction to restore stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Restore stock for all items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 2. Update order status
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          notes: `${order.notes || ''}\n[Hủy bởi nhân viên: ${reason}]`.trim(),
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      return cancelledOrder;
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Đã hủy đơn hàng thành công',
      data: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.status,
        customer: result.customer,
        notes: result.notes,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
