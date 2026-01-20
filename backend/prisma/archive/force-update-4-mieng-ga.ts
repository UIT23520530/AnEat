/**
 * Script để force update ảnh cho sản phẩm "4 MIẾNG GÀ"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceUpdate4MiengGa() {
  console.log('🖼️  Force updating image for "4 MIẾNG GÀ"...\n');

  try {
    // Tìm tất cả sản phẩm có tên chứa "4 MIẾNG GÀ"
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: '4 MIẾNG GÀ',
          mode: 'insensitive',
        },
      },
    });

    console.log(`📦 Found ${products.length} products with "4 MIẾNG GÀ"\n`);

    const targetImage = '/assets/6-mieng-ga-gion-vui-ve.webp';

    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: { image: targetImage },
      });
      console.log(`✅ Updated: ${product.name} (${product.code}) -> ${targetImage}`);
    }

    console.log('\n✨ Force update completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
forceUpdate4MiengGa();
