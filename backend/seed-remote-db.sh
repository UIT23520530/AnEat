#!/bin/bash

# Script to seed Render database from local machine
# Usage: ./seed-remote-db.sh

echo "🌱 Seed Remote Database Script"
echo "================================"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ File .env.production not found!"
    echo ""
    echo "Please create .env.production with:"
    echo "DATABASE_URL=\"<your-external-database-url>\""
    echo ""
    echo "Get External Database URL from:"
    echo "Render Dashboard → PostgreSQL → Info → External Database URL"
    exit 1
fi

echo "✓ Found .env.production"
echo ""

# Check if dotenv-cli is available
if ! command -v dotenv &> /dev/null; then
    echo "📦 Installing dotenv-cli..."
    npm install -g dotenv-cli
fi

echo "� Running migrations (this will create all tables)..."
npx dotenv -e .env.production -- npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migrations failed. Please check DATABASE_URL in .env.production"
    exit 1
fi

echo "✓ Migrations completed successfully"
echo ""

echo ""
echo "🌱 Seeding database..."
npx dotenv -e .env.production -- npm run prisma:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seeding completed successfully!"
    echo ""
    echo "📊 Your database now has:"
    echo "   - 1 Branch (HCM-Q1)"
    echo "   - 9 Users (Manager, Staff, Logistics)"
    echo "   - 6 Categories"
    echo "   - 36 Products"
    echo "   - 3 Banners"
    echo ""
    echo "🔐 Test accounts:"
    echo "   Manager:   manager@aneat.com / manager123"
    echo "   Staff:     staff001@aneat.com / staff123"
    echo "   Logistics: logistics01@aneat.com / logistics123"
    echo ""
    echo "🧪 Test your API:"
    echo "   curl https://your-service-name.onrender.com/api/branches"
else
    echo "❌ Seeding failed. Check errors above."
    exit 1
fi
