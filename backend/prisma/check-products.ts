import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...\n');

    // Count products
    const productCount = await prisma.product.count();
    console.log(`📦 Total products: ${productCount}`);

    // Count products by branch
    const productsByBranch = await prisma.product.groupBy({
      by: ['branchId'],
      _count: {
        id: true,
      },
    });

    console.log('\n📊 Products by branch:');
    for (const group of productsByBranch) {
      const branch = await prisma.branch.findUnique({
        where: { id: group.branchId },
        select: { name: true, code: true },
      });
      console.log(`   - ${branch?.name || group.branchId}: ${group._count.id} products`);
    }

    // Count products with options
    const productsWithOptions = await prisma.product.count({
      where: {
        options: {
          some: {},
        },
      },
    });
    console.log(`\n✨ Products with options: ${productsWithOptions}`);

    // Count options
    const optionCount = await prisma.productOption.count();
    console.log(`🔧 Total options: ${optionCount}`);

    // Sample products
    if (productCount > 0) {
      console.log('\n📋 Sample products (first 5):');
      const sampleProducts = await prisma.product.findMany({
        take: 5,
        select: {
          id: true,
          code: true,
          name: true,
          price: true,
          isAvailable: true,
          quantity: true,
          branch: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              options: true,
            },
          },
        },
      });

      for (const product of sampleProducts) {
        console.log(`   - ${product.name} (${product.code})`);
        console.log(`     Branch: ${product.branch.name}, Category: ${product.category?.name || 'N/A'}`);
        console.log(`     Price: ${product.price / 100}đ, Available: ${product.isAvailable}, Quantity: ${product.quantity}`);
        console.log(`     Options: ${product._count.options}`);
      }
    } else {
      console.log('\n⚠️  No products found in database!');
      console.log('   Run: npm run import:menu:md to import products');
    }

    // Check branches
    const branchCount = await prisma.branch.count({
      where: {
        deletedAt: null,
      },
    });
    console.log(`\n🏪 Active branches: ${branchCount}`);

    if (branchCount > 0) {
      const branches = await prisma.branch.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        take: 5,
      });
      console.log('   Sample branches:');
      for (const branch of branches) {
        console.log(`   - ${branch.name} (${branch.code}) - ID: ${branch.id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
