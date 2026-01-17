import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const branches = await prisma.branch.findMany({
        select: { id: true, name: true }
    });
    console.log(JSON.stringify(branches, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
