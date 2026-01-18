import apiClient from "@/lib/api-client";

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  badge?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  imageUrl: string;
  title?: string;
  description?: string;
  badge?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateBannerData {
  imageUrl?: string;
  title?: string;
  description?: string;
  badge?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const bannerService = {
  /**
   * Get all banners (admin)
   */
  async getAllBanners(isActive?: boolean): Promise<{ data: Banner[] }> {
    const params: any = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    const response = await apiClient.get("/admin/banners", { params });
    return response.data;
  },

  /**
   * Get active banners (public)
   */
  async getActiveBanners(): Promise<{ data: Banner[] }> {
    const response = await apiClient.get("/banners");
    return response.data;
  },

  /**
   * Get banner by ID
   */
  async getBannerById(id: string): Promise<{ data: Banner }> {
    const response = await apiClient.get(`/admin/banners/${id}`);
    return response.data;
  },

  /**
   * Create banner
   */
  async createBanner(data: CreateBannerData): Promise<{ data: Banner }> {
    const response = await apiClient.post("/admin/banners", data);
    return response.data;
  },

  /**
   * Update banner
   */
  async updateBanner(id: string, data: UpdateBannerData): Promise<{ data: Banner }> {
    const response = await apiClient.put(`/admin/banners/${id}`, data);
    return response.data;
  },

  /**
   * Delete banner
   */
  async deleteBanner(id: string): Promise<void> {
    await apiClient.delete(`/admin/banners/${id}`);
  },

  /**
   * Reorder banners
   */
  async reorderBanners(bannerIds: string[]): Promise<void> {
    await apiClient.post("/admin/banners/reorder", { bannerIds });
  },

  /**
   * Toggle banner status
   */
  async toggleBannerStatus(id: string): Promise<{ data: Banner }> {
    const response = await apiClient.patch(`/admin/banners/${id}/toggle`);
    return response.data;
  },
};
