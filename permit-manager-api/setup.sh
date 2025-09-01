#!/bin/bash

echo "🚀 Setting up Permit Manager API..."

# Check if PostgreSQL is running
echo "📊 Checking database connection..."
if ! pg_isready -h localhost -p 51214 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on port 51214"
    echo "Please start PostgreSQL or update the DATABASE_URL in .env"
    exit 1
fi

echo "✅ Database connection OK"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Permit Manager API is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: npm run dev"
echo "2. Start the frontend: cd .. && npm run dev"
echo "3. Login with: admin@example.com / admin123"
echo ""
echo "🔗 API will be available at: http://localhost:4000"
echo "🔗 Frontend will be available at: http://localhost:5173"
