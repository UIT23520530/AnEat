import apiClient from "@/lib/api-client";

export type TemplateCategory = "INVOICE" | "ORDER" | "RECEIPT" | "REPORT";
export type TemplateStatus = "ACTIVE" | "INACTIVE";

export interface PrintSettings {
  pageSize?: string;
  pageWidth?: string;
  pageHeight?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  contentWidth?: string;
  customCss?: string;
}

export interface TemplateDTO {
  id: string;
  name: string;
  type: string;
  description?: string;
  content: string;
  printSettings?: PrintSettings;
  category: TemplateCategory;
  status: TemplateStatus;
  isDefault: boolean;
  branchId?: string | null;
  branchName?: string;
  createdBy?: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  type: string;
  description?: string;
  content: string;
  printSettings?: PrintSettings;
  category: TemplateCategory;
  status?: TemplateStatus;
  isDefault?: boolean;
  branchId?: string | null;
}

export interface UpdateTemplateDto {
  name?: string;
  type?: string;
  description?: string;
  content?: string;
  printSettings?: PrintSettings;
  category?: TemplateCategory;
  status?: TemplateStatus;
  isDefault?: boolean;
  branchId?: string | null;
}

export interface TemplateFilters {
  search?: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  branchId?: string | null;
  isDefault?: boolean;
}

export interface TemplateStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: {
    invoice: number;
    order: number;
    receipt: number;
    report: number;
  };
}

class AdminTemplateService {
  private baseUrl = "/admin/templates";

  async getAll(
    filters?: TemplateFilters,
    page: number = 1,
    limit: number = 20,
    sort: string = "-createdAt"
  ): Promise<{ data: TemplateDTO[]; meta: any }> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("sort", sort);

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.category) {
      params.append("category", filters.category);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.branchId !== undefined) {
      params.append("branchId", filters.branchId || "null");
    }
    if (filters?.isDefault !== undefined) {
      params.append("isDefault", filters.isDefault.toString());
    }

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getById(id: string): Promise<TemplateDTO> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async create(data: CreateTemplateDto): Promise<TemplateDTO> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateTemplateDto): Promise<TemplateDTO> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async duplicate(id: string): Promise<TemplateDTO> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`);
    return response.data.data;
  }

  async getDefaultTemplate(category: TemplateCategory, branchId?: string): Promise<TemplateDTO> {
    const params = branchId ? `?branchId=${branchId}` : "";
    const response = await apiClient.get(`${this.baseUrl}/default/${category}${params}`);
    return response.data.data;
  }

  async getStats(branchId?: string): Promise<TemplateStats> {
    const params = branchId ? `?branchId=${branchId}` : "";
    const response = await apiClient.get(`${this.baseUrl}/stats${params}`);
    return response.data.data;
  }
}

export const adminTemplateService = new AdminTemplateService();
