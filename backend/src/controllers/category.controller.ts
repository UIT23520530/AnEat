import { Request, Response } from 'express';
import { CategoryService } from '../models/category.service';

/**
 * Get category list with pagination, sorting and filtering
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

    const params = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };

    const { categories, total } = await CategoryService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Category list retrieved successfully',
      data: categories,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get category list error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch category list',
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await CategoryService.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch category',
    });
  }
};

/**
 * Create new category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, image } = req.body;

    const existingCategory = await CategoryService.findByCode(code);

    if (existingCategory) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Category code already exists',
      });
      return;
    }

    const category = await CategoryService.create({
      code,
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create category',
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

    const existingCategory = await CategoryService.findById(id);

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Category not found',
      });
      return;
    }

    const category = await CategoryService.update(id, {
      name,
      description,
      image,
      isActive,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update category',
    });
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCategory = await CategoryService.findById(id);

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Category not found',
      });
      return;
    }

    const productCount = await CategoryService.countProducts(id);

    if (productCount > 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Cannot delete category with existing products',
      });
      return;
    }

    await CategoryService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete category',
    });
  }
};
