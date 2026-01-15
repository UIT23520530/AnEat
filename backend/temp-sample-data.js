const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSampleData() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
        quantity: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

getSampleData();
