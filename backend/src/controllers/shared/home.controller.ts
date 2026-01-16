import { Request, Response, NextFunction } from 'express';
import { BannerService } from '../../models/banner.service';
import { ProductService } from '../../models/product.service';
import { CategoryService } from '../../models/category.service';
import { PromotionService } from '../../models/promotion.service';
import { prisma } from '../../db';
import { OrderStatus } from '@prisma/client';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';

/**
 * Get active banners for homepage
 * GET /api/v1/home/banners
 */
export const getBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banners = await BannerService.getActiveBanners();

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Banners retrieved successfully',
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products (top selling products)
 * GET /api/v1/home/featured-products
 */
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = 10, branchId } = req.query;

    // If branchId is provided, get featured products for that branch
    // Otherwise, get featured products across all branches
    const limitNum = parseInt(limit as string, 10);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whereClause: any = {
      order: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
    };

    if (branchId) {
      whereClause.order.branchId = branchId as string;
    }

    // Get top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: whereClause,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limitNum,
    });

    // If no products found, return empty array
    if (topProducts.length === 0) {
      res.status(200).json({
        success: true,
        code: 200,
        message: 'No featured products found',
        data: [],
      });
      return;
    }

    // Get product details
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
        deletedAt: null, // Soft delete
      } as any,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        options: {
          where: { isAvailable: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            type: true,
            isRequired: true,
            isAvailable: true,
            order: true,
          },
        },
      },
    });

    // Map products with sales data
    const featuredProducts = products.map((product: any) => {
      const salesData = topProducts.find((item) => item.productId === product.id);
      return {
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: product.quantity,
        isAvailable: product.isAvailable && product.quantity > 0,
        category: product.category,
        branch: product.branch,
        options: product.options || [],
        unitsSold: salesData?._sum.quantity || 0,
      };
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Featured products retrieved successfully',
      data: featuredProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active categories (public)
 * GET /api/v1/home/categories
 */
export const getPublicCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await CategoryService.findAll({
      page: 1,
      limit: 100,
      sort: 'name',
      order: 'asc',
      isActive: true,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Categories retrieved successfully',
      data: result.categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products for menu (public, requires branchId)
 * GET /api/v1/home/products?branchId=xxx
 */
export const getPublicProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { branchId, categoryId, search, page = 1, limit = 50, sort } = req.query;

    // Validate branchId is required
    if (!branchId) {
      throw new ValidationError('Branch ID is required. Please select a branch first.');
    }

    // Verify branch exists (not soft deleted)
    const branch = await prisma.branch.findFirst({
      where: { 
        id: branchId as string,
        deletedAt: null, // Soft delete
      } as any,
    });

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Parse sort parameter (format: -created_at or created_at)
    let sortField = 'name';
    let sortOrder: 'asc' | 'desc' = 'asc';
    if (sort) {
      const sortStr = sort as string;
      if (sortStr.startsWith('-')) {
        sortField = sortStr.substring(1);
        sortOrder = 'desc';
      } else {
        sortField = sortStr;
        sortOrder = 'asc';
      }
    }

    // Get products with stock status
    const params = {
      page: Number(page),
      limit: Number(limit),
      sort: sortField,
      order: sortOrder as 'asc' | 'desc',
      search: search as string | undefined,
      categoryId: categoryId as string | undefined,
      isAvailable: undefined,
      branchId: branchId as string,
    };

    const { products, total } = await ProductService.findAll(params);

    // Add stock status to each product
    const productsWithStockStatus = products.map((product) => {
      const stockStatus = product.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
      return {
        ...product,
        stockStatus,
        canOrder: product.isAvailable && product.quantity > 0,
      };
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Products retrieved successfully',
      data: productsWithStockStatus,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
        branch: {
          id: branch.id,
          name: branch.name,
          code: branch.code,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug (public)
 * GET /api/v1/home/products/slug/:slug?branchId=xxx
 */
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const { branchId } = req.query;

    // Validate branchId is required
    if (!branchId) {
      throw new ValidationError('Branch ID is required. Please select a branch first.');
    }

    // Verify branch exists
    const branch = await prisma.branch.findFirst({
      where: { 
        id: branchId as string,
        deletedAt: null,
      } as any,
    });

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Get all products from this branch and find by matching slug
    // Slug được tạo từ name: lowercase, remove dấu, replace spaces với hyphens
    const allProducts = await prisma.product.findMany({
      where: {
        branchId: branchId as string,
        deletedAt: null,
        isAvailable: true,
      } as any,
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        options: {
          where: { isAvailable: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            type: true,
            isRequired: true,
            isAvailable: true,
            order: true,
          },
        },
      },
    });

    // Helper function để tạo slug từ name (giống frontend)
    const createSlugFromName = (name: string): string => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    // Tìm product có slug match
    const product = allProducts.find((p) => {
      const productSlug = createSlugFromName(p.name);
      return productSlug === slug;
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const stockStatus = product.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product retrieved successfully',
      data: {
        ...product,
        stockStatus,
        canOrder: product.isAvailable && product.quantity > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active promotions (public)
 * GET /api/v1/home/promotions
 */
export const getPublicPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await PromotionService.findAll({
      page: Number(page),
      limit: Number(limit),
      isActive: true,
      type: undefined,
      search: undefined,
    });

    // Filter out expired promotions
    const now = new Date();
    const activePromotions = result.promotions.filter((promo: any) => {
      if (promo.expiryDate && new Date(promo.expiryDate) < now) {
        return false;
      }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return false;
      }
      return true;
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Promotions retrieved successfully',
      data: activePromotions,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(activePromotions.length / Number(limit)),
        limit: Number(limit),
        totalItems: activePromotions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders list (public - by orderNumber or customerId if authenticated)
 * GET /api/v1/home/orders
 */
export const getPublicOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderNumber, status, page = 1, limit = 10 } = req.query;
    // Try to get user from request (optional authentication)
    const userId = (req as any).user?.id;

    const where: any = {};

    // If user is authenticated, find their Customer ID and show their orders
    if (userId) {
      // Get user to find their phone
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (user && user.phone) {
        // Find customer by phone
        const customer = await prisma.customer.findUnique({
          where: { phone: user.phone },
          select: { id: true },
        });

        if (customer) {
          where.customerId = customer.id;
        } else {
          // Customer not found, return empty orders
          res.status(200).json({
            success: true,
            code: 200,
            message: 'Orders retrieved successfully',
            data: [],
            meta: {
              currentPage: Number(page),
              totalPages: 0,
              limit: Number(limit),
              totalItems: 0,
            },
          });
          return;
        }
      } else {
        // User has no phone, return empty orders
        res.status(200).json({
          success: true,
          code: 200,
          message: 'Orders retrieved successfully',
          data: [],
          meta: {
            currentPage: Number(page),
            totalPages: 0,
            limit: Number(limit),
            totalItems: 0,
          },
        });
        return;
      }
    } else if (orderNumber) {
      // If not authenticated but has orderNumber, allow tracking
      where.orderNumber = orderNumber as string;
    } else {
      throw new ValidationError('Please provide orderNumber or login to view orders');
    }

    // Filter by status if provided
    if (status) {
      where.status = status as OrderStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Orders retrieved successfully',
      data: orders,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create temporary order (save to cookie/localStorage on frontend)
 * POST /api/v1/home/orders/temp
 * Level 3: Transaction + Locking + Validation
 */
export const createTempOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Start transaction for concurrency control
    const transaction = await prisma.$transaction(async (tx) => {
    const { branchId, items, customerInfo, promotionCode, notes } = req.body;

    // Validate branchId
    if (!branchId) {
      throw new ValidationError('Branch ID is required');
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }

    // Verify branch exists (not soft deleted)
    const branch = await tx.branch.findFirst({
      where: { 
        id: branchId,
        deletedAt: null, // Soft delete
      } as any,
    });

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Get products and calculate total with LOCKING
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // LOCKING: Use raw query for FOR UPDATE to prevent race conditions
      // Prisma doesn't support FOR UPDATE directly, so we use raw query
      const productResult = await tx.$queryRaw<Array<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        price: number;
        image: string | null;
        quantity: number;
        isAvailable: boolean;
        branchId: string;
        categoryId: string | null;
        deletedAt: Date | null;
      }>>`
        SELECT * FROM "Product" 
        WHERE id = ${item.productId}
        AND "deletedAt" IS NULL
        FOR UPDATE
      `;

      if (!productResult || productResult.length === 0) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }

      const product = productResult[0];

      if (product.branchId !== branchId) {
        throw new ValidationError(`Product ${product.name} does not belong to selected branch`);
      }

      // Validate stock with locked data
      if (!product.isAvailable || product.quantity < item.quantity) {
        throw new ValidationError(
          `Product ${product.name} is ${product.quantity === 0 ? 'out of stock' : `only ${product.quantity} available`}`
        );
      }

      // Get category info
      const category = product.categoryId
        ? await tx.productCategory.findUnique({
            where: { id: product.categoryId },
            select: { id: true, name: true },
          })
        : null;

      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal,
        category: category,
      });
    }

    // Apply promotion if provided
    let discountAmount = 0;
    let promotion = null;

    if (promotionCode) {
      promotion = await PromotionService.findByCode(promotionCode);
      if (promotion) {
        if (promotion.minOrderAmount && subtotal < promotion.minOrderAmount) {
          throw new ValidationError(`Minimum order amount is ${promotion.minOrderAmount}`);
        }

        if (promotion.type === 'PERCENTAGE') {
          discountAmount = Math.floor((subtotal * promotion.value) / 100);
        } else {
          discountAmount = promotion.value;
        }
      }
    }

    const total = subtotal - discountAmount;

    // Create temporary order object (not saved to DB)
    // Transaction will commit automatically if no errors
    return {
      orderNumber: `TEMP-${Date.now()}`,
      branchId,
      branch: {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
      },
      items: orderItems,
      customerInfo: customerInfo || null,
      promotionCode: promotionCode || null,
      promotion: promotion
        ? {
            code: promotion.code,
            type: promotion.type,
            value: promotion.value,
          }
        : null,
      subtotal,
      discountAmount,
      total,
      notes: notes || null,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
  });

    // Transaction completed successfully
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Temporary order created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track order status by orderNumber
 * GET /api/v1/home/orders/:orderNumber/tracking
 */
export const trackOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      throw new ValidationError('Order number is required');
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Calculate estimated completion time based on status
    let estimatedTime = null;
    if (order.status === 'PENDING') {
      estimatedTime = new Date(order.createdAt.getTime() + 15 * 60000); // +15 minutes
    } else if (order.status === 'PREPARING') {
      estimatedTime = new Date(order.createdAt.getTime() + 30 * 60000); // +30 minutes
    } else if (order.status === 'READY') {
      estimatedTime = new Date(order.createdAt.getTime() + 5 * 60000); // +5 minutes
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Order tracking retrieved successfully',
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        items: order.items,
        branch: order.branch,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt,
        estimatedTime,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get about us information (company story)
 * GET /api/v1/home/about-us
 */
export const getAboutUs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const aboutUs = await prisma.aboutUs.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!aboutUs) {
      throw new NotFoundError('About us information not found');
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'About us information retrieved successfully',
      data: aboutUs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all branches (public)
 * GET /api/v1/home/branches
 */
export const getPublicBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 50, search, sort } = req.query;

    const where: any = {
      // Soft delete: Only get non-deleted branches
      deletedAt: null,
    } as any;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Parse sort parameter (format: -name or name)
    let sortField = 'name';
    let sortOrder: 'asc' | 'desc' = 'asc';
    if (sort) {
      const sortStr = sort as string;
      if (sortStr.startsWith('-')) {
        sortField = sortStr.substring(1);
        sortOrder = 'desc';
      } else {
        sortField = sortStr;
        sortOrder = 'asc';
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          code: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          [sortField]: sortOrder,
        },
      }),
      prisma.branch.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Branches retrieved successfully',
      data: branches,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};
