import { Request, Response } from 'express';
import { BannerService } from '../../models/banner.service';

/**
 * Get active banners (public endpoint)
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
