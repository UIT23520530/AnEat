import { Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

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

    const staff = await prisma.user.findFirst({
      where: {
        id,
        branchId: req.user.branchId,
        role: UserRole.STAFF,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!staff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found in your branch',
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

    const { email, password, name, phone, avatar } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

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
    const staff = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: UserRole.STAFF,
        branchId: req.user.branchId,
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        isActive: true,
        createdAt: true,
      },
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
    const { name, phone, avatar, isActive } = req.body;

    // Check if staff exists in manager's branch
    const existingStaff = await prisma.user.findFirst({
      where: {
        id,
        branchId: req.user.branchId,
        role: UserRole.STAFF,
        isActive: true,
      },
    });

    if (!existingStaff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found in your branch',
      });
      return;
    }

    // Update staff
    const staff = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Staff updated successfully',
      data: staff,
    });
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

    // Check if staff exists in manager's branch
    const existingStaff = await prisma.user.findFirst({
      where: {
        id,
        branchId: req.user.branchId,
        role: UserRole.STAFF,
        isActive: true,
      },
    });

    if (!existingStaff) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Staff not found in your branch',
      });
      return;
    }

    // Soft delete staff
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

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
      isActive 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {
      role: UserRole.STAFF,
    };

    // ADMIN_BRAND can only see staff in their branch
    // ADMIN_SYSTEM can see all staff
    if (req.user?.role === UserRole.ADMIN_BRAND) {
      where.branchId = req.user.branchId;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }

    // Add active filter
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort as string] = order === 'asc' ? 'asc' : 'desc';

    // Execute queries
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Staff list retrieved successfully',
      data: staff,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        limit: take,
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
