import { Request, Response } from 'express';
import { SystemSettingService } from '../../models/system-setting.service';

/**
 * Get all system settings
 */
export const getAllSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isPublic } = req.query;

    const filters: any = {};
    if (category) {
      filters.category = category as string;
    }
    if (isPublic !== undefined) {
      filters.isPublic = isPublic === 'true';
    }

    const settings = await SystemSettingService.getAllSettings(filters);

    res.status(200).json({
      success: true,
      code: 200,
      data: settings,
    });
  } catch (error: any) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy danh sách cài đặt',
      error: error.message,
    });
  }
};

/**
 * Get public settings
 */
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SystemSettingService.getPublicSettings();

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

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const settings = await SystemSettingService.getSettingsByCategory(category);

    res.status(200).json({
      success: true,
      code: 200,
      data: settings,
    });
  } catch (error: any) {
    console.error('Get settings by category error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy cài đặt theo danh mục',
      error: error.message,
    });
  }
};

/**
 * Get settings as key-value object
 */
export const getSettingsAsObject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isPublic } = req.query;

    const filters: any = {};
    if (category) {
      filters.category = category as string;
    }
    if (isPublic !== undefined) {
      filters.isPublic = isPublic === 'true';
    }

    const settings = await SystemSettingService.getSettingsAsObject(filters);

    res.status(200).json({
      success: true,
      code: 200,
      data: settings,
    });
  } catch (error: any) {
    console.error('Get settings as object error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy cài đặt',
      error: error.message,
    });
  }
};

/**
 * Get setting by key
 */
export const getSettingByKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const setting = await SystemSettingService.getSettingByKey(key);

    if (!setting) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Không tìm thấy cài đặt',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: setting,
    });
  } catch (error: any) {
    console.error('Get setting by key error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi lấy cài đặt',
      error: error.message,
    });
  }
};

/**
 * Upsert setting
 */
export const upsertSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, type, category, description, isPublic } = req.body;

    const setting = await SystemSettingService.upsertSetting({
      key,
      value,
      type,
      category,
      description,
      isPublic,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật cài đặt thành công',
      data: setting,
    });
  } catch (error: any) {
    console.error('Upsert setting error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật cài đặt',
      error: error.message,
    });
  }
};

/**
 * Update setting by key
 */
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value, type, category, description, isPublic } = req.body;

    const setting = await SystemSettingService.updateSetting(key, {
      value,
      type,
      category,
      description,
      isPublic,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật cài đặt thành công',
      data: setting,
    });
  } catch (error: any) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật cài đặt',
      error: error.message,
    });
  }
};

/**
 * Delete setting
 */
export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    await SystemSettingService.deleteSetting(key);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Xóa cài đặt thành công',
    });
  } catch (error: any) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi xóa cài đặt',
      error: error.message,
    });
  }
};

/**
 * Bulk upsert settings
 */
export const bulkUpsertSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'settings phải là một mảng',
      });
      return;
    }

    await SystemSettingService.bulkUpsertSettings(settings);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Cập nhật nhiều cài đặt thành công',
    });
  } catch (error: any) {
    console.error('Bulk upsert settings error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi cập nhật nhiều cài đặt',
      error: error.message,
    });
  }
};

/**
 * Initialize default settings
 */
export const initializeDefaultSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    await SystemSettingService.initializeDefaultSettings();

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Khởi tạo cài đặt mặc định thành công',
    });
  } catch (error: any) {
    console.error('Initialize default settings error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Lỗi khi khởi tạo cài đặt mặc định',
      error: error.message,
    });
  }
};
