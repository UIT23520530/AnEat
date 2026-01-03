import { Request, Response } from 'express';
import { prisma } from '../../db';

/**
 * Get assigned orders for staff
 */
export const getAssignedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        staffId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assigned orders',
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Verify staff is assigned to this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
      return;
    }

    if (order.staffId !== req.user?.id) {
      res.status(403).json({
        status: 'error',
        message: 'You are not assigned to this order',
      });
      return;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status',
    });
  }
};
