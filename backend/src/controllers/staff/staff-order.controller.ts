import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../../models/category.service';

/**
 * @desc    Get all active categories for order page (with pagination)
 * @route   GET /api/v1/staff/order/categories
 * @access  Staff only
 */
export const getOrderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 50,
      search,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const params = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string | undefined,
    };

    const result = await CategoryService.getActiveCategories(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách danh mục thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active categories (no pagination)
 * @route   GET /api/v1/staff/order/categories/all
 * @access  Staff only
 */
export const getAllOrderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CategoryService.getAllActiveCategories();

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy tất cả danh mục thành công',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active category by ID
 * @route   GET /api/v1/staff/order/categories/:id
 * @access  Staff only
 */
export const getOrderCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await CategoryService.getActiveCategoryById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy danh mục hoặc danh mục không khả dụng',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thông tin danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
