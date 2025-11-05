#!/bin/bash
set -e

echo "⚡ Running Load Tests..."

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
  echo "📥 Installing Artillery..."
  npm install -g artillery
fi

# Check if API is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️  API is not running. Please start the API first:"
  echo "   cd api && pnpm run start:dev"
  exit 1
fi

echo "✅ API is running"

# Run baseline test
echo "📊 Running baseline performance test..."
artillery run test/performance/baseline.yml

# Run load test
echo "📈 Running load test..."
artillery run test/performance/load-test.yml

echo "✅ Load tests completed"
echo "📋 Review the output above for performance metrics"

