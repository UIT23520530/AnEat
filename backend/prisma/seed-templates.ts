import { PrismaClient, TemplateCategory, TemplateStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('🌱 Seeding templates...');

  // Clear existing templates
  await prisma.template.deleteMany({});

  // Company-wide templates (branchId = null)
  const templates = [
    {
      name: 'Hóa đơn chuẩn',
      type: 'Mẫu hóa đơn',
      description: 'Mẫu hóa đơn mặc định cho toàn hệ thống',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 24px; margin: 10px 0; }
    .header { text-align: center; margin-bottom: 15px; }
    .info { margin: 10px 0; font-size: 14px; }
    .items { margin: 15px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>HÓA ĐƠN</h1>
    <p><strong>AnEat Restaurant</strong></p>
  </div>
  
  <div class="info">
    <p>Mã đơn hàng: <strong>{{orderId}}</strong></p>
    <p>Ngày: <strong>{{date}}</strong></p>
    <p>Khách hàng: <strong>{{customerName}}</strong></p>
    <p>Số điện thoại: <strong>{{customerPhone}}</strong></p>
  </div>
  
  <div class="items">
    <p><strong>Chi tiết đơn hàng:</strong></p>
    {{items}}
  </div>
  
  <div class="total">
    <div style="display: flex; justify-content: space-between;">
      <span>Tổng cộng:</span>
      <span>{{total}}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Giảm giá:</span>
      <span>{{discount}}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 18px;">
      <span>Thành tiền:</span>
      <span>{{finalTotal}}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>Cảm ơn quý khách!</p>
    <p>Hẹn gặp lại!</p>
  </div>
</body>
</html>`,
      category: TemplateCategory.INVOICE,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
      branchId: null,
    },
    {
      name: 'Phiếu order tại bàn',
      type: 'Mẫu đơn hàng',
      description: 'Mẫu in phiếu order cho khách tại bàn',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phiếu Order</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 24px; margin: 10px 0; }
    .info { margin: 10px 0; font-size: 16px; }
    .items { margin: 15px 0; }
    .item { margin: 10px 0; font-size: 14px; }
  </style>
</head>
<body>
  <h1>PHIẾU ORDER</h1>
  
  <div class="info">
    <p>Số bàn: <strong style="font-size: 24px;">{{tableNumber}}</strong></p>
    <p>Thời gian: <strong>{{date}}</strong></p>
  </div>
  
  <div class="items">
    <p><strong>Món đặt:</strong></p>
    {{items}}
  </div>
</body>
</html>`,
      category: TemplateCategory.ORDER,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
      branchId: null,
    },
    {
      name: 'Biên lai thanh toán',
      type: 'Mẫu biên lai',
      description: 'Biên lai đơn giản cho thanh toán nhanh',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Biên lai</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 20px; margin: 10px 0; }
    .info { margin: 10px 0; font-size: 14px; }
    .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; text-align: center; }
  </style>
</head>
<body>
  <h1>BIÊN LAI</h1>
  
  <div class="info">
    <p>Mã: <strong>{{orderId}}</strong></p>
    <p>Ngày: <strong>{{date}}</strong></p>
  </div>
  
  <div class="total">
    <p>Tổng tiền: <strong>{{total}}</strong></p>
  </div>
  
  <p style="text-align: center; margin-top: 20px;">Cảm ơn quý khách!</p>
</body>
</html>`,
      category: TemplateCategory.RECEIPT,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
      branchId: null,
    },
    {
      name: 'Báo cáo doanh thu ngày',
      type: 'Mẫu báo cáo',
      description: 'Báo cáo tổng kết doanh thu cuối ngày',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Báo cáo doanh thu</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 20px; margin: 10px 0; }
    .info { margin: 10px 0; font-size: 14px; }
    .summary { margin: 15px 0; }
    .row { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>BÁO CÁO DOANH THU</h1>
  
  <div class="info">
    <p>Ngày: <strong>{{date}}</strong></p>
    <p>Chi nhánh: <strong>{{branchName}}</strong></p>
  </div>
  
  <div class="summary">
    <div class="row">
      <span>Tổng doanh thu:</span>
      <span><strong>{{totalSales}}</strong></span>
    </div>
    <div class="row">
      <span>Tổng đơn hàng:</span>
      <span><strong>{{totalOrders}}</strong></span>
    </div>
    <div class="row total">
      <span>Lợi nhuận:</span>
      <span><strong>{{profit}}</strong></span>
    </div>
  </div>
</body>
</html>`,
      category: TemplateCategory.REPORT,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
      branchId: null,
    },
    {
      name: 'Hóa đơn khuyến mãi',
      type: 'Mẫu hóa đơn',
      description: 'Hóa đơn có áp dụng giảm giá và khuyến mãi',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn khuyến mãi</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 24px; margin: 10px 0; color: #e74c3c; }
    .promo { background: #e74c3c; color: white; padding: 5px; text-align: center; margin: 10px 0; }
    .info { margin: 10px 0; font-size: 14px; }
    .items { margin: 15px 0; }
    .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
    .discount { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  <h1>ƯU ĐÃI ĐẶC BIỆT</h1>
  <div class="promo">🎉 KHUYẾN MÃI 🎉</div>
  
  <div class="info">
    <p>Mã đơn: <strong>{{orderId}}</strong></p>
    <p>Ngày: <strong>{{date}}</strong></p>
    <p>Khách hàng: <strong>{{customerName}}</strong></p>
  </div>
  
  <div class="items">
    {{items}}
  </div>
  
  <div class="total">
    <div style="display: flex; justify-content: space-between;">
      <span>Tổng cộng:</span>
      <span>{{total}}</span>
    </div>
    <div style="display: flex; justify-content: space-between;" class="discount">
      <span>Giảm giá:</span>
      <span>-{{discount}}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
      <span>Thành tiền:</span>
      <span>{{finalTotal}}</span>
    </div>
    <p style="text-align: center; margin-top: 10px;" class="discount">
      Tiết kiệm: {{discount}}
    </p>
  </div>
  
  <p style="text-align: center; margin-top: 20px;">Cảm ơn quý khách!</p>
</body>
</html>`,
      category: TemplateCategory.INVOICE,
      status: TemplateStatus.ACTIVE,
      isDefault: false,
      branchId: null,
    },
    {
      name: 'Đơn hàng giao tận nơi',
      type: 'Mẫu đơn hàng',
      description: 'Mẫu đơn hàng giao hàng tận nơi',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Đơn giao hàng</title>
  <style>
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
    h1 { text-align: center; font-size: 22px; margin: 10px 0; }
    .info { margin: 10px 0; font-size: 14px; }
    .address { background: #f0f0f0; padding: 10px; margin: 10px 0; }
    .items { margin: 15px 0; }
  </style>
</head>
<body>
  <h1>ĐƠN GIAO HÀNG</h1>
  
  <div class="info">
    <p>Mã đơn: <strong>{{orderId}}</strong></p>
    <p>Khách hàng: <strong>{{customerName}}</strong></p>
    <p>SĐT: <strong>{{customerPhone}}</strong></p>
  </div>
  
  <div class="address">
    <p><strong>Địa chỉ giao hàng:</strong></p>
    <p>{{address}}</p>
  </div>
  
  <div class="items">
    <p><strong>Món đặt:</strong></p>
    {{items}}
  </div>
  
  <div style="margin-top: 15px; font-size: 16px; font-weight: bold;">
    <p>Tổng tiền: {{total}}</p>
  </div>
</body>
</html>`,
      category: TemplateCategory.ORDER,
      status: TemplateStatus.ACTIVE,
      isDefault: false,
      branchId: null,
    },
  ];

  // Create templates
  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
    console.log(`✅ Created template: ${template.name}`);
  }

  console.log(`\n✨ Seeded ${templates.length} templates successfully!`);
}

seedTemplates()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
