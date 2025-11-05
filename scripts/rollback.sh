#!/bin/bash
set -e

# Rollback Script for Production Deployment
# This script rolls back to a previous deployment version

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/hummii"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
BACKUP_DIR="/opt/hummii/backups"
LOG_FILE="$PROJECT_DIR/logs/rollback-$(date +%Y%m%d-%H%M%S).log"

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

# Check if version is provided
if [ -z "$1" ]; then
    error "Usage: $0 <version> or $0 --latest"
fi

log "Starting rollback procedure..."

# Change to project directory
cd "$PROJECT_DIR" || error "Failed to change to project directory: $PROJECT_DIR"

# Determine rollback version
if [ "$1" == "--latest" ]; then
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/docker-compose.prod.yml.backup-* 2>/dev/null | head -1)
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    ROLLBACK_VERSION=$(basename "$LATEST_BACKUP" | sed 's/docker-compose.prod.yml.backup-//')
    log "Rolling back to latest backup: $ROLLBACK_VERSION"
else
    ROLLBACK_VERSION="$1"
    LATEST_BACKUP="$BACKUP_DIR/docker-compose.prod.yml.backup-$ROLLBACK_VERSION"
    if [ ! -f "$LATEST_BACKUP" ]; then
        error "Backup file not found: $LATEST_BACKUP"
    fi
    log "Rolling back to version: $ROLLBACK_VERSION"
fi

# Create backup of current deployment
log "Creating backup of current deployment before rollback..."
CURRENT_BACKUP="$BACKUP_DIR/docker-compose.prod.yml.backup-before-rollback-$(date +%Y%m%d-%H%M%S)"
if [ -f "$COMPOSE_FILE" ]; then
    cp "$COMPOSE_FILE" "$CURRENT_BACKUP"
    log "Current deployment backed up: $CURRENT_BACKUP"
fi

# Restore previous compose file
log "Restoring previous docker-compose.prod.yml..."
cp "$LATEST_BACKUP" "$COMPOSE_FILE"
log "Docker Compose file restored from backup"

# Extract image versions from restored compose file
API_IMAGE=$(grep "image:.*api" "$COMPOSE_FILE" | head -1 | awk '{print $2}')
FRONTEND_IMAGE=$(grep "image:.*frontend" "$COMPOSE_FILE" | head -1 | awk '{print $2}')
ADMIN_IMAGE=$(grep "image:.*admin" "$COMPOSE_FILE" | head -1 | awk '{print $2}')

log "Rolling back to images:"
log "  API: $API_IMAGE"
log "  Frontend: $FRONTEND_IMAGE"
log "  Admin: $ADMIN_IMAGE"

# Pull previous images
log "Pulling previous Docker images..."
docker compose -f "$COMPOSE_FILE" pull || error "Failed to pull Docker images"

# Stop current containers
log "Stopping current containers..."
docker compose -f "$COMPOSE_FILE" down || warning "Failed to stop some containers"

# Start previous containers
log "Starting previous containers..."
docker compose -f "$COMPOSE_FILE" up -d || error "Failed to start containers"

# Wait for health checks
log "Waiting for health checks..."
sleep 30

# Check if services are healthy
log "Checking service health..."
if docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy\|Up"; then
    log "Services are healthy after rollback"
else
    error "Services failed health checks after rollback"
fi

# Verify rollback
log "Verifying rollback..."
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
    log "Rollback verified successfully!"
else
    error "Rollback verification failed after $MAX_RETRIES attempts"
fi

log "Rollback completed successfully!"
log "System rolled back to version: $ROLLBACK_VERSION"

exit 0

