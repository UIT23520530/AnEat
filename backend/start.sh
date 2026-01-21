#!/bin/bash
# Start script for Render deployment

set -e  # Exit on error

echo "🚀 Starting application..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Optionally seed database (uncomment if needed)
# echo "🌱 Seeding database..."
# npm run prisma:seed

# Start the application
echo "🎯 Starting server..."
node dist/server.js
