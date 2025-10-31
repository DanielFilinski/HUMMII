#!/bin/sh
set -e

# Rebuild bcrypt for the current architecture
# This fixes "Exec format error" when architecture mismatch occurs
echo "Rebuilding bcrypt for current architecture..."
npm rebuild bcrypt || {
  echo "Warning: bcrypt rebuild failed, trying to reinstall..."
  npm install bcrypt --force
}

# Generate Prisma Client if schema exists
if [ -f "prisma/schema.prisma" ]; then
  echo "Generating Prisma Client..."
  npx prisma generate || echo "Warning: Prisma generate failed"
  
  # Run migrations if DATABASE_URL is set
  if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    npx prisma migrate deploy || echo "Warning: Migrations failed"
  fi
fi

# Execute the main command
exec "$@"

