import apiClient from "@/lib/api-client";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  category?: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingData {
  key: string;
  value: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export const systemSettingService = {
  /**
   * Get all settings (admin)
   */
  async getAllSettings(category?: string, isPublic?: boolean): Promise<{ data: SystemSetting[] }> {
    const params: any = {};
    if (category) params.category = category;
    if (isPublic !== undefined) params.isPublic = isPublic;
    const response = await apiClient.get("/admin/settings", { params });
    return response.data;
  },

  /**
   * Get settings as key-value object (admin)
   */
  async getSettingsAsObject(category?: string): Promise<{ data: Record<string, string> }> {
    const params: any = {};
    if (category) params.category = category;
    const response = await apiClient.get("/admin/settings/object", { params });
    return response.data;
  },

  /**
   * Get public settings (public endpoint)
   */
  async getPublicSettings(category?: string): Promise<{ data: Record<string, string> }> {
    const params: any = {};
    if (category) params.category = category;
    const response = await apiClient.get("/settings", { params });
    return response.data;
  },

  /**
   * Get setting by key
   */
  async getSettingByKey(key: string): Promise<{ data: SystemSetting }> {
    const response = await apiClient.get(`/admin/settings/${key}`);
    return response.data;
  },

  /**
   * Upsert setting
   */
  async upsertSetting(data: SettingData): Promise<{ data: SystemSetting }> {
    const response = await apiClient.post("/admin/settings", data);
    return response.data;
  },

  /**
   * Update setting
   */
  async updateSetting(key: string, data: Partial<SettingData>): Promise<{ data: SystemSetting }> {
    const response = await apiClient.put(`/admin/settings/${key}`, data);
    return response.data;
  },

  /**
   * Delete setting
   */
  async deleteSetting(key: string): Promise<void> {
    await apiClient.delete(`/admin/settings/${key}`);
  },

  /**
   * Bulk upsert settings
   */
  async bulkUpsertSettings(settings: SettingData[]): Promise<void> {
    await apiClient.post("/admin/settings/bulk", { settings });
  },

  /**
   * Initialize default settings
   */
  async initializeDefaultSettings(): Promise<void> {
    await apiClient.post("/admin/settings/initialize");
  },
};
