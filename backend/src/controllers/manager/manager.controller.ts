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
    // Only ADMIN_BRAND needs branchId check
    // ADMIN_SYSTEM can access any staff
    if (req.user?.role === UserRole.ADMIN_BRAND && !req.user?.branchId) {
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

    // Check if staff belongs to manager's branch (only for ADMIN_BRAND)
    if (req.user?.role === UserRole.ADMIN_BRAND && staff.branch?.id !== req.user.branchId) {
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
    // Only ADMIN_BRAND needs branchId check
    // ADMIN_SYSTEM can create staff for any branch if branchId is provided
    if (req.user?.role === UserRole.ADMIN_BRAND && !req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { email, password, name, phone, branchId } = req.body;

    // Debug logging
    console.log('🔐 Creating staff with password:', { 
      email, 
      passwordLength: password?.length,
      passwordPreview: password?.substring(0, 3) + '***'
    });

    // Determine which branchId to use
    // ADMIN_SYSTEM can specify branchId, ADMIN_BRAND uses their own branchId
    const finalBranchId = req.user?.role === UserRole.ADMIN_SYSTEM 
      ? (branchId || req.user?.branchId) 
      : req.user?.branchId;

    if (!finalBranchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Branch ID is required',
      });
      return;
    }

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
    console.log('🔐 Password hashed successfully:', {
      originalLength: password.length,
      hashedLength: hashedPassword.length,
      hashedStart: hashedPassword.substring(0, 10)
    });

    // Create staff
    const staff = await StaffService.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: UserRole.STAFF,
      branchId: finalBranchId,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Staff created successfully',
      data: {
        ...staff,
        password: password, // Return plain password only once for display
      },
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
    const { name, email, phone, role, isActive, password } = req.body;

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

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    try {
      // Update staff
      const staff = await StaffService.update(id, {
        name,
        email,
        phone,
        role,
        isActive,
        password: hashedPassword,
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
    // Only ADMIN_BRAND needs branchId check
    // ADMIN_SYSTEM can delete any staff
    if (req.user?.role === UserRole.ADMIN_BRAND && !req.user?.branchId) {
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

    // Check if staff belongs to manager's branch (only for ADMIN_BRAND)
    if (req.user?.role === UserRole.ADMIN_BRAND && existingStaff.branch?.id !== req.user.branchId) {
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

// ==================== CATEGORY MANAGEMENT ====================

/**
 * Get category list for manager
 */
export const getCategoryList = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      isActive
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          [sort as string]: order,
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  branchId: req.user?.branchId || undefined
                }
              }
            },
          },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    // Format response to match Expected Category DTO
    const formattedCategories = categories.map((cat: any) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Category list retrieved successfully',
      data: formattedCategories,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get manager category list error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch category list',
    });
  }
};

/**
 * Get category statistics for manager's branch
 */
export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.branchId;
    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID required' });
      return;
    }

    const [totalCategories, activeCategories, totalProducts] = await Promise.all([
      prisma.productCategory.count(),
      prisma.productCategory.count({ where: { isActive: true } }),
      prisma.product.count({ where: { branchId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        totalProducts,
        // Add more stats if needed
      },
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

/**
 * Create new category (Manager)
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, image } = req.body;

    const existingCategory = await prisma.productCategory.findUnique({
      where: { code },
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category code already exists',
      });
      return;
    }

    const category = await prisma.productCategory.create({
      data: {
        code,
        name,
        description,
        image,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

/**
 * Update category (Manager)
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name,
        description,
        image,
        isActive,
      },
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

/**
 * Toggle category visibility for branch
 * "ẩn món này ở cửa hàng, không phải toàn bộ hệ thống như admin"
 */
export const toggleCategoryVisibilityForBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const branchId = req.user?.branchId;

    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID required' });
      return;
    }

    // Update all products in this category for this branch
    await prisma.product.updateMany({
      where: {
        categoryId: id,
        branchId: branchId,
      },
      data: {
        isAvailable: isActive,
      },
    });

    res.status(200).json({
      success: true,
      message: `Updated all products in category to ${isActive ? 'available' : 'unavailable'} for this branch`,
    });
  } catch (error) {
    console.error('Toggle category visibility error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle visibility' });
  }
};

/**
 * Delete category (Manager)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if any products exist in this category GLOBALLY
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products',
      });
      return;
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// ==================== PRODUCT MANAGEMENT ====================

/**
 * Get product list for manager's branch
 */
export const getProductList = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.branchId;
    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID required' });
      return;
    }

    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      categoryId,
      status
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      branchId: branchId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (status === 'available') {
      where.isAvailable = true;
      where.quantity = { gt: 10 };
    } else if (status === 'low-stock') {
      where.isAvailable = true;
      where.quantity = { gt: 0, lte: 10 };
    } else if (status === 'out-of-stock') {
      where.quantity = 0;
    } else if (status === 'hidden') {
      where.isAvailable = false;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          [sort as string]: order,
        },
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get manager product list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * Get product by ID (scoped to branch)
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId;

    const product = await prisma.product.findFirst({
      where: {
        id,
        branchId: branchId || undefined,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

/**
 * Create product (auto-assign branchId)
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.branchId;
    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID required' });
      return;
    }

    const {
      code,
      name,
      description,
      price,
      image,
      categoryId,
      quantity,
      costPrice,
      prepTime,
      isAvailable
    } = req.body;

    // Convert price to cents if needed, but assuming frontend sends correct format or controller handles it
    // Usually admin-product.service.ts mentions converting to cents

    const existingProduct = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      res.status(400).json({ success: false, message: 'Product code already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        description,
        price,
        image,
        categoryId,
        branchId,
        quantity: quantity || 0,
        costPrice: costPrice || 0,
        prepTime: prepTime || 15,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

/**
 * Update product (scoped to branch)
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId;

    const existingProduct = await prisma.product.findFirst({
      where: { id, branchId: branchId || undefined }
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: 'Product not found in your branch' });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

/**
 * Delete product (scoped to branch)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = req.user?.branchId;

    const existingProduct = await prisma.product.findFirst({
      where: { id, branchId: branchId || undefined }
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: 'Product not found in your branch' });
      return;
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

/**
 * Get product statistics for manager's branch
 */
export const getProductStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user?.branchId;
    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID required' });
      return;
    }

    const [totalProducts, availableProducts, unavailableProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count({ where: { branchId } }),
      prisma.product.count({ where: { branchId, isAvailable: true } }),
      prisma.product.count({ where: { branchId, isAvailable: false } }),
      prisma.product.count({ where: { branchId, isAvailable: true, quantity: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { branchId, quantity: 0 } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        unavailableProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
