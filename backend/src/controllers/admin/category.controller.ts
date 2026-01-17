import { Request, Response } from 'express';
import { prisma } from '../../db';

/**
 * Get all categories (with pagination and filters)
 */
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    console.log('📋 Get all categories request:', {
      page,
      limit,
      search,
      isActive,
    });

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    // Transform to include productCount
    const transformedCategories = categories.map((category) => ({
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }));

    console.log('✅ Categories fetched:', {
      count: categories.length,
      total,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách danh mục thành công',
      data: transformedCategories,
      meta: {
        total_items: total,
        total_pages: Math.ceil(total / take),
        current_page: Number(page),
        page_size: Number(limit),
      },
    });
  } catch (error) {
    console.error('❌ Get all categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách danh mục',
    });
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Get category stats request');

    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
    ] = await Promise.all([
      // Total categories
      prisma.productCategory.count(),
      // Active categories
      prisma.productCategory.count({
        where: { isActive: true },
      }),
      // Inactive categories
      prisma.productCategory.count({
        where: { isActive: false },
      }),
    ]);

    const stats = {
      totalCategories,
      activeCategories,
      inactiveCategories,
    };

    console.log('✅ Category stats fetched:', stats);

    res.status(200).json({
      status: 'success',
      message: 'Lấy thống kê danh mục thành công',
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get category stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thống kê danh mục',
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('📂 Get category by ID request:', { id });

    const category = await prisma.productCategory.findFirst({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      console.log('❌ Category not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục',
      });
      return;
    }

    const transformedCategory = {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    };

    console.log('✅ Category fetched:', { id, name: category.name });

    res.status(200).json({
      status: 'success',
      message: 'Lấy thông tin danh mục thành công',
      data: transformedCategory,
    });
  } catch (error) {
    console.error('❌ Get category by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thông tin danh mục',
    });
  }
};

/**
 * Create new category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, image, isActive = true } = req.body;

    console.log('➕ Create category request:', {
      code,
      name,
      description,
      isActive,
    });

    // Validate required fields
    if (!code || code.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Mã danh mục không được để trống',
      });
      return;
    }

    if (!name || name.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Tên danh mục không được để trống',
      });
      return;
    }

    // Check for duplicate code
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (existingCategory) {
      console.log('❌ Category code already exists:', { code });
      res.status(400).json({
        status: 'error',
        message: 'Mã danh mục đã tồn tại',
      });
      return;
    }

    // Create category
    const newCategory = await prisma.productCategory.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        isActive: Boolean(isActive),
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ Category created:', { id: newCategory.id, name: newCategory.name });

    res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục thành công',
      data: newCategory,
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tạo danh mục',
    });
  }
};

/**
 * Update category
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    console.log('🔄 Update category request:', {
      id,
      updateData: { name, description, isActive },
    });

    // Check if category exists
    const category = await prisma.productCategory.findFirst({
      where: { id },
    });

    if (!category) {
      console.log('❌ Category not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục',
      });
      return;
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Tên danh mục không được để trống',
        });
        return;
      }

      if (name.length > 100) {
        res.status(400).json({
          status: 'error',
          message: 'Tên danh mục không được vượt quá 100 ký tự',
        });
        return;
      }

      // Check for duplicate name (excluding current category)
      const existingCategory = await prisma.productCategory.findFirst({
        where: {
          name: name.trim(),
          id: { not: id },
        },
      });

      if (existingCategory) {
        console.log('❌ Category name already exists:', { name });
        res.status(400).json({
          status: 'error',
          message: 'Tên danh mục đã tồn tại',
        });
        return;
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (image !== undefined) updateData.image = image?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update category
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const transformedCategory = {
      ...updatedCategory,
      productCount: updatedCategory._count.products,
      _count: undefined,
    };

    console.log('✅ Category updated:', { id, name: updatedCategory.name });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục thành công',
      data: transformedCategory,
    });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật danh mục',
    });
  }
};

/**
 * Delete category (soft delete)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🗑️ Delete category request:', { id });

    // Check if category exists
    const category = await prisma.productCategory.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      console.log('❌ Category not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục',
      });
      return;
    }

    // Check if category has products
    if (category._count.products > 0) {
      console.log('❌ Cannot delete category with products:', { 
        id, 
        productCount: category._count.products 
      });
      res.status(400).json({
        status: 'error',
        message: `Không thể xóa danh mục có ${category._count.products} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      });
      return;
    }

    // Hard delete category (no soft delete in schema)
    await prisma.productCategory.delete({
      where: { id },
    });

    console.log('✅ Category deleted (soft):', { id, name: category.name });

    res.status(200).json({
      status: 'success',
      message: 'Xóa danh mục thành công',
    });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể xóa danh mục',
    });
  }
};
