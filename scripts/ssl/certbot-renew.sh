#!/bin/bash
set -e

# SSL Certificate Renewal Script for Hummii Production
# Automatically renews Let's Encrypt certificates and reloads Nginx

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@hummii.ca}"
DOMAINS=("hummii.ca" "www.hummii.ca" "api.hummii.ca" "admin.hummii.ca")
COMPOSE_FILE="/opt/hummii/docker-compose.prod.yml"
LOG_FILE="/opt/hummii/logs/certbot-renew-$(date +%Y%m%d-%H%M%S).log"

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
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root (use sudo)"
fi

log "Starting SSL certificate renewal..."
log "Domains: ${DOMAINS[*]}"
log "Email: $CERTBOT_EMAIL"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log "Certbot not found, installing..."
    apt-get update
    apt-get install -y certbot || error "Failed to install certbot"
fi

# Create domains string for certbot
DOMAINS_STRING=$(printf " -d %s" "${DOMAINS[@]}")

# Renew certificates
log "Renewing SSL certificates..."
certbot renew --quiet --no-self-upgrade || error "Failed to renew certificates"

# Check if certificates were renewed
CERT_RENEWED=false
for domain in "${DOMAINS[@]}"; do
    CERT_PATH="/etc/letsencrypt/live/$domain/fullchain.pem"
    if [ -f "$CERT_PATH" ]; then
        CERT_AGE=$(stat -c %Y "$CERT_PATH")
        CURRENT_TIME=$(date +%s)
        AGE_DAYS=$(( (CURRENT_TIME - CERT_AGE) / 86400 ))
        
        if [ "$AGE_DAYS" -lt 1 ]; then
            CERT_RENEWED=true
            log "Certificate for $domain was renewed (age: $AGE_DAYS days)"
        else
            log "Certificate for $domain is still valid (age: $AGE_DAYS days)"
        fi
    else
        warning "Certificate not found for $domain: $CERT_PATH"
    fi
done

# Copy certificates to project directory (if needed)
if [ "$CERT_RENEWED" = true ]; then
    log "Certificates were renewed, copying to project directory..."
    
    # Create SSL directories
    mkdir -p /opt/hummii/docker/nginx/ssl/certs
    mkdir -p /opt/hummii/docker/nginx/ssl/private
    
    # Copy certificates for each domain
    for domain in "${DOMAINS[@]}"; do
        CERT_PATH="/etc/letsencrypt/live/$domain/fullchain.pem"
        KEY_PATH="/etc/letsencrypt/live/$domain/privkey.pem"
        
        if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
            # Copy fullchain (certificate + chain)
            cp "$CERT_PATH" "/opt/hummii/docker/nginx/ssl/certs/$domain-fullchain.pem" || \
                warning "Failed to copy certificate for $domain"
            
            # Copy private key
            cp "$KEY_PATH" "/opt/hummii/docker/nginx/ssl/private/$domain-privkey.pem" || \
                warning "Failed to copy private key for $domain"
            
            # Set proper permissions
            chmod 644 "/opt/hummii/docker/nginx/ssl/certs/$domain-fullchain.pem"
            chmod 600 "/opt/hummii/docker/nginx/ssl/private/$domain-privkey.pem"
            
            log "Certificates copied for $domain"
        else
            warning "Certificate files not found for $domain"
        fi
    done
    
    # Create combined certificate file (for Nginx)
    if [ -f "/opt/hummii/docker/nginx/ssl/certs/hummii.ca-fullchain.pem" ]; then
        cp "/opt/hummii/docker/nginx/ssl/certs/hummii.ca-fullchain.pem" \
           "/opt/hummii/docker/nginx/ssl/fullchain.pem" || \
            warning "Failed to create combined certificate file"
    fi
    
    if [ -f "/opt/hummii/docker/nginx/ssl/private/hummii.ca-privkey.pem" ]; then
        cp "/opt/hummii/docker/nginx/ssl/private/hummii.ca-privkey.pem" \
           "/opt/hummii/docker/nginx/ssl/privkey.pem" || \
            warning "Failed to create combined private key file"
    fi
    
    # Reload Nginx
    log "Reloading Nginx..."
    if command -v docker &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload || \
            error "Failed to reload Nginx"
        log "Nginx reloaded successfully"
    else
        if systemctl is-active --quiet nginx; then
            systemctl reload nginx || error "Failed to reload Nginx"
            log "Nginx reloaded successfully"
        else
            warning "Nginx not running, skipping reload"
        fi
    fi
else
    log "No certificates were renewed (still valid)"
fi

# Clean up old certificates
log "Cleaning up old certificates..."
certbot delete --cert-name old-cert 2>/dev/null || true

log "SSL certificate renewal completed successfully!"

exit 0

