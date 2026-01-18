import { Request, Response } from 'express';
import { BannerService } from '../../models/banner.service';

/**
 * Get all banners
 */
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive } = req.query;

    const filters: any = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const banners = await BannerService.getAllBanners(filters);

    res.status(200).json({
      success: true,
      code: 200,
      data: banners,
    });
  } catch (error: any) {
    console.error('Get all banners error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách banner',
      error: error.message,
    });
  }
};

/**
 * Get active banners (public)
 */
export const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await BannerService.getActiveBanners();

    res.status(200).json({
      success: true,
      code: 200,
      data: banners,
    });
  } catch (error: any) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách banner',
      error: error.message,
    });
  }
};

/**
 * Get banner by ID
 */
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await BannerService.getBannerById(id);

    if (!banner) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy banner',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: banner,
    });
  } catch (error: any) {
    console.error('Get banner by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy thông tin banner',
      error: error.message,
    });
  }
};

/**
 * Create new banner
 */
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, title, description, badge, displayOrder, isActive } = req.body;

    const banner = await BannerService.createBanner({
      imageUrl,
      title,
      description,
      badge,
      displayOrder,
      isActive,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Tạo banner thành công',
      data: banner,
    });
  } catch (error: any) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi tạo banner',
      error: error.message,
    });
  }
};

/**
 * Update banner
 */
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl, title, description, badge, displayOrder, isActive } = req.body;

    const banner = await BannerService.updateBanner(id, {
      imageUrl,
      title,
      description,
      badge,
      displayOrder,
      isActive,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật banner thành công',
      data: banner,
    });
  } catch (error: any) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật banner',
      error: error.message,
    });
  }
};

/**
 * Delete banner
 */
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await BannerService.deleteBanner(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Xóa banner thành công',
    });
  } catch (error: any) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi xóa banner',
      error: error.message,
    });
  }
};

/**
 * Reorder banners
 */
export const reorderBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bannerIds } = req.body;

    if (!Array.isArray(bannerIds)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'bannerIds phải là một mảng',
      });
      return;
    }

    await BannerService.reorderBanners(bannerIds);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Sắp xếp lại banner thành công',
    });
  } catch (error: any) {
    console.error('Reorder banners error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi sắp xếp lại banner',
      error: error.message,
    });
  }
};

/**
 * Toggle banner status
 */
export const toggleBannerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await BannerService.toggleBannerStatus(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: `Banner đã được ${banner.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      data: banner,
    });
  } catch (error: any) {
    console.error('Toggle banner status error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi thay đổi trạng thái banner',
      error: error.message,
    });
  }
};
