import { Request, Response } from "express";
import { TemplateService, TemplateFilters } from "../../models/template.service";
import { TemplateCategory, TemplateStatus } from "@prisma/client";

/**
 * Helper to map template with branch relation
 */
const mapTemplateResponse = (template: any) => {
  return {
    ...template,
    branchName: template.branch?.name || null,
    creatorName: template.creator?.name || null,
  };
};

/**
 * Get template statistics
 */
export const getTemplateStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";
    const { branchId } = req.query;
    
    // Get all templates with branch filtering
    const filters: TemplateFilters = {};
    if (isSystemAdmin) {
      // System admin can filter by specific branch or see all
      if (branchId && branchId !== "null") {
        filters.branchId = branchId as string;
      }
    } else {
      // Manager can only see their branch
      filters.branchId = req.user?.branchId || undefined;
    }
    
    const result = await TemplateService.getAllTemplates(filters, 1, 10000, "-createdAt");
    const templates = result.data;
    
    // Calculate stats
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
    return;
  } catch (error: any) {
    console.error("Get template stats error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi lấy thống kê template",
      error: error.message,
    });
    return;
  }
};

/**
 * Get all templates with filters, pagination, sorting
 * Query params: page, limit, sort, search, category, status, branchId, isDefault
 */
export const getAllTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      sort = "-createdAt",
      search,
      category,
      status,
      branchId,
      isDefault,
    } = req.query;

    // Check if user is system admin
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    // Build filters
    const filters: TemplateFilters = {};

    if (search && typeof search === "string") {
      filters.search = search;
    }

    if (category && typeof category === "string") {
      filters.category = category as TemplateCategory;
    }

    if (status && typeof status === "string") {
      filters.status = status as TemplateStatus;
    }

    // Branch filtering: ADMIN_BRAND can only see their branch, ADMIN_SYSTEM can see all
    if (isSystemAdmin) {
      // System admin can filter by branchId or see all
      if (branchId !== undefined) {
        filters.branchId = branchId === "null" ? undefined : (branchId as string);
      }
    } else {
      // Manager (ADMIN_BRAND) can only see their branch
      filters.branchId = req.user?.branchId || undefined;
    }

    if (isDefault !== undefined) {
      filters.isDefault = isDefault === "true";
    }

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
    return;
  } catch (error: any) {
    console.error("Get all templates error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi lấy danh sách mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    const template = await TemplateService.getTemplateById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    // Branch access check: ADMIN_BRAND can only access their branch templates
    if (!isSystemAdmin && template.branchId && template.branchId !== req.user?.branchId) {
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
    return;
  } catch (error: any) {
    console.error("Get template by ID error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi lấy thông tin mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Create new template
 */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, description, content, category, status, isDefault, branchId } =
      req.body;
    const userId = (req as any).user?.id;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    // Branch enforcement: ADMIN_BRAND can only create templates for their branch
    let finalBranchId = branchId;
    if (!isSystemAdmin) {
      finalBranchId = req.user?.branchId;
    }

    // Validation
    if (!name || !type || !content || !category) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Thiếu thông tin bắt buộc: name, type, content, category",
      });
      return;
    }

    // Validate category
    if (!Object.values(TemplateCategory).includes(category)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Category không hợp lệ",
      });
      return;
    }

    // Validate status if provided
    if (status && !Object.values(TemplateStatus).includes(status)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Status không hợp lệ",
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
      branchId: finalBranchId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: "Tạo mẫu thành công",
      data: mapTemplateResponse(template),
    });
    return;
  } catch (error: any) {
    console.error("Create template error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi tạo mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Update template
 */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, description, content, category, status, isDefault, branchId } = req.body;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";
    
    console.log('📝 Update template request:', { id, branchId, body: req.body });

    // Check if template exists and user has access
    const existingTemplate = await TemplateService.getTemplateById(id);
    if (!existingTemplate) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    // Branch access check: ADMIN_BRAND can only update their branch templates
    if (!isSystemAdmin && existingTemplate.branchId && existingTemplate.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: "Bạn không có quyền chỉnh sửa mẫu này",
      });
      return;
    }

    // Validate category if provided
    if (category && !Object.values(TemplateCategory).includes(category)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Category không hợp lệ",
      });
      return;
    }

    // Validate status if provided
    if (status && !Object.values(TemplateStatus).includes(status)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Status không hợp lệ",
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
      branchId,
    });

    if (!template) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: "Cập nhật mẫu thành công",
      data: mapTemplateResponse(template),
    });
    return;
  } catch (error: any) {
    console.error("Update template error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi cập nhật mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Delete template (soft delete)
 */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    // Check if template exists and user has access
    const existingTemplate = await TemplateService.getTemplateById(id);
    if (!existingTemplate) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    // Branch access check: ADMIN_BRAND can only delete their branch templates
    if (!isSystemAdmin && existingTemplate.branchId && existingTemplate.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: "Bạn không có quyền xóa mẫu này",
      });
      return;
    }

    const success = await TemplateService.deleteTemplate(id);

    if (!success) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: "Xóa mẫu thành công",
    });
    return;
  } catch (error: any) {
    console.error("Delete template error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi xóa mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Duplicate template
 */
export const duplicateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    // Check if source template exists and user has access
    const sourceTemplate = await TemplateService.getTemplateById(id);
    if (!sourceTemplate) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    // Branch access check: ADMIN_BRAND can only duplicate their branch templates
    if (!isSystemAdmin && sourceTemplate.branchId && sourceTemplate.branchId !== req.user?.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: "Bạn không có quyền sao chép mẫu này",
      });
      return;
    }

    const template = await TemplateService.duplicateTemplate(id, userId);

    if (!template) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu",
      });
      return;
    }

    res.status(201).json({
      success: true,
      code: 201,
      message: "Sao chép mẫu thành công",
      data: mapTemplateResponse(template),
    });
    return;
  } catch (error: any) {
    console.error("Duplicate template error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi sao chép mẫu",
      error: error.message,
    });
    return;
  }
};

/**
 * Get default template for a category
 */
export const getDefaultTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { branchId } = req.query;
    const isSystemAdmin = req.user?.role === "ADMIN_SYSTEM";

    // Branch enforcement: ADMIN_BRAND can only get default template for their branch
    let finalBranchId = branchId as string | undefined;
    if (!isSystemAdmin) {
      finalBranchId = req.user?.branchId || undefined;
    }

    // Validate category
    if (!Object.values(TemplateCategory).includes(category as TemplateCategory)) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "Category không hợp lệ",
      });
      return;
    }

    const template = await TemplateService.getDefaultTemplate(
      category as TemplateCategory,
      finalBranchId
    );

    if (!template) {
      res.status(404).json({
        success: false,
        code: 404,
        message: "Không tìm thấy mẫu mặc định",
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: mapTemplateResponse(template),
    });
    return;
  } catch (error: any) {
    console.error("Get default template error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Lỗi khi lấy mẫu mặc định",
      error: error.message,
    });
    return;
  }
};
