#!/bin/bash

# Pre-deployment Check Script for Render
echo "🔍 Checking deployment readiness..."
echo ""

# Check Node version
echo "📦 Node version:"
node --version

# Check npm version
echo "📦 NPM version:"
npm --version

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check if prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ prisma/schema.prisma found"
else
    echo "❌ prisma/schema.prisma not found"
    exit 1
fi

# Check if src directory exists
if [ -d "src" ]; then
    echo "✅ src directory found"
else
    echo "❌ src directory not found"
    exit 1
fi

# Check if tsconfig.json exists
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json found"
else
    echo "❌ tsconfig.json not found"
    exit 1
fi

echo ""
echo "🎯 Checking required scripts in package.json..."

# Check build script
if grep -q '"build"' package.json; then
    echo "✅ build script found"
else
    echo "❌ build script not found"
fi

# Check start script
if grep -q '"start"' package.json; then
    echo "✅ start script found"
else
    echo "❌ start script not found"
fi

# Check prisma:migrate:deploy script
if grep -q '"prisma:migrate:deploy"' package.json; then
    echo "✅ prisma:migrate:deploy script found"
else
    echo "❌ prisma:migrate:deploy script not found"
fi

echo ""
echo "🔐 Checking environment variables template..."

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo "✅ .env.example found"
else
    echo "⚠️  .env.example not found (optional but recommended)"
fi

echo ""
echo "📋 Required Environment Variables for Render:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - NODE_ENV"
echo "   - PORT"
echo "   - FRONTEND_URL"

echo ""
echo "✅ Pre-deployment check completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Create PostgreSQL database on Render"
echo "   2. Push code to GitHub"
echo "   3. Create Web Service on Render"
echo "   4. Add environment variables"
echo "   5. Deploy!"
echo ""
echo "📚 Full guide: docs/RENDER_DEPLOY.md"
echo "⚡ Quick guide: docs/RENDER_QUICK.md"
