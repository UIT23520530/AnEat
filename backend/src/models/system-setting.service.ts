import { prisma } from '../db';
import { SystemSetting } from '@prisma/client';

interface SystemSettingFilters {
  category?: string;
  isPublic?: boolean;
}

interface CreateSettingData {
  key: string;
  value: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

interface UpdateSettingData {
  value?: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export class SystemSettingService {
  /**
   * Get all system settings with filters
   */
  static async getAllSettings(filters: SystemSettingFilters = {}): Promise<SystemSetting[]> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    return settings;
  }

  /**
   * Get public settings only
   */
  static async getPublicSettings(): Promise<SystemSetting[]> {
    return this.getAllSettings({ isPublic: true });
  }

  /**
   * Get settings by category
   */
  static async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return this.getAllSettings({ category });
  }

  /**
   * Get setting by key
   */
  static async getSettingByKey(key: string): Promise<SystemSetting | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting;
  }

  /**
   * Get setting value by key
   */
  static async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.getSettingByKey(key);
    return setting ? setting.value : null;
  }

  /**
   * Create or update setting (upsert)
   */
  static async upsertSetting(data: CreateSettingData): Promise<SystemSetting> {
    const setting = await prisma.systemSetting.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        value: data.value,
        type: data.type ?? 'text',
        category: data.category,
        description: data.description,
        isPublic: data.isPublic ?? true,
      },
      update: {
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic,
      },
    });

    return setting;
  }

  /**
   * Update setting by key
   */
  static async updateSetting(key: string, data: UpdateSettingData): Promise<SystemSetting> {
    const setting = await prisma.systemSetting.update({
      where: { key },
      data,
    });

    return setting;
  }

  /**
   * Delete setting by key
   */
  static async deleteSetting(key: string): Promise<void> {
    await prisma.systemSetting.delete({
      where: { key },
    });
  }

  /**
   * Bulk upsert settings
   */
  static async bulkUpsertSettings(
    settings: Array<{ key: string; value: string; type?: string; category?: string }>
  ): Promise<void> {
    const upsertPromises = settings.map((setting) =>
      this.upsertSetting({
        key: setting.key,
        value: setting.value,
        type: setting.type ?? 'text',
        category: setting.category,
      })
    );

    await Promise.all(upsertPromises);
  }

  /**
   * Get settings as key-value object
   */
  static async getSettingsAsObject(filters: SystemSettingFilters = {}): Promise<Record<string, string>> {
    const settings = await this.getAllSettings(filters);
    const settingsObject: Record<string, string> = {};

    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
  }

  /**
   * Initialize default settings if not exist
   */
  static async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      // General settings
      { key: 'store_name', value: 'AnEat', type: 'text', category: 'general', description: 'Tên cửa hàng' },
      { key: 'store_tagline', value: 'Ngon - Nhanh - Tiện lợi', type: 'text', category: 'general', description: 'Slogan' },
      
      // Contact settings
      { key: 'hotline', value: '1900 6522', type: 'text', category: 'contact', description: 'Số hotline' },
      { key: 'email', value: 'contact@aneat.com', type: 'text', category: 'contact', description: 'Email liên hệ' },
      { key: 'address', value: 'Thủ Dầu Một, Bình Dương', type: 'text', category: 'contact', description: 'Địa chỉ' },
      
      // Social media
      { key: 'facebook_url', value: '', type: 'text', category: 'social', description: 'Link Facebook' },
      { key: 'instagram_url', value: '', type: 'text', category: 'social', description: 'Link Instagram' },
      { key: 'tiktok_url', value: '', type: 'text', category: 'social', description: 'Link TikTok' },
      
      // About us
      { key: 'about_us', value: 'AnEat là chuỗi cửa hàng thức ăn nhanh hàng đầu tại Việt Nam', type: 'text', category: 'about', description: 'Giới thiệu về chúng tôi' },
      
      // Business settings
      { key: 'tax_rate', value: '10', type: 'number', category: 'business', description: 'Thuế VAT (%)' },
      { key: 'delivery_fee', value: '20000', type: 'number', category: 'business', description: 'Phí giao hàng (VND)' },
      { key: 'min_order_amount', value: '50000', type: 'number', category: 'business', description: 'Đơn hàng tối thiểu (VND)' },
      
      // Banner settings
      { key: 'banner_transition_time', value: '5000', type: 'number', category: 'banner', description: 'Thời gian chuyển banner (ms)' },
      { key: 'banner_auto_play', value: 'true', type: 'boolean', category: 'banner', description: 'Tự động chuyển banner' },
    ];

    for (const setting of defaultSettings) {
      const exists = await this.getSettingByKey(setting.key);
      if (!exists) {
        await this.upsertSetting(setting);
      }
    }
  }
}
