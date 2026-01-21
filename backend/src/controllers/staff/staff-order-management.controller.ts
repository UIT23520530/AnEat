import { Request, Response, NextFunction } from 'express';
import { StaffOrderService } from '../../models/staff-order.service';
import { PromotionService } from '../../models/promotion.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * @desc    Create new order from Staff POS
 * @route   POST /api/v1/staff/orders/create
 * @access  Staff only
 */
export const createStaffOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      items, 
      customerId, 
      promotionCode,
      paymentMethod, 
      notes, 
      orderType,
      deliveryAddress 
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Đơn hàng phải có ít nhất một sản phẩm',
      });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Phương thức thanh toán là bắt buộc',
      });
      return;
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CARD', 'BANK_TRANSFER', 'E_WALLET'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Phương thức thanh toán không hợp lệ',
      });
      return;
    }

    // Verify user is staff and get their info
    if (!req.user?.id || !req.user?.branchId) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Người dùng không xác thực hoặc không có chi nhánh',
      });
      return;
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Validate promotion if provided
    let promotionId: string | undefined;
    let discountAmount = 0;

    if (promotionCode) {
      try {
        const promotion = await PromotionService.findByCode(promotionCode);
        
        if (!promotion) {
          res.status(400).json({
            success: false,
            code: 400,
            message: 'Mã giảm giá không tồn tại',
          });
          return;
        }

        // Check if promotion is still valid
        if (!promotion.isActive) {
          res.status(400).json({
            success: false,
            code: 400,
            message: 'Mã giảm giá đã hết hiệu lực',
          });
          return;
        }

        if (promotion.expiryDate && new Date(promotion.expiryDate) < new Date()) {
          res.status(400).json({
            success: false,
            code: 400,
            message: 'Mã giảm giá đã hết hạn',
          });
          return;
        }

        if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
          res.status(400).json({
            success: false,
            code: 400,
            message: 'Mã giảm giá đã hết lượt sử dụng',
          });
          return;
        }

        if (promotion.minOrderAmount && subtotal < promotion.minOrderAmount) {
          res.status(400).json({
            success: false,
            code: 400,
            message: `Đơn hàng tối thiểu ${promotion.minOrderAmount.toLocaleString()}₫ để sử dụng mã này`,
          });
          return;
        }

        // Calculate discount
        promotionId = promotion.id;
        if (promotion.type === 'PERCENTAGE') {
          discountAmount = Math.floor(subtotal * (promotion.value / 100));
        } else {
          discountAmount = promotion.value;
        }
      } catch (error) {
        console.error('Promotion validation error:', error);
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Lỗi khi kiểm tra mã giảm giá',
        });
        return;
      }
    }

    // Create order
    const order = await StaffOrderService.createOrder({
      customerId: customerId || undefined,
      staffId: req.user.id,
      branchId: req.user.branchId,
      items,
      promotionId,
      discountAmount,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: paymentMethod === 'CASH' ? PaymentStatus.PAID : PaymentStatus.PENDING,
      notes: notes || undefined,
      orderType,
      deliveryAddress: deliveryAddress || undefined,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Tạo đơn hàng thành công',
      data: order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message || 'Lỗi khi tạo đơn hàng',
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/staff/orders/:orderId
 * @access  Staff only
 */
export const getStaffOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await StaffOrderService.getOrderById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    // Verify order belongs to staff's branch
    if (order.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền xem đơn hàng này',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thông tin đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    next(error);
  }
};

/**
 * @desc    Get list of orders
 * @route   GET /api/v1/staff/orders/list
 * @access  Staff only
 */
export const getStaffOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, search, dateFrom, dateTo } = req.query;

    const result = await StaffOrderService.getOrders({
      page: Number(page),
      limit: Number(limit),
      branchId: req.user?.branchId || undefined,
      status: status as any,
      search: search as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách đơn hàng thành công',
      data: result.orders,
      meta: {
        current_page: result.page,
        total_pages: result.totalPages,
        limit: result.limit,
        total_items: result.total,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    next(error);
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/v1/staff/orders/:orderId/payment-status
 * @access  Staff only
 */
export const updateStaffOrderPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Validate payment status
    const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(paymentStatus)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Trạng thái thanh toán không hợp lệ',
      });
      return;
    }

    // Verify order exists and belongs to branch
    const order = await StaffOrderService.getOrderById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    if (order.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền cập nhật đơn hàng này',
      });
      return;
    }

    const updatedOrder = await StaffOrderService.updatePaymentStatus(orderId, paymentStatus);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    next(error);
  }
};

/**
 * @desc    Cancel order
 * @route   POST /api/v1/staff/orders/:orderId/cancel
 * @access  Staff only
 */
export const cancelStaffOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;

    // Verify order exists and belongs to branch
    const order = await StaffOrderService.getOrderById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    if (order.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Bạn không có quyền hủy đơn hàng này',
      });
      return;
    }

    await StaffOrderService.cancelOrder(orderId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Hủy đơn hàng thành công',
      data: { orderId },
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(400).json({
      success: false,
      code: 400,
      message: error.message || 'Lỗi khi hủy đơn hàng',
    });
  }
};

/**
 * @desc    Validate promotion code
 * @route   POST /api/v1/staff/orders/validate-promotion
 * @access  Staff only
 */
export const validatePromotionCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    const branchId = req.user?.branchId;

    console.log('[Staff Validate Promotion] Code:', code, 'BranchId:', branchId, 'Subtotal:', subtotal);

    if (!code) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Mã giảm giá là bắt buộc',
      });
      return;
    }

    // Find promotion with branch awareness
    const promotion = await PromotionService.findByCode(code, branchId || undefined);

    if (!promotion) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Mã giảm giá không tồn tại',
      });
      return;
    }

    // Check if promotion is still valid
    if (!promotion.isActive) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Mã giảm giá đã hết hiệu lực',
      });
      return;
    }

    if (promotion.expiryDate && new Date(promotion.expiryDate) < new Date()) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Mã giảm giá đã hết hạn',
      });
      return;
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Mã giảm giá đã hết lượt sử dụng',
      });
      return;
    }

    if (promotion.minOrderAmount && subtotal && subtotal < promotion.minOrderAmount) {
      res.status(400).json({
        success: false,
        code: 400,
        message: `Đơn hàng tối thiểu ${promotion.minOrderAmount.toLocaleString()}₫ để sử dụng mã này`,
      });
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (subtotal) {
      if (promotion.type === 'PERCENTAGE') {
        discountAmount = Math.floor(subtotal * (promotion.value / 100));
      } else {
        discountAmount = promotion.value;
      }
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Mã giảm giá hợp lệ',
      data: {
        id: promotion.id,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        discountAmount,
        minOrderAmount: promotion.minOrderAmount,
      },
    });
  } catch (error) {
    console.error('Validate promotion error:', error);
    next(error);
  }
};
