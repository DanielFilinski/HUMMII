#!/bin/bash
# Log Viewer Script for Hummii API
# Usage: ./scripts/view-logs.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOGS_DIR="logs/api"

# Helper function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if logs directory exists
check_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        log_error "Logs directory not found: $LOGS_DIR"
        log_info "Make sure Docker containers are running: docker compose up -d"
        exit 1
    fi
}

# Show help
show_help() {
    cat << EOF
${GREEN}Hummii Log Viewer${NC}

Usage: $0 [command] [options]

Commands:
    stats           Show log statistics
    tail [file]     Tail logs in real-time (default: combined)
    errors          Show recent errors
    audit           Show audit logs
    search <text>   Search logs for specific text
    last [N]        Show last N lines (default: 50)
    clean           Clean old logs (backup first!)
    container       View logs inside Docker container
    help            Show this help message

Files:
    combined        All logs (info, warn, error, debug)
    error           Only errors
    audit           Audit logs (PIPEDA compliance)
    exceptions      Unhandled exceptions
    rejections      Promise rejections

Examples:
    $0 stats                    # Show statistics
    $0 tail                     # Tail all logs
    $0 tail error               # Tail only errors
    $0 errors                   # Show last 20 errors
    $0 search "UserService"     # Search for UserService logs
    $0 last 100                 # Show last 100 lines
    $0 container                # View logs inside container

EOF
}

# Show statistics
show_stats() {
    check_logs_dir
    
    log_info "Log Statistics"
    echo ""
    echo "File Sizes:"
    ls -lh $LOGS_DIR/*.log 2>/dev/null || log_warning "No log files found"
    echo ""
    
    if [ -f "$LOGS_DIR/combined.log" ]; then
        echo "Records:"
        echo "  Combined: $(wc -l < $LOGS_DIR/combined.log) lines"
        [ -f "$LOGS_DIR/error.log" ] && echo "  Errors:   $(wc -l < $LOGS_DIR/error.log) lines"
        [ -f "$LOGS_DIR/audit.log" ] && echo "  Audit:    $(wc -l < $LOGS_DIR/audit.log) lines"
        echo ""
        
        # Show level distribution (if jq is available)
        if command -v jq &> /dev/null; then
            echo "Log Levels:"
            cat $LOGS_DIR/combined.log | jq -r '.level' | sort | uniq -c | sort -rn
        else
            log_info "Install 'jq' for detailed statistics: apt install jq"
        fi
    else
        log_warning "No combined.log found"
    fi
}

# Tail logs
tail_logs() {
    check_logs_dir
    
    local file="${1:-combined}"
    local log_file="$LOGS_DIR/${file}.log"
    
    if [ ! -f "$log_file" ]; then
        log_error "Log file not found: $log_file"
        exit 1
    fi
    
    log_info "Tailing $log_file (Ctrl+C to stop)"
    tail -f "$log_file"
}

# Show errors
show_errors() {
    check_logs_dir
    
    local count="${1:-20}"
    
    if [ ! -f "$LOGS_DIR/error.log" ]; then
        log_warning "No error.log found"
        exit 0
    fi
    
    log_info "Last $count errors:"
    echo ""
    
    tail -n "$count" "$LOGS_DIR/error.log"
}

# Show audit logs
show_audit() {
    check_logs_dir
    
    local count="${1:-50}"
    
    if [ ! -f "$LOGS_DIR/audit.log" ]; then
        log_warning "No audit.log found"
        exit 0
    fi
    
    log_info "Last $count audit logs:"
    echo ""
    
    tail -n "$count" "$LOGS_DIR/audit.log"
}

# Search logs
search_logs() {
    check_logs_dir
    
    if [ -z "$1" ]; then
        log_error "Please provide search text"
        exit 1
    fi
    
    local search_text="$1"
    
    log_info "Searching for: '$search_text'"
    echo ""
    
    grep -i "$search_text" "$LOGS_DIR/combined.log" || log_warning "No matches found"
}

# Show last N lines
show_last() {
    check_logs_dir
    
    local count="${1:-50}"
    
    log_info "Last $count log entries:"
    echo ""
    
    tail -n "$count" "$LOGS_DIR/combined.log"
}

# Clean logs
clean_logs() {
    log_warning "This will DELETE all log files!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Cancelled"
        exit 0
    fi
    
    log_info "Backing up logs..."
    mkdir -p logs/backup
    tar -czf "logs/backup/logs-$(date +%Y%m%d-%H%M%S).tar.gz" $LOGS_DIR/*.log 2>/dev/null || true
    
    log_info "Removing log files..."
    rm -f $LOGS_DIR/*.log
    
    log_success "Logs cleaned. Backup saved in logs/backup/"
    log_info "Logs will be recreated when application writes new entries"
}

# View container logs
view_container_logs() {
    log_info "Viewing logs inside Docker container"
    
    if ! docker ps | grep -q "hummii-api"; then
        log_error "Container 'hummii-api' is not running"
        log_info "Start it with: docker compose up -d"
        exit 1
    fi
    
    docker exec -it hummii-api ls -lh /app/logs
    echo ""
    log_info "To tail logs inside container:"
    echo "  docker exec hummii-api tail -f /app/logs/combined.log"
}

# Main script
main() {
    case "${1:-help}" in
        stats)
            show_stats
            ;;
        tail)
            tail_logs "$2"
            ;;
        errors)
            show_errors "$2"
            ;;
        audit)
            show_audit "$2"
            ;;
        search)
            search_logs "$2"
            ;;
        last)
            show_last "$2"
            ;;
        clean)
            clean_logs
            ;;
        container)
            view_container_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

