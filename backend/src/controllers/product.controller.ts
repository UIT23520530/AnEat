import { Request, Response } from 'express';
import { ProductService } from '../models/product.service';
import { UserRole } from '@prisma/client';

/**
 * Get product list with pagination, sorting and filtering
 */
export const getProductList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      categoryId,
      isAvailable 
    } = req.query;

    const params = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string | undefined,
      categoryId: categoryId as string | undefined,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      // ADMIN_BRAND only sees their branch products, ADMIN_SYSTEM sees all
      branchId: (req.user?.role === UserRole.ADMIN_BRAND ? req.user.branchId : undefined) || undefined,
    };

    const { products, total } = await ProductService.findAll(params);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product list retrieved successfully',
      data: products,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / params.limit),
        limit: params.limit,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get product list error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch product list',
    });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await ProductService.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
      });
      return;
    }

    // Check if product belongs to manager's branch
    if (req.user?.role === UserRole.ADMIN_BRAND && product.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only view products in your branch',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch product',
    });
  }
};

/**
 * Create new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.branchId) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Manager is not assigned to any branch',
      });
      return;
    }

    const { code, name, description, price, image, categoryId, quantity, costPrice, prepTime, isAvailable } = req.body;

    // Check if code already exists
    const existingProduct = await ProductService.findByCode(code);

    if (existingProduct) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Product code already exists',
      });
      return;
    }

    const product = await ProductService.create({
      code,
      name,
      description,
      price,
      image,
      categoryId,
      quantity,
      costPrice,
      prepTime,
      isAvailable,
      branchId: req.user.branchId,
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create product',
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, quantity, costPrice, prepTime, isAvailable } = req.body;

    const existingProduct = await ProductService.findById(id);

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
      });
      return;
    }

    // Check if product belongs to manager's branch
    if (req.user?.role === UserRole.ADMIN_BRAND && existingProduct.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only update products in your branch',
      });
      return;
    }

    const product = await ProductService.update(id, {
      name,
      description,
      price,
      image,
      categoryId,
      quantity,
      costPrice,
      prepTime,
      isAvailable,
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update product',
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingProduct = await ProductService.findById(id);

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
      });
      return;
    }

    // Check if product belongs to manager's branch
    if (req.user?.role === UserRole.ADMIN_BRAND && existingProduct.branch?.id !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only delete products in your branch',
      });
      return;
    }

    // Check if product has orders
    const hasOrders = await ProductService.hasOrders(id);

    if (hasOrders) {
      res.status(400).json({
        success: false,
        code: 400,
        message: 'Cannot delete product with existing orders',
      });
      return;
    }

    await ProductService.delete(id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete product',
    });
  }
};
