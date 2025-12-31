import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exporting all data...\n');

  const data = {
    users: await prisma.user.findMany(),
    branches: await prisma.branch.findMany(),
    categories: await prisma.productCategory.findMany(),
    products: await prisma.product.findMany(),
    templates: await prisma.template.findMany(),
    promotions: await prisma.promotion.findMany(),
    orders: await prisma.order.findMany(),
    bills: await prisma.bill.findMany(),
    exportDate: new Date().toISOString(),
  };

  const filename = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  console.log(`✅ Data exported to: ${filename}`);
  console.log(`📊 Total records: ${
    data.users.length + 
    data.branches.length + 
    data.categories.length + 
    data.products.length + 
    data.templates.length + 
    data.promotions.length + 
    data.orders.length + 
    data.bills.length
  }`);

  await prisma.$disconnect();
}

exportData();
