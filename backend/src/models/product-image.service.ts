/**
 * Product Image Service
 * Handles product image updates across all branches
 * When admin uploads/updates an image, it syncs to all products with the same base code
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extract base code from product code
 * Example: "BURGER-001-HCM-Q1" -> "BURGER-001"
 */
export function extractBaseCode(productCode: string): string {
  // Product codes are formatted as: {BASE_CODE}-{BRANCH_CODE}
  // Example: BURGER-001-HCM-Q1
  const parts = productCode.split('-');
  
  if (parts.length >= 3) {
    // Return all parts except the last two (which are branch code)
    return parts.slice(0, -2).join('-');
  }
  
  return productCode;
}

/**
 * Update image for all products with the same base code across all branches
 * @param productId - ID of any product with the base code
 * @param newImagePath - New image path to set
 * @returns Number of products updated
 */
export async function updateProductImageAcrossAllBranches(
  productId: string,
  newImagePath: string
): Promise<number> {
  try {
    // Get the product to find its base code
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Extract base code
    const baseCode = extractBaseCode(product.code);

    // Find all products with the same base code (across all branches)
    const productsToUpdate = await prisma.product.findMany({
      where: {
        code: {
          startsWith: baseCode,
        },
        deletedAt: null,
      },
    });

    // Update all matching products
    const updatePromises = productsToUpdate.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { image: newImagePath },
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Updated ${productsToUpdate.length} products with base code: ${baseCode}`);
    return productsToUpdate.length;
  } catch (error) {
    console.error('Error updating product images:', error);
    throw error;
  }
}

/**
 * Update image by base code directly
 * @param baseCode - Base product code (e.g., "BURGER-001")
 * @param newImagePath - New image path
 * @returns Number of products updated
 */
export async function updateProductImageByBaseCode(
  baseCode: string,
  newImagePath: string
): Promise<number> {
  try {
    // Find all products with the same base code
    const productsToUpdate = await prisma.product.findMany({
      where: {
        code: {
          startsWith: baseCode,
        },
        deletedAt: null,
      },
    });

    if (productsToUpdate.length === 0) {
      throw new Error(`No products found with base code: ${baseCode}`);
    }

    // Update all matching products
    const updatePromises = productsToUpdate.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { image: newImagePath },
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Updated ${productsToUpdate.length} products with base code: ${baseCode}`);
    return productsToUpdate.length;
  } catch (error) {
    console.error('Error updating product images by base code:', error);
    throw error;
  }
}

/**
 * Get all products with the same base code
 * @param productCode - Any product code with the base code
 * @returns Array of products
 */
export async function getProductsByBaseCode(productCode: string) {
  const baseCode = extractBaseCode(productCode);
  
  return await prisma.product.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
      deletedAt: null,
    },
    include: {
      branch: true,
      category: true,
    },
  });
}

/**
 * Check if image update will affect multiple branches
 * @param productId - Product ID
 * @returns Object with baseCode and affectedBranches count
 */
export async function checkImageUpdateImpact(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const baseCode = extractBaseCode(product.code);
  const affectedProducts = await prisma.product.findMany({
    where: {
      code: {
        startsWith: baseCode,
      },
      deletedAt: null,
    },
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

  return {
    baseCode,
    affectedBranchesCount: affectedProducts.length,
    affectedBranches: affectedProducts.map((p) => ({
      branchId: p.branch.id,
      branchName: p.branch.name,
      branchCode: p.branch.code,
      productId: p.id,
      productCode: p.code,
      currentImage: p.image,
    })),
  };
}
