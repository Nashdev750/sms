#!/bin/bash

# Junior Secondary Grading System Setup Script
echo "🚀 Setting up Junior Secondary Grading System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp config.env .env
    echo "✅ .env file created from config.env"
else
    echo "✅ .env file already exists"
fi

# Build and start the application
echo "🏗️ Building and starting the application..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Check if the database is ready
echo "🔍 Checking database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T db mysqladmin ping -h localhost --silent; then
        echo "✅ Database is ready!"
        break
    else
        echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Database failed to start within expected time"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database with sample data..."
docker-compose exec backend npm run seed

# Check if seeding was successful
if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
else
    echo "❌ Database seeding failed"
    exit 1
fi

# Display success message
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Application Information:"
echo "   - URL: http://localhost:3000"
echo "   - Health Check: http://localhost:3000/health"
echo "   - Database: MySQL on localhost:3306"
echo ""
echo "👥 Sample Data:"
echo "   - 30 students (10 per grade level)"
echo "   - 29 subjects across all grades"
echo "   - Sample grades for current term"
echo ""
echo "🔧 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop application: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Access database: docker-compose exec db mysql -u root -p grading_system"
echo ""
echo "🚀 You can now access the grading system at http://localhost:3000"
echo ""
