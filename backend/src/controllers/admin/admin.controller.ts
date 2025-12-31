import { Request, Response } from 'express';
import { prisma } from '../../db';
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
      message: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * Manage all branches
 */
export const getAllBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            staff: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { branches },
    });
  } catch (error) {
    console.error('Get all branches error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch branches',
    });
  }
};

/**
 * Create new branch
 */
export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, address, phone, email, managerId } = req.body;

    const branch = await prisma.branch.create({
      data: {
        code,
        name,
        address,
        phone,
        email,
        managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Branch created successfully',
      data: { branch },
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create branch',
    });
  }
};

/**
 * Update branch
 */
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const branch = await prisma.branch.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Branch updated successfully',
      data: { branch },
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update branch',
    });
  }
};

/**
 * Delete branch
 */
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.branch.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete branch',
    });
  }
};
