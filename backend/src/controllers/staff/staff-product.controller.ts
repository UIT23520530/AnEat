import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../models/product.service';

/**
 * @desc    Get available products for order page (with pagination)
 * @route   GET /api/v1/staff/order/products
 * @access  Staff only
 */
export const getOrderProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20,
      search,
      categoryId,
      sort = 'name',
      order = 'asc'
    } = req.query;

    // Get branchId from authenticated user
    const branchId = (req as any).user?.branchId;

    const params = {
      page: Number(page),
      limit: Math.min(Number(limit), 100), // Max 100 items
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string | undefined,
      categoryId: categoryId as string | undefined,
      branchId: branchId as string | undefined,
    };

    const result = await ProductService.getAvailableProducts(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách sản phẩm thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product detail with options
 * @route   GET /api/v1/staff/order/products/:id
 * @access  Staff only
 */
export const getOrderProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).user?.branchId;

    const product = await ProductService.getProductDetailForOrder(id, branchId);

    if (!product) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy sản phẩm hoặc sản phẩm không khả dụng',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy thông tin sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get products by category (quick filter)
 * @route   GET /api/v1/staff/order/products/category/:categoryId
 * @access  Staff only
 */
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, search } = req.query;
    const branchId = (req as any).user?.branchId;

    const params = {
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      sort: 'name',
      order: 'asc' as 'asc' | 'desc',
      categoryId,
      branchId: branchId as string | undefined,
      search: search as string | undefined,
    };

    const result = await ProductService.getAvailableProducts(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Lấy danh sách sản phẩm theo danh mục thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
