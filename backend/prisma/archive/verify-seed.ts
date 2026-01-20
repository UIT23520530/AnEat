import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('📊 Verifying Seeded Data\n');
  console.log('='.repeat(60));

  try {
    // Customer data
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
    });
    
    console.log('\n👥 KHÁCH HÀNG THÀNH VIÊN:');
    console.log('-'.repeat(60));
    console.log(`Tổng số khách hàng: ${customers.length}`);
    
    const tierCounts = customers.reduce((acc, c) => {
      acc[c.tier] = (acc[c.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nPhân loại hạng:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`  • ${tier}: ${count} khách hàng`);
    });
    
    console.log('\nTop 5 khách hàng chi tiêu nhiều nhất:');
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    topCustomers.forEach((customer, index) => {
      console.log(`  ${index + 1}. ${customer.name}`);
      console.log(`     - Hạng: ${customer.tier}`);
      console.log(`     - Tổng chi tiêu: ${(customer.totalSpent / 100).toLocaleString('vi-VN')} VNĐ`);
      console.log(`     - Điểm: ${customer.points}`);
      console.log(`     - Số đơn hàng: ${customer.orders.length}`);
    });

    // Bills data
    const bills = await prisma.bill.findMany({
      include: {
        branch: true,
      },
    });
    
    console.log('\n\n🧾 HÓA ĐƠN:');
    console.log('-'.repeat(60));
    console.log(`Tổng số hóa đơn: ${bills.length}`);
    
    const statusCounts = bills.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nTrạng thái hóa đơn:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count} hóa đơn`);
    });
    
    const paymentStatusCounts = bills.reduce((acc, b) => {
      acc[b.paymentStatus] = (acc[b.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nTrạng thái thanh toán:');
    Object.entries(paymentStatusCounts).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count} hóa đơn`);
    });
    
    const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
    console.log(`\n💰 Tổng doanh thu: ${(totalRevenue / 100).toLocaleString('vi-VN')} VNĐ`);
    
    // Revenue by branch
    const branchRevenue = bills.reduce((acc, b) => {
      const branchName = b.branch.name;
      acc[branchName] = (acc[branchName] || 0) + b.total;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nDoanh thu theo chi nhánh:');
    Object.entries(branchRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([branch, revenue]) => {
        console.log(`  • ${branch}: ${(revenue / 100).toLocaleString('vi-VN')} VNĐ`);
      });

    // Dashboard relevant data
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
    });
    
    console.log('\n\n📈 DASHBOARD DATA:');
    console.log('-'.repeat(60));
    console.log(`Tổng số đơn hàng: ${orders.length}`);
    
    const orderStatusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nTrạng thái đơn hàng:');
    Object.entries(orderStatusCounts).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count} đơn`);
    });
    
    const totalOrderValue = orders.reduce((sum, o) => {
      const orderTotal = o.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);
    console.log(`\n💵 Tổng giá trị đơn hàng: ${(totalOrderValue / 100).toLocaleString('vi-VN')} VNĐ`);
    
    const avgOrderValue = orders.length > 0 ? totalOrderValue / orders.length : 0;
    console.log(`📊 Giá trị đơn hàng trung bình: ${(avgOrderValue / 100).toLocaleString('vi-VN')} VNĐ`);

    // Additional stats
    const branches = await prisma.branch.findMany();
    const products = await prisma.product.findMany();
    const promotions = await prisma.promotion.findMany();
    
    console.log('\n\n📦 TỔNG QUAN HỆ THỐNG:');
    console.log('-'.repeat(60));
    console.log(`Chi nhánh: ${branches.length}`);
    console.log(`Sản phẩm: ${products.length}`);
    console.log(`Khuyến mãi: ${promotions.length}`);
    console.log(`Khách hàng: ${customers.length}`);
    console.log(`Đơn hàng: ${orders.length}`);
    console.log(`Hóa đơn: ${bills.length}`);

    console.log('\n='.repeat(60));
    console.log('✅ Seed data verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyData()
  .catch((error) => {
    console.error(error);

  });
