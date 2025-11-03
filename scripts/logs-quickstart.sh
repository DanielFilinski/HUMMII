#!/bin/bash
# Quick Start Guide for Viewing Logs

echo "🐝 Hummii - Log Viewer Quick Start"
echo ""
echo "📊 Current Statistics:"
./scripts/view-logs.sh stats
echo ""
echo "📖 Common Commands:"
echo "  ./scripts/view-logs.sh tail         # Watch logs in real-time"
echo "  ./scripts/view-logs.sh errors       # Show recent errors"
echo "  ./scripts/view-logs.sh search TEXT  # Search for text"
echo "  ./scripts/view-logs.sh help         # Show all commands"
echo ""
echo "📁 Direct Access:"
echo "  tail -f logs/api/combined.log       # All logs"
echo "  tail -f logs/api/error.log          # Errors only"
echo "  tail -f logs/api/audit.log          # Audit trail"
echo ""
echo "🐳 Docker Commands:"
echo "  docker exec hummii-api tail -f /app/logs/combined.log"
echo "  docker cp hummii-api:/app/logs/. ./logs/api/"
echo ""
echo "📚 Full Documentation:"
echo "  logs/README.md              # Complete guide"
echo "  logs/QUICK_REFERENCE.md     # Quick reference"
echo ""

