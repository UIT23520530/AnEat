
import { Request, Response } from "express";
import { TemplateService, TemplateFilters } from "../../models/template.service";
import { TemplateCategory, TemplateStatus } from "@prisma/client";

/**
 * Helper to map template (same as admin controller)
 */
const mapTemplateResponse = (template: any) => {
    return {
        ...template,
        branchName: template.branch?.name || null,
        creatorName: template.creator?.name || null,
    };
};

/**
 * Get manager template statistics
 * Managers see stats for: Global templates + Their Branch templates
 */
export const getManagerTemplateStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const branchId = req.user?.branchId; // Guaranteed by auth middleware for Manager logic usually

        if (!branchId) {
            // Should not happen if middleware is correct for manager routes
            res.status(400).json({
                success: false,
                code: 400,
                message: "Không xác định được chi nhánh của quản lý",
            });
            return;
        }

        // Reuse getAllTemplates logic from Service which handles "My Branch OR System"
        const filters: TemplateFilters = {
            branchId: branchId,
        };

        // We fetch a larger limit to calculate stats in memory or use count queries.
        // TemplateService doesn't have a specific getStats method that does grouping effectively with the OR condition easily exposing it.
        // We'll mimic the Admin controller approach: fetch all (limit high) and count.
        const result = await TemplateService.getAllTemplates(filters, 1, 10000, "-createdAt");
        const templates = result.data;

        const stats = {
            total: templates.length,
            active: templates.filter(t => t.status === "ACTIVE").length,
            inactive: templates.filter(t => t.status === "INACTIVE").length,
            byCategory: {
                invoice: templates.filter(t => t.category === "INVOICE").length,
                order: templates.filter(t => t.category === "ORDER").length,
                receipt: templates.filter(t => t.category === "RECEIPT").length,
                report: templates.filter(t => t.category === "REPORT").length,
            },
        };

        res.status(200).json({
            success: true,
            code: 200,
            data: stats,
        });
    } catch (error: any) {
        console.error("Get manager template stats error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi lấy thống kê template",
            error: error.message,
        });
    }
};

/**
 * Get all templates for manager (Global + Branch)
 */
export const getManagerTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        const branchId = req.user?.branchId;
        if (!branchId) {
            res.status(400).json({
                success: false,
                code: 400,
                message: "Không xác định được chi nhánh của quản lý",
            });
            return;
        }

        const {
            page = "1",
            limit = "20",
            sort = "-createdAt",
            search,
            category,
            status,
            // branchId param from query currently implies filtering options? 
            // Admin controller allows passing it.
            // Manager might want to filter "System Only" (branchId="null")
        } = req.query;

        const filters: TemplateFilters = {
            branchId: branchId // Default to "My Branch + System"
        };

        if (search && typeof search === "string") filters.search = search;
        if (category && typeof category === "string") filters.category = category as TemplateCategory;
        if (status && typeof status === "string") filters.status = status as TemplateStatus;

        // If frontend explicitly asks for "System Only" by sending branchId="null"
        // We override the default "My Branch + System" behavior to "System Only"
        // CAUTION: TemplateService logic:
        // If filters.branchId is set, it does OR query.
        // If filters.branchId is explicitly empty string or somehow falsy but not undefined?, it does where.branchId = null.
        // We need to pass empty string to trigger "System Only" in TemplateService if that's the intention.

        if (req.query.branchId === "null") {
            filters.branchId = ""; // Trick TemplateService to use where.branchId = null
        }
        // If req.query.branchId is the manager's branch ID, it loops back to default.

        // NOTE: If manager wants "My Branch Only", TemplateService DOES NOT support it cleanly via existing params
        // (it always includes NULL when branchId is present). 
        // We will rely on Client Side filtering for "My Branch Only" or add logic to Service later if needed.
        // For now, consistent with Admin controller approach.

        const result = await TemplateService.getAllTemplates(
            filters,
            parseInt(page as string),
            parseInt(limit as string),
            sort as string
        );

        res.status(200).json({
            success: true,
            code: 200,
            data: result.data.map(mapTemplateResponse),
            meta: result.meta,
        });
    } catch (error: any) {
        console.error("Get manager templates error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi lấy danh sách mẫu",
            error: error.message,
        });
    }
};

/**
 * Get manager template by ID
 */
export const getManagerTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const branchId = req.user?.branchId;

        const template = await TemplateService.getTemplateById(id);

        if (!template) {
            res.status(404).json({
                success: false,
                code: 404,
                message: "Không tìm thấy mẫu",
            });
            return;
        }

        // Authorization:
        // Manager can view if: Template is System (branchId=null) OR Template is Mine (branchId=myBranch)
        if (template.branchId && template.branchId !== branchId) {
            res.status(403).json({
                success: false,
                code: 403,
                message: "Bạn không có quyền truy cập mẫu này",
            });
            return;
        }

        res.status(200).json({
            success: true,
            code: 200,
            data: mapTemplateResponse(template),
        });
    } catch (error: any) {
        console.error("Get manager template by ID error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi lấy thông tin mẫu",
            error: error.message,
        });
    }
};

/**
 * Create template (Scoped to Manager's Branch)
 */
export const createManagerTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, type, description, content, category, status, isDefault } = req.body;
        const userId = (req as any).user?.id;
        const branchId = req.user?.branchId;

        if (!branchId) {
            res.status(400).json({ success: false, code: 400, message: "Missing branch context" });
            return;
        }

        if (!name || !type || !content || !category) {
            res.status(400).json({
                success: false,
                code: 400,
                message: "Thiếu thông tin bắt buộc: name, type, content, category",
            });
            return;
        }

        const template = await TemplateService.createTemplate({
            name,
            type,
            description,
            content,
            category,
            status,
            isDefault,
            branchId: branchId || undefined, // Enforce Manager's Branch
            createdBy: userId,
        });

        res.status(201).json({
            success: true,
            code: 201,
            message: "Tạo mẫu thành công",
            data: mapTemplateResponse(template),
        });
    } catch (error: any) {
        console.error("Create manager template error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi tạo mẫu",
            error: error.message,
        });
    }
};

/**
 * Update template (Rights: Only if it belongs to Manager's Branch)
 */
export const updateManagerTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, type, description, content, category, status, isDefault } = req.body;
        const branchId = req.user?.branchId;

        const existingTemplate = await TemplateService.getTemplateById(id);
        if (!existingTemplate) {
            res.status(404).json({ success: false, code: 404, message: "Không tìm thấy mẫu" });
            return;
        }

        // STRICT CHECK: Can only update OWN branch templates
        if (existingTemplate.branchId !== branchId) {
            // Even if it's null (System), manager cannot edit.
            res.status(403).json({
                success: false,
                code: 403,
                message: "Bạn không có quyền chỉnh sửa mẫu này (chỉ được sửa mẫu của chi nhánh mình)",
            });
            return;
        }

        const template = await TemplateService.updateTemplate(id, {
            name,
            type,
            description,
            content,
            category,
            status,
            isDefault,
            branchId: branchId, // Ensure it stays in branch
        });

        res.status(200).json({
            success: true,
            code: 200,
            message: "Cập nhật mẫu thành công",
            data: mapTemplateResponse(template),
        });
    } catch (error: any) {
        console.error("Update manager template error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi cập nhật mẫu",
            error: error.message,
        });
    }
};

/**
 * Delete template (Rights: Only if it belongs to Manager's Branch)
 */
export const deleteManagerTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const branchId = req.user?.branchId;

        const existingTemplate = await TemplateService.getTemplateById(id);
        if (!existingTemplate) {
            res.status(404).json({ success: false, code: 404, message: "Không tìm thấy mẫu" });
            return;
        }

        if (existingTemplate.branchId !== branchId) {
            res.status(403).json({
                success: false,
                code: 403,
                message: "Bạn không có quyền xóa mẫu này",
            });
            return;
        }

        await TemplateService.deleteTemplate(id);

        res.status(200).json({
            success: true,
            code: 200,
            message: "Xóa mẫu thành công",
        });
    } catch (error: any) {
        console.error("Delete manager template error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi xóa mẫu",
            error: error.message,
        });
    }
};

/**
 * Duplicate template (Override: Always create copy in Manager's Branch)
 */
export const duplicateManagerTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const branchId = req.user?.branchId;

        const sourceTemplate = await TemplateService.getTemplateById(id);
        if (!sourceTemplate) {
            res.status(404).json({ success: false, code: 404, message: "Không tìm thấy mẫu gốc" });
            return;
        }

        // Check visibility (can view system or own branch)
        if (sourceTemplate.branchId && sourceTemplate.branchId !== branchId) {
            res.status(403).json({ success: false, code: 403, message: "Không có quyền truy cập mẫu này" });
            return;
        }

        // CREATE NEW COPY manually to ensure branchId is set to MANAGER'S BRANCH
        // We cannot use TemplateService.duplicateTemplate because it copies the old branchId
        const newTemplate = await TemplateService.createTemplate({
            name: `${sourceTemplate.name} (Copy)`,
            type: sourceTemplate.type,
            description: sourceTemplate.description || "",
            content: sourceTemplate.content,
            category: sourceTemplate.category,
            status: sourceTemplate.status,
            isDefault: false,
            branchId: branchId || undefined, // ASSIGN TO CURRENT BRANCH
            createdBy: userId
        });

        res.status(201).json({
            success: true,
            code: 201,
            message: "Sao chép mẫu thành công",
            data: mapTemplateResponse(newTemplate),
        });
    } catch (error: any) {
        console.error("Duplicate manager template error:", error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Lỗi khi sao chép mẫu",
            error: error.message,
        });
    }
};
