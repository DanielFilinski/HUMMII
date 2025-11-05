#!/bin/bash
set -e

# Security Audit Script for Hummii Production
# Runs comprehensive security audits (npm audit, Snyk, Trivy)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AUDIT_DIR="/opt/hummii/audits"
LOG_FILE="$AUDIT_DIR/security-audit-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="$AUDIT_DIR/security-audit-report-$(date +%Y%m%d-%H%M%S).md"
PROJECT_ROOT="/opt/hummii"

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

# Create audit directory
mkdir -p "$AUDIT_DIR"

log "Starting security audit..."
log "Audit directory: $AUDIT_DIR"
log "Report file: $REPORT_FILE"

# Initialize report file
cat > "$REPORT_FILE" << EOF
# Security Audit Report - Hummii Production

**Date:** $(date +'%Y-%m-%d %H:%M:%S')  
**Auditor:** Security Audit Script  
**Environment:** Production

## Executive Summary

This report contains the results of a comprehensive security audit of the Hummii production environment.

## Audit Results

EOF

# ====================================
# npm audit
# ====================================
log "Running npm audit for all services..."

for service in api frontend admin; do
    log "Running npm audit for $service..."
    SERVICE_DIR="$PROJECT_ROOT/$service"
    
    if [ -f "$SERVICE_DIR/package.json" ]; then
        cd "$SERVICE_DIR" || continue
        
        # Run npm audit
        npm audit --audit-level=moderate > "$AUDIT_DIR/npm-audit-$service.txt" 2>&1 || true
        
        # Count vulnerabilities
        CRITICAL=$(grep -c "Critical" "$AUDIT_DIR/npm-audit-$service.txt" 2>/dev/null || echo "0")
        HIGH=$(grep -c "High" "$AUDIT_DIR/npm-audit-$service.txt" 2>/dev/null || echo "0")
        MODERATE=$(grep -c "Moderate" "$AUDIT_DIR/npm-audit-$service.txt" 2>/dev/null || echo "0")
        
        cat >> "$REPORT_FILE" << EOF
### $service - npm audit

- **Critical:** $CRITICAL
- **High:** $HIGH
- **Moderate:** $MODERATE

<details>
<summary>Full Report</summary>

\`\`\`
$(cat "$AUDIT_DIR/npm-audit-$service.txt")
\`\`\`

</details>

EOF
        
        if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            warning "$service: Found $CRITICAL critical and $HIGH high vulnerabilities"
        else
            log "$service: npm audit passed (no critical/high vulnerabilities)"
        fi
    else
        warning "$service: package.json not found, skipping"
    fi
done

# ====================================
# Snyk Security Scan
# ====================================
log "Running Snyk security scan..."

if command -v snyk &> /dev/null || [ -n "$SNYK_TOKEN" ]; then
    for service in api frontend admin; do
        log "Running Snyk scan for $service..."
        SERVICE_DIR="$PROJECT_ROOT/$service"
        
        if [ -f "$SERVICE_DIR/package.json" ]; then
            cd "$SERVICE_DIR" || continue
            
            # Run Snyk test
            if [ -n "$SNYK_TOKEN" ]; then
                snyk test --severity-threshold=high > "$AUDIT_DIR/snyk-$service.txt" 2>&1 || true
            else
                log "Snyk token not set, skipping Snyk scan for $service"
                continue
            fi
            
            cat >> "$REPORT_FILE" << EOF
### $service - Snyk Security Scan

<details>
<summary>Full Report</summary>

\`\`\`
$(cat "$AUDIT_DIR/snyk-$service.txt")
\`\`\`

</details>

EOF
        fi
    done
else
    warning "Snyk not installed or SNYK_TOKEN not set, skipping Snyk scan"
fi

# ====================================
# Trivy Vulnerability Scanner
# ====================================
log "Running Trivy vulnerability scanner..."

if command -v trivy &> /dev/null; then
    # Scan Docker images
    for service in api frontend admin; do
        log "Scanning Docker image for $service..."
        
        IMAGE_NAME="hummii-$service"
        if docker images | grep -q "$IMAGE_NAME"; then
            trivy image --severity HIGH,CRITICAL "$IMAGE_NAME:latest" > "$AUDIT_DIR/trivy-$service.txt" 2>&1 || true
            
            # Count vulnerabilities
            CRITICAL=$(grep -c "CRITICAL" "$AUDIT_DIR/trivy-$service.txt" 2>/dev/null || echo "0")
            HIGH=$(grep -c "HIGH" "$AUDIT_DIR/trivy-$service.txt" 2>/dev/null || echo "0")
            
            cat >> "$REPORT_FILE" << EOF
### $service - Trivy Docker Image Scan

- **Critical:** $CRITICAL
- **High:** $HIGH

<details>
<summary>Full Report</summary>

\`\`\`
$(cat "$AUDIT_DIR/trivy-$service.txt")
\`\`\`

</details>

EOF
            
            if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
                warning "$service: Found $CRITICAL critical and $HIGH high vulnerabilities in Docker image"
            else
                log "$service: Trivy scan passed (no critical/high vulnerabilities)"
            fi
        else
            warning "$service: Docker image not found, skipping Trivy scan"
        fi
    done
    
    # Scan filesystem
    log "Scanning filesystem for vulnerabilities..."
    trivy fs --severity HIGH,CRITICAL "$PROJECT_ROOT" > "$AUDIT_DIR/trivy-filesystem.txt" 2>&1 || true
    
    cat >> "$REPORT_FILE" << EOF
### Filesystem - Trivy Scan

<details>
<summary>Full Report</summary>

\`\`\`
$(cat "$AUDIT_DIR/trivy-filesystem.txt")
\`\`\`

</details>

EOF
else
    warning "Trivy not installed, skipping Trivy scan"
fi

# ====================================
# Security Headers Check
# ====================================
log "Checking security headers..."

if command -v curl &> /dev/null; then
    # Check API security headers
    API_URL="${API_URL:-https://api.hummii.ca}"
    if curl -s -I "$API_URL/health" > "$AUDIT_DIR/security-headers-api.txt" 2>&1; then
        cat >> "$REPORT_FILE" << EOF
### API - Security Headers

\`\`\`
$(cat "$AUDIT_DIR/security-headers-api.txt")
\`\`\`

EOF
        
        # Check for required headers
        if grep -q "Strict-Transport-Security" "$AUDIT_DIR/security-headers-api.txt"; then
            log "HSTS header present"
        else
            warning "HSTS header missing"
        fi
        
        if grep -q "X-Frame-Options" "$AUDIT_DIR/security-headers-api.txt"; then
            log "X-Frame-Options header present"
        else
            warning "X-Frame-Options header missing"
        fi
        
        if grep -q "X-Content-Type-Options" "$AUDIT_DIR/security-headers-api.txt"; then
            log "X-Content-Type-Options header present"
        else
            warning "X-Content-Type-Options header missing"
        fi
    else
        warning "Failed to check API security headers"
    fi
else
    warning "curl not installed, skipping security headers check"
fi

# ====================================
# Summary
# ====================================
cat >> "$REPORT_FILE" << EOF
## Summary

Security audit completed. Review the individual sections above for detailed results.

## Recommendations

1. **Fix Critical and High Vulnerabilities Immediately**
   - Review npm audit results
   - Update vulnerable dependencies
   - Rebuild Docker images

2. **Regular Security Audits**
   - Run this script weekly
   - Review security reports monthly
   - Update dependencies regularly

3. **Security Monitoring**
   - Set up automated security scanning in CI/CD
   - Monitor security advisories
   - Implement security alerts

---

**Report Generated:** $(date +'%Y-%m-%d %H:%M:%S')  
**Report Location:** $REPORT_FILE  
**Log Location:** $LOG_FILE

EOF

log "Security audit completed successfully!"
log "Report saved to: $REPORT_FILE"
log "Log saved to: $LOG_FILE"

exit 0

