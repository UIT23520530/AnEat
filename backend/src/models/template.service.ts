import { PrismaClient, TemplateCategory, TemplateStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface TemplateFilters {
  search?: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  branchId?: string;
  isDefault?: boolean;
}

export interface TemplateDTO {
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
  createdAt: Date;
  updatedAt: Date;
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
  createdBy?: string;
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

export class TemplateService {
  /**
   * Get all templates with filters, pagination, sorting
   */
  static async getAllTemplates(
    filters: TemplateFilters,
    page: number = 1,
    limit: number = 20,
    sort: string = "-createdAt"
  ) {
    // Build WHERE clause
    const where: any = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { type: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.branchId !== undefined) {
      // null means company-wide, specific ID means branch-specific
      where.branchId = filters.branchId || null;
    }

    if (filters.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    // Parse sort parameter
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith("-") ? "desc" : "asc";

    // Execute query with pagination
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          content: true,
          category: true,
          status: true,
          isDefault: true,
          branchId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.template.count({ where }),
    ]);

    return {
      data: templates as TemplateDTO[],
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        limit,
        total_items: total,
      },
    };
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<TemplateDTO | null> {
    const template = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        content: true,
        category: true,
        status: true,
        isDefault: true,
        branchId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return template as TemplateDTO | null;
  }

  /**
   * Create new template
   */
  static async createTemplate(input: CreateTemplateInput): Promise<TemplateDTO> {
    // If setting as default, unset other defaults in the same category/branch
    if (input.isDefault) {
      await prisma.template.updateMany({
        where: {
          category: input.category,
          branchId: input.branchId || null,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.template.create({
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        content: input.content,
        category: input.category,
        status: input.status || TemplateStatus.ACTIVE,
        isDefault: input.isDefault || false,
        branchId: input.branchId,
        createdBy: input.createdBy,
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        content: true,
        category: true,
        status: true,
        isDefault: true,
        branchId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return template as TemplateDTO;
  }

  /**
   * Update template
   */
  static async updateTemplate(
    id: string,
    input: UpdateTemplateInput
  ): Promise<TemplateDTO | null> {
    // Check if template exists
    const existing = await prisma.template.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    // If setting as default, unset other defaults in the same category/branch
    if (input.isDefault) {
      await prisma.template.updateMany({
        where: {
          category: input.category || existing.category,
          branchId: existing.branchId,
          deletedAt: null,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.template.update({
      where: { id },
      data: input,
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        content: true,
        category: true,
        status: true,
        isDefault: true,
        branchId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return template as TemplateDTO;
  }

  /**
   * Soft delete template
   */
  static async deleteTemplate(id: string): Promise<boolean> {
    const existing = await prisma.template.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(
    id: string,
    userId?: string
  ): Promise<TemplateDTO | null> {
    const existing = await prisma.template.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const template = await prisma.template.create({
      data: {
        name: `${existing.name} (Copy)`,
        type: existing.type,
        description: existing.description,
        content: existing.content,
        category: existing.category,
        status: existing.status,
        isDefault: false, // Never set copy as default
        branchId: existing.branchId,
        createdBy: userId || existing.createdBy,
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        content: true,
        category: true,
        status: true,
        isDefault: true,
        branchId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return template as TemplateDTO;
  }

  /**
   * Get default template for a category and branch
   */
  static async getDefaultTemplate(
    category: TemplateCategory,
    branchId?: string
  ): Promise<TemplateDTO | null> {
    // First try to find branch-specific default
    if (branchId) {
      const branchDefault = await prisma.template.findFirst({
        where: {
          category,
          branchId,
          isDefault: true,
          status: TemplateStatus.ACTIVE,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          content: true,
          category: true,
          status: true,
          isDefault: true,
          branchId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (branchDefault) {
        return branchDefault as TemplateDTO;
      }
    }

    // Fall back to company-wide default
    const companyDefault = await prisma.template.findFirst({
      where: {
        category,
        branchId: null,
        isDefault: true,
        status: TemplateStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        content: true,
        category: true,
        status: true,
        isDefault: true,
        branchId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return companyDefault as TemplateDTO | null;
  }
}
