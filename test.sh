#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "🧪 Starting Hummii Test Suite"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Start test database
echo -e "${YELLOW}📦 Starting test database...${NC}"
docker compose -f docker-compose.test.yml up -d postgres-test

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for test database to be ready...${NC}"
until docker exec hummii-postgres-test pg_isready -U hummii_test > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo -e "\n${GREEN}✅ Test database is ready${NC}"
echo ""

# Change to API directory
cd api

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs) 2>/dev/null || true

# Run Prisma migrations on test database
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
DATABASE_URL=postgresql://hummii_test:test_password@localhost:5433/hummii_test npx prisma migrate deploy

echo ""
echo -e "${YELLOW}🧪 Running unit tests...${NC}"
echo "======================================"
npm run test:unit

echo ""
echo -e "${YELLOW}🌐 Running E2E tests...${NC}"
echo "======================================"
DATABASE_URL=postgresql://hummii_test:test_password@localhost:5433/hummii_test npm run test:e2e

# Cleanup
echo ""
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
cd ..
docker compose -f docker-compose.test.yml down -v

echo ""
echo -e "${GREEN}✅ All tests completed successfully!${NC}"
echo "======================================"

