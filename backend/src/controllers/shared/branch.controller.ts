import { Request, Response } from 'express';
import { BranchService } from '../../models/branch.service';
import { Prisma } from '@prisma/client';

/**
 * Get all branches (Admin only)
 * GET /api/admin/branches
 */
export const getAllBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const search = req.query.search as string;

    const { branches, total } = await BranchService.findAll({
      page,
      limit,
      sort,
      order,
      search,
    });

    res.status(200).json({
      success: true,
      code: 200,
      data: branches,
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        limit,
        total_items: total,
      },
    });
  } catch (error) {
    console.error('Get all branches error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch branches',
    });
  }
};

/**
 * Get branch by ID
 * GET /api/admin/branches/:id
 */
export const getBranchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await BranchService.findById(id);

    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: branch,
    });
  } catch (error) {
    console.error('Get branch by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch branch',
    });
  }
};

/**
 * Get manager's branch information
 * GET /api/manager/branch
 */
export const getManagerBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const branch = await BranchService.findById(req.user.branchId);

    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: branch,
    });
  } catch (error) {
    console.error('Get manager branch error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch branch information',
    });
  }
};

/**
 * Update manager's branch information
 * PATCH /api/manager/branch
 */
export const updateManagerBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { name, address, phone, email } = req.body;

    // Validation
    if (!name && !address && !phone && !email) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'At least one field is required to update',
      });
      return;
    }

    // Phone validation
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid phone number format',
      });
      return;
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Invalid email format',
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const updatedBranch = await BranchService.update(req.user.branchId, updateData);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Branch information updated successfully',
      data: updatedBranch,
    });
  } catch (error) {
    console.error('Update manager branch error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json({
          success: false,
          code: 409,
          message: 'Branch with this information already exists',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update branch information',
    });
  }
};

/**
 * Create new branch (Admin only)
 * POST /api/admin/branches
 */
export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, address, phone, email, managerId } = req.body;

    // Validation
    if (!code || !name || !address || !phone) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Code, name, address, and phone are required',
      });
      return;
    }

    // Check if code already exists
    const existingBranch = await BranchService.findByCode(code);
    if (existingBranch) {
      res.status(409).json({
        success: false,
        code: 409,
        message: 'Branch with this code already exists',
      });
      return;
    }

    const newBranch = await BranchService.create({
      code,
      name,
      address,
      phone,
      email,
      managerId,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Branch created successfully',
      data: newBranch,
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create branch',
    });
  }
};

/**
 * Update branch (Admin only)
 * PATCH /api/admin/branches/:id
 */
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;

    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    const updatedBranch = await BranchService.update(id, updateData);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Branch updated successfully',
      data: updatedBranch,
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update branch',
    });
  }
};

/**
 * Delete branch (Admin only)
 * DELETE /api/admin/branches/:id
 */
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    await BranchService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete branch',
    });
  }
};

/**
 * Assign manager to branch (Admin only)
 * PATCH /api/admin/branches/:id/manager
 */
export const assignManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    if (!managerId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager ID is required',
      });
      return;
    }

    const branch = await BranchService.findById(id);
    if (!branch) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Branch not found',
      });
      return;
    }

    const updatedBranch = await BranchService.assignManager(id, managerId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Manager assigned successfully',
      data: updatedBranch,
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to assign manager',
    });
  }
};

/**
 * Get branch statistics
 * GET /api/manager/branch/statistics
 */
export const getBranchStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const statistics = await BranchService.getStatistics(req.user.branchId);

    res.status(200).json({
      success: true,
      code: 200,
      data: statistics,
    });
  } catch (error) {
    console.error('Get branch statistics error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch branch statistics',
    });
  }
};
