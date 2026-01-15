import { Request, Response } from 'express';
import { CustomerService } from '../../models/customer.service';
import { CustomerTier } from '@prisma/client';

/**
 * Get all customers with pagination, search, and filtering
 * Level 3: Supports pagination, search, sorting, filtering
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const tier = req.query.tier as CustomerTier | undefined;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    // Call service layer
    const { customers, total } = await CustomerService.findAll({
      page,
      limit,
      sort: sortField,
      order: sortOrder,
      search,
      tier,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    // Return standard response
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách khách hàng thành công',
      data: customers,
      meta: {
        current_page: page,
        total_pages: totalPages,
        limit,
        total_items: total,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách khách hàng',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Search customer by phone number
 * Used for quick lookup during order creation
 */
export const searchCustomerByPhone = async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Vui lòng nhập số điện thoại',
        data: null,
      });
    }

    const customer = await CustomerService.findByPhone(phone.trim());

    if (!customer) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy khách hàng',
        data: null,
      });
    }

    // Return customer info (excluding sensitive data)
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Tìm thấy khách hàng',
      data: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
        tier: customer.tier,
        points: customer.points,
        totalSpent: customer.totalSpent,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi tìm kiếm khách hàng',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Create new customer
 * Level 3: Input validation, standard response, duplicate prevention
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { phone, name, email, avatar } = req.body;

    // Check if customer with phone already exists
    const existingCustomer = await CustomerService.findByPhone(phone);
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Số điện thoại đã được sử dụng',
        data: null,
      });
    }

    // Create customer via service layer
    const customer = await CustomerService.create({
      phone,
      name,
      email,
      avatar,
      tier: 'BRONZE', // Default tier for new customers
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Tạo khách hàng thành công',
      data: customer,
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Số điện thoại đã được sử dụng',
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi tạo khách hàng',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Get customer by ID
 * Returns detailed customer information
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await CustomerService.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy khách hàng',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy thông tin khách hàng',
      data: null,
      errors: error.message,
    });
  }
};

/**
 * Update customer information
 * Level 3: Validation, standard response
 * Staff can update: name, email, avatar (not tier or points)
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, avatar } = req.body;

    // Check if customer exists
    const existingCustomer = await CustomerService.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy khách hàng',
        data: null,
      });
    }

    // Update via service layer (only allow name, email, avatar)
    const updatedCustomer = await CustomerService.update(id, {
      name,
      email,
      avatar,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật thông tin khách hàng thành công',
      data: updatedCustomer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật thông tin khách hàng',
      data: null,
      errors: error.message,
    });
  }
};
