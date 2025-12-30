import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // Category 1: Burger
  {
    code: 'BURGER-001',
    name: 'Burger Bò Tiêu Chuẩn',
    description: 'Burger bò truyền thống với rau xà lách, cà chua và tương ớt',
    price: 45000,
    costPrice: 25000,
    quantity: 100,
    prepTime: 8,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-002',
    name: 'Burger Bò Phô Mai',
    description: 'Burger bò với phô mai cheddar tan chảy',
    price: 50000,
    costPrice: 28000,
    quantity: 100,
    prepTime: 8,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-003',
    name: 'Burger Bò Phô Mai Kép',
    description: 'Burger bò kép với phô mai cheddar tan chảy',
    price: 65000,
    costPrice: 38000,
    quantity: 80,
    prepTime: 10,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-004',
    name: 'Burger Gà',
    description: 'Burger gà giòn với rau xà lách và sốt mayonnaise',
    price: 42000,
    costPrice: 23000,
    quantity: 100,
    prepTime: 8,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-005',
    name: 'Burger Gà Giòn Cay',
    description: 'Burger gà giòn cay với sốt đặc biệt',
    price: 48000,
    costPrice: 26000,
    quantity: 90,
    prepTime: 9,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-006',
    name: 'Burger Tôm',
    description: 'Burger tôm giòn với rau xà lách và sốt tartare',
    price: 55000,
    costPrice: 32000,
    quantity: 60,
    prepTime: 10,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-007',
    name: 'Burger Cá',
    description: 'Burger cá với sốt tartare và rau xà lách',
    price: 52000,
    costPrice: 30000,
    quantity: 70,
    prepTime: 9,
    categoryCode: 'BURGER',
  },

  // Category 2: Gà Rán
  {
    code: 'CHICKEN-001',
    name: 'Gà Rán Có Xương',
    description: 'Gà rán giòn có xương - Vị Truyền Thống (1 miếng)',
    price: 35000,
    costPrice: 18000,
    quantity: 150,
    prepTime: 15,
    categoryCode: 'FRIED_CHICKEN',
  },
  {
    code: 'CHICKEN-002',
    name: 'Cánh Gà Sốt Mật Ong',
    description: 'Cánh gà chiên giòn phủ sốt mật ong (3/5/10 miếng)',
    price: 45000,
    costPrice: 22000,
    quantity: 120,
    prepTime: 12,
    categoryCode: 'FRIED_CHICKEN',
  },
  {
    code: 'CHICKEN-003',
    name: 'Cánh Gà Sốt Cay',
    description: 'Cánh gà chiên giòn phủ sốt cay (3/5/10 miếng)',
    price: 45000,
    costPrice: 22000,
    quantity: 120,
    prepTime: 12,
    categoryCode: 'FRIED_CHICKEN',
  },
  {
    code: 'CHICKEN-004',
    name: 'Gà Viên (Popcorn)',
    description: 'Gà viên giòn - Cỡ Vừa / Lớn',
    price: 38000,
    costPrice: 19000,
    quantity: 100,
    prepTime: 10,
    categoryCode: 'FRIED_CHICKEN',
  },
  {
    code: 'CHICKEN-005',
    name: 'Gà Không Xương',
    description: 'Gà phi lê không xương (3/5 miếng)',
    price: 42000,
    costPrice: 21000,
    quantity: 100,
    prepTime: 12,
    categoryCode: 'FRIED_CHICKEN',
  },

  // Category 3: Món Ăn Kèm
  {
    code: 'SIDE-001',
    name: 'Khoai Tây Chiên',
    description: 'Khoai tây chiên giòn - Cỡ Nhỏ / Vừa / Lớn',
    price: 25000,
    costPrice: 10000,
    quantity: 200,
    prepTime: 5,
    categoryCode: 'SIDE_DISHES',
  },
  {
    code: 'SIDE-002',
    name: 'Khoai Tây Nghiền',
    description: 'Khoai tây nghiền mịn - Cỡ Nhỏ / Vừa',
    price: 22000,
    costPrice: 9000,
    quantity: 150,
    prepTime: 5,
    categoryCode: 'SIDE_DISHES',
  },
  {
    code: 'SIDE-003',
    name: 'Salad Bắp Cải',
    description: 'Salad bắp cải tươi với sốt mayonnaise',
    price: 18000,
    costPrice: 7000,
    quantity: 100,
    prepTime: 3,
    categoryCode: 'SIDE_DISHES',
  },
  {
    code: 'SIDE-004',
    name: 'Bánh Mì Bơ Tỏi',
    description: 'Bánh mì nướng với bơ tỏi thơm ngon',
    price: 20000,
    costPrice: 8000,
    quantity: 80,
    prepTime: 5,
    categoryCode: 'SIDE_DISHES',
  },
  {
    code: 'SIDE-005',
    name: 'Phô Mai Que',
    description: 'Phô mai que chiên giòn (3 que)',
    price: 28000,
    costPrice: 12000,
    quantity: 90,
    prepTime: 6,
    categoryCode: 'SIDE_DISHES',
  },
  {
    code: 'SIDE-006',
    name: 'Hành Vòng Chiên',
    description: 'Hành tây tẩm bột chiên giòn',
    price: 24000,
    costPrice: 10000,
    quantity: 100,
    prepTime: 6,
    categoryCode: 'SIDE_DISHES',
  },

  // Category 4: Thức Uống
  {
    code: 'DRINK-001',
    name: 'Coca-Cola',
    description: 'Nước ngọt Coca-Cola - Cỡ Nhỏ / Vừa / Lớn',
    price: 15000,
    costPrice: 5000,
    quantity: 300,
    prepTime: 2,
    categoryCode: 'BEVERAGES',
  },
  {
    code: 'DRINK-002',
    name: 'Pepsi',
    description: 'Nước ngọt Pepsi - Cỡ Nhỏ / Vừa / Lớn',
    price: 15000,
    costPrice: 5000,
    quantity: 300,
    prepTime: 2,
    categoryCode: 'BEVERAGES',
  },
  {
    code: 'DRINK-003',
    name: '7 Up / Sprite',
    description: 'Nước ngọt 7 Up hoặc Sprite - Cỡ Nhỏ / Vừa / Lớn',
    price: 15000,
    costPrice: 5000,
    quantity: 300,
    prepTime: 2,
    categoryCode: 'BEVERAGES',
  },
  {
    code: 'DRINK-004',
    name: 'Nước Suối',
    description: 'Nước suối tinh khiết - Chai 500ml',
    price: 10000,
    costPrice: 3000,
    quantity: 400,
    prepTime: 1,
    categoryCode: 'BEVERAGES',
  },
  {
    code: 'DRINK-005',
    name: 'Trà Chanh',
    description: 'Trà chanh tươi mát lạnh - Ly cỡ Vừa',
    price: 18000,
    costPrice: 6000,
    quantity: 200,
    prepTime: 3,
    categoryCode: 'BEVERAGES',
  },
  {
    code: 'DRINK-006',
    name: 'Trà Đào',
    description: 'Trà đào ngọt dịu - Ly cỡ Vừa',
    price: 20000,
    costPrice: 7000,
    quantity: 200,
    prepTime: 3,
    categoryCode: 'BEVERAGES',
  },

  // Category 5: Tráng Miệng
  {
    code: 'DESSERT-001',
    name: 'Kem Ốc Quế Vani',
    description: 'Kem vani thơm ngon trong ốc quế giòn',
    price: 18000,
    costPrice: 7000,
    quantity: 150,
    prepTime: 2,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-002',
    name: 'Kem Ốc Quế Chocolate',
    description: 'Kem chocolate đậm đà trong ốc quế giòn',
    price: 20000,
    costPrice: 8000,
    quantity: 150,
    prepTime: 2,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-003',
    name: 'Kem Ly Sundae',
    description: 'Kem sundae với sốt chocolate hoặc dâu',
    price: 25000,
    costPrice: 10000,
    quantity: 120,
    prepTime: 3,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-004',
    name: 'Kem Trộn (Oreo)',
    description: 'Kem vani trộn bánh Oreo giòn tan',
    price: 28000,
    costPrice: 12000,
    quantity: 100,
    prepTime: 4,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-005',
    name: 'Kem Trộn (KitKat)',
    description: 'Kem vani trộn chocolate KitKat',
    price: 30000,
    costPrice: 13000,
    quantity: 100,
    prepTime: 4,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-006',
    name: 'Bánh Táo Nướng',
    description: 'Bánh táo nướng giòn thơm với nhân táo',
    price: 22000,
    costPrice: 9000,
    quantity: 80,
    prepTime: 5,
    categoryCode: 'DESSERTS',
  },
  {
    code: 'DESSERT-007',
    name: 'Bánh Trứng',
    description: 'Bánh trứng Bồ Đào Nha thơm béo',
    price: 15000,
    costPrice: 6000,
    quantity: 100,
    prepTime: 3,
    categoryCode: 'DESSERTS',
  },

  // Category 6: Combo
  {
    code: 'COMBO-001',
    name: 'Combo Burger Tiết Kiệm',
    description: '1 Burger Bò Phô Mai + 1 Khoai Tây Vừa + 1 Coca Vừa',
    price: 75000,
    costPrice: 38000,
    quantity: 50,
    prepTime: 10,
    categoryCode: 'COMBO',
  },
  {
    code: 'COMBO-002',
    name: 'Combo Gà Rán Thả Ga',
    description: '2 Gà Rán (tự chọn vị) + 1 Salad Bắp Cải + 1 Pepsi Vừa',
    price: 95000,
    costPrice: 48000,
    quantity: 50,
    prepTime: 18,
    categoryCode: 'COMBO',
  },
  {
    code: 'COMBO-003',
    name: 'Combo Cặp Đôi Vui Vẻ',
    description: '1 Burger Gà Cay + 1 Burger Bò + 2 Khoai Tây Vừa + 2 Nước Vừa',
    price: 145000,
    costPrice: 72000,
    quantity: 40,
    prepTime: 15,
    categoryCode: 'COMBO',
  },
  {
    code: 'COMBO-004',
    name: 'Combo Nhóm Bạn',
    description: '5 Gà Rán + 1 Gà Viên Lớn + 1 Khoai Tây Lớn + 3 Nước Vừa',
    price: 250000,
    costPrice: 125000,
    quantity: 30,
    prepTime: 20,
    categoryCode: 'COMBO',
  },
  {
    code: 'COMBO-005',
    name: 'Combo Tráng Miệng',
    description: '1 Kem Sundae (tự chọn sốt) + 1 Bánh Táo Nướng',
    price: 42000,
    costPrice: 19000,
    quantity: 60,
    prepTime: 6,
    categoryCode: 'COMBO',
  },
];

async function seedProducts() {
  console.log('🌱 Seeding products...');

  try {
    // Get the first branch for products
    const branch = await prisma.branch.findFirst();
    
    if (!branch) {
      throw new Error('No branch found. Please run seed-manager.ts first');
    }

    for (const product of products) {
      const { categoryCode, ...productData } = product;

      // Find category by code
      const category = await prisma.productCategory.findUnique({
        where: { code: categoryCode },
      });

      if (!category) {
        console.log(`⚠️  Category ${categoryCode} not found, skipping product ${product.name}`);
        continue;
      }

      // Check if product already exists
      const existing = await prisma.product.findUnique({
        where: { code: product.code },
      });

      if (existing) {
        console.log(`⏭️  Product ${product.code} already exists, skipping...`);
        continue;
      }

      await prisma.product.create({
        data: {
          ...productData,
          categoryId: category.id,
          branchId: branch.id,
          isAvailable: true,
        },
      });

      console.log(`✅ Created product: ${product.name} (${product.code})`);
    }

    console.log('✨ Products seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
