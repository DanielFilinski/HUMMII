#!/bin/bash

# Hummii Quick Start Script
# This script helps quickly start the development environment

set -e

echo "🐝 Hummii Development Environment Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Copying .env.example to .env..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env with your actual values before continuing!"
    echo ""
    echo "Run: nano .env"
    echo "Then run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Start all services"
echo "2) Start services with tools (PgAdmin, Redis Commander)"
echo "3) Stop all services"
echo "4) Rebuild and start"
echo "5) View logs"
echo "6) Clean everything (⚠️ deletes data)"
echo ""
read -p "Choose option (1-6): " option

case $option in
    1)
        echo "🚀 Starting all services..."
        docker compose up -d
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "Access services at:"
        echo "  - API:      http://localhost:3000"
        echo "  - Frontend: http://localhost:3001"
        echo "  - Admin:    http://localhost:3002"
        echo ""
        echo "View logs: docker compose logs -f"
        ;;
    2)
        echo "🚀 Starting all services with tools..."
        docker compose --profile tools up -d
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "Access services at:"
        echo "  - API:             http://localhost:3000"
        echo "  - Frontend:        http://localhost:3001"
        echo "  - Admin:           http://localhost:3002"
        echo "  - PgAdmin:         http://localhost:5050"
        echo "  - Redis Commander: http://localhost:8081"
        echo ""
        echo "PgAdmin credentials: admin@hummii.local / admin"
        ;;
    3)
        echo "🛑 Stopping all services..."
        docker compose --profile tools down
        echo "✅ Services stopped!"
        ;;
    4)
        echo "🔨 Rebuilding and starting services..."
        docker compose build
        docker compose up -d
        echo "✅ Services rebuilt and started!"
        ;;
    5)
        echo "📋 Viewing logs (Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    6)
        read -p "⚠️  This will delete all data! Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🧹 Cleaning everything..."
            docker compose --profile tools down -v
            echo "✅ All containers and volumes removed!"
        else
            echo "❌ Cancelled"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

