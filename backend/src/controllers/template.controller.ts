import { Request, Response } from "express";
import { TemplateService, TemplateFilters } from "../models/template.service";
import { TemplateCategory, TemplateStatus } from "@prisma/client";

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

    if (branchId !== undefined) {
      filters.branchId = branchId === "null" ? undefined : (branchId as string);
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
      data: result.data,
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

    const template = await TemplateService.getTemplateById(id);

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
      data: template,
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
      branchId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: "Tạo mẫu thành công",
      data: template,
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
    const { name, type, description, content, category, status, isDefault } = req.body;

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
      data: template,
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
      data: template,
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
      branchId as string | undefined
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
      data: template,
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
