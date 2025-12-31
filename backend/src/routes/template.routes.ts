import { Router } from "express";
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  getDefaultTemplate,
} from "../controllers/admin/template.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication and ADMIN_BRAND role
router.use(authenticate);
router.use(authorize("ADMIN_BRAND"));

/**
 * GET /api/v1/manager/templates
 * Get all templates with filters, pagination, sorting
 * Query params: page, limit, sort, search, category, status, branchId, isDefault
 */
router.get("/", getAllTemplates);

/**
 * GET /api/v1/manager/templates/default/:category
 * Get default template for a category
 * Params: category (INVOICE|ORDER|RECEIPT|REPORT)
 * Query: branchId (optional)
 */
router.get("/default/:category", getDefaultTemplate);

/**
 * GET /api/v1/manager/templates/:id
 * Get template by ID
 */
router.get("/:id", getTemplateById);

/**
 * POST /api/v1/manager/templates
 * Create new template
 * Body: name, type, description?, content, category, status?, isDefault?, branchId?
 */
router.post("/", createTemplate);

/**
 * PUT /api/v1/manager/templates/:id
 * Update template
 * Body: name?, type?, description?, content?, category?, status?, isDefault?
 */
router.put("/:id", updateTemplate);

/**
 * DELETE /api/v1/manager/templates/:id
 * Delete template (soft delete)
 */
router.delete("/:id", deleteTemplate);

/**
 * POST /api/v1/manager/templates/:id/duplicate
 * Duplicate template
 */
router.post("/:id/duplicate", duplicateTemplate);

export default router;
