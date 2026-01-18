import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed: Logistics Staff accounts...\n');

    // 2. Create Logistics Users
    const logisticsStaffData = [
        {
            email: 'logistics01@aneat.com',
            name: 'Nguyễn Văn Giao',
            phone: '0981111111',
        },
        {
            email: 'logistics02@aneat.com',
            name: 'Trần Thị Vận',
            phone: '0982222222',
        },
        {
            email: 'logistics03@aneat.com',
            name: 'Lê Văn Chuyển',
            phone: '0983333333',
        },
        {
            email: 'logistics04@aneat.com',
            name: 'Phạm Văn Tải',
            phone: '0984444444',
        },
        {
            email: 'logistics05@aneat.com',
            name: 'Hoàng Văn Kho',
            phone: '0985555555',
        },
    ];

    const hashedPassword = await bcrypt.hash('logistics123', 10);

    for (const data of logisticsStaffData) {
        const staff = await prisma.user.upsert({
            where: { email: data.email },
            update: {
                role: UserRole.LOGISTICS_STAFF, // Update role just in case
                password: hashedPassword,
                branchId: null,
            },
            create: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: UserRole.LOGISTICS_STAFF,
                branchId: null,
                isActive: true,
            },
        });
        console.log(`  ✅ Created/Updated: ${staff.email} (${staff.name})`);
    }

    console.log('\nSeed completed successfully!\n');
    console.log('Credentials:');
    console.log('Password for all: logistics123');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
