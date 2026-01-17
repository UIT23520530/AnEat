import { Request, Response } from 'express';
import { prisma } from '../../db';
import axios from 'axios';
import crypto from 'crypto';

/**
 * MoMo POS payment for staff (quầy thanh toán)
 */
export const momoPosPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy thông tin từ body
    const { amount, orderInfo, paymentCode } = req.body;
    if (!amount || !orderInfo || !paymentCode) {
      res.status(400).json({
        status: 'error',
        message: 'amount, orderInfo, paymentCode are required',
      });
      return;
    }

    // MoMo config từ env
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const redirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;
    const requestType = process.env.MOMO_REQUEST_TYPE!;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = '';
    const orderGroupId = '';
    const autoCapture = true;
    const lang = 'vi';

    // Build raw signature string cho POS
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    // Create signature
    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Prepare request body
    const requestBody = {
      partnerCode,
      partnerName: 'AnEat',
      storeId: 'AnEatStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      autoCapture,
      extraData,
      paymentCode,
      orderGroupId,
      signature,
    };

    // Gửi request tới MoMo POS endpoint
    const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/pos', requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).json({
      status: 'success',
      data: momoRes.data,
    });
  } catch (error: any) {
    console.error('MoMo POS payment error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.response?.data?.message || error.message || 'Failed to initiate POS payment',
    });
  }
};


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
