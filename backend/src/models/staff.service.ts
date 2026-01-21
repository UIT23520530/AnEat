import { prisma } from '../db';
import { Prisma, UserRole } from '@prisma/client';

// Types for query parameters
export interface StaffQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  role?: UserRole;
  branchId?: string;
}

// Types for create data
export interface StaffCreateData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  branchId: string;
  isActive?: boolean;
}

// Types for update data
export interface StaffUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

/**
 * Service layer for Staff operations
 * Encapsulates all database access logic
 */
export class StaffService {
  /**
   * Find all staff with pagination, sorting, filtering
   */
  static async findAll(params: StaffQueryParams) {
    const { page, limit, sort, order, search, status, role, branchId } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.UserWhereInput = {
      role: {
        in: [UserRole.STAFF],
      },
    };

    // Filter by branch if provided (for ADMIN_BRAND)
    if (branchId) {
      where.branchId = branchId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sort] = order;

    const [staffs, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { staffs, total };
  }

  /**
   * Find staff by ID
   */
  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Find staff by email
   */
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new staff
   */
  static async create(data: StaffCreateData) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone || '',
        role: data.role,
        branchId: data.branchId,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Update staff
   */
  static async update(id: string, data: StaffUpdateData) {
    // If email is being updated, check if it already exists
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      // If email exists and belongs to a different user, throw error
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    return await prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.password && { password: data.password }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Delete staff (soft delete)
   */
  static async delete(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
