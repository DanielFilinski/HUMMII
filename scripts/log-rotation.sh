#!/bin/bash
set -e

# Log Rotation Script for Hummii Production
# Rotates and cleans logs based on retention policy (90 days)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="/opt/hummii/logs"
RETENTION_DAYS=90
BACKUP_DIR="/opt/hummii/backups/logs"
LOG_FILE="$LOG_DIR/log-rotation-$(date +%Y%m%d-%H%M%S).log"

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

log "Starting log rotation..."
log "Retention period: $RETENTION_DAYS days"
log "Log directory: $LOG_DIR"
log "Backup directory: $BACKUP_DIR"

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Find and compress old logs
log "Compressing old logs..."
find "$LOG_DIR" -name "*.log" -type f -mtime +$RETENTION_DAYS -exec gzip {} \; || warning "Failed to compress some logs"

# Move compressed logs to backup directory
log "Moving compressed logs to backup directory..."
find "$LOG_DIR" -name "*.log.gz" -type f -exec mv {} "$BACKUP_DIR/" \; || warning "Failed to move some compressed logs"

# Delete logs older than retention period
log "Deleting logs older than $RETENTION_DAYS days..."
find "$LOG_DIR" -name "*.log" -type f -mtime +$RETENTION_DAYS -delete || warning "Failed to delete some old logs"
find "$BACKUP_DIR" -name "*.log.gz" -type f -mtime +$RETENTION_DAYS -delete || warning "Failed to delete some old backup logs"

# Rotate current logs (if they exist)
log "Rotating current logs..."
if [ -f "$LOG_DIR/api/app.log" ]; then
    mv "$LOG_DIR/api/app.log" "$LOG_DIR/api/app.log.$(date +%Y%m%d-%H%M%S)" || warning "Failed to rotate API log"
fi

if [ -f "$LOG_DIR/nginx/access.log" ]; then
    mv "$LOG_DIR/nginx/access.log" "$LOG_DIR/nginx/access.log.$(date +%Y%m%d-%H%M%S)" || warning "Failed to rotate Nginx access log"
fi

if [ -f "$LOG_DIR/nginx/error.log" ]; then
    mv "$LOG_DIR/nginx/error.log" "$LOG_DIR/nginx/error.log.$(date +%Y%m%d-%H%M%S)" || warning "Failed to rotate Nginx error log"
fi

# Reload Nginx to open new log files
log "Reloading Nginx to open new log files..."
if command -v docker &> /dev/null; then
    docker compose -f /opt/hummii/docker-compose.prod.yml exec -T nginx nginx -s reload || warning "Failed to reload Nginx"
else
    warning "Docker not found, skipping Nginx reload"
fi

# Clean up old rotation logs
log "Cleaning up old rotation logs..."
find "$LOG_DIR" -name "log-rotation-*.log" -type f -mtime +7 -delete || warning "Failed to delete old rotation logs"

log "Log rotation completed successfully!"
log "Compressed logs saved to: $BACKUP_DIR"
log "Logs older than $RETENTION_DAYS days have been deleted"

exit 0

