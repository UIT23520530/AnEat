/* Tạo branch01 và gán manager@aneat.com vào branch này */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupManagerBranch() {
  try {
    console.log('🚀 Setting up manager with branch...');

    // Tìm manager account
    const manager = await prisma.user.findUnique({
      where: { email: 'manager@aneat.com' },
    });

    if (!manager) {
      console.error('❌ Manager account not found! Run seed-manager.ts first.');
      return;
    }

    console.log('✅ Found manager:', manager.email);

    // Kiểm tra xem đã có branch01 chưa
    let branch = await prisma.branch.findUnique({
      where: { code: 'branch01' },
    });

    if (!branch) {
      // Tạo branch01 mới
      branch = await prisma.branch.create({
        data: {
          code: 'branch01',
          name: 'Chi nhánh Trung tâm',
          address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
          phone: '0901234567',
          email: 'branch01@aneat.com',
          managerId: manager.id,
        },
      });
      console.log('✅ Created new branch:', branch.code);
    } else if (!branch.managerId) {
      // Update branch để gán manager
      branch = await prisma.branch.update({
        where: { id: branch.id },
        data: { managerId: manager.id },
      });
      console.log('✅ Updated branch with manager:', branch.code);
    } else {
      console.log('✅ Branch already has manager:', branch.code);
    }

    // Verify
    const verifyManager = await prisma.user.findUnique({
      where: { id: manager.id },
      include: {
        managedBranches: true,
      },
    });

    console.log('Verification:');
    console.log('   Manager:', verifyManager?.email);
    console.log('   Manages branch:', verifyManager?.managedBranches?.name);
    console.log('   Branch ID:', verifyManager?.managedBranches?.id);

    console.log('\nSetup completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupManagerBranch();
