#!/bin/bash
# FORGE Development Setup Script

set -e

echo "=========================================="
echo "FORGE Development Setup"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

echo "All prerequisites found."

# Setup API
echo ""
echo "Setting up API server..."
cd api

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file. Please update with your configuration."
fi

cd ..

# Setup Frontend
echo ""
echo "Setting up frontend..."
cd web

if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "Created .env.local file."
fi

cd ..

# Start services
echo ""
echo "Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

# Wait for services
echo "Waiting for services to be ready..."
sleep 5

# Run migrations
echo ""
echo "Database schema will be applied on first API start."

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "To start development:"
echo ""
echo "  API Server:"
echo "    cd api"
echo "    source venv/bin/activate"
echo "    uvicorn main:app --reload"
echo ""
echo "  Frontend:"
echo "    cd web"
echo "    npm run dev"
echo ""
echo "  Or use Docker Compose:"
echo "    docker-compose up"
echo ""
