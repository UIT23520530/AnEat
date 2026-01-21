import { Request, Response } from 'express';
import { CustomerService } from '../../models/customer.service';
import { CustomerTier, Prisma } from '@prisma/client';

/**
 * Get all customers (Manager view)
 * GET /api/v1/manager/customers
 */
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const search = req.query.search as string;
    const tier = req.query.tier as CustomerTier;
    const includeDeleted = req.query.includeDeleted === 'true';

    const { customers, total } = await CustomerService.findAll({
      page,
      limit,
      sort,
      order,
      search,
      tier,
      includeDeleted,
    });

    res.status(200).json({
      success: true,
      code: 200,
      data: customers,
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        limit,
        total_items: total,
      },
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch customers',
    });
  }
};

/**
 * Get customer by ID
 * GET /api/v1/manager/customers/:id
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await CustomerService.findById(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch customer',
    });
  }
};

/**
 * Get customer statistics
 * GET /api/v1/manager/customers/statistics
 */
export const getCustomerStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await CustomerService.getStatistics();

    res.status(200).json({
      success: true,
      code: 200,
      data: statistics,
    });
  } catch (error) {
    console.error('Get customer statistics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch customer statistics',
    });
  }
};

/**
 * Update customer information
 * PATCH /api/v1/manager/customers/:id
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, avatar, tier, points, isActive } = req.body;

    console.log('[DEBUG] updateCustomer body:', JSON.stringify(req.body));

    // Check if customer exists (include deleted for restore functionality)
    const existingCustomer = await CustomerService.findById(id, true);
    if (!existingCustomer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    // Validation: Ensure at least one field is provided
    // Note: checks against undefined to allow 0 or empty strings if valid
    if (name === undefined && email === undefined && phone === undefined &&
      avatar === undefined && tier === undefined && points === undefined && isActive === undefined) {
      console.log('[DEBUG] Validation failed: No fields to update');
      res.status(400).json({
        success: false,
        code: 400,
        message: 'At least one field is required to update',
      });
      return;
    }

    // Phone validation
    if (phone !== undefined) {
      if (typeof phone !== 'string' || !/^[0-9]{10}$/.test(phone)) {
        console.log('[DEBUG] Validation failed: Invalid phone', phone);
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid phone number format (must be 10 digits)',
        });
        return;
      }
    }

    // Email validation
    if (email !== undefined && email !== null && email !== '') {
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log('[DEBUG] Validation failed: Invalid email', email);
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid email format',
        });
        return;
      }
    }

    // Tier validation
    if (tier !== undefined) {
      if (typeof tier !== 'string' || !['BRONZE', 'SILVER', 'GOLD', 'VIP'].includes(tier)) {
        console.log('[DEBUG] Validation failed: Invalid tier', tier);
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid tier value',
        });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;

    // Treat empty string email as null to avoid unique constraint violations on empty strings
    if (email !== undefined) {
      updateData.email = email === '' ? null : email;
    }

    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (tier !== undefined) updateData.tier = tier;

    // Handle points explicitly
    if (points !== undefined && points !== null) {
      const parsedPoints = typeof points === 'string' ? parseInt(points, 10) : points;
      if (!isNaN(parsedPoints)) {
        updateData.points = parsedPoints;
      } else {
        console.log('[DEBUG] points is NaN', points);
      }
    }

    console.log('[DEBUG] Final updateData:', JSON.stringify(updateData));

    // Handle restore (set deletedAt to null when isActive is true)
    if (isActive === true && existingCustomer.deletedAt) {
      updateData.deletedAt = null;
      console.log('[DEBUG] Restoring customer - setting deletedAt to null');
    }

    const updatedCustomer = await CustomerService.update(id, updateData);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('Update customer error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json({
          success: false,
          code: 409,
          message: 'Phone or email already exists',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update customer',
    });
  }
};

/**
 * Adjust customer points (for VIP/special customers)
 * POST /api/v1/manager/customers/:id/adjust-points
 */
export const adjustCustomerPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    // Validation
    if (points === undefined || points === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Points adjustment amount is required and cannot be zero',
      });
      return;
    }

    if (!reason || reason.trim() === '') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Reason for points adjustment is required',
      });
      return;
    }

    // Check if customer exists
    const customer = await CustomerService.findById(id);
    if (!customer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    const updatedCustomer = await CustomerService.adjustPoints({
      customerId: id,
      points: parseInt(points),
      reason,
      performedBy: req.user!.id,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Customer points adjusted successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('Adjust customer points error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to adjust customer points',
    });
  }
};

/**
 * Update customer tier
 * PATCH /api/v1/manager/customers/:id/tier
 */
export const updateCustomerTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tier, reason } = req.body;

    // Validation
    if (!tier) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Tier is required',
      });
      return;
    }

    if (!['BRONZE', 'SILVER', 'GOLD', 'VIP'].includes(tier)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid tier value. Must be BRONZE, SILVER, GOLD, or VIP',
      });
      return;
    }

    // Check if customer exists
    const customer = await CustomerService.findById(id);
    if (!customer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    const updatedCustomer = await CustomerService.updateTier(id, tier, reason);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Customer tier updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('Update customer tier error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update customer tier',
    });
  }
};

/**
 * Get customer order history
 * GET /api/v1/manager/customers/:id/orders
 */
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Check if customer exists
    const customer = await CustomerService.findById(id);
    if (!customer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    const { orders, total } = await CustomerService.getOrderHistory(id, { page, limit });

    res.status(200).json({
      success: true,
      code: 200,
      data: orders,
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        limit,
        total_items: total,
      },
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch customer orders',
    });
  }
};

/**
 * Search customers
 * GET /api/v1/manager/customers/search
 */
export const searchCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim() === '') {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Search query is required',
      });
      return;
    }

    const customers = await CustomerService.search(query, limit);

    res.status(200).json({
      success: true,
      code: 200,
      data: customers,
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to search customers',
    });
  }
};

/**
 * Delete customer (soft delete)
 * DELETE /api/v1/manager/customers/:id
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await CustomerService.findById(id);
    if (!customer) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Customer not found',
      });
      return;
    }

    // Delete customer (soft delete)
    const deletedCustomer = await CustomerService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Customer deleted successfully',
      data: deletedCustomer,
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete customer',
    });
  }
};

/**
 * Create new customer (manual registration by manager)
 * POST /api/v1/manager/customers
 */
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, email, avatar, tier, points } = req.body;

    // Validation
    if (!phone || !name) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Phone and name are required',
      });
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid phone number format (must be 10 digits)',
      });
      return;
    }

    // Email validation
    if (email && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid email format',
      });
      return;
    }

    // Check if phone already exists
    const existingCustomer = await CustomerService.findByPhone(phone);
    if (existingCustomer) {
      res.status(409).json({
        success: false,
        code: 409,
        message: 'Customer with this phone number already exists',
      });
      return;
    }

    // Prepare create data with sanitized email
    const createData: any = {
      phone,
      name,
      avatar,
      tier: tier || 'BRONZE',
      points: points || 0,
    };

    // Only add email if it's a valid string (convert empty string to null/undefined behavior by omission or explicit null)
    // Prisma create usually takes optional fields. If we pass "", it saves "". We want null.
    if (email && email !== '') {
      createData.email = email;
    } else {
      // If email is explicitly passed as "", or null, or undefined, we might want to ensure it's null in DB?
      // If schema is String?, passing null is fine. omitting it is fine.
      // But passing "" is NOT fine for @unique.
      // So we just don't add it to createData, or set it to null if needed?
      // Let's set it to undefined to be safe, or null.
      // createData.email = null; // if we want explicit null
    }

    const newCustomer = await CustomerService.create({
      ...createData,
      // Force email to be undefined if empty string, so Prisma uses default (null)
      email: (email && email !== '') ? email : undefined
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Customer created successfully',
      data: newCustomer,
    });
  } catch (error) {
    console.error('Create customer error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta as any)?.target;
        if (Array.isArray(target) && target.includes('email')) {
          res.status(409).json({
            success: false,
            code: 409,
            message: 'Email already exists',
          });
          return;
        }

        res.status(409).json({
          success: false,
          code: 409,
          message: 'Phone or email already exists',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create customer',
    });
  }
};
