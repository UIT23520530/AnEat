import { Request, Response } from 'express';
import { prisma } from '../../db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { StaffService } from '../../models/staff.service';

/**
 * Get manager's branch statistics
 */
export const getBranchStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        status: 'error',
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const branchId = req.user.branchId;

    const [totalStaff, totalOrders, totalRevenue, branch] = await Promise.all([
      prisma.user.count({
        where: { branchId },
      }),
      prisma.order.count({
        where: { branchId },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { branchId, status: 'COMPLETED' },
      }),
      prisma.branch.findUnique({
        where: { id: branchId },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        branch,
        totalStaff,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
    });
  } catch (error) {
    console.error('Get branch stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch branch statistics',
    });
  }
};

/**
 * Get staff in manager's branch
 */
export const getBranchStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        status: 'error',
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const staff = await prisma.user.findMany({
      where: {
        branchId: req.user.branchId,
        role: 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { staff },
    });
  } catch (error) {
    console.error('Get branch staff error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch staff',
    });
  }
};

/**
 * Get orders in manager's branch
 */
export const getBranchOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        status: 'error',
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      branchId: req.user.branchId,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get branch orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
    });
  }
};

// ==================== STAFF CRUD OPERATIONS ====================

/**
 * Get staff by ID in manager's branch
 */
export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { id } = req.params;

    const staff = await StaffService.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found',
      });
      return;
    }

    // Check if staff belongs to manager's branch
    if (req.user.role === UserRole.ADMIN_BRAND && staff.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only view staff in your branch',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Staff retrieved successfully',
      data: staff,
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch staff',
    });
  }
};

/**
 * Create new staff in manager's branch
 */
export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { email, password, name, phone } = req.body;

    // Check if email already exists
    const existingUser = await StaffService.findByEmail(email);

    if (existingUser) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff
    const staff = await StaffService.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: UserRole.STAFF,
      branchId: req.user.branchId,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Staff created successfully',
      data: staff,
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create staff',
    });
  }
};

/**
 * Update staff in manager's branch
 */
export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    // Check if staff exists
    const existingStaff = await StaffService.findById(id);

    if (!existingStaff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found',
      });
      return;
    }

    // Check if staff belongs to manager's branch
    if (req.user.role === UserRole.ADMIN_BRAND && existingStaff.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only update staff in your branch',
      });
      return;
    }

    try {
      // Update staff
      const staff = await StaffService.update(id, {
        name,
        email,
        phone,
        role,
        isActive,
      });

      res.status(200).json({
        success: true,
        code: 200,
        message: 'Staff updated successfully',
        data: staff,
      });
    } catch (error: any) {
      // Handle email duplicate error
      if (error.message === 'Email already exists') {
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Email already exists',
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update staff',
    });
  }
};

/**
 * Delete staff (soft delete) in manager's branch
 */
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { id } = req.params;

    // Check if staff exists
    const existingStaff = await StaffService.findById(id);

    if (!existingStaff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found',
      });
      return;
    }

    // Check if staff belongs to manager's branch
    if (req.user.role === UserRole.ADMIN_BRAND && existingStaff.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only delete staff in your branch',
      });
      return;
    }

    // Soft delete staff
    await StaffService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete staff',
    });
  }
};

/**
 * Get staff list with pagination, sorting and filtering
 */
export const getStaffList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only ADMIN_BRAND needs branchId check
    // ADMIN_SYSTEM can see all staff
    if (req.user?.role === UserRole.ADMIN_BRAND && !req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      status,
      role 
    } = req.query;

    const params = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string | undefined,
      status: status as string | undefined,
      role: role as UserRole | undefined,
      // ADMIN_BRAND only sees their branch staff, ADMIN_SYSTEM sees all
      branchId: (req.user?.role === UserRole.ADMIN_BRAND ? req.user.branchId : undefined) || undefined,
    };

    const { staffs, total } = await StaffService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Staff list retrieved successfully',
      data: staffs,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get staff list error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch staff list',
    });
  }
};
