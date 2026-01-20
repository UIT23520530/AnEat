import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Giữ lại các categories được chỉ định, xóa các categories khác
 */
async function cleanupCategories() {
  try {
    console.log('🧹 Cleaning up categories...\n');

    // Danh sách categories cần giữ lại
    const categoriesToKeep = [
      'Món ngon phải thử',
      'Gà giòn vui vẻ',
      'Mỳ ý',
      'Burger',
      'Phần ăn phụ',
      'Tráng miệng',
      'Thức uống',
    ];

    console.log('📋 Categories to keep:');
    categoriesToKeep.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    console.log('');

    // Tìm tất cả categories
    const allCategories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    console.log(`📦 Total categories in database: ${allCategories.length}\n`);

    // Phân loại categories: giữ lại vs xóa
    const categoriesToDelete: typeof allCategories = [];
    const categoriesToKeepList: typeof allCategories = [];

    for (const category of allCategories) {
      // Kiểm tra xem category này có trong danh sách giữ lại không
      // So sánh không phân biệt hoa thường và bỏ qua dấu
      const normalizedCategoryName = category.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

      const shouldKeep = categoriesToKeep.some((keepName) => {
        const normalizedKeepName = keepName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        return normalizedCategoryName.includes(normalizedKeepName) || 
               normalizedKeepName.includes(normalizedCategoryName);
      });

      if (shouldKeep) {
        categoriesToKeepList.push(category);
      } else {
        categoriesToDelete.push(category);
      }
    }

    console.log(`✅ Categories to keep: ${categoriesToKeepList.length}`);
    categoriesToKeepList.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.code}) - ${cat._count.products} products`);
    });
    console.log('');

    console.log(`🗑️  Categories to delete: ${categoriesToDelete.length}`);
    categoriesToDelete.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.code}) - ${cat._count.products} products`);
    });
    console.log('');

    if (categoriesToDelete.length === 0) {
      console.log('✅ No categories to delete. All categories are in the keep list.');
      return;
    }

    // Xác nhận xóa
    const totalProductsToDelete = categoriesToDelete.reduce(
      (sum, cat) => sum + cat._count.products,
      0
    );

    console.log(`⚠️  Will delete ${categoriesToDelete.length} categories with ${totalProductsToDelete} products`);
    console.log('');

    // Bắt đầu xóa
    let deletedProducts = 0;
    let deletedOptions = 0;
    let deletedCategories = 0;

    for (const category of categoriesToDelete) {
      console.log(`\n🗑️  Deleting category: ${category.name}...`);

      // Lấy tất cả products của category này
      const products = await prisma.product.findMany({
        where: {
          categoryId: category.id,
        },
        include: {
          options: true,
        },
      });

      // Lấy danh sách product IDs
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        // Xóa OrderItemOptions trước
        await prisma.orderItemOption.deleteMany({
          where: {
            option: {
              productId: {
                in: productIds,
              },
            },
          },
        });

        // Xóa ProductOptions
        await prisma.productOption.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });

        deletedOptions = products.reduce(
          (sum, p) => sum + (p.options?.length || 0),
          0
        );

        // Xóa OrderItems liên quan
        await prisma.orderItem.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });

        // Xóa StockRequests, StockTransactions, Inventory liên quan
        await prisma.stockRequest.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });

        await prisma.stockTransaction.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });

        await prisma.inventory.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });

        // Xóa Reviews
        await prisma.review.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });
      }

      // Xóa Products
      const deletedProductsResult = await prisma.product.deleteMany({
        where: {
          categoryId: category.id,
        },
      });

      deletedProducts += deletedProductsResult.count;

      // Xóa Category
      await prisma.productCategory.delete({
        where: {
          id: category.id,
        },
      });

      deletedCategories++;
      console.log(`   ✅ Deleted category "${category.name}" with ${deletedProductsResult.count} products`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Deleted categories: ${deletedCategories}`);
    console.log(`   ✅ Deleted products: ${deletedProducts}`);
    console.log(`   ✅ Deleted options: ${deletedOptions}`);
    console.log(`   ✅ Kept categories: ${categoriesToKeepList.length}`);
    console.log('='.repeat(50) + '\n');

    // Verify: Đếm lại categories
    console.log('🔍 Verifying...\n');
    const remainingCategories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`📦 Remaining categories: ${remainingCategories.length}`);
    remainingCategories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.code}) - ${cat._count.products} products`);
    });

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCategories();
