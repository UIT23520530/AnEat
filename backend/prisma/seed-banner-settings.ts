import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBannerAndSettings() {
  console.log('🎨 Seeding banners and system settings...\n');

  try {
    // ==================== Seed Banners ====================
    console.log('📸 Creating banners...');
    
    const banners = [
      {
        imageUrl: '/assets/fried-chicken-combo-meal.jpg',
        title: 'NỞ CÀNG BỤNG VUI BẤT MOOD',
        description: 'Combo 79.000đ',
        badge: 'Giá không đổi',
        displayOrder: 0,
        isActive: true,
      },
      {
        imageUrl: '/assets/cheese-burger.png',
        title: 'BURGER PHÔ MAI',
        description: 'Thử ngay burger phô mai mới',
        badge: 'Mới',
        displayOrder: 1,
        isActive: true,
      },
      {
        imageUrl: '/assets/classic-carbonara.png',
        title: 'MỲ Ý THƯỢNG HẠNG',
        description: 'Thưởng thức hương vị Ý đích thực',
        badge: 'Best Seller',
        displayOrder: 2,
        isActive: true,
      },
    ];

    // Delete existing banners first to avoid conflicts
    await prisma.banner.deleteMany({});

    // Create new banners
    for (const banner of banners) {
      await prisma.banner.create({
        data: banner,
      });
    }

    console.log(`✅ Created ${banners.length} banners\n`);

    // ==================== Seed System Settings ====================
    console.log('⚙️  Creating system settings...');

    const settings = [
      // General settings
      { key: 'store_name', value: 'AnEat', type: 'text', category: 'general', description: 'Tên cửa hàng', isPublic: true },
      { key: 'store_tagline', value: 'Ngon - Nhanh - Tiện lợi', type: 'text', category: 'general', description: 'Slogan', isPublic: true },
      
      // Contact settings
      { key: 'hotline', value: '1900 6522', type: 'text', category: 'contact', description: 'Số hotline', isPublic: true },
      { key: 'email', value: 'contact@aneat.com', type: 'text', category: 'contact', description: 'Email liên hệ', isPublic: true },
      { key: 'address', value: 'Thủ Dầu Một, Bình Dương', type: 'text', category: 'contact', description: 'Địa chỉ', isPublic: true },
      
      // Social media
      { key: 'facebook_url', value: 'https://facebook.com/aneat', type: 'text', category: 'social', description: 'Link Facebook', isPublic: true },
      { key: 'instagram_url', value: 'https://instagram.com/aneat', type: 'text', category: 'social', description: 'Link Instagram', isPublic: true },
      { key: 'tiktok_url', value: 'https://tiktok.com/@aneat', type: 'text', category: 'social', description: 'Link TikTok', isPublic: true },
      
      // About us
      { key: 'about_us', value: 'AnEat là chuỗi cửa hàng thức ăn nhanh hàng đầu tại Việt Nam. Chúng tôi cam kết mang đến những món ăn ngon, chất lượng với dịch vụ nhanh chóng và thân thiện.', type: 'text', category: 'about', description: 'Giới thiệu về chúng tôi', isPublic: true },
      { key: 'mission', value: 'Mang đến trải nghiệm ẩm thực tuyệt vời cho mọi khách hàng', type: 'text', category: 'about', description: 'Sứ mệnh', isPublic: true },
      { key: 'vision', value: 'Trở thành chuỗi thức ăn nhanh số 1 Việt Nam', type: 'text', category: 'about', description: 'Tầm nhìn', isPublic: true },
      
      // Business settings
      { key: 'tax_rate', value: '10', type: 'number', category: 'business', description: 'Thuế VAT (%)', isPublic: true },
      { key: 'delivery_fee', value: '20000', type: 'number', category: 'business', description: 'Phí giao hàng (VND)', isPublic: true },
      { key: 'min_order_amount', value: '50000', type: 'number', category: 'business', description: 'Đơn hàng tối thiểu (VND)', isPublic: true },
      { key: 'free_ship_threshold', value: '200000', type: 'number', category: 'business', description: 'Miễn phí ship từ (VND)', isPublic: true },
      
      // Banner settings
      { key: 'banner_transition_time', value: '5000', type: 'number', category: 'banner', description: 'Thời gian chuyển banner (ms)', isPublic: false },
      { key: 'banner_auto_play', value: 'true', type: 'boolean', category: 'banner', description: 'Tự động chuyển banner', isPublic: false },
      
      // Operating hours
      { key: 'opening_time', value: '08:00', type: 'text', category: 'business', description: 'Giờ mở cửa', isPublic: true },
      { key: 'closing_time', value: '22:00', type: 'text', category: 'business', description: 'Giờ đóng cửa', isPublic: true },
      
      // Customer service
      { key: 'return_policy', value: 'Hoàn tiền 100% nếu không hài lòng trong vòng 24h', type: 'text', category: 'policy', description: 'Chính sách hoàn trả', isPublic: true },
      { key: 'warranty_period', value: '30', type: 'number', category: 'policy', description: 'Thời gian bảo hành (ngày)', isPublic: true },
    ];

    for (const setting of settings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        create: setting,
        update: setting,
      });
    }

    console.log(`✅ Created ${settings.length} system settings\n`);

    // ==================== Summary ====================
    console.log('═'.repeat(70));
    console.log('✅ BANNER & SETTINGS SEEDING COMPLETED!\n');
    console.log('📊 SUMMARY:');
    console.log(`  • Banners: ${banners.length}`);
    console.log(`  • System Settings: ${settings.length}`);
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error seeding banners and settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBannerAndSettings()
  .then(() => {
    console.log('\n✨ Seeding completed successfully!');
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
  });
