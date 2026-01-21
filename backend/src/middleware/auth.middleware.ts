import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        branchId?: string | null;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  branchId?: string | null;
}

/**
 * Authentication middleware - Verify JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided or invalid format',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret'
    ) as JwtPayload;

    console.log('[AUTH DEBUG] Decoded token userId:', decoded.userId);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        branchId: true,
        isActive: true,
      },
    });

    console.log('[AUTH DEBUG] User found:', user ? `${user.email} (${user.role}) - Active: ${user.isActive}` : 'NOT FOUND');

    // Check if user exists and is active
    if (!user || !user.isActive) {
      console.log('[AUTH DEBUG] User validation failed - exists:', !!user, 'isActive:', user?.isActive);
      res.status(401).json({
        status: 'error',
        message: 'User not found or inactive',
      });
      return;
    }

    // Check if user's branch is active (for non-admin users)
    if (user.branchId && user.role !== UserRole.ADMIN_SYSTEM && user.role !== UserRole.ADMIN_BRAND) {
      const branch = await prisma.branch.findUnique({
        where: { id: user.branchId },
        select: { isActive: true },
      });

      if (!branch || !branch.isActive) {
        console.log('[AUTH DEBUG] Branch validation failed - branch inactive or not found');
        res.status(403).json({
          status: 'error',
          message: 'Your branch is currently inactive. Please contact administrator.',
        });
        return;
      }
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
};

/**
 * Authorization middleware - Check user roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is admin (ADMIN_SYSTEM or ADMIN_BRAND)
 */
export const isAdmin = authorize(UserRole.ADMIN_SYSTEM, UserRole.ADMIN_BRAND);

/**
 * Check if user is manager
 */
export const isManager = authorize(
  UserRole.ADMIN_SYSTEM,
  UserRole.ADMIN_BRAND,
  UserRole.STAFF
);

/**
 * Check if user is staff
 */
export const isStaff = authorize(
  UserRole.ADMIN_SYSTEM,
  UserRole.ADMIN_BRAND,
  UserRole.STAFF
);

/**
 * Check if user is customer
 */
export const isCustomer = authorize(UserRole.CUSTOMER);

/**
 * Optional authentication middleware - Verify JWT token if present, but don't fail if missing
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no token, just continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      ) as JwtPayload;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          branchId: true,
          isActive: true,
        },
      });

      // If user exists and is active, attach to request
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        };
      }
    } catch (tokenError) {
      // If token is invalid/expired, just continue without setting req.user
      // Don't throw error for optional auth
    }

    next();
  } catch (error) {
    // For optional auth, always continue even on error
    next();
  }
};

/**
 * Check if authenticated (any role)
 */
export const isAuthenticated = authenticate;
