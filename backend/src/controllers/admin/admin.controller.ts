import { Request, Response } from 'express';
import { prisma } from '../../db';
import { BranchService } from '../../models/branch.service';
import { UserRole } from '@prisma/client';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalBranches, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.branch.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalBranches,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thống kê',
    });
  }
};

/**
 * Get all branches with pagination, sorting and filtering
 */
export const getAllBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search } = req.query;

    const result = await BranchService.findAll({
      page: Number(page),
      limit: Number(limit),
      sort: String(sort),
      order: (String(order) === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
      search: search ? String(search) : undefined,
    });

    res.status(200).json({
      status: 'success',
      data: result.branches,
      meta: {
        total_items: result.total,
        current_page: Number(page),
        per_page: Number(limit),
        total_pages: Math.ceil(result.total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all branches error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách chi nhánh',
    });
  }
};

/**
 * Get branch by ID
 */
export const getBranchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await BranchService.findById(id);

    if (!branch) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy chi nhánh',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: branch,
    });
  } catch (error) {
    console.error('Get branch by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thông tin chi nhánh',
    });
  }
};

/**
 * Create new branch
 */
export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, address, phone, email, managerId, isActive } = req.body;

    // Check if code is provided and already exists
    if (code) {
      const existingBranch = await BranchService.findByCode(code);
      if (existingBranch) {
        res.status(400).json({
          status: 'error',
          message: 'Mã chi nhánh đã tồn tại',
        });
        return;
      }
    }

    const branch = await BranchService.create({
      code,
      name,
      address,
      phone,
      email: email || undefined,
      managerId: managerId || undefined,
      isActive,
    });

    res.status(201).json({
      status: 'success',
      message: 'Tạo chi nhánh thành công',
      data: branch,
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tạo chi nhánh',
    });
  }
};

/**
 * Update branch
 */
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, name, address, phone, email, managerId, isActive } = req.body;

    // Check if branch exists
    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy chi nhánh',
      });
      return;
    }

    // If code is being changed, check if new code already exists
    if (code && code !== branch.code) {
      const existingBranch = await BranchService.findByCode(code);
      if (existingBranch) {
        res.status(400).json({
          status: 'error',
          message: 'Mã chi nhánh đã tồn tại',
        });
        return;
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (managerId !== undefined) updateData.managerId = managerId || null;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    // 🔄 AUTO-SYNC LOGIC:
    // 1. If branch is being assigned a manager, update user.branchId
    if (managerId !== undefined) {
      // Clear old manager assignment if exists
      if (branch.managerId && branch.managerId !== managerId) {
        await prisma.user.update({
          where: { id: branch.managerId },
          data: { branchId: null },
        });
        console.log('✅ Cleared old manager branchId:', branch.managerId);
      }
      
      // Set new manager assignment
      if (managerId) {
        await prisma.user.update({
          where: { id: managerId },
          data: { branchId: id },
        });
        console.log('✅ Synced user.branchId:', managerId);
      }
    }
    
    // 2. If branch is being deactivated, clear managerId
    if (req.body.isActive === false && branch.managerId) {
      console.log('⚠️ Branch deactivated → Clearing managerId');
      updateData.managerId = null;
      
      // Also clear user's branchId
      await prisma.user.update({
        where: { id: branch.managerId },
        data: { branchId: null },
      });
      console.log('✅ Cleared user.branchId:', branch.managerId);
    }
    
    // 3. If managerId is being cleared, auto-deactivate branch
    if (managerId === null && branch.isActive) {
      console.log('⚠️ Manager removed → Auto-deactivating branch');
      updateData.isActive = false;
      
      // Clear old manager's branchId if exists
      if (branch.managerId) {
        await prisma.user.update({
          where: { id: branch.managerId },
          data: { branchId: null },
        });
        console.log('✅ Cleared user.branchId:', branch.managerId);
      }
    }

    console.log('🔄 Update branch request:', { id, updateData });
    const updatedBranch = await BranchService.update(id, updateData);
    console.log('✅ Updated branch result:', updatedBranch);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật chi nhánh thành công',
      data: updatedBranch,
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật chi nhánh',
    });
  }
};

/**
 * Delete branch
 */
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if branch exists and count staff
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff: true },
        },
      },
    });
    
    if (!branch) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy chi nhánh',
      });
      return;
    }

    // Check if branch has staff
    if (branch._count.staff > 0) {
      res.status(400).json({
        status: 'error',
        message: 'Không thể xóa chi nhánh vì có nhân viên đang làm việc',
      });
      return;
    }

    await BranchService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Xóa chi nhánh thành công',
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể xóa chi nhánh',
    });
  }
};

/**
 * Assign manager to branch
 */
export const assignManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    // Check if branch exists
    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy chi nhánh',
      });
      return;
    }

    // Check if manager exists (if managerId is provided)
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: { 
          id: managerId,
          deletedAt: null, // 🔥 CRITICAL FIX: Only allow non-deleted users as managers
        },
      });
      if (!manager) {
        res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy quản lý hoặc tài khoản đã bị xóa',
        });
        return;
      }

      // Check if manager has correct role
      if (manager.role !== UserRole.ADMIN_BRAND) {
        res.status(400).json({
          status: 'error',
          message: 'Người dùng này không phải là quản lý chi nhánh',
        });
        return;
      }
    }

    const updatedBranch = await BranchService.assignManager(id, managerId || null);

    res.status(200).json({
      status: 'success',
      message: 'Gán quản lý chi nhánh thành công',
      data: updatedBranch,
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể gán quản lý chi nhánh',
    });
  }
};

/**
 * Get branch statistics
 */
export const getBranchStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if branch exists
    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy chi nhánh',
      });
      return;
    }

    // Get detailed statistics
    const [staffCount, productCount, orderCount, totalRevenue] = await Promise.all([
      prisma.user.count({
        where: { branchId: id },
      }),
      prisma.product.count({
        where: { branchId: id },
      }),
      prisma.order.count({
        where: { branchId: id },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          branchId: id,
          status: 'COMPLETED',
        },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        branchId: id,
        staffCount,
        productCount,
        orderCount,
        totalRevenue: totalRevenue._sum.total || 0,
      },
    });
  } catch (error) {
    console.error('Get branch stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thống kê chi nhánh',
    });
  }
};

/**
 * Get available managers (users with role MANAGER who are not managing any branch)
 */
export const getAvailableManagers = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentManagerId = req.query.currentManagerId as string | undefined;
    
    // Build where clause
    const where: any = {
      role: UserRole.ADMIN_BRAND,
      deletedAt: null, // 🔥 CRITICAL FIX: Only show non-deleted managers
    };
    
    // If no currentManagerId, only get managers without branches
    // If currentManagerId provided, get all ADMIN_BRAND users
    if (!currentManagerId) {
      where.managedBranches = { is: null };
    }
    
    const managers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: managers,
    });
  } catch (error) {
    console.error('Get available managers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách quản lý',
    });
  }
};

/**
 * Get overview statistics for all branches
 */
export const getBranchesOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalBranches, activeBranches, allBranches, allOrders] = await Promise.all([
      prisma.branch.count(),
      prisma.branch.count({ where: { isActive: true } }),
      prisma.branch.findMany({
        select: {
          id: true,
          _count: {
            select: { staff: true },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['branchId'],
        where: { status: 'COMPLETED' },
        _sum: { total: true },
      }),
    ]);

    // Calculate total staff across all branches
    const totalStaff = allBranches.reduce((sum, b) => sum + b._count.staff, 0);

    // Calculate average revenue per branch
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order._sum.total || 0), 0);
    const averageRevenue = totalBranches > 0 ? totalRevenue / totalBranches : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalBranches,
        activeBranches,
        totalStaff,
        averageRevenue: Math.round(averageRevenue),
      },
    });
  } catch (error) {
    console.error('Get branches overview stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tải thống kê tổng quan',
    });
  }
};

