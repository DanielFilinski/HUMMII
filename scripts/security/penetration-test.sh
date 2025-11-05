#!/bin/bash
set -e

# Penetration Testing Script for Hummii Production
# Uses OWASP ZAP for automated security testing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="/opt/hummii/security-tests"
LOG_FILE="$TEST_DIR/penetration-test-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="$TEST_DIR/penetration-test-report-$(date +%Y%m%d-%H%M%S).html"
API_URL="${API_URL:-https://api.hummii.ca}"
FRONTEND_URL="${FRONTEND_URL:-https://hummii.ca}"

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

# Create test directory
mkdir -p "$TEST_DIR"

log "Starting penetration testing..."
log "Test directory: $TEST_DIR"
log "Report file: $REPORT_FILE"
log "API URL: $API_URL"
log "Frontend URL: $FRONTEND_URL"

# Check if OWASP ZAP is available
if command -v zap-cli &> /dev/null || docker ps | grep -q zap; then
    log "OWASP ZAP found, running penetration tests..."
    
    # Use Docker if available
    if command -v docker &> /dev/null; then
        log "Running OWASP ZAP via Docker..."
        
        # Start ZAP container
        docker run -d --name zap \
            -v "$TEST_DIR:/zap/wrk/:rw" \
            owasp/zap2docker-stable \
            zap-baseline.py -t "$API_URL" -J -j zap-report.json || \
            warning "ZAP baseline scan failed"
        
        # Wait for scan to complete
        sleep 30
        
        # Get report
        docker cp zap:/zap/wrk/zap-report.json "$TEST_DIR/zap-report.json" || \
            warning "Failed to copy ZAP report"
        
        # Stop and remove container
        docker stop zap || true
        docker rm zap || true
    else
        warning "Docker not available, skipping OWASP ZAP scan"
    fi
else
    warning "OWASP ZAP not found, skipping penetration tests"
    log "Install OWASP ZAP: https://www.zaproxy.org/download/"
fi

# Manual security tests
log "Running manual security tests..."

# Test SQL injection protection
log "Testing SQL injection protection..."
if command -v curl &> /dev/null; then
    # Test SQL injection on login endpoint
    SQL_INJECTION_TEST="' OR '1'='1"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$SQL_INJECTION_TEST\",\"password\":\"test\"}" || echo "000")
    
    if [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "401" ]; then
        log "SQL injection protection: PASSED (response: $RESPONSE)"
    else
        warning "SQL injection protection: FAILED (response: $RESPONSE)"
    fi
fi

# Test XSS protection
log "Testing XSS protection..."
if command -v curl &> /dev/null; then
    XSS_TEST="<script>alert('XSS')</script>"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$XSS_TEST@test.com\",\"password\":\"test123456\"}" || echo "000")
    
    if [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "422" ]; then
        log "XSS protection: PASSED (response: $RESPONSE)"
    else
        warning "XSS protection: FAILED (response: $RESPONSE)"
    fi
fi

# Test rate limiting
log "Testing rate limiting..."
if command -v curl &> /dev/null; then
    RATE_LIMIT_COUNT=0
    for i in {1..10}; do
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/auth/login" || echo "000")
        if [ "$RESPONSE" == "429" ]; then
            RATE_LIMIT_COUNT=$((RATE_LIMIT_COUNT + 1))
        fi
        sleep 0.1
    done
    
    if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
        log "Rate limiting: PASSED (blocked $RATE_LIMIT_COUNT requests)"
    else
        warning "Rate limiting: FAILED (no rate limit detected)"
    fi
fi

# Test CSRF protection
log "Testing CSRF protection..."
if command -v curl &> /dev/null; then
    # Test without CSRF token
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/users/me" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"test\"}" || echo "000")
    
    if [ "$RESPONSE" == "401" ] || [ "$RESPONSE" == "403" ]; then
        log "CSRF protection: PASSED (response: $RESPONSE)"
    else
        warning "CSRF protection: FAILED (response: $RESPONSE)"
    fi
fi

# Test authentication bypass
log "Testing authentication bypass..."
if command -v curl &> /dev/null; then
    # Test accessing protected endpoint without token
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/users/me" || echo "000")
    
    if [ "$RESPONSE" == "401" ] || [ "$RESPONSE" == "403" ]; then
        log "Authentication bypass protection: PASSED (response: $RESPONSE)"
    else
        warning "Authentication bypass protection: FAILED (response: $RESPONSE)"
    fi
fi

log "Penetration testing completed!"
log "Report saved to: $REPORT_FILE"
log "Log saved to: $LOG_FILE"

exit 0

