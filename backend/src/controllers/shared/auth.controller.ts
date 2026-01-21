import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db';
import { UserRole } from '@prisma/client';

/**
 * Generate JWT token
 */
const generateToken = (userId: string, email: string, role: UserRole, branchId?: string | null): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign(
    { userId, email, role, branchId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

/**
 * Register new user
 * For CUSTOMER role: Also creates Customer record
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role = UserRole.CUSTOMER } = req.body;

    // Validation
    if (!email || !password || !name || !phone) {
      res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập đầy đủ email, mật khẩu, họ tên và số điện thoại',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'Email này đã được đăng ký',
      });
      return;
    }

    // If registering as CUSTOMER, check if Customer with phone exists
    if (role === UserRole.CUSTOMER) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existingCustomer) {
        res.status(400).json({
          status: 'error',
          message: 'Số điện thoại này đã được đăng ký',
        });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and customer (if CUSTOMER role) in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      // If CUSTOMER role, create Customer record
      if (role === UserRole.CUSTOMER) {
        await tx.customer.create({
          data: {
            phone,
            name,
            email,
            tier: 'BRONZE',
            points: 0,
            totalSpent: 0,
          },
        });
      }

      return user;
    });

    // Generate token
    const token = generateToken(result.id, result.email, result.role);

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công',
      data: {
        user: result,
        token,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      const fieldMessages: Record<string, string> = {
        email: 'Email này đã được sử dụng',
        phone: 'Số điện thoại này đã được sử dụng',
      };
      res.status(400).json({
        status: 'error',
        message: fieldMessages[field] || `${field} đã tồn tại`,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Đăng ký thất bại. Vui lòng thử lại sau',
    });
  }
};

/**
 * Login user
 * For CUSTOMER role ONLY: Also returns Customer info (points, tier, etc.)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      });
      return;
    }

    // Only allow CUSTOMER role for this endpoint
    if (user.role !== UserRole.CUSTOMER) {
      res.status(403).json({
        status: 'error',
        message: 'Vui lòng sử dụng trang đăng nhập dành cho nhân viên',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Get Customer info
    let customerInfo = null;
    const customer = await prisma.customer.findUnique({
      where: { phone: user.phone },
      select: {
        id: true,
        points: true,
        tier: true,
        totalSpent: true,
      },
    });
    if (customer) {
      customerInfo = {
        id: customer.id,
        points: customer.points,
        tier: customer.tier,
        totalSpent: customer.totalSpent,
      };
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role, user.branchId);

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          branchId: user.branchId,
          branchName: user.branch?.name || null,
        },
        customer: customerInfo,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đăng nhập thất bại. Vui lòng thử lại sau',
    });
  }
};

/**
 * System Login
 * For STAFF, ADMIN_BRAND, ADMIN_SYSTEM, LOGISTICS_STAFF roles
 */
export const systemLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      });
      return;
    }

    // Only allow system roles (not CUSTOMER)
    const systemRoles: UserRole[] = [
      UserRole.STAFF, 
      UserRole.ADMIN_BRAND, 
      UserRole.ADMIN_SYSTEM, 
      UserRole.LOGISTICS_STAFF
  ];
    if (!systemRoles.includes(user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Trang này chỉ dành cho tài khoản nhân viên/quản trị',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
      return;
    }

    // Verify password
    console.log('🔐 Verifying password for:', { 
      email, 
      passwordLength: password.length,
      hashedPasswordLength: user.password.length,
      hashedStart: user.password.substring(0, 10)
    });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng',
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role, user.branchId);

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          branchId: user.branchId,
          branchName: user.branch?.name || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error('System login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đăng nhập thất bại. Vui lòng thử lại sau',
    });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Chưa đăng nhập',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    let responseData: any = { ...user };

    // Nếu là CUSTOMER, lấy thêm thông tin từ bảng Customer
    if (user.role === 'CUSTOMER' && user.phone) {
      try {
        const customer = await prisma.customer.findUnique({
          where: { phone: user.phone },
          select: {
            tier: true,
            points: true,
            totalSpent: true,
            address: true,
          }
        });

        if (customer) {
          responseData = {
            ...responseData,
            ...customer
          };
        }
      } catch (customerError) {
        // Nếu trường address chưa tồn tại, thử lại không có address
        console.log('Trying without address field...');
        const customer = await prisma.customer.findUnique({
          where: { phone: user.phone },
          select: {
            tier: true,
            points: true,
            totalSpent: true,
          }
        });

        if (customer) {
          responseData = {
            ...responseData,
            ...customer
          };
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: { user: responseData },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thông tin người dùng',
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'success',
    message: 'Đăng xuất thành công',
  });
};
