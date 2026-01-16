import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTestIds() {
  try {
    console.log('🔍 Getting test IDs for API testing...\n');

    // Get first branch
    const branch = await prisma.branch.findFirst({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!branch) {
      console.log('❌ No branch found. Please run seed scripts first.');
      return;
    }

    console.log('📍 Branch:');
    console.log(`   ID: ${branch.id}`);
    console.log(`   Code: ${branch.code}`);
    console.log(`   Name: ${branch.name}\n`);

    // Get products from this branch
    const products = await prisma.product.findMany({
      where: {
        branchId: branch.id,
        isAvailable: true,
        quantity: { gt: 0 },
      },
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        quantity: true,
      },
      take: 5,
    });

    if (products.length === 0) {
      console.log('❌ No available products found in this branch.');
      return;
    }

    console.log('🍔 Available Products:');
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.code})`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Price: ${product.price} (${product.price / 100}đ)`);
      console.log(`      Stock: ${product.quantity}\n`);
    });

    console.log('\n📋 Example API Request Body:');
    console.log(JSON.stringify(
      {
        branchId: branch.id,
        items: [
          {
            productId: products[0].id,
            quantity: 2,
          },
          ...(products.length > 1
            ? [
                {
                  productId: products[1].id,
                  quantity: 1,
                },
              ]
            : []),
        ],
        customerInfo: {
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          email: 'customer@example.com',
          address: '123 Đường ABC, Quận 1, TP.HCM',
        },
        promotionCode: null,
        notes: 'Giao hàng trước 12h',
      },
      null,
      2
    ));

    console.log('\n✅ Copy the IDs above to test the API!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTestIds();
