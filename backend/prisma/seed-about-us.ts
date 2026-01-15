import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAboutUs() {
  console.log('📖 Seeding About Us...');

  const existing = await prisma.aboutUs.findFirst({
    where: { isActive: true },
  });

  if (existing) {
    console.log('⏭️  About Us already exists, skipping...');
    return;
  }

  const aboutUs = await prisma.aboutUs.create({
    data: {
      title: 'Câu chuyện AnEat',
      content: `
        <h2>Chào mừng đến với AnEat</h2>
        <p>AnEat được thành lập với sứ mệnh mang đến những bữa ăn ngon miệng, chất lượng và tiện lợi cho mọi người.</p>
        
        <h3>Sứ mệnh của chúng tôi</h3>
        <p>Chúng tôi cam kết cung cấp những món ăn tươi ngon, đảm bảo vệ sinh an toàn thực phẩm và mang đến trải nghiệm dịch vụ tuyệt vời nhất cho khách hàng.</p>
        
        <h3>Tầm nhìn</h3>
        <p>Trở thành thương hiệu thức ăn nhanh hàng đầu Việt Nam, được yêu thích bởi chất lượng sản phẩm và dịch vụ chuyên nghiệp.</p>
        
        <h3>Giá trị cốt lõi</h3>
        <ul>
          <li><strong>Chất lượng:</strong> Luôn đặt chất lượng lên hàng đầu</li>
          <li><strong>Đổi mới:</strong> Không ngừng cải tiến và phát triển</li>
          <li><strong>Phục vụ:</strong> Khách hàng là trung tâm của mọi hoạt động</li>
          <li><strong>Trách nhiệm:</strong> Cam kết với cộng đồng và môi trường</li>
        </ul>
      `,
      mission: 'Mang đến những bữa ăn ngon miệng, chất lượng và tiện lợi cho mọi người',
      vision: 'Trở thành thương hiệu thức ăn nhanh hàng đầu Việt Nam',
      values: JSON.stringify([
        'Chất lượng',
        'Đổi mới',
        'Phục vụ',
        'Trách nhiệm'
      ]),
      image: '/assets/about-us.jpg',
      isActive: true,
    },
  });

  console.log(`✅ Created About Us: ${aboutUs.title}`);
  console.log('✨ About Us seeding completed!');
}

seedAboutUs()
  .catch((e) => {
    console.error('❌ Error seeding About Us:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
