import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate tokens for all seeded users
 * Useful for testing with Postman
 */
async function generateTokens() {
  try {
    console.log('🔑 Generating tokens for all users...\n');
    console.log('JWT_SECRET:', JWT_SECRET);
    console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
    console.log('═'.repeat(80));

    // Get all active users with branch info
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' },
      ],
    });

    console.log(`\n📊 Found ${users.length} active users\n`);

    // Group by role
    const usersByRole: { [key: string]: any[] } = {};
    users.forEach((user) => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    // Generate tokens for each role
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\n${'═'.repeat(80)}`);
      console.log(`🎭 ${role} (${roleUsers.length} users)`);
      console.log('═'.repeat(80));

      roleUsers.forEach((user, index) => {
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN } as any
        );

        console.log(`\n${index + 1}. ${user.name}`);
        console.log('   📧 Email:', user.email);
        console.log('   🆔 User ID:', user.id);
        if (user.branch) {
          console.log('   🏪 Branch:', user.branch.name, `(${user.branch.code})`);
        }
        console.log('   🔑 Token:');
        console.log(`      ${token}`);
        console.log('   📤 Postman Authorization:');
        console.log(`      Bearer ${token}`);
      });
    }

    console.log(`\n${'═'.repeat(80)}`);
    console.log('✅ Token generation completed!');
    console.log('═'.repeat(80));
    console.log('\n💡 How to use in Postman:');
    console.log('   1. Open your request in Postman');
    console.log('   2. Go to "Authorization" tab');
    console.log('   3. Select "Bearer Token" type');
    console.log('   4. Paste the token (without "Bearer" prefix)');
    console.log('   OR');
    console.log('   1. Go to "Headers" tab');
    console.log('   2. Add key: Authorization');
    console.log('   3. Add value: Bearer <paste-token-here>');
    console.log('\n⚠️  Note: Tokens expire after', JWT_EXPIRES_IN);
    console.log('    If you get 401 error, generate new tokens by running this script again\n');

    // Also save to a JSON file for easy access
    const tokenData = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch?.name || null,
      branchCode: user.branch?.code || null,
      userId: user.id,
      branchId: user.branchId,
      token: jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as any
      ),
    }));

    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../tokens.json');
    fs.writeFileSync(outputPath, JSON.stringify(tokenData, null, 2));
    
    console.log(`📁 Tokens also saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Error generating tokens:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateTokens();
