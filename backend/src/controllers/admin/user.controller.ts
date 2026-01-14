import { Request, Response } from 'express';
import { prisma } from '../../db';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

/**
 * Get all users (with pagination and filters)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    console.log('📋 Get all users request:', {
      page,
      limit,
      role,
      search,
      isActive,
    });

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { deletedAt: null };

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
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
          managedBranches: {
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    console.log('✅ Users fetched:', {
      count: users.length,
      total,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách người dùng thành công',
      data: users,
      meta: {
        total_items: total,
        total_pages: Math.ceil(total / take),
        current_page: Number(page),
        page_size: Number(limit),
      },
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách người dùng',
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('👤 Get user by ID request:', { id });

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
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
            address: true,
          },
        },
        managedBranches: {
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

    if (!user) {
      console.log('❌ User not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    console.log('✅ User fetched:', { id, name: user.name, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    });
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thông tin người dùng',
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, avatar, isActive, role, branchId, password } = req.body;

    console.log('🔄 Update user request:', {
      id,
      updateData: { name, phone, isActive, role, branchId, hasPassword: !!password },
    });

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      console.log('❌ User not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    // Prevent self-deactivation
    if (isActive === false && (req as any).user?.userId === id) {
      console.log('❌ Cannot deactivate self:', { id });
      res.status(400).json({
        status: 'error',
        message: 'Không thể vô hiệu hóa tài khoản của chính mình',
      });
      return;
    }

    // Prevent any modification to ADMIN_SYSTEM users
    if (user.role === UserRole.ADMIN_SYSTEM) {
      console.log('❌ Cannot modify ADMIN_SYSTEM:', { id });
      res.status(400).json({
        status: 'error',
        message: 'Không thể chỉnh sửa tài khoản Admin Hệ thống',
      });
      return;
    }

    // Prevent changing role to ADMIN_SYSTEM
    if (role === UserRole.ADMIN_SYSTEM) {
      console.log('❌ Cannot change role to ADMIN_SYSTEM:', { id });
      res.status(400).json({
        status: 'error',
        message: 'Không thể thay đổi vai trò thành Admin Hệ thống',
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;
    if (branchId !== undefined) updateData.branchId = branchId || null;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 🔄 AUTO-SYNC LOGIC FOR ADMIN_BRAND (Manager):
    const finalRole = role !== undefined ? role : user.role;
    const finalBranchId = branchId !== undefined ? branchId : user.branchId;
    
    // 1. If ADMIN_BRAND user is being assigned to a branch, update branch.managerId
    if (finalRole === UserRole.ADMIN_BRAND && branchId !== undefined) {
      // Clear old branch assignment if exists
      if (user.role === UserRole.ADMIN_BRAND) {
        const oldBranch = await prisma.branch.findFirst({
          where: { managerId: id },
        });
        if (oldBranch && oldBranch.id !== branchId) {
          await prisma.branch.update({
            where: { id: oldBranch.id },
            data: { managerId: null, isActive: false },
          });
          console.log('✅ Cleared old branch assignment:', oldBranch.name);
        }
      }
      
      // Set new branch assignment
      if (branchId) {
        await prisma.branch.update({
          where: { id: branchId },
          data: { managerId: id },
        });
        console.log('✅ Synced branch.managerId:', branchId);
      }
    }
    
    // 2. If ADMIN_BRAND user is being deactivated, clear their branch assignment
    if (isActive === false && finalRole === UserRole.ADMIN_BRAND) {
      console.log('⚠️ Manager deactivated → Clearing branch assignment');
      
      const managedBranch = await prisma.branch.findFirst({
        where: { managerId: id },
      });
      
      if (managedBranch) {
        await prisma.branch.update({
          where: { id: managedBranch.id },
          data: { 
            managerId: null,
            isActive: false,
          },
        });
        console.log('✅ Cleared manager from branch:', managedBranch.name);
      }
      
      updateData.branchId = null;
    }
    
    // 3. If branchId is being cleared, also clear branch.managerId
    if (branchId === null && finalRole === UserRole.ADMIN_BRAND) {
      const oldBranch = await prisma.branch.findFirst({
        where: { managerId: id },
      });
      if (oldBranch) {
        await prisma.branch.update({
          where: { id: oldBranch.id },
          data: { managerId: null, isActive: false },
        });
        console.log('✅ Cleared branch assignment');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        managedBranches: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        isActive: true,
        updatedAt: true,
      },
    });

    console.log('✅ User updated:', {
      id: updatedUser.id,
      name: updatedUser.name,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật người dùng',
    });
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🗑️ Delete user request:', { id });

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      console.log('❌ User not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    // Prevent deleting self
    if ((req as any).user?.userId === id) {
      console.log('❌ Cannot delete self:', { id });
      res.status(400).json({
        status: 'error',
        message: 'Không thể xóa tài khoản của chính mình',
      });
      return;
    }

    // Prevent deleting ADMIN_SYSTEM
    if (user.role === UserRole.ADMIN_SYSTEM) {
      console.log('❌ Cannot delete ADMIN_SYSTEM:', { id });
      res.status(400).json({
        status: 'error',
        message: 'Không thể xóa tài khoản Admin Hệ thống',
      });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    console.log('✅ User deleted:', { id, name: user.name, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể xóa người dùng',
    });
  }
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role, branchId, isActive, avatar } = req.body;

    // Prevent creating ADMIN_SYSTEM
    if (role === UserRole.ADMIN_SYSTEM) {
      console.log('❌ Cannot create ADMIN_SYSTEM');
      res.status(400).json({
        status: 'error',
        message: 'Không thể tạo tài khoản Admin Hệ thống',
      });
      return;
    }

    console.log('➕ Create user request:', {
      email,
      name,
      phone,
      role,
      branchId,
      isActive,
      hasPassword: !!password,
    });

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Email already exists:', { email });
      res.status(400).json({
        status: 'error',
        message: 'Email đã tồn tại trong hệ thống',
      });
      return;
    }

    // Generate password if not provided
    const finalPassword = password || `User${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || UserRole.STAFF,
        branchId: branchId || null,
        isActive: isActive !== undefined ? isActive : false, // Default inactive for security
        avatar: avatar || null,
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
        managedBranches: {
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

    // 🔄 SYNC LOGIC: If ADMIN_BRAND user is assigned to a branch, update branch.managerId
    if ((role === UserRole.ADMIN_BRAND || !role) && branchId) {
      await prisma.branch.update({
        where: { id: branchId },
        data: { managerId: user.id },
      });
      console.log('✅ Synced branch.managerId:', branchId);
    }

    console.log('✅ User created:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      generatedPassword: password ? '[provided]' : finalPassword,
    });

    res.status(201).json({
      status: 'success',
      message: 'Tạo người dùng thành công',
      data: user,
      // Return generated password only if it was auto-generated (not provided by admin)
      generatedPassword: password ? undefined : finalPassword,
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tạo người dùng',
    });
  }
};

/**
 * Get users statistics
 */
export const getUsersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Get users stats request');

    const [totalUsers, activeUsers, usersByRole] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const roleStats: Record<string, number> = {
      ADMIN_SYSTEM: 0,
      ADMIN_BRAND: 0,
      STAFF: 0,
      CUSTOMER: 0,
      LOGISTICS_STAFF: 0,
    };

    usersByRole.forEach((item) => {
      roleStats[item.role] = item._count;
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalManagers: roleStats.ADMIN_BRAND,
      totalStaff: roleStats.STAFF,
      usersByRole: roleStats,
    };

    console.log('✅ Users stats fetched:', stats);

    res.status(200).json({
      status: 'success',
      message: 'Lấy thống kê người dùng thành công',
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get users stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thống kê người dùng',
    });
  }
};
