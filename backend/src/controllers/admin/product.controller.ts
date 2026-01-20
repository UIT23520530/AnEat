import { Request, Response } from 'express';
import { prisma } from '../../db';
import { Prisma } from '@prisma/client';

/**
 * Get all products (with pagination and filters)
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, categoryId, isAvailable } = req.query;

    console.log('📋 Get all products request:', {
      page,
      limit,
      search,
      categoryId,
      isAvailable,
    });

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          price: true,
          costPrice: true,
          image: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          branchId: true,
          quantity: true,
          prepTime: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    console.log('✅ Products fetched:', {
      count: products.length,
      total,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
      meta: {
        total_items: total,
        total_pages: Math.ceil(total / take),
        current_page: Number(page),
        page_size: Number(limit),
      },
    });
  } catch (error) {
    console.error('❌ Get all products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách sản phẩm',
    });
  }
};

/**
 * Get product statistics
 */
export const getProductStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query;
    console.log('📊 Get product stats request', { branchId });

    // Build where clause for branch filtering
    const whereClause: any = {};
    if (branchId && branchId !== 'null') {
      whereClause.branchId = branchId as string;
    }

    const [
      totalProducts,
      availableProducts,
      unavailableProducts,
      productsByCategory,
    ] = await Promise.all([
      // Total products
      prisma.product.count({ where: whereClause }),
      // Available products
      prisma.product.count({
        where: {
          ...whereClause,
          isAvailable: true,
        },
      }),
      // Unavailable products
      prisma.product.count({
        where: {
          ...whereClause,
          isAvailable: false,
        },
      }),
      // Products grouped by category
      prisma.product.groupBy({
        by: ['categoryId'],
        where: whereClause,
        _count: {
          id: true,
        },
      }),
    ]);

    // Get category names for grouped products
    const categoryIds = productsByCategory
      .map((item) => item.categoryId)
      .filter((id): id is string => id !== null); // Filter out null values
    const categories = await prisma.productCategory.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const productsByCategoryWithNames = productsByCategory
      .filter((item) => item.categoryId !== null) // Filter out null categories
      .map((item) => ({
        categoryId: item.categoryId!,
        categoryName: categoryMap.get(item.categoryId!) || 'Unknown',
        count: item._count.id,
      }));

    const stats = {
      totalProducts,
      availableProducts,
      unavailableProducts,
      productsByCategory: productsByCategoryWithNames,
    };

    console.log('✅ Product stats fetched:', stats);

    res.status(200).json({
      status: 'success',
      message: 'Lấy thống kê sản phẩm thành công',
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get product stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thống kê sản phẩm',
    });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('📦 Get product by ID request:', { id });

    const product = await prisma.product.findFirst({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        price: true,
        costPrice: true,
        image: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        branchId: true,
        quantity: true,
        prepTime: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      console.log('❌ Product not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm',
      });
      return;
    }

    console.log('✅ Product fetched:', { id, name: product.name });

    res.status(200).json({
      status: 'success',
      message: 'Lấy thông tin sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    console.error('❌ Get product by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thông tin sản phẩm',
    });
  }
};

/**
 * Create new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, price, image, categoryId, branchId, quantity, prepTime, costPrice, isAvailable = true } = req.body;

    console.log('➕ Create product request:', {
      code,
      name,
      description,
      price,
      categoryId,
      branchId,
      quantity,
      prepTime,
      costPrice,
      isAvailable,
    });

    // Validate required fields
    if (!code || code.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Mã sản phẩm không được để trống',
      });
      return;
    }

    if (!name || name.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Tên sản phẩm không được để trống',
      });
      return;
    }

    if (name.length > 200) {
      res.status(400).json({
        status: 'error',
        message: 'Tên sản phẩm không được vượt quá 200 ký tự',
      });
      return;
    }

    if (!price || Number(price) < 0) {
      res.status(400).json({
        status: 'error',
        message: 'Giá sản phẩm phải là số không âm',
      });
      return;
    }

    if (!categoryId) {
      res.status(400).json({
        status: 'error',
        message: 'Vui lòng chọn danh mục cho sản phẩm',
      });
      return;
    }

    // Check if category exists and is active
    const category = await prisma.productCategory.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      console.log('❌ Category not found:', { categoryId });
      res.status(400).json({
        status: 'error',
        message: 'Danh mục không tồn tại',
      });
      return;
    }

    if (!category.isActive) {
      console.log('❌ Category is inactive:', { categoryId });
      res.status(400).json({
        status: 'error',
        message: 'Không thể thêm sản phẩm vào danh mục đã bị ẩn',
      });
      return;
    }

    // Create product
    const newProduct = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price), // Fixed: Use direct value, no *100
        costPrice: costPrice ? Number(costPrice) : 0,
        image: image?.trim() || null,
        categoryId,
        branchId: branchId || null,
        quantity: quantity !== undefined ? Number(quantity) : 0,
        prepTime: prepTime !== undefined ? Number(prepTime) : 15, // Default 15 minutes
        isAvailable: Boolean(isAvailable),
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        price: true,
        costPrice: true,
        image: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        branchId: true,
        quantity: true,
        prepTime: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ Product created:', { id: newProduct.id, name: newProduct.name });

    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm thành công',
      data: newProduct,
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể tạo sản phẩm',
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, branchId, quantity, prepTime, costPrice, isAvailable } = req.body;

    console.log('🔄 Update product request:', {
      id,
      updateData: { name, price, categoryId, branchId, quantity, prepTime, costPrice, isAvailable },
    });

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      console.log('❌ Product not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm',
      });
      return;
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Tên sản phẩm không được để trống',
        });
        return;
      }

      if (name.length > 200) {
        res.status(400).json({
          status: 'error',
          message: 'Tên sản phẩm không được vượt quá 200 ký tự',
        });
        return;
      }
    }

    // Validate price if provided
    if (price !== undefined) {
      if (Number(price) < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Giá sản phẩm phải là số không âm',
        });
        return;
      }
    }

    // Validate category if provided
    if (categoryId !== undefined) {
      const category = await prisma.productCategory.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        console.log('❌ Category not found:', { categoryId });
        res.status(400).json({
          status: 'error',
          message: 'Danh mục không tồn tại',
        });
        return;
      }

      if (!category.isActive) {
        console.log('❌ Category is inactive:', { categoryId });
        res.status(400).json({
          status: 'error',
          message: 'Không thể chuyển sản phẩm vào danh mục đã bị ẩn',
        });
        return;
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = Number(price); // Fixed: Use direct value
    if (costPrice !== undefined) updateData.costPrice = Number(costPrice);
    if (image !== undefined) updateData.image = image?.trim() || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (branchId !== undefined) updateData.branchId = branchId || null;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (prepTime !== undefined) updateData.prepTime = prepTime !== null ? Number(prepTime) : 15; // Default 15 if null
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        price: true,
        costPrice: true,
        image: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        branchId: true,
        quantity: true,
        prepTime: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ Product updated:', { id, name: updatedProduct.name });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật sản phẩm',
    });
  }
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🗑️ Delete product request:', { id });

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      console.log('❌ Product not found:', { id });
      res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm',
      });
      return;
    }

    // Hard delete product (no soft delete in schema)
    await prisma.product.delete({
      where: { id },
    });

    console.log('✅ Product deleted:', { id, name: product.name });

    res.status(200).json({
      status: 'success',
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể xóa sản phẩm',
    });
  }
};
