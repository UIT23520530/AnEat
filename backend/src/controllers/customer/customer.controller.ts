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
    const { amount, orderInfo, orderNumber } = req.body;
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
    const baseRedirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;
    const requestType = process.env.MOMO_REQUEST_TYPE!;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    
    // Add order details to redirect URL
    const redirectUrl = `${baseRedirectUrl}?orderId=${orderNumber || orderId}&total=${amount}`;
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

    // Get customer ID from user
    // For CUSTOMER role, we need to find the Customer record
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'User not found',
      });
      return;
    }

    // Find customer by phone (customer phone matches user phone)
    let customerId: string | null = null;
    if (user.phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone: user.phone },
        select: { id: true },
      });
      if (customer) {
        customerId = customer.id;
      }
    }

    // If customer not found, create one
    if (!customerId && user.phone) {
      const newCustomer = await prisma.customer.create({
        data: {
          phone: user.phone,
          name: user.email.split('@')[0] || 'Customer',
          email: user.email,
        },
      });
      customerId = newCustomer.id;
    }

    if (!customerId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Customer record not found and cannot be created',
      });
      return;
    }

    const { branchId, items, tableId, notes, deliveryAddress, deliveryPhone, orderType, paymentMethod } = req.body;

    // Validate branchId
    if (!branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch not found',
      });
      return;
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Order must have at least one item',
      });
      return;
    }

    // Validate and calculate total amount từ price đã gửi từ frontend (có thể đã bao gồm options)
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productId || !item.quantity || item.price === undefined) {
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid item data: productId, quantity, and price are required',
        });
        return;
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        res.status(400).json({
          success: false,
          code: 400,
          message: `Product not found: ${item.productId}`,
        });
        return;
      }

      totalAmount += item.price * item.quantity; // price đã là cent
    }

    // Generate unique order number
    let orderNumber: string = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      orderNumber = `ORD-${year}${month}${day}-${random}`;

      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique || !orderNumber) {
      res.status(500).json({
        success: false,
        code: 500,
        message: 'Failed to generate unique order number',
      });
      return;
    }

    console.log('Creating order with:', {
      customerId,
      branchId,
      orderNumber,
      totalAmount,
      itemsCount: items.length,
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        branchId,
        notes: notes || null,
        orderNumber,
        total: totalAmount,
        paymentMethod: paymentMethod ? (paymentMethod.toUpperCase().replace('-', '_') as any) : 'CASH',
        paymentStatus: 'PENDING',
        orderType: orderType || 'DELIVERY',
        deliveryAddress: deliveryAddress || null,
        deliveryPhone: deliveryPhone || null,
        items: {
          create: items.map((item: any) => {
            const orderItemData: any = {
              productId: item.productId,
              quantity: item.quantity,
              price: item.price, // price đã là cent (đã bao gồm options)
            };

            // Thêm options nếu có
            if (item.options && Array.isArray(item.options) && item.options.length > 0) {
              orderItemData.options = {
                create: item.options.map((opt: any) => ({
                  optionId: opt.optionId,
                  optionName: opt.optionName || '',
                  optionPrice: opt.optionPrice || 0, // price đã là cent
                })),
              };
            }

            return orderItemData;
          }),
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
              },
            },
            options: {
              include: {
                option: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack,
    });

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Order number already exists. Please try again.',
      });
      return;
    }

    // Handle Prisma foreign key error
    if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        code: 400,
        message: `Invalid reference: ${error.meta?.field_name || 'branch or product not found'}`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      code: 500,
      message: error.message || 'Failed to create order',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.toString(),
        stack: error.stack,
      }),
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
