import { prisma } from '../src/db';
import { StaffOrderService } from '../src/models/staff-order.service';

(async () => {
  try {
    const product = await prisma.product.findFirst({
      where: { branchId: 'cmkhv7kej002nwfrzjvwr3oqk', isAvailable: true }
    });
    
    if (!product) {
      console.log('No product found');
      await prisma.$disconnect();
      return;
    }
    
    console.log('Product:', product.name, product.price);
    
    const order = await StaffOrderService.createOrder({
      staffId: 'cmkhv7kel002pwfrzeowvm74z',
      branchId: 'cmkhv7kej002nwfrzjvwr3oqk',
      items: [{
        productId: product.id,
        quantity: 2,
        price: product.price
      }],
      paymentMethod: 'CASH',
      notes: 'Test order for debugging'
    });
    
    console.log('\n✅ Order created:', order.id);
    console.log('Order items:', JSON.stringify(order.items, null, 2));
    
    // Now fetch the order using getOrderById
    console.log('\n🔍 Fetching order by ID...');
    const fetchedOrder = await StaffOrderService.getOrderById(order.id);
    console.log('Fetched order items:', JSON.stringify(fetchedOrder?.items, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
