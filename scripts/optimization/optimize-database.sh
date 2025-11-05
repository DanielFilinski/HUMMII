#!/bin/bash
set -e

# Database Optimization Script for Hummii Production
# Optimizes PostgreSQL database performance

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="/opt/hummii/docker-compose.prod.yml"
LOG_FILE="/opt/hummii/logs/optimize-database-$(date +%Y%m%d-%H%M%S).log"
ANALYZE_FILE="/opt/hummii/logs/database-analysis-$(date +%Y%m%d-%H%M%S).log"

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

log "Starting database optimization..."
log "Compose file: $COMPOSE_FILE"
log "Log file: $LOG_FILE"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    error "Docker not found. Cannot optimize database."
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
fi

# Analyze database
log "Analyzing database..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    ANALYZE;
    SELECT schemaname, tablename, n_live_tup, n_dead_tup, 
           last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
    FROM pg_stat_user_tables
    ORDER BY n_dead_tup DESC;
" > "$ANALYZE_FILE" || warning "Failed to analyze database"

log "Database analysis completed. Results saved to: $ANALYZE_FILE"

# Vacuum database
log "Running VACUUM ANALYZE..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    VACUUM ANALYZE;
" || warning "Failed to run VACUUM ANALYZE"

log "VACUUM ANALYZE completed"

# Check for missing indexes
log "Checking for missing indexes..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    SELECT schemaname, tablename, attname, n_distinct, correlation
    FROM pg_stats
    WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1
    ORDER BY n_distinct DESC;
" > "$ANALYZE_FILE.indexes" || warning "Failed to check indexes"

log "Index analysis completed. Results saved to: $ANALYZE_FILE.indexes"

# Check slow queries
log "Checking for slow queries..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    SELECT query, calls, total_time, mean_time, max_time
    FROM pg_stat_statements
    WHERE mean_time > 100
    ORDER BY mean_time DESC
    LIMIT 20;
" > "$ANALYZE_FILE.slow-queries" 2>&1 || warning "Failed to check slow queries (pg_stat_statements may not be enabled)"

log "Slow query analysis completed. Results saved to: $ANALYZE_FILE.slow-queries"

# Reindex database
log "Reindexing database..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    REINDEX DATABASE ${DATABASE_NAME:-hummii};
" || warning "Failed to reindex database"

log "Database reindexing completed"

# Update statistics
log "Updating statistics..."
docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME:-hummii}" -c "
    ANALYZE;
" || warning "Failed to update statistics"

log "Database optimization completed successfully!"
log "Analysis results saved to: $ANALYZE_FILE"

exit 0

