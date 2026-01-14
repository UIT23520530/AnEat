import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// DTO interfaces
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string | null;
  branchId: string | null;
  branch?: {
    id: string;
    code: string;
    name: string;
  } | null;
  managedBranches?: {
    id: string;
    code: string;
    name: string;
  } | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateData {
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId?: string | null;
  isActive?: boolean;
  avatar?: string | null;
}

export interface UserUpdateData {
  name?: string;
  phone?: string;
  role?: UserRole;
  branchId?: string | null;
  isActive?: boolean;
  avatar?: string | null;
  password?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalManagers: number;
  totalStaff: number;
  usersByRole: Record<UserRole, number>;
}

export class UserService {
  /**
   * Generate random password
   */
  static generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Get all users with pagination and filters
   */
  static async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    branchId?: string;
  }): Promise<{ data: UserDTO[]; meta: { total_items: number; total_pages: number; current_page: number; page_size: number } }> {
    const { page = 1, limit = 10, search, role, isActive, branchId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          managedBranches: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users as UserDTO[],
      meta: {
        total_items: total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        page_size: limit,
      },
    };
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        managedBranches: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return user as UserDTO | null;
  }

  /**
   * Create new user
   */
  static async create(data: UserCreateData): Promise<UserDTO> {
    // Generate password if not provided
    const password = data.password || this.generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role,
        branchId: data.branchId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        avatar: data.avatar || null,
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        managedBranches: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return user as UserDTO;
  }

  /**
   * Update user
   */
  static async update(id: string, data: UserUpdateData): Promise<UserDTO> {
    const updateData: any = { ...data };

    // If password is provided, hash it
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        managedBranches: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return user as UserDTO;
  }

  /**
   * Soft delete user
   */
  static async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get users statistics
   */
  static async getStats(): Promise<UserStats> {
    const [totalUsers, activeUsers, usersByRole] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const roleStats: Record<UserRole, number> = {
      ADMIN_SYSTEM: 0,
      ADMIN_BRAND: 0,
      STAFF: 0,
      CUSTOMER: 0,
      LOGISTICS_STAFF: 0,
    };

    usersByRole.forEach((item) => {
      roleStats[item.role] = item._count;
    });

    return {
      totalUsers,
      activeUsers,
      totalManagers: roleStats.ADMIN_BRAND,
      totalStaff: roleStats.STAFF,
      usersByRole: roleStats,
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
