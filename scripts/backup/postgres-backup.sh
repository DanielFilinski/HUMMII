#!/bin/bash
set -e

# PostgreSQL Backup Script for Hummii Production
# Creates encrypted backups with retention policy

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/hummii/backups/postgres"
RETENTION_DAYS=30
RETENTION_WEEKS=52
LOG_FILE="/opt/hummii/logs/backup-postgres-$(date +%Y%m%d-%H%M%S).log"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
COMPOSE_FILE="/opt/hummii/docker-compose.prod.yml"

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
if [ -z "$DATABASE_URL" ] && [ -z "$DATABASE_NAME" ]; then
    error "DATABASE_URL or DATABASE_NAME environment variable is not set"
fi

log "Starting PostgreSQL backup..."
log "Backup directory: $BACKUP_DIR"
log "Retention: $RETENTION_DAYS days (daily), 52 weeks (weekly)"

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/postgres-backup-$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"
ENCRYPTED_FILE="$COMPRESSED_FILE.enc"

# Determine backup type (daily or weekly)
DAY_OF_WEEK=$(date +%u)
if [ "$DAY_OF_WEEK" == "1" ]; then
    BACKUP_TYPE="weekly"
    BACKUP_FILE="$BACKUP_DIR/postgres-backup-weekly-$TIMESTAMP.sql"
    COMPRESSED_FILE="$BACKUP_FILE.gz"
    ENCRYPTED_FILE="$COMPRESSED_FILE.enc"
    log "Creating weekly backup..."
else
    BACKUP_TYPE="daily"
    log "Creating daily backup..."
fi

# Create backup
log "Creating PostgreSQL backup..."
if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    # Using Docker Compose
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${DATABASE_USER:-postgres}" "${DATABASE_NAME:-hummii}" > "$BACKUP_FILE" || \
        error "Failed to create PostgreSQL backup"
else
    # Direct pg_dump (if PostgreSQL client is installed)
    if command -v pg_dump &> /dev/null; then
        pg_dump -U "${DATABASE_USER:-postgres}" "${DATABASE_NAME:-hummii}" > "$BACKUP_FILE" || \
            error "Failed to create PostgreSQL backup"
    else
        error "Neither Docker nor pg_dump found. Cannot create backup."
    fi
fi

# Check backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Compress backup
log "Compressing backup..."
gzip -f "$BACKUP_FILE" || error "Failed to compress backup"
log "Compressed backup: $COMPRESSED_FILE"

# Encrypt backup if encryption key is set
if [ -n "$ENCRYPTION_KEY" ]; then
    log "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -in "$COMPRESSED_FILE" -out "$ENCRYPTED_FILE" -k "$ENCRYPTION_KEY" || \
        error "Failed to encrypt backup"
    
    # Remove unencrypted file
    rm -f "$COMPRESSED_FILE"
    log "Encrypted backup: $ENCRYPTED_FILE"
    FINAL_FILE="$ENCRYPTED_FILE"
else
    warning "Encryption key not set, backup is not encrypted"
    FINAL_FILE="$COMPRESSED_FILE"
fi

# Verify backup
log "Verifying backup..."
if [ -f "$FINAL_FILE" ] && [ -s "$FINAL_FILE" ]; then
    BACKUP_SIZE=$(du -h "$FINAL_FILE" | cut -f1)
    log "Backup verified: $FINAL_FILE ($BACKUP_SIZE)"
else
    error "Backup verification failed: file is empty or missing"
fi

# Upload to S3 (if configured)
if [ -n "$AWS_S3_BACKUP_BUCKET" ] && command -v aws &> /dev/null; then
    log "Uploading backup to S3..."
    S3_PATH="s3://$AWS_S3_BACKUP_BUCKET/postgres/$BACKUP_TYPE/$(basename "$FINAL_FILE")"
    aws s3 cp "$FINAL_FILE" "$S3_PATH" || warning "Failed to upload backup to S3"
    log "Backup uploaded to: $S3_PATH"
fi

# Clean up old backups
log "Cleaning up old backups..."
if [ "$BACKUP_TYPE" == "daily" ]; then
    # Keep daily backups for RETENTION_DAYS
    find "$BACKUP_DIR" -name "postgres-backup-*.sql.gz*" ! -name "*weekly*" -mtime +$RETENTION_DAYS -delete || \
        warning "Failed to delete old daily backups"
else
    # Keep weekly backups for RETENTION_WEEKS
    find "$BACKUP_DIR" -name "postgres-backup-weekly-*.sql.gz*" -mtime +$((RETENTION_WEEKS * 7)) -delete || \
        warning "Failed to delete old weekly backups"
fi

log "PostgreSQL backup completed successfully!"
log "Backup file: $FINAL_FILE"
log "Backup size: $BACKUP_SIZE"

exit 0

