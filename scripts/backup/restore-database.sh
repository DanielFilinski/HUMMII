#!/bin/bash
set -e

# PostgreSQL Restore Script for Hummii Production
# Restores database from encrypted backup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="/opt/hummii/docker-compose.prod.yml"
LOG_FILE="/opt/hummii/logs/restore-database-$(date +%Y%m%d-%H%M%S).log"

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

# Check if backup file is provided
if [ -z "$1" ]; then
    error "Usage: $0 <backup-file> [--force]"
fi

BACKUP_FILE="$1"
FORCE_RESTORE="${2:-}"

if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
fi

log "Starting database restore..."
log "Backup file: $BACKUP_FILE"
log "Force restore: ${FORCE_RESTORE:-no}"

# Confirm restore (unless --force is specified)
if [ "$FORCE_RESTORE" != "--force" ]; then
    echo -e "${YELLOW}WARNING: This will restore the database from backup.${NC}"
    echo -e "${YELLOW}This will OVERWRITE the current database!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Create temporary directory for restore
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Determine if backup is encrypted
if [[ "$BACKUP_FILE" == *.enc ]]; then
    log "Backup is encrypted, decrypting..."
    if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
        error "BACKUP_ENCRYPTION_KEY environment variable is not set"
    fi
    
    DECRYPTED_FILE="$TEMP_DIR/backup-decrypted.sql.gz"
    openssl enc -aes-256-cbc -d -in "$BACKUP_FILE" -out "$DECRYPTED_FILE" -k "$BACKUP_ENCRYPTION_KEY" || \
        error "Failed to decrypt backup"
    BACKUP_TO_RESTORE="$DECRYPTED_FILE"
else
    BACKUP_TO_RESTORE="$BACKUP_FILE"
fi

# Determine if backup is compressed
if [[ "$BACKUP_TO_RESTORE" == *.gz ]]; then
    log "Backup is compressed, decompressing..."
    DECOMPRESSED_FILE="$TEMP_DIR/backup-decompressed.sql"
    gunzip -c "$BACKUP_TO_RESTORE" > "$DECOMPRESSED_FILE" || \
        error "Failed to decompress backup"
    BACKUP_TO_RESTORE="$DECOMPRESSED_FILE"
fi

# Verify backup file
if [ ! -f "$BACKUP_TO_RESTORE" ] || [ ! -s "$BACKUP_TO_RESTORE" ]; then
    error "Backup file is invalid or empty"
fi

log "Backup file verified: $BACKUP_TO_RESTORE"

# Stop application services (if needed)
log "Stopping application services..."
if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    docker compose -f "$COMPOSE_FILE" stop api || warning "Failed to stop API service"
fi

# Restore database
log "Restoring database..."
if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    # Using Docker Compose
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" < "$BACKUP_TO_RESTORE" || \
        error "Failed to restore database"
else
    # Direct psql (if PostgreSQL client is installed)
    if command -v psql &> /dev/null; then
        psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" < "$BACKUP_TO_RESTORE" || \
            error "Failed to restore database"
    else
        error "Neither Docker nor psql found. Cannot restore database."
    fi
fi

# Start application services
log "Starting application services..."
if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    docker compose -f "$COMPOSE_FILE" start api || warning "Failed to start API service"
fi

# Verify restore
log "Verifying restore..."
if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    CONNECTION_CHECK=$(docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "SELECT 1;" 2>&1)
    if echo "$CONNECTION_CHECK" | grep -q "1"; then
        log "Database restore verified successfully"
    else
        error "Database restore verification failed"
    fi
fi

log "Database restore completed successfully!"
log "Database restored from: $BACKUP_FILE"

exit 0

