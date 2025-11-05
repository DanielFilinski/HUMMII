#!/bin/bash
set -e

echo "📦 Updating Postman Collection from Swagger..."

# Check if API is running
if ! curl -s http://localhost:3000/api/docs-json > /dev/null 2>&1; then
  echo "⚠️  API is not running. Starting API server..."
  cd api
  npm run export-swagger
  cd ..
else
  echo "✅ API is running. Exporting Swagger JSON..."
  cd api
  npm run export-swagger
  cd ..
fi

# Check if openapi2postmanv2 is installed
if ! command -v openapi2postmanv2 &> /dev/null; then
  echo "📥 Installing openapi2postmanv2..."
  npm install -g openapi2postmanv2
fi

# Check if swagger.json exists
if [ ! -f "docs/api/swagger.json" ]; then
  echo "❌ Swagger JSON not found. Please run 'npm run export-swagger' first."
  exit 1
fi

# Convert Swagger to Postman collection
echo "🔄 Converting Swagger to Postman collection..."
openapi2postmanv2 -s docs/api/swagger.json -o "docs/postman collection/Hummii-API.postman_collection.json"

# Validate collection
if [ -f "docs/postman collection/Hummii-API.postman_collection.json" ]; then
  echo "✅ Postman collection updated successfully!"
  echo "📋 Collection location: docs/postman collection/Hummii-API.postman_collection.json"
  echo "📊 Total endpoints: $(jq '.item | length' "docs/postman collection/Hummii-API.postman_collection.json" 2>/dev/null || echo "N/A")"
else
  echo "❌ Failed to generate Postman collection"
  exit 1
fi

