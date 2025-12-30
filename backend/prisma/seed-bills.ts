import { PrismaClient, BillStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Bills - Convert mockdata to seed data
 * Creates sample bills for testing and development
 */

export async function seedBills() {
  console.log('🧾 Seeding bills...');

  try {
    // Get branches
    const branches = await prisma.branch.findMany({
      take: 3,
    });

    if (branches.length === 0) {
      console.log('⚠️  No branches found. Skipping bill seeding.');
      return;
    }

    // Get staff users for each branch
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'ADMIN_BRAND'] },
      },
      take: 5,
    });

    if (staffUsers.length === 0) {
      console.log('⚠️  No staff users found. Skipping bill seeding.');
      return;
    }

    // Get completed orders that don't have bills yet
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        bill: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      take: 20,
    });

    if (orders.length === 0) {
      console.log('⚠️  No completed orders without bills found. Creating sample orders first...');
      // You might want to create some orders first or handle this case
      return;
    }

    console.log(`📝 Found ${orders.length} orders to create bills for`);

    // Sample bill data variations
    const billTemplates = [
      {
        taxAmount: 10000, // 10% tax
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PAID,
        notes: 'Thanh toán bằng tiền mặt',
      },
      {
        taxAmount: 8000,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.PAID,
        notes: 'Thanh toán bằng thẻ',
      },
      {
        taxAmount: 5000,
        paymentMethod: PaymentMethod.E_WALLET,
        paymentStatus: PaymentStatus.PAID,
        notes: 'Thanh toán qua ví điện tử',
      },
      {
        taxAmount: 0,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Chuyển khoản ngân hàng - chờ xác nhận',
      },
    ];

    const createdBills = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const template = billTemplates[i % billTemplates.length];
      const staff = staffUsers[i % staffUsers.length];

      // Get branch from order or use first branch
      const branchId = order.branchId || branches[0].id;
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        console.log(`⚠️  Branch not found for order ${order.orderNumber}`);
        continue;
      }

      // Generate bill number
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const sequence = (i + 1).toString().padStart(4, '0');
      const billNumber = `BILL-${branch.code}-${year}${month}${day}-${sequence}`;

      // Calculate amounts
      const subtotal = order.total;
      const taxAmount = Math.round(subtotal * 0.1); // 10% tax
      const discountAmount = order.discountAmount || 0;
      const total = subtotal + taxAmount - discountAmount;
      const paidAmount = template.paymentStatus === PaymentStatus.PAID ? total : 0;
      const changeAmount = paidAmount > total ? paidAmount - total : 0;

      // Create bill
      try {
        const bill = await prisma.bill.create({
          data: {
            billNumber,
            status: template.paymentStatus === PaymentStatus.PAID 
              ? BillStatus.PAID 
              : BillStatus.ISSUED,
            subtotal,
            taxAmount,
            discountAmount,
            total,
            customerName: order.customer?.name || 'Khách hàng',
            customerPhone: order.customer?.phone || null,
            customerEmail: order.customer?.email || null,
            customerAddress: order.deliveryAddress || null,
            paymentMethod: template.paymentMethod,
            paymentStatus: template.paymentStatus,
            paidAmount,
            changeAmount,
            notes: template.notes,
            internalNotes: `Auto-generated bill for order ${order.orderNumber}`,
            orderId: order.id,
            branchId,
            issuedById: staff.id,
          },
        });

        createdBills.push(bill);
        console.log(`✅ Created bill ${bill.billNumber} for order ${order.orderNumber}`);
      } catch (error: any) {
        console.error(`❌ Error creating bill for order ${order.orderNumber}:`, error.message);
      }
    }

    // Create some bill history entries for edited bills
    if (createdBills.length > 0) {
      console.log('\n📝 Creating bill edit history entries...');

      // Edit 3 random bills
      const billsToEdit = createdBills.slice(0, Math.min(3, createdBills.length));

      for (const bill of billsToEdit) {
        try {
          // Create history snapshot
          await prisma.billHistory.create({
            data: {
              version: 1,
              billNumber: bill.billNumber,
              status: bill.status,
              subtotal: bill.subtotal,
              taxAmount: bill.taxAmount,
              discountAmount: bill.discountAmount,
              total: bill.total,
              customerName: bill.customerName,
              customerPhone: bill.customerPhone,
              customerEmail: bill.customerEmail,
              customerAddress: bill.customerAddress,
              paymentMethod: bill.paymentMethod,
              paymentStatus: bill.paymentStatus,
              paidAmount: bill.paidAmount,
              changeAmount: bill.changeAmount,
              notes: bill.notes,
              internalNotes: bill.internalNotes,
              editReason: 'Cập nhật thông tin khách hàng theo yêu cầu',
              changedFields: JSON.stringify(['customerName', 'customerPhone']),
              billId: bill.id,
              editedById: bill.issuedById,
            },
          });

          // Update bill
          await prisma.bill.update({
            where: { id: bill.id },
            data: {
              customerName: bill.customerName + ' (Updated)',
              isEdited: true,
              editCount: 1,
              lastEditedAt: new Date(),
            },
          });

          console.log(`✅ Created edit history for bill ${bill.billNumber}`);
        } catch (error: any) {
          console.error(`❌ Error creating history for bill ${bill.billNumber}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully seeded ${createdBills.length} bills`);
    
    // Print summary
    const paidCount = createdBills.filter(b => b.paymentStatus === PaymentStatus.PAID).length;
    const pendingCount = createdBills.filter(b => b.paymentStatus === PaymentStatus.PENDING).length;
    
    console.log('\n📊 Bill Summary:');
    console.log(`   - Total bills: ${createdBills.length}`);
    console.log(`   - Paid bills: ${paidCount}`);
    console.log(`   - Pending bills: ${pendingCount}`);
    console.log(`   - Total revenue: ${createdBills.reduce((sum, b) => sum + b.total, 0) / 100} VND`);

  } catch (error) {
    console.error('❌ Error seeding bills:', error);
    throw error;
  }
}

