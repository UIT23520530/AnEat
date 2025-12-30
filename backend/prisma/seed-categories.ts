import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    code: 'BURGER',
    name: 'Burger',
    description: 'Các loại bánh burger',
    isActive: true,
  },
  {
    code: 'FRIED_CHICKEN',
    name: 'Gà Rán',
    description: 'Gà rán, cánh gà, gà viên',
    isActive: true,
  },
  {
    code: 'SIDE_DISHES',
    name: 'Món Ăn Kèm',
    description: 'Khoai tây chiên và các món phụ',
    isActive: true,
  },
  {
    code: 'BEVERAGES',
    name: 'Thức Uống',
    description: 'Nước ngọt, nước suối, trà',
    isActive: true,
  },
  {
    code: 'DESSERTS',
    name: 'Tráng Miệng',
    description: 'Kem và các loại bánh ngọt',
    isActive: true,
  },
  {
    code: 'COMBO',
    name: 'Combo',
    description: 'Các gói/phần ăn kết hợp',
    isActive: true,
  },
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  try {
    for (const category of categories) {
      const existing = await prisma.productCategory.findUnique({
        where: { code: category.code },
      });

      if (existing) {
        console.log(`⏭️  Category ${category.code} already exists, skipping...`);
        continue;
      }

      await prisma.productCategory.create({
        data: category,
      });

      console.log(`✅ Created category: ${category.name} (${category.code})`);
    }

    console.log('✨ Categories seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
