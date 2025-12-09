#!/usr/bin/env node

/**
 * Database Query Script
 * 
 * Usage: node query-db.js
 * 
 * This script connects to PostgreSQL via Prisma and checks:
 * 1. Database connection status
 * 2. All tables and their record counts
 * 3. Sample data from each table
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryDatabase() {
  try {
    console.log('🔗 Connecting to PostgreSQL database...\n');

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connection successful!\n');

    // Get database info
    const dbInfo = await prisma.$queryRaw`
      SELECT datname as "Database Name", 
             pg_size_pretty(pg_database_size(datname)) as "Size"
      FROM pg_database 
      WHERE datname = 'aneat_dev'
    `;
    console.log('📊 Database Info:');
    console.table(dbInfo);

    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('\n📋 Tables in database:');
    console.table(tables);

    // Check record count for each table
    console.log('\n📈 Record Count per Table:');
    
    const tableNames = [
      'User',
      'Branch',
      'Product',
      'Order',
      'OrderItem',
      'Customer',
      'Table',
      'Promotion'
    ];

    for (const tableName of tableNames) {
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        console.log(`  ${tableName}: ${count[0]?.count || 0} records`);
      } catch (err) {
        console.log(`  ${tableName}: ⚠️ Table not found or error reading`);
      }
    }

    // Sample data from each table
    console.log('\n📝 Sample Data:\n');

    // Users
    try {
      const users = await prisma.user.findMany({ take: 3 });
      if (users.length > 0) {
        console.log('👤 Users (first 3):');
        console.table(users);
      } else {
        console.log('👤 Users: No data');
      }
    } catch (err) {
      console.log('👤 Users: Error reading data');
    }

    // Branches
    try {
      const branches = await prisma.branch.findMany({ take: 3 });
      if (branches.length > 0) {
        console.log('\n🏪 Branches (first 3):');
        console.table(branches);
      } else {
        console.log('\n🏪 Branches: No data');
      }
    } catch (err) {
      console.log('\n🏪 Branches: Error reading data');
    }

    // Products
    try {
      const products = await prisma.product.findMany({ take: 3 });
      if (products.length > 0) {
        console.log('\n🍔 Products (first 3):');
        console.table(products);
      } else {
        console.log('\n🍔 Products: No data');
      }
    } catch (err) {
      console.log('\n🍔 Products: Error reading data');
    }

    // Orders
    try {
      const orders = await prisma.order.findMany({ take: 3 });
      if (orders.length > 0) {
        console.log('\n📦 Orders (first 3):');
        console.table(orders);
      } else {
        console.log('\n📦 Orders: No data');
      }
    } catch (err) {
      console.log('\n📦 Orders: Error reading data');
    }

    // Customers
    try {
      const customers = await prisma.customer.findMany({ take: 3 });
      if (customers.length > 0) {
        console.log('\n👨‍💼 Customers (first 3):');
        console.table(customers);
      } else {
        console.log('\n👨‍💼 Customers: No data');
      }
    } catch (err) {
      console.log('\n👨‍💼 Customers: Error reading data');
    }

    // Promotions
    try {
      const promotions = await prisma.promotion.findMany({ take: 3 });
      if (promotions.length > 0) {
        console.log('\n🎉 Promotions (first 3):');
        console.table(promotions);
      } else {
        console.log('\n🎉 Promotions: No data');
      }
    } catch (err) {
      console.log('\n🎉 Promotions: Error reading data');
    }

    // Tables
    try {
      const tables = await prisma.table.findMany({ take: 3 });
      if (tables.length > 0) {
        console.log('\n🪑 Tables (first 3):');
        console.table(tables);
      } else {
        console.log('\n🪑 Tables: No data');
      }
    } catch (err) {
      console.log('\n🪑 Tables: Error reading data');
    }

    console.log('\n✅ Database query completed!\n');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if PostgreSQL is running: docker start postgres-aneat');
    console.error('2. Verify DATABASE_URL in .env file');
    console.error('3. Check if database exists: psql -U postgres -l');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

queryDatabase();
