import { Request, Response } from 'express';
import { prisma } from '../../db';
import axios from 'axios';
import crypto from 'crypto';

/**
 * MoMo IPN (Instant Payment Notification) handler
 * MoMo gọi endpoint này khi thanh toán hoàn tất
 */
export const handleMoMoIPN = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    console.log('MoMo IPN received:', { orderId, resultCode, message, transId });

    // Verify signature
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    
    const rawSignature = 
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;
    
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('MoMo IPN: Invalid signature');
      res.status(400).json({ message: 'Invalid signature' });
      return;
    }

    // Extract orderNumber from orderInfo (format: "Thanh toán đơn hàng tại AnEat - ORD-XXXXXX")
    const orderNumberMatch = orderInfo?.match(/ORD-[A-Z0-9]+/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;

    if (!orderNumber) {
      console.error('MoMo IPN: Could not extract order number from orderInfo:', orderInfo);
      res.status(200).json({ message: 'OK' }); // Vẫn trả về OK để MoMo không retry
      return;
    }

    // resultCode = 0 means success
    if (resultCode === 0 || resultCode === '0') {
      // Update order payment status to PAID
      const updatedOrder = await prisma.order.updateMany({
        where: { orderNumber },
        data: { 
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        },
      });

      console.log(`MoMo IPN: Order ${orderNumber} payment status updated to PAID`, updatedOrder);
    } else {
      // Payment failed
      const updatedOrder = await prisma.order.updateMany({
        where: { orderNumber },
        data: { 
          paymentStatus: 'FAILED',
          updatedAt: new Date(),
        },
      });
      
      console.log(`MoMo IPN: Order ${orderNumber} payment failed with code ${resultCode}`, updatedOrder);
    }

    // MoMo expects HTTP 204 or 200 with empty body on success
    res.status(204).send();
  } catch (error: any) {
    console.error('MoMo IPN error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update payment status from frontend (backup for IPN when testing locally)
 */
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber, paymentStatus } = req.body;

    if (!orderNumber || !paymentStatus) {
      res.status(400).json({
        status: 'error',
        message: 'orderNumber and paymentStatus are required',
      });
      return;
    }

    const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(paymentStatus)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payment status',
      });
      return;
    }

    const updatedOrder = await prisma.order.updateMany({
      where: { orderNumber },
      data: { 
        paymentStatus,
        updatedAt: new Date(),
      },
    });

    if (updatedOrder.count === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
      return;
    }

    console.log(`Payment status updated: Order ${orderNumber} -> ${paymentStatus}`);

    res.status(200).json({
      status: 'success',
      message: 'Payment status updated',
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update payment status',
    });
  }
};

/**
 * Initiate MoMo payment for customer or staff checkout
 */
export const initiateMoMoPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get payment info from request body
    const { amount, orderInfo, orderNumber, returnUrl } = req.body;
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
    const defaultRedirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;
    const requestType = process.env.MOMO_REQUEST_TYPE!;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    
    // Use provided returnUrl or fallback to default (customer checkout)
    // returnUrl should include all query parameters needed (orderId, total, etc.)
    const baseUrl = returnUrl || `${defaultRedirectUrl}?orderId=${orderNumber || orderId}&total=${amount}`;
    // Ensure base URL format is correct
    const redirectUrl = baseUrl.includes('?') 
      ? `${baseUrl}${!baseUrl.includes('orderId') ? `&orderId=${orderNumber || orderId}` : ''}${!baseUrl.includes('total') ? `&total=${amount}` : ''}`
      : `${baseUrl}?orderId=${orderNumber || orderId}&total=${amount}`;
    
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
        promotion: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
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

    const { branchId, items, tableId, notes, deliveryAddress, deliveryPhone, orderType, paymentMethod, momoPaymentStatus, promotionId } = req.body;

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

    // Calculate discount if promotionId is provided
    let discountAmount = 0;
    if (promotionId) {
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
      });

      if (promotion && promotion.isActive) {
        // Check expiry date
        if (!promotion.expiryDate || new Date(promotion.expiryDate) >= new Date()) {
          // Check minimum order amount
          if (!promotion.minOrderAmount || totalAmount >= promotion.minOrderAmount) {
            // Calculate discount
            if (promotion.type === 'PERCENTAGE') {
              discountAmount = Math.floor((totalAmount * promotion.value) / 100);
            } else if (promotion.type === 'FIXED') {
              discountAmount = promotion.value;
            }
            
            // Ensure discount doesn't exceed total
            discountAmount = Math.min(discountAmount, totalAmount);
          }
        }
      }
    }

    // Calculate final total after discount
    const finalTotal = totalAmount - discountAmount;

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

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        branchId,
        notes: notes || null,
        orderNumber,
        total: finalTotal,
        paymentMethod: paymentMethod ? (paymentMethod.toUpperCase().replace('-', '_') as any) : 'CASH',
        paymentStatus: momoPaymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        orderType: orderType || 'DELIVERY',
        deliveryAddress: deliveryAddress || null,
        deliveryPhone: deliveryPhone || null,
        promotionId: promotionId || null,
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

/**
 * Update customer profile (including address)
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        status: 'error',
        message: 'Chưa đăng nhập',
      });
      return;
    }

    const { name, email, phone, address } = req.body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, phone: true, name: true, email: true },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    // Kiểm tra nếu email mới đã tồn tại với user khác
    if (email && email !== user.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUserByEmail) {
        res.status(400).json({
          status: 'error',
          message: 'Email đã được sử dụng',
        });
        return;
      }
    }

    // Kiểm tra nếu phone mới đã tồn tại với user khác
    if (phone && phone !== user.phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone: phone },
      });

      if (existingUserByPhone) {
        res.status(400).json({
          status: 'error',
          message: 'Số điện thoại đã được sử dụng',
        });
        return;
      }

      // Kiểm tra phone mới có tồn tại trong Customer table không
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: phone },
      });

      if (existingCustomer) {
        res.status(400).json({
          status: 'error',
          message: 'Số điện thoại đã được sử dụng bởi khách hàng khác',
        });
        return;
      }
    }

    // Update Customer table first (using old phone as key)
    let customerData = null;
    if (user.phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone: user.phone },
      });

      if (customer) {
        try {
          // Thử cập nhật Customer với address và phone mới nếu có
          const updateData: any = {
            name: name || customer.name,
            address: address !== undefined ? address : customer.address,
          };
          
          // Chỉ update phone nếu có thay đổi
          if (phone && phone !== user.phone) {
            updateData.phone = phone;
          }

          customerData = await prisma.customer.update({
            where: { phone: user.phone },
            data: updateData,
            select: {
              id: true,
              tier: true,
              points: true,
              totalSpent: true,
              address: true,
            },
          });
        } catch (updateError) {
          // Nếu trường address chưa tồn tại, cập nhật không có address
          const updateData: any = {
            name: name || customer.name,
          };
          
          if (phone && phone !== user.phone) {
            updateData.phone = phone;
          }

          customerData = await prisma.customer.update({
            where: { phone: user.phone },
            data: updateData,
            select: {
              id: true,
              tier: true,
              points: true,
              totalSpent: true,
            },
          });
        }
      }
    }

    // Update User table
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin thành công',
      data: {
        user: {
          ...updatedUser,
          ...customerData,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật thông tin',
    });
  }
};
