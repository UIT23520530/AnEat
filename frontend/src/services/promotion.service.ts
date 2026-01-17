import apiClient from "@/lib/api-client";

export interface Promotion {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiryDate?: string;
  minOrderAmount?: number;
  applicableProducts?: string;
  branchId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionsResponse {
  success: boolean;
  code: number;
  data: Promotion[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface PromotionResponse {
  success: boolean;
  code: number;
  data: Promotion;
  message?: string;
}

export interface CreatePromotionDto {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxUses?: number;
  isActive: boolean;
  expiryDate?: string;
  minOrderAmount?: number;
  applicableProducts?: string;
}

export interface UpdatePromotionDto {
  code?: string;
  type?: "PERCENTAGE" | "FIXED";
  value?: number;
  maxUses?: number;
  isActive?: boolean;
  expiryDate?: string;
  minOrderAmount?: number;
  applicableProducts?: string;
}

export interface PromotionStatistics {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  totalUses: number;
}

export interface PromotionStatisticsResponse {
  success: boolean;
  code: number;
  data: PromotionStatistics;
}

export const promotionService = {
  async getPromotions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    type?: "PERCENTAGE" | "FIXED";
    search?: string;
  }): Promise<PromotionsResponse> {
    const response = await apiClient.get("/promotions", { params });
    return response.data;
  },

  async getPromotionById(id: string): Promise<PromotionResponse> {
    const response = await apiClient.get(`/promotions/${id}`);
    return response.data;
  },

  async validatePromotionCode(code: string): Promise<PromotionResponse> {
    const response = await apiClient.get(`/promotions/validate/${code}`);
    return response.data;
  },

  async createPromotion(data: CreatePromotionDto): Promise<PromotionResponse> {
    const response = await apiClient.post("/promotions", data);
    return response.data;
  },

  async updatePromotion(
    id: string,
    data: UpdatePromotionDto
  ): Promise<PromotionResponse> {
    const response = await apiClient.put(`/promotions/${id}`, data);
    return response.data;
  },

  async deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/promotions/${id}`);
    return response.data;
  },

  async getStatistics(): Promise<PromotionStatisticsResponse> {
    const response = await apiClient.get("/promotions/statistics");
    return response.data;
  },
};
