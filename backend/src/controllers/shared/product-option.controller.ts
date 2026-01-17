import { Request, Response } from 'express';
import { prisma } from '../../db';
import { UserRole } from '@prisma/client';

/**
 * Get all options for a product
 * GET /api/v1/products/:productId/options
 */
export const getProductOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
      });
      return;
    }

    // Check permission
    if (req.user?.role === UserRole.ADMIN_BRAND && product.branchId !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only view options for products in your branch',
      });
      return;
    }

    const options = await prisma.productOption.findMany({
      where: {
        productId,
        isAvailable: true,
      },
      orderBy: { order: 'asc' },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product options retrieved successfully',
      data: options,
    });
  } catch (error) {
    console.error('Get product options error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to fetch product options',
    });
  }
};

/**
 * Create new option for a product
 * POST /api/v1/products/:productId/options
 */
export const createProductOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, description, price, type, isRequired, isAvailable, order } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
      });
      return;
    }

    // Check permission
    if (req.user?.role === UserRole.ADMIN_BRAND && product.branchId !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only create options for products in your branch',
      });
      return;
    }

    const option = await prisma.productOption.create({
      data: {
        productId,
        name,
        description,
        price: price || 0,
        type: type || 'OTHER',
        isRequired: isRequired || false,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Product option created successfully',
      data: option,
    });
  } catch (error) {
    console.error('Create product option error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to create product option',
    });
  }
};

/**
 * Update product option
 * PUT /api/v1/products/:productId/options/:optionId
 */
export const updateProductOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, optionId } = req.params;
    const { name, description, price, type, isRequired, isAvailable, order } = req.body;

    // Verify option exists and belongs to product
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: { product: true },
    });

    if (!option || option.productId !== productId) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product option not found',
      });
      return;
    }

    // Check permission
    if (req.user?.role === UserRole.ADMIN_BRAND && option.product.branchId !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only update options for products in your branch',
      });
      return;
    }

    const updatedOption = await prisma.productOption.update({
      where: { id: optionId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(type && { type }),
        ...(isRequired !== undefined && { isRequired }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(order !== undefined && { order }),
      },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product option updated successfully',
      data: updatedOption,
    });
  } catch (error) {
    console.error('Update product option error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to update product option',
    });
  }
};

/**
 * Delete product option
 * DELETE /api/v1/products/:productId/options/:optionId
 */
export const deleteProductOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, optionId } = req.params;

    // Verify option exists and belongs to product
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: { product: true },
    });

    if (!option || option.productId !== productId) {
      res.status(404).json({
        success: false,
        code: 404,
        message: 'Product option not found',
      });
      return;
    }

    // Check permission
    if (req.user?.role === UserRole.ADMIN_BRAND && option.product.branchId !== req.user.branchId) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'You can only delete options for products in your branch',
      });
      return;
    }

    await prisma.productOption.delete({
      where: { id: optionId },
    });

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product option deleted successfully',
    });
  } catch (error) {
    console.error('Delete product option error:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Failed to delete product option',
    });
  }
};
