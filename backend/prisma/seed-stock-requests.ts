import { PrismaClient, UserRole, StockRequestStatus, StockRequestType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedStockRequests() {
  console.log('🌱 Bắt đầu seed Stock Requests...');

  try {
    // Lấy hoặc tạo managers (ADMIN_BRAND)
    let managers = await prisma.user.findMany({
      where: {
        role: UserRole.ADMIN_BRAND,
        branchId: { not: null },
      },
      include: {
        branch: true,
      },
    });

    // Nếu không có manager với branchId, tạo mới
    if (managers.length === 0) {
      console.log('⚠️  Không tìm thấy manager có branchId. Tạo managers mẫu...');
      
      const branches = await prisma.branch.findMany({ take: 5 });
      
      if (branches.length === 0) {
        throw new Error('Không tìm thấy chi nhánh. Vui lòng seed branches trước.');
      }

      const hashedPassword = await bcrypt.hash('123456', 10);
      
      for (let i = 0; i < Math.min(3, branches.length); i++) {
        const manager = await prisma.user.create({
          data: {
            email: `manager${i + 1}@aneat.com`,
            password: hashedPassword,
            name: `Quản lý Chi nhánh ${i + 1}`,
            phone: `090123456${i}`,
            role: UserRole.ADMIN_BRAND,
            branchId: branches[i].id,
          },
          include: {
            branch: true,
          },
        });
        managers.push(manager);
      }
      
      console.log(`✅ Đã tạo ${managers.length} managers`);
    }

    // Lấy products
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
      },
      take: 20,
    });

    if (products.length === 0) {
      throw new Error('Không tìm thấy sản phẩm. Vui lòng seed products trước.');
    }

    console.log(`📦 Tìm thấy ${products.length} sản phẩm`);
    console.log(`👥 Tìm thấy ${managers.length} managers`);

    // Xóa stock requests cũ (nếu có)
    const deletedCount = await prisma.stockRequest.deleteMany({});
    console.log(`🗑️  Đã xóa ${deletedCount.count} stock requests cũ`);

    // Tạo stock requests với nhiều trạng thái khác nhau
    const requestTypes = [StockRequestType.RESTOCK, StockRequestType.ADJUSTMENT, StockRequestType.RETURN];
    const statuses = [
      { status: StockRequestStatus.PENDING, weight: 5 }, // 50% PENDING
      { status: StockRequestStatus.APPROVED, weight: 2 }, // 20% APPROVED
      { status: StockRequestStatus.REJECTED, weight: 1 }, // 10% REJECTED
      { status: StockRequestStatus.COMPLETED, weight: 1 }, // 10% COMPLETED
      { status: StockRequestStatus.CANCELLED, weight: 1 }, // 10% CANCELLED
    ];

    const stockRequests = [];
    let requestCounter = 1;

    // Tạo 30 stock requests
    for (let i = 0; i < 30; i++) {
      const manager = managers[i % managers.length];
      const product = products[i % products.length];
      const requestType = requestTypes[i % requestTypes.length];
      
      // Random status dựa trên weight
      const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedStatus = statuses[0].status;
      
      for (const statusConfig of statuses) {
        random -= statusConfig.weight;
        if (random <= 0) {
          selectedStatus = statusConfig.status;
          break;
        }
      }

      // Tạo request number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const requestNumber = `SR${year}${month}${String(requestCounter).padStart(4, '0')}`;
      requestCounter++;

      // Tính toán số lượng
      const requestedQuantity = Math.floor(Math.random() * 100) + 20; // 20-120
      const approvedQuantity = selectedStatus === StockRequestStatus.APPROVED || selectedStatus === StockRequestStatus.COMPLETED
        ? Math.floor(requestedQuantity * (0.8 + Math.random() * 0.2)) // 80-100% của requested
        : null;

      // Ngày
      const daysAgo = Math.floor(Math.random() * 14); // 0-14 ngày trước
      const requestedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const expectedDate = new Date(requestedDate.getTime() + (3 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000); // 3-7 ngày sau
      
      const completedDate = selectedStatus === StockRequestStatus.COMPLETED
        ? new Date(requestedDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
        : null;

      // Notes và rejected reason
      const notes = requestType === StockRequestType.RESTOCK
        ? `Yêu cầu nhập thêm ${product.name} do tồn kho thấp`
        : requestType === StockRequestType.ADJUSTMENT
        ? `Điều chỉnh tồn kho ${product.name}`
        : `Trả lại ${product.name} do hư hỏng`;

      const rejectedReason = selectedStatus === StockRequestStatus.REJECTED
        ? [
            'Sản phẩm tạm thời hết hàng tại kho trung tâm',
            'Số lượng yêu cầu vượt quá hạn mức cho phép',
            'Chi nhánh đã có đủ tồn kho',
            'Sản phẩm đang trong quá trình kiểm tra chất lượng',
          ][Math.floor(Math.random() * 4)]
        : null;

      // Tạo stock request
      const stockRequest = await prisma.stockRequest.create({
        data: {
          requestNumber,
          type: requestType,
          status: selectedStatus,
          requestedQuantity,
          approvedQuantity,
          notes,
          rejectedReason,
          requestedDate,
          expectedDate,
          completedDate,
          productId: product.id,
          branchId: manager.branchId!,
          requestedById: manager.id,
          approvedById: selectedStatus !== StockRequestStatus.PENDING && selectedStatus !== StockRequestStatus.CANCELLED
            ? managers[0].id // Admin đầu tiên approve
            : null,
        },
      });

      stockRequests.push(stockRequest);
    }

    console.log(`✅ Đã tạo ${stockRequests.length} stock requests`);

    // Thống kê
    const stats = await prisma.stockRequest.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\n📊 Thống kê Stock Requests:');
    stats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count} requests`);
    });

    return stockRequests;

  } catch (error) {
    console.error('❌ Lỗi khi seed stock requests:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await seedStockRequests();
    console.log('\n✅ Seed stock requests hoàn tất!');
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { seedStockRequests };
