/**
 * Script để update ảnh cho các sản phẩm đã có trong database
 * Sử dụng hàm getProductImage để tự động gán ảnh
 */

import { PrismaClient } from '@prisma/client';
import { getProductImage } from './image-mapping';

const prisma = new PrismaClient();

async function updateProductImages() {
  console.log('🖼️  Updating product images...\n');

  try {
    // Lấy tất cả sản phẩm
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    console.log(`📦 Found ${products.length} products\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Update từng sản phẩm
    for (const product of products) {
      try {
        const categoryName = product.category?.name || 'Khác';
        const productImage = getProductImage(product.name, categoryName);

        if (productImage) {
          // Chỉ update nếu ảnh khác với ảnh hiện tại
          if (product.image !== productImage) {
            await prisma.product.update({
              where: { id: product.id },
              data: { image: productImage },
            });
            console.log(`✅ Updated: ${product.name} -> ${productImage}`);
            updatedCount++;
          } else {
            console.log(`⏭️  Skipped (same image): ${product.name}`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  No image found for: ${product.name}`);
          skippedCount++;
        }
      } catch (err: any) {
        console.error(`❌ Error updating ${product.name}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Update completed!');
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run update
updateProductImages();
