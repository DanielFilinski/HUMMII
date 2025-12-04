#!/bin/bash

# Script to replace hardcoded fill colors with currentColor in all SVG icons
# This allows icons to inherit text color from parent elements

ICONS_DIR="/root/Garantiny_old/HUMMII/frontend/public/images/icons"

echo "🎨 Fixing icon colors to support currentColor..."
echo "Directory: $ICONS_DIR"
echo ""

# Counter
count=0

# Process all SVG files
for file in "$ICONS_DIR"/*.svg; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    
    # Replace fill="#2A2A0F" with fill="currentColor"
    # Also handle other possible hardcoded colors
    sed -i 's/fill="#2A2A0F"/fill="currentColor"/g' "$file"
    sed -i 's/fill="#000000"/fill="currentColor"/g' "$file"
    sed -i 's/fill="#000"/fill="currentColor"/g' "$file"
    sed -i 's/fill="black"/fill="currentColor"/g' "$file"
    
    echo "✓ Fixed: $filename"
    ((count++))
  fi
done

echo ""
echo "✅ Done! Fixed $count SVG files."
echo "Icons now support color inheritance via currentColor."
