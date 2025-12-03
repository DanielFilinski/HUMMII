#!/bin/bash

# Design System Installation Script
# This script will copy all design system files to your Next.js project

echo "🎨 Design System Installation Script"
echo "===================================="
echo ""

# Get the project directory
read -p "Enter your Next.js project directory path (or press Enter for current directory): " PROJECT_DIR

if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="."
fi

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directory $PROJECT_DIR does not exist"
    exit 1
fi

echo ""
echo "📁 Installing design system to: $PROJECT_DIR"
echo ""

# Create directories
echo "📂 Creating directories..."
mkdir -p "$PROJECT_DIR/components/ui"
mkdir -p "$PROJECT_DIR/lib"
mkdir -p "$PROJECT_DIR/app/design-system"

# Copy UI components
echo "📦 Copying UI components..."
cp components/ui/*.tsx "$PROJECT_DIR/components/ui/" 2>/dev/null
cp components/ui/*.ts "$PROJECT_DIR/components/ui/" 2>/dev/null

# Copy lib files
echo "📚 Copying library files..."
cp lib/*.ts "$PROJECT_DIR/lib/" 2>/dev/null

# Copy app files
echo "🎯 Copying app files..."
cp app/layout.tsx "$PROJECT_DIR/app/" 2>/dev/null
cp app/globals.css "$PROJECT_DIR/app/" 2>/dev/null
cp app/design-system/page.tsx "$PROJECT_DIR/app/design-system/" 2>/dev/null

# Copy config
echo "⚙️ Copying configuration..."
cp tailwind.config.ts "$PROJECT_DIR/" 2>/dev/null

# Copy documentation
echo "📖 Copying documentation..."
cp *.md "$PROJECT_DIR/" 2>/dev/null

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install dependencies:"
echo "   npm install clsx tailwind-merge"
echo ""
echo "2. Install dev dependencies (if not already installed):"
echo "   npm install -D tailwindcss postcss autoprefixer"
echo ""
echo "3. Start development server:"
echo "   npm run dev"
echo ""
echo "4. Visit http://localhost:3000/design-system to see the showcase"
echo ""
echo "📚 Documentation:"
echo "- README.md - General overview"
echo "- DESIGN_SYSTEM.md - Full documentation"
echo "- QUICK_START.md - Quick start guide"
echo ""
echo "🎉 Happy coding!"
