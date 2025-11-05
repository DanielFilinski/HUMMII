#!/bin/bash
set -e

echo "🔒 Running Security Audit..."

# Check if npm audit is available
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  exit 1
fi

cd api

echo "📦 Running npm audit..."
npm audit --audit-level=high || true

echo "✅ Security audit completed"
echo "📋 Review the output above for vulnerabilities"
echo "💡 Fix high/critical vulnerabilities before deploying to production"

cd ..

