#!/bin/bash
# Quick preview script for compiled Figma pages

echo "🌐 Opening compiled page in browser..."

COMPILED_DIR="./output/compiled"
LATEST_FILE=$(ls -t "$COMPILED_DIR"/*.html 2>/dev/null | head -1)

if [ -z "$LATEST_FILE" ]; then
    echo "❌ No compiled files found!"
    echo "Run: npm run compile first"
    exit 1
fi

echo "📄 Opening: $LATEST_FILE"

# Try to open based on OS
if command -v xdg-open > /dev/null; then
    xdg-open "$LATEST_FILE"
elif command -v open > /dev/null; then
    open "$LATEST_FILE"
elif command -v start > /dev/null; then
    start "$LATEST_FILE"
else
    echo "✅ File ready at: $LATEST_FILE"
    echo "📋 Copy this path and open in browser:"
    echo "   file://$(pwd)/$LATEST_FILE"
fi




