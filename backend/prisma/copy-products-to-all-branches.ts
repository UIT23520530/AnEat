import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Copy products từ branch "AnEat - Hoàn Kiếm (Hà Nội)" sang tất cả các branch khác
 */
async function copyProductsToAllBranches() {
  try {
    console.log('🔄 Copying products to all branches...\n');

    // Tìm branch nguồn (AnEat - Hoàn Kiếm)
    const sourceBranch = await prisma.branch.findFirst({
      where: {
        name: {
          contains: 'Hoàn Kiếm',
        },
        deletedAt: null,
      },
    });

    if (!sourceBranch) {
      console.error('❌ Không tìm thấy branch "AnEat - Hoàn Kiếm (Hà Nội)"');
      return;
    }

    console.log(`📦 Source branch: ${sourceBranch.name} (${sourceBranch.code})`);
    console.log(`   ID: ${sourceBranch.id}\n`);

    // Lấy tất cả products từ branch nguồn (bao gồm options)
    const sourceProducts = await prisma.product.findMany({
      where: {
        branchId: sourceBranch.id,
        deletedAt: null,
      },
      include: {
        options: true,
      },
    });

    console.log(`📋 Found ${sourceProducts.length} products in source branch\n`);

    if (sourceProducts.length === 0) {
      console.log('⚠️  Không có products nào để copy');
      return;
    }

    // Lấy tất cả các branch khác (trừ branch nguồn)
    const targetBranches = await prisma.branch.findMany({
      where: {
        id: {
          not: sourceBranch.id,
        },
        deletedAt: null,
      },
    });

    console.log(`🏪 Found ${targetBranches.length} target branches:\n`);
    targetBranches.forEach((branch, index) => {
      console.log(`   ${index + 1}. ${branch.name} (${branch.code})`);
    });
    console.log('');

    if (targetBranches.length === 0) {
      console.log('⚠️  Không có branch nào để copy products');
      return;
    }

    // Copy products sang từng branch
    let totalCopied = 0;
    let totalOptionsCopied = 0;

    for (const targetBranch of targetBranches) {
      console.log(`\n📤 Copying to: ${targetBranch.name}...`);

      // Kiểm tra xem branch này đã có products chưa
      const existingProductsCount = await prisma.product.count({
        where: {
          branchId: targetBranch.id,
          deletedAt: null,
        },
      });

      if (existingProductsCount > 0) {
        console.log(`   ⚠️  Branch này đã có ${existingProductsCount} products. Bỏ qua...`);
        continue;
      }

      let branchCopied = 0;
      let branchOptionsCopied = 0;

      for (const sourceProduct of sourceProducts) {
        try {
          // Tạo code mới cho branch này: {originalCode}-{branchCode}
          // Ví dụ: PROD-COMBO-GA-RAN-BR001
          const newCode = `${sourceProduct.code}-${targetBranch.code}`;
          
          // Kiểm tra xem code này đã tồn tại chưa
          const existingProduct = await prisma.product.findUnique({
            where: { code: newCode },
          });

          if (existingProduct) {
            console.log(`   ⚠️  Product "${sourceProduct.name}" (${newCode}) đã tồn tại, bỏ qua`);
            continue;
          }

          // Tạo product mới cho branch đích
          const newProduct = await prisma.product.create({
            data: {
              code: newCode,
              name: sourceProduct.name,
              description: sourceProduct.description,
              price: sourceProduct.price,
              image: sourceProduct.image,
              quantity: sourceProduct.quantity,
              costPrice: sourceProduct.costPrice,
              prepTime: sourceProduct.prepTime,
              isAvailable: sourceProduct.isAvailable,
              categoryId: sourceProduct.categoryId,
              branchId: targetBranch.id,
            },
          });

          branchCopied++;

          // Copy options nếu có
          if (sourceProduct.options && sourceProduct.options.length > 0) {
            const optionsData = sourceProduct.options.map((option) => ({
              productId: newProduct.id,
              name: option.name,
              description: option.description,
              price: option.price,
              type: option.type,
              isRequired: option.isRequired,
              isAvailable: option.isAvailable,
              order: option.order,
            }));

            await prisma.productOption.createMany({
              data: optionsData,
            });

            branchOptionsCopied += optionsData.length;
          }
        } catch (error: any) {
          console.error(`   ❌ Error copying product "${sourceProduct.name}":`, error.message);
        }
      }

      console.log(`   ✅ Copied ${branchCopied} products with ${branchOptionsCopied} options`);
      totalCopied += branchCopied;
      totalOptionsCopied += branchOptionsCopied;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Total products copied: ${totalCopied}`);
    console.log(`   ✅ Total options copied: ${totalOptionsCopied}`);
    console.log(`   ✅ Target branches: ${targetBranches.length}`);
    console.log('='.repeat(50) + '\n');

    // Verify: Đếm products trong mỗi branch
    console.log('🔍 Verifying...\n');
    const allBranches = await prisma.branch.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    for (const branch of allBranches) {
      const optionsCount = await prisma.productOption.count({
        where: {
          product: {
            branchId: branch.id,
            deletedAt: null,
          },
        },
      });

      console.log(
        `   ${branch.name}: ${branch._count.products} products, ${optionsCount} options`
      );
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

copyProductsToAllBranches();
