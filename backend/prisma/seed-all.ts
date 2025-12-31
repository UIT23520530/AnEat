import { PrismaClient } from '@prisma/client';
import { seedBills } from './seed-bills';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  try {
    // Seed bills
    await seedBills();
    
    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
  });
