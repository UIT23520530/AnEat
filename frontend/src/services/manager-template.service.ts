import apiClient from "@/lib/api-client";
import {
    TemplateDTO,
    CreateTemplateDto,
    UpdateTemplateDto,
    TemplateFilters,
    TemplateStats,
    TemplateCategory
} from "./admin-template.service";

class ManagerTemplateService {
    private baseUrl = "/manager/templates";

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
        // Manager might want to filter by "system" (branchId=null) or "branch" (branchId=my_branch)
        // The backend for manager usually returns both. 
        // If we want to filter explicitly:
        if (filters?.branchId !== undefined) {
            params.append("branchId", filters.branchId || "null");
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

    async getStats(branchId?: string): Promise<TemplateStats> {
        // Manager might not need to pass branchId if it's auto-scoped, 
        // but if the API supports filtering "system" vs "branch", we might pass it.
        const params = branchId ? `?branchId=${branchId}` : "";
        const response = await apiClient.get(`${this.baseUrl}/stats${params}`);
        return response.data.data;
    }
}

export const managerTemplateService = new ManagerTemplateService();
