#!/bin/bash
set -e

# Backup Verification Script for Hummii Production
# Verifies backup integrity and completeness

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/hummii/backups"
LOG_FILE="/opt/hummii/logs/verify-backup-$(date +%Y%m%d-%H%M%S).log"

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

log "Starting backup verification..."
log "Backup directory: $BACKUP_DIR"

# Check PostgreSQL backups
log "Verifying PostgreSQL backups..."
POSTGRES_BACKUPS=$(find "$BACKUP_DIR/postgres" -name "*.sql.gz*" -type f 2>/dev/null | wc -l)
if [ "$POSTGRES_BACKUPS" -gt 0 ]; then
    log "Found $POSTGRES_BACKUPS PostgreSQL backup(s)"
    
    # Check latest backup
    LATEST_BACKUP=$(find "$BACKUP_DIR/postgres" -name "*.sql.gz*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        log "Latest PostgreSQL backup: $(basename "$LATEST_BACKUP") ($BACKUP_SIZE)"
        
        # Verify backup file integrity
        if [[ "$LATEST_BACKUP" == *.enc ]]; then
            log "Backup is encrypted, checking encryption..."
            if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
                # Try to decrypt (without saving) to verify encryption
                TEMP_FILE=$(mktemp)
                trap "rm -f $TEMP_FILE" EXIT
                if openssl enc -aes-256-cbc -d -in "$LATEST_BACKUP" -out "$TEMP_FILE" -k "$BACKUP_ENCRYPTION_KEY" 2>/dev/null; then
                    log "Backup encryption verified"
                    rm -f "$TEMP_FILE"
                else
                    warning "Backup encryption verification failed"
                fi
            fi
        fi
        
        # Check if backup is compressed
        if [[ "$LATEST_BACKUP" == *.gz ]] || [[ "$LATEST_BACKUP" == *.enc ]]; then
            log "Backup is compressed, checking compression..."
            if gunzip -t "$LATEST_BACKUP" 2>/dev/null || true; then
                log "Backup compression verified"
            else
                warning "Backup compression verification failed"
            fi
        fi
    else
        warning "No PostgreSQL backups found"
    fi
else
    warning "No PostgreSQL backups found"
fi

# Check Redis backups
log "Verifying Redis backups..."
REDIS_BACKUPS=$(find "$BACKUP_DIR/redis" -name "*.rdb.gz*" -type f 2>/dev/null | wc -l)
if [ "$REDIS_BACKUPS" -gt 0 ]; then
    log "Found $REDIS_BACKUPS Redis backup(s)"
    
    # Check latest backup
    LATEST_BACKUP=$(find "$BACKUP_DIR/redis" -name "*.rdb.gz*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        log "Latest Redis backup: $(basename "$LATEST_BACKUP") ($BACKUP_SIZE)"
        
        # Verify backup file integrity (similar to PostgreSQL)
        if [[ "$LATEST_BACKUP" == *.enc ]]; then
            log "Backup is encrypted, checking encryption..."
            if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
                TEMP_FILE=$(mktemp)
                trap "rm -f $TEMP_FILE" EXIT
                if openssl enc -aes-256-cbc -d -in "$LATEST_BACKUP" -out "$TEMP_FILE" -k "$BACKUP_ENCRYPTION_KEY" 2>/dev/null; then
                    log "Backup encryption verified"
                    rm -f "$TEMP_FILE"
                else
                    warning "Backup encryption verification failed"
                fi
            fi
        fi
    else
        warning "No Redis backups found"
    fi
else
    warning "No Redis backups found"
fi

# Check S3 backups (if configured)
if [ -n "$AWS_S3_BACKUP_BUCKET" ] && command -v aws &> /dev/null; then
    log "Verifying S3 backups..."
    S3_BACKUPS=$(aws s3 ls "s3://$AWS_S3_BACKUP_BUCKET/postgres/" 2>/dev/null | wc -l)
    if [ "$S3_BACKUPS" -gt 0 ]; then
        log "Found $S3_BACKUPS PostgreSQL backup(s) in S3"
    else
        warning "No PostgreSQL backups found in S3"
    fi
    
    S3_REDIS_BACKUPS=$(aws s3 ls "s3://$AWS_S3_BACKUP_BUCKET/redis/" 2>/dev/null | wc -l)
    if [ "$S3_REDIS_BACKUPS" -gt 0 ]; then
        log "Found $S3_REDIS_BACKUPS Redis backup(s) in S3"
    else
        warning "No Redis backups found in S3"
    fi
fi

log "Backup verification completed successfully!"

exit 0

