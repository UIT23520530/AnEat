#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Build TypeScript (using relaxed tsconfig for production)
echo "🏗️  Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
