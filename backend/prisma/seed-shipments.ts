import { PrismaClient, UserRole, ShipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedShipments() {
  console.log('Bắt đầu seed dữ liệu Shipments...');

  try {
    // Lấy logistics staff từ database
    const logisticsStaff = await prisma.user.findMany({
      where: {
        role: UserRole.LOGISTICS_STAFF,
      },
      take: 3,
    });

    if (logisticsStaff.length === 0) {
      console.log('Không tìm thấy LOGISTICS_STAFF. Tạo user mẫu...');
      
      // Tạo logistics staff mẫu
      const newStaff = await prisma.user.create({
        data: {
          email: 'logistics001@aneat.com',
          password: '$2a$10$YourHashedPasswordHere', // Cần hash thực tế
          name: 'Nguyễn Văn Logistics',
          phone: '0901234567',
          role: UserRole.LOGISTICS_STAFF,
        },
      });
      
      logisticsStaff.push(newStaff);
    }

    // Lấy branches và products từ database
    const branches = await prisma.branch.findMany({
      take: 5,
    });

    if (branches.length === 0) {
      throw new Error('Không tìm thấy chi nhánh. Vui lòng seed branches trước.');
    }

    const products = await prisma.product.findMany({
      take: 10,
    });

    if (products.length === 0) {
      throw new Error('Không tìm thấy sản phẩm. Vui lòng seed products trước.');
    }

    // Tạo stock requests mẫu cho các shipments
    const stockRequests = [];
    for (let i = 0; i < 10; i++) {
      const stockRequest = await prisma.stockRequest.create({
        data: {
          requestNumber: `SR-${Date.now()}-${i.toString().padStart(3, '0')}`,
          type: 'RESTOCK',
          status: 'APPROVED',
          requestedQuantity: 50 + i * 10,
          approvedQuantity: 50 + i * 10,
          notes: `Yêu cầu nhập hàng cho chuyến #${i + 1}`,
          productId: products[i % products.length].id,
          branchId: branches[i % branches.length].id,
          requestedById: logisticsStaff[0].id,
          requestedDate: new Date(),
          expectedDate: new Date(Date.now() + 86400000), // 1 ngày sau
        },
      });
      stockRequests.push(stockRequest);
    }

    // Dữ liệu món ăn thực tế
    const foodProducts = [
      {
        name: 'Thịt Bò Úc Cao Cấp',
        quantity: 50,
        unit: 'kg',
        temperature: '2-4°C',
        priority: 'HIGH',
      },
      {
        name: 'Gà Rán Giòn Tan',
        quantity: 100,
        unit: 'miếng',
        temperature: '4-8°C',
        priority: 'HIGH',
      },
      {
        name: 'Bánh Mì Pháp',
        quantity: 200,
        unit: 'cái',
        temperature: 'Thường',
        priority: 'NORMAL',
      },
      {
        name: 'Rau Xà Lách Hữu Cơ',
        quantity: 30,
        unit: 'kg',
        temperature: '2-4°C',
        priority: 'NORMAL',
      },
      {
        name: 'Nước Ngọt Có Gas',
        quantity: 150,
        unit: 'chai',
        temperature: '8-12°C',
        priority: 'LOW',
      },
      {
        name: 'Sốt Mayonnaise',
        quantity: 50,
        unit: 'chai',
        temperature: '4-8°C',
        priority: 'NORMAL',
      },
      {
        name: 'Khoai Tây Chiên',
        quantity: 80,
        unit: 'phần',
        temperature: '-18°C',
        priority: 'HIGH',
      },
      {
        name: 'Bánh Burger Tươi',
        quantity: 120,
        unit: 'cái',
        temperature: 'Thường',
        priority: 'NORMAL',
      },
      {
        name: 'Sốt Cà Chua Heinz',
        quantity: 40,
        unit: 'chai',
        temperature: 'Thường',
        priority: 'LOW',
      },
      {
        name: 'Thịt Gà Tươi Nguyên Con',
        quantity: 60,
        unit: 'kg',
        temperature: '2-4°C',
        priority: 'HIGH',
      },
    ];

    // Các địa điểm kho và chi nhánh
    const locations = [
      { from: 'Kho Trung Tâm Q1', to: branches[0].address, branchCode: branches[0].code },
      { from: 'Kho Miền Bắc', to: branches[1]?.address || 'Chi nhánh miền Bắc', branchCode: branches[1]?.code || branches[0].code },
      { from: 'Kho Miền Trung', to: branches[2]?.address || 'Chi nhánh miền Trung', branchCode: branches[2]?.code || branches[0].code },
      { from: 'Kho Q7', to: branches[3]?.address || 'Chi nhánh Q7', branchCode: branches[3]?.code || branches[0].code },
      { from: 'Kho Bình Thạnh', to: branches[4]?.address || 'Chi nhánh Bình Thạnh', branchCode: branches[4]?.code || branches[0].code },
    ];

    // Tạo shipments với các trạng thái khác nhau
    const shipments = [];

    for (let i = 0; i < 10; i++) {
      const product = foodProducts[i];
      const location = locations[i % locations.length];
      const staff = logisticsStaff[i % logisticsStaff.length];
      
      // Phân bổ trạng thái: 3 READY, 4 IN_TRANSIT, 2 DELIVERED, 1 COMPLETED
      let status: ShipmentStatus;
      let assignedAt: Date | null = null;
      let startedAt: Date | null = null;
      let deliveredAt: Date | null = null;
      let completedAt: Date | null = null;

      if (i < 3) {
        status = ShipmentStatus.READY;
        assignedAt = new Date(Date.now() - Math.random() * 86400000); // Ngẫu nhiên trong 24h qua
      } else if (i < 7) {
        status = ShipmentStatus.IN_TRANSIT;
        assignedAt = new Date(Date.now() - 86400000 * 2);
        startedAt = new Date(Date.now() - Math.random() * 43200000); // Bắt đầu trong 12h qua
      } else if (i < 9) {
        status = ShipmentStatus.DELIVERED;
        assignedAt = new Date(Date.now() - 86400000 * 3);
        startedAt = new Date(Date.now() - 86400000 * 2);
        deliveredAt = new Date(Date.now() - Math.random() * 3600000); // Giao trong 1h qua
      } else {
        status = ShipmentStatus.COMPLETED;
        assignedAt = new Date(Date.now() - 86400000 * 5);
        startedAt = new Date(Date.now() - 86400000 * 4);
        deliveredAt = new Date(Date.now() - 86400000 * 2);
        completedAt = new Date(Date.now() - 86400000);
      }

      const shipment = await prisma.shipment.create({
        data: {
          shipmentNumber: `SHP-${Date.now()}-${i.toString().padStart(3, '0')}`,
          status,
          priority: product.priority === 'HIGH',
          productName: product.name,
          quantity: product.quantity,
          temperature: product.temperature,
          fromLocation: location.from,
          toLocation: location.to,
          branchCode: location.branchCode,
          assignedToId: staff.id,
          stockRequestId: stockRequests[i].id,
          branchId: branches[i % branches.length].id,
          assignedAt,
          startedAt,
          deliveredAt,
          completedAt,
          notes: status === ShipmentStatus.COMPLETED 
            ? 'Giao hàng thành công, khách hàng đã ký nhận' 
            : status === ShipmentStatus.DELIVERED
            ? 'Đã giao hàng, đang chờ xác nhận'
            : null,
        },
      });

      shipments.push(shipment);
      console.log(`✅ Tạo shipment: ${shipment.shipmentNumber} - ${product.name} (${status})`);
    }

    console.log(`\n🎉 Đã tạo ${shipments.length} shipments thành công!`);
    
    // Hiển thị thống kê
    const stats = await prisma.shipment.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\n📊 Thống kê theo trạng thái:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count} shipments`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi seed shipments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được thực thi trực tiếp
if (require.main === module) {
  seedShipments()
    .then(() => {
      console.log('\n✨ Seed shipments hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed thất bại:', error);
      process.exit(1);
    });
}

export { seedShipments };
