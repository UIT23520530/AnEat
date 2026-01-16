import { Request, Response } from 'express';
import { prisma } from '../../db';
import axios from 'axios';
import crypto from 'crypto';
/**
 * Initiate MoMo payment for customer checkout
 */
export const initiateMoMoPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get payment info from request body
    const { amount, orderInfo } = req.body;
    if (!amount || !orderInfo) {
      res.status(400).json({
        status: 'error',
        message: 'Amount and orderInfo are required',
      });
      return;
    }

    // MoMo config from env
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

    // Build raw signature string
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
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    // Send request to MoMo
    const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).json({
      status: 'success',
      data: momoRes.data,
    });
  } catch (error: any) {
    console.error('MoMo payment error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.response?.data?.message || error.message || 'Failed to initiate payment',
    });
  }
};


/**
 * Get customer's order history
 */
export const getOrderHistory = async (req: Request, res: Response): Promise<void> => {
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
        customerId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
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
    console.error('Get order history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order history',
    });
  }
};

/**
 * Create new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { branchId, items, tableId, notes } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        branchId,
        notes,
        orderNumber,
        total: totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order',
    });
  }
};

/**
 * Get menu items (products) for customers
 */
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search } = req.query;

    const where: any = {
      isAvailable: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch menu',
    });
  }
};

/**
 * Get customer profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            ordersAssigned: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
    });
  }
};
