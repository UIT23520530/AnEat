import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed: Manager account...\n');

  // 1. Create Branch first
  console.log('📍 Creating branch...');
  const branch = await prisma.branch.upsert({
    where: { code: 'HCM-Q1' },
    update: {},
    create: {
      code: 'HCM-Q1',
      name: 'Chi nhánh Quận 1',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '0281234567',
      email: 'q1@aneat.com',
    },
  });
  console.log('✅ Branch created:', branch.name);

  // 2. Create Manager account
  console.log('\n👤 Creating manager account...');
  const hashedPassword = await bcrypt.hash('manager123', 10);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@aneat.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'manager@aneat.com',
      password: hashedPassword,
      name: 'Manager Quận 1',
      phone: '0901234567',
      role: UserRole.ADMIN_BRAND,
      isActive: true,
    },
  });
  console.log('✅ Manager created:', manager.email);

  // 3. Link manager to branch (2-way relationship)
  console.log('\n🔗 Linking manager to branch...');
  
  // Update manager's branchId
  await prisma.user.update({
    where: { id: manager.id },
    data: { branchId: branch.id },
  });
  
  // Update branch's managerId
  await prisma.branch.update({
    where: { id: branch.id },
    data: { managerId: manager.id },
  });
  console.log('✅ Manager linked to branch (both ways)');

  // 4. Create some sample staff for testing
  console.log('\n👥 Creating sample staff...');
  const staffData = [
    {
      email: 'staff001@aneat.com',
      name: 'Nguyễn Văn A',
      phone: '0901111111',
    },
    {
      email: 'staff002@aneat.com',
      name: 'Trần Thị B',
      phone: '0902222222',
    },
    {
      email: 'staff003@aneat.com',
      name: 'Lê Văn C',
      phone: '0903333333',
    },
  ];

  for (const data of staffData) {
    const staff = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: await bcrypt.hash('staff123', 10),
        name: data.name,
        phone: data.phone,
        role: UserRole.STAFF,
        branchId: branch.id,
        isActive: true,
      },
    });
    console.log('  ✅', staff.email);
  }

  console.log('\nSeed completed successfully!\n');
  console.log('Test credentials:');
  console.log('Email: manager@aneat.com');
  console.log('Password: manager123');
  console.log('\nYou can now test with Postman!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
