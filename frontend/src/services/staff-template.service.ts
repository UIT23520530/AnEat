import apiClient from "@/lib/api-client";
import { TemplateResponse } from "./template.service";

export enum TemplateCategory {
    INVOICE = "INVOICE",
    ORDER = "ORDER",
    RECEIPT = "RECEIPT",
    REPORT = "REPORT",
}

export const staffTemplateService = {
    /**
     * Get default template for a category (staff view)
     */
    async getDefaultTemplate(
        category: TemplateCategory
    ): Promise<TemplateResponse> {
        const response = await apiClient.get(`/staff/templates/default/${category}`);
        return response.data;
    },
};
