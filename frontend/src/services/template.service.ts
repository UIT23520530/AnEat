import apiClient from "@/lib/api-client";

export enum TemplateCategory {
  INVOICE = "INVOICE",
  ORDER = "ORDER",
  RECEIPT = "RECEIPT",
  REPORT = "REPORT",
}

export enum TemplateStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Template {
  id: string;
  name: string;
  type: string;
  description?: string;
  content: string;
  category: TemplateCategory;
  status: TemplateStatus;
  isDefault: boolean;
  branchId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilters {
  search?: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  branchId?: string | null;
  isDefault?: boolean;
}

export interface CreateTemplateInput {
  name: string;
  type: string;
  description?: string;
  content: string;
  category: TemplateCategory;
  status?: TemplateStatus;
  isDefault?: boolean;
  branchId?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  type?: string;
  description?: string;
  content?: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  isDefault?: boolean;
}

export interface TemplateListResponse {
  success: boolean;
  code: number;
  data: Template[];
  meta: {
    current_page: number;
    total_pages: number;
    limit: number;
    total_items: number;
  };
}

export interface TemplateResponse {
  success: boolean;
  code: number;
  data: Template;
  message?: string;
}

export const templateService = {
  /**
   * Get all templates with filters, pagination, sorting
   */
  async getAll(
    filters?: TemplateFilters,
    page: number = 1,
    limit: number = 20,
    sort: string = "-createdAt"
  ): Promise<TemplateListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.branchId !== undefined) {
      params.append("branchId", filters.branchId || "null");
    }
    if (filters?.isDefault !== undefined) {
      params.append("isDefault", filters.isDefault.toString());
    }

    const response = await apiClient.get(`/manager/templates?${params.toString()}`);
    return response.data;
  },

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<TemplateResponse> {
    const response = await apiClient.get(`/manager/templates/${id}`);
    return response.data;
  },

  /**
   * Create new template
   */
  async create(input: CreateTemplateInput): Promise<TemplateResponse> {
    const response = await apiClient.post("/manager/templates", input);
    return response.data;
  },

  /**
   * Update template
   */
  async update(id: string, input: UpdateTemplateInput): Promise<TemplateResponse> {
    const response = await apiClient.put(`/manager/templates/${id}`, input);
    return response.data;
  },

  /**
   * Delete template (soft delete)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/manager/templates/${id}`);
    return response.data;
  },

  /**
   * Duplicate template
   */
  async duplicate(id: string): Promise<TemplateResponse> {
    const response = await apiClient.post(`/manager/templates/${id}/duplicate`);
    return response.data;
  },

  /**
   * Get default template for a category
   */
  async getDefault(
    category: TemplateCategory,
    branchId?: string
  ): Promise<TemplateResponse> {
    const params = branchId ? `?branchId=${branchId}` : "";
    const response = await apiClient.get(`/manager/templates/default/${category}${params}`);
    return response.data;
  },
};
