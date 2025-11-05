#!/bin/bash
set -e

# Production Deployment Script
# This script deploys the Hummii application to production using Docker Compose

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/hummii"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
BACKUP_DIR="/opt/hummii/backups"
LOG_FILE="$PROJECT_DIR/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run as root. Use a non-root user with sudo privileges."
fi

# Check required environment variables
if [ -z "$VERSION" ]; then
    error "VERSION environment variable is not set"
fi

if [ -z "$REGISTRY" ]; then
    error "REGISTRY environment variable is not not set"
fi

if [ -z "$IMAGE_PREFIX" ]; then
    error "IMAGE_PREFIX environment variable is not set"
fi

log "Starting production deployment..."
log "Version: $VERSION"
log "Registry: $REGISTRY"
log "Image Prefix: $IMAGE_PREFIX"

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/scripts"

# Change to project directory
cd "$PROJECT_DIR" || error "Failed to change to project directory: $PROJECT_DIR"

# Backup current deployment
log "Creating backup of current deployment..."
if [ -f "$COMPOSE_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/docker-compose.prod.yml.backup-$(date +%Y%m%d-%H%M%S)"
    cp "$COMPOSE_FILE" "$BACKUP_FILE"
    log "Backup created: $BACKUP_FILE"
else
    warning "No existing compose file found, skipping backup"
fi

# Update docker-compose.prod.yml with new image tags
log "Updating docker-compose.prod.yml with new image tags..."
if [ -f "$COMPOSE_FILE" ]; then
    # Backup current compose file
    cp "$COMPOSE_FILE" "$COMPOSE_FILE.backup"

    # Update image tags (using sed - replace your registry/image with actual tags)
    sed -i "s|image:.*hummii-api.*|image: ${REGISTRY}/${IMAGE_PREFIX}-api:${VERSION}|g" "$COMPOSE_FILE"
    sed -i "s|image:.*hummii-frontend.*|image: ${REGISTRY}/${IMAGE_PREFIX}-frontend:${VERSION}|g" "$COMPOSE_FILE"
    sed -i "s|image:.*hummii-admin.*|image: ${REGISTRY}/${IMAGE_PREFIX}-admin:${VERSION}|g" "$COMPOSE_FILE"

    log "Docker Compose file updated"
else
    error "Docker Compose file not found: $COMPOSE_FILE"
fi

# Login to container registry
log "Logging in to container registry..."
if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$(whoami)" --password-stdin || \
        error "Failed to login to container registry"
else
    warning "GITHUB_TOKEN not set, assuming already logged in"
fi

# Pull new images
log "Pulling new Docker images..."
docker compose -f "$COMPOSE_FILE" pull || error "Failed to pull Docker images"

# Run database migrations (if needed)
log "Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T api npm run migration:run || \
    warning "Database migrations failed or not needed"

# Perform zero-downtime deployment
log "Starting zero-downtime deployment..."

# Start new containers in background
log "Starting new containers..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps --build || error "Failed to start containers"

# Wait for health checks
log "Waiting for health checks..."
sleep 30

# Check if services are healthy
log "Checking service health..."
if docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy\|Up"; then
    log "Services are healthy"
else
    error "Services failed health checks"
fi

# Verify deployment
log "Verifying deployment..."
MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log "Health check attempt $RETRY_COUNT/$MAX_RETRIES failed, retrying..."
    sleep 5
done

if [ "$HEALTHY" = true ]; then
    log "Deployment verified successfully!"
else
    error "Deployment verification failed after $MAX_RETRIES attempts"
fi

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -af --filter "until=24h" || warning "Failed to clean up old images"

# Clean up old backups (keep last 10)
log "Cleaning up old backups..."
cd "$BACKUP_DIR" || warning "Failed to change to backup directory"
ls -t | tail -n +11 | xargs -r rm || warning "Failed to clean up old backups"

log "Production deployment completed successfully!"
log "Version $VERSION is now live"

exit 0

