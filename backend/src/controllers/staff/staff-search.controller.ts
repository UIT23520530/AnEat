import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../../models/search.service';

/**
 * @desc    Unified search across categories and products
 * @route   GET /api/v1/staff/order/search
 * @access  Staff only
 */
export const searchAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      q,
      page = 1, 
      limit = 20,
    } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Vui lòng nhập từ khóa tìm kiếm',
        data: null,
      });
      return;
    }

    const branchId = (req as any).user?.branchId;

    const params = {
      query: q.trim(),
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      branchId: branchId as string | undefined,
    };

    const result = await SearchService.searchAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Tìm kiếm thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick search for autocomplete/suggestions
 * @route   GET /api/v1/staff/order/search/quick
 * @access  Staff only
 */
export const quickSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(200).json({
        success: true,
        code: 200,
        message: 'Không có từ khóa tìm kiếm',
        data: {
          categories: [],
          products: [],
        },
      });
      return;
    }

    const branchId = (req as any).user?.branchId;

    const result = await SearchService.quickSearch(q.trim(), branchId);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Tìm kiếm nhanh thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
