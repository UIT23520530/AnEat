import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Xóa tất cả products và options cũ
 * Giữ lại categories và các bảng khác
 */
async function cleanupProducts() {
  console.log('🧹 Cleaning up old products and options...\n');

  try {
    // Đếm số lượng trước khi xóa
    const productCount = await prisma.product.count();
    const optionCount = await prisma.productOption.count();
    const orderItemOptionCount = await prisma.orderItemOption.count();

    console.log(`📊 Current data:`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - ProductOptions: ${optionCount}`);
    console.log(`   - OrderItemOptions: ${orderItemOptionCount}\n`);

    if (productCount === 0 && optionCount === 0) {
      console.log('✅ No products to clean up. Database is already empty.\n');
      return;
    }

    // Xóa OrderItemOption trước (có foreign key đến ProductOption)
    if (orderItemOptionCount > 0) {
      console.log('🗑️  Deleting OrderItemOptions...');
      const deletedOrderItemOptions = await prisma.orderItemOption.deleteMany({});
      console.log(`   ✅ Deleted ${deletedOrderItemOptions.count} OrderItemOptions`);
    }

    // Xóa ProductOption (có foreign key đến Product)
    if (optionCount > 0) {
      console.log('🗑️  Deleting ProductOptions...');
      const deletedOptions = await prisma.productOption.deleteMany({});
      console.log(`   ✅ Deleted ${deletedOptions.count} ProductOptions`);
    }

    // Xóa Product (có foreign key đến OrderItem, StockRequest, etc.)
    // Cần xóa các bảng liên quan trước
    console.log('🗑️  Deleting related data...');
    
    // Xóa OrderItem (có foreign key đến Product)
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrderItems.count} OrderItems`);

    // Xóa StockRequest (có foreign key đến Product)
    const deletedStockRequests = await prisma.stockRequest.deleteMany({});
    console.log(`   ✅ Deleted ${deletedStockRequests.count} StockRequests`);

    // Xóa StockTransaction (có foreign key đến Product)
    const deletedStockTransactions = await prisma.stockTransaction.deleteMany({});
    console.log(`   ✅ Deleted ${deletedStockTransactions.count} StockTransactions`);

    // Xóa Inventory (có foreign key đến Product)
    const deletedInventories = await prisma.inventory.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInventories.count} Inventories`);

    // Xóa Review (có foreign key đến Product)
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`   ✅ Deleted ${deletedReviews.count} Reviews`);

    // Cuối cùng xóa Product
    console.log('🗑️  Deleting Products...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✅ Deleted ${deletedProducts.count} Products`);

    console.log('\n✨ Cleanup completed!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Products deleted: ${deletedProducts.count}`);
    console.log(`   ✅ ProductOptions deleted: ${optionCount}`);
    console.log(`   ✅ Related data cleaned up`);
    console.log('\n💡 You can now run: npm run import:menu:md');
  } catch (error) {
    console.error('❌ Error cleaning up products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupProducts();
