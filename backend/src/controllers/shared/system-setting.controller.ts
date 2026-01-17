import { Request, Response } from 'express';
import { SystemSettingService } from '../../models/system-setting.service';

/**
 * Get public settings (public endpoint)
 */
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const filters: any = { isPublic: true };
    if (category) {
      filters.category = category as string;
    }

    const settings = await SystemSettingService.getSettingsAsObject(filters);

    res.status(200).json({
      success: true,
      code: 200,
      data: settings,
    });
  } catch (error: any) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy cài đặt công khai',
      error: error.message,
    });
  }
};
