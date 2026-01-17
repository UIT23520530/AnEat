import { PrismaClient, BannerStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBanners() {
  console.log('🌅 Seeding banners...');

  const banners = [
    {
      title: 'NỞ CÀNG BỤNG VUI BẤT MOOD',
      description: 'Combo 79.000đ',
      image: '/assets/fried-chicken-combo-meal.jpg',
      link: null,
      order: 0,
      status: BannerStatus.ACTIVE,
    },
    {
      title: 'BURGER PHÔ MAI',
      description: 'Thử ngay burger phô mai mới',
      image: '/assets/cheese-burger.png',
      link: null,
      order: 1,
      status: BannerStatus.ACTIVE,
    },
    {
      title: 'MỲ Ý THƯỢNG HẠNG',
      description: 'Mỳ Ý Carbonara đặc biệt',
      image: '/assets/classic-carbonara.png',
      link: null,
      order: 2,
      status: BannerStatus.ACTIVE,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({
      where: {
        image: banner.image,
      },
    });

    if (!existing) {
      await prisma.banner.create({
        data: banner,
      });
      console.log(`✅ Created banner: ${banner.title}`);
    } else {
      console.log(`⏭️  Banner already exists: ${banner.title}`);
    }
  }

  console.log('✨ Banner seeding completed!');
}

seedBanners()
  .catch((e) => {
    console.error('❌ Error seeding banners:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
