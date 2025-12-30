import { PrismaClient, PromotionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎉 Bắt đầu seed dữ liệu khuyến mãi...');

  // Sample promotions
  const promotions = [
    {
      code: 'WELCOME10',
      type: PromotionType.PERCENTAGE,
      value: 10,
      maxUses: 1000,
      isActive: true,
      expiryDate: new Date('2025-12-31'),
      minOrderAmount: 100000,
    },
    {
      code: 'SALE20',
      type: PromotionType.PERCENTAGE,
      value: 20,
      maxUses: 500,
      isActive: true,
      expiryDate: new Date('2025-06-30'),
      minOrderAmount: 200000,
    },
    {
      code: 'FREESHIP50K',
      type: PromotionType.FIXED,
      value: 50000,
      maxUses: 2000,
      isActive: true,
      expiryDate: new Date('2025-12-31'),
      minOrderAmount: 150000,
    },
    {
      code: 'NEWYEAR30',
      type: PromotionType.PERCENTAGE,
      value: 30,
      maxUses: 100,
      isActive: true,
      expiryDate: new Date('2025-01-31'),
      minOrderAmount: 500000,
    },
    {
      code: 'FLASH50',
      type: PromotionType.FIXED,
      value: 50000,
      maxUses: null, // No limit
      isActive: true,
      expiryDate: null, // No expiry
      minOrderAmount: 100000,
    },
    {
      code: 'VIP15',
      type: PromotionType.PERCENTAGE,
      value: 15,
      maxUses: 200,
      isActive: true,
      expiryDate: new Date('2025-12-31'),
      minOrderAmount: 300000,
    },
    {
      code: 'STUDENT10',
      type: PromotionType.PERCENTAGE,
      value: 10,
      maxUses: null,
      isActive: true,
      expiryDate: null,
      minOrderAmount: 50000,
    },
    {
      code: 'LUNCH25',
      type: PromotionType.PERCENTAGE,
      value: 25,
      maxUses: 300,
      isActive: true,
      expiryDate: new Date('2025-03-31'),
      minOrderAmount: 150000,
    },
    {
      code: 'FIRSTORDER100K',
      type: PromotionType.FIXED,
      value: 100000,
      maxUses: 500,
      isActive: true,
      expiryDate: new Date('2025-12-31'),
      minOrderAmount: 200000,
    },
    {
      code: 'OLDPROMO',
      type: PromotionType.PERCENTAGE,
      value: 50,
      maxUses: 50,
      isActive: false, // Inactive
      expiryDate: new Date('2024-12-31'), // Expired
      minOrderAmount: 100000,
    },
  ];

  for (const promotion of promotions) {
    try {
      const created = await prisma.promotion.upsert({
        where: { code: promotion.code },
        update: promotion,
        create: promotion,
      });
      console.log(`✅ Created/Updated promotion: ${created.code}`);
    } catch (error) {
      console.error(`❌ Error creating promotion ${promotion.code}:`, error);
    }
  }

  // Simulate some used promotions
  try {
    await prisma.promotion.update({
      where: { code: 'WELCOME10' },
      data: { usedCount: 234 },
    });
    await prisma.promotion.update({
      where: { code: 'SALE20' },
      data: { usedCount: 156 },
    });
    await prisma.promotion.update({
      where: { code: 'FREESHIP50K' },
      data: { usedCount: 892 },
    });
    await prisma.promotion.update({
      where: { code: 'NEWYEAR30' },
      data: { usedCount: 45 },
    });
    await prisma.promotion.update({
      where: { code: 'FLASH50' },
      data: { usedCount: 67 },
    });
    console.log('✅ Updated usedCount for promotions');
  } catch (error) {
    console.error('❌ Error updating usedCount:', error);
  }

  console.log('🎉 Hoàn thành seed dữ liệu khuyến mãi!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
