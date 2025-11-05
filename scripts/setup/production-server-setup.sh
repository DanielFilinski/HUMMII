#!/bin/bash
set -e

# Production Server Setup Script for Hummii
# Sets up production server with security hardening

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="/opt/hummii/logs/setup-production-$(date +%Y%m%d-%H%M%S).log"

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

log "Starting production server setup..."

# ==============================================================================
# Update System
# ==============================================================================
log "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ==============================================================================
# Install Required Packages
# ==============================================================================
log "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    ufw \
    fail2ban \
    unattended-upgrades \
    htop \
    net-tools \
    openssl \
    certbot \
    awscli \
    jq \
    || error "Failed to install required packages"

# ==============================================================================
# Install Docker
# ==============================================================================
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    usermod -aG docker "$SUDO_USER" || warning "Failed to add user to docker group"
    
    log "Docker installed successfully"
else
    log "Docker already installed"
fi

# ==============================================================================
# Install Docker Compose
# ==============================================================================
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
    log "Docker Compose installed successfully"
else
    log "Docker Compose already installed"
fi

# ==============================================================================
# Configure Firewall
# ==============================================================================
log "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Block direct access to services
ufw deny 3000/tcp comment 'API (blocked)'
ufw deny 5432/tcp comment 'PostgreSQL (blocked)'
ufw deny 6379/tcp comment 'Redis (blocked)'

log "Firewall configured successfully"

# ==============================================================================
# Configure Fail2ban
# ==============================================================================
log "Configuring Fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create custom jail for SSH
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 5
bantime = 86400
EOF

systemctl restart fail2ban
log "Fail2ban configured successfully"

# ==============================================================================
# Configure Automatic Updates
# ==============================================================================
log "Configuring automatic updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}:\${distro_codename}-updates";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
log "Automatic updates configured successfully"

# ==============================================================================
# Configure SSH Security
# ==============================================================================
log "Configuring SSH security..."

# Backup SSH config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Update SSH config
cat >> /etc/ssh/sshd_config << EOF

# Security hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

# Restart SSH (test configuration first)
if sshd -t; then
    systemctl restart sshd
    log "SSH security configured successfully"
    warning "SSH password authentication disabled. Ensure SSH keys are configured!"
else
    error "SSH configuration test failed. Restoring backup..."
    cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
    systemctl restart sshd
fi

# ==============================================================================
# Create Project Directories
# ==============================================================================
log "Creating project directories..."
mkdir -p /opt/hummii/{logs,backups/{postgres,redis,logs},scripts,audits,security-tests}
mkdir -p /opt/hummii/docker/nginx/ssl/{certs,private}
chown -R "$SUDO_USER:$SUDO_USER" /opt/hummii
log "Project directories created successfully"

# ==============================================================================
# Configure Log Rotation
# ==============================================================================
log "Configuring log rotation..."
cat > /etc/logrotate.d/hummii << EOF
/opt/hummii/logs/*/*.log {
    daily
    rotate 90
    compress
    delaycompress
    notifempty
    missingok
    create 0644 $SUDO_USER $SUDO_USER
    sharedscripts
    postrotate
        /opt/hummii/scripts/log-rotation.sh
    endscript
}
EOF

log "Log rotation configured successfully"

# ==============================================================================
# Configure Cron Jobs
# ==============================================================================
log "Configuring cron jobs..."

# Create cron jobs file
cat > /tmp/hummii-cron << EOF
# SSL Certificate Renewal (daily at 3 AM)
0 3 * * * /opt/hummii/scripts/ssl/certbot-renew.sh >> /opt/hummii/logs/certbot-renew.log 2>&1

# Database Backup (daily at 2 AM)
0 2 * * * /opt/hummii/scripts/backup/postgres-backup.sh >> /opt/hummii/logs/backup-postgres.log 2>&1

# Redis Backup (daily at 2:30 AM)
30 2 * * * /opt/hummii/scripts/backup/redis-backup.sh >> /opt/hummii/logs/backup-redis.log 2>&1

# Log Rotation (daily at 4 AM)
0 4 * * * /opt/hummii/scripts/log-rotation.sh >> /opt/hummii/logs/log-rotation.log 2>&1

# Database Optimization (weekly on Sunday at 1 AM)
0 1 * * 0 /opt/hummii/scripts/optimization/optimize-database.sh >> /opt/hummii/logs/optimize-database.log 2>&1

# Security Audit (weekly on Monday at 2 AM)
0 2 * * 1 /opt/hummii/scripts/security/audit.sh >> /opt/hummii/logs/security-audit.log 2>&1

# Backup Verification (weekly on Monday at 3 AM)
0 3 * * 1 /opt/hummii/scripts/backup/verify-backup.sh >> /opt/hummii/logs/verify-backup.log 2>&1
EOF

# Install cron jobs (for current user)
crontab -u "$SUDO_USER" /tmp/hummii-cron || warning "Failed to install cron jobs"
rm /tmp/hummii-cron

log "Cron jobs configured successfully"

# ==============================================================================
# Configure System Limits
# ==============================================================================
log "Configuring system limits..."
cat >> /etc/security/limits.conf << EOF

# Hummii application limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

log "System limits configured successfully"

# ==============================================================================
# Configure Swap
# ==============================================================================
log "Configuring swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make swap permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    log "Swap configured successfully (2GB)"
else
    log "Swap already configured"
fi

# ==============================================================================
# Summary
# ==============================================================================
log "Production server setup completed successfully!"
log ""
log "Next steps:"
log "1. Configure SSH keys for user: $SUDO_USER"
log "2. Set up environment variables in /opt/hummii/.env.production"
log "3. Clone repository to /opt/hummii"
log "4. Configure SSL certificates"
log "5. Deploy application using deploy-production.sh"
log ""
log "Setup log saved to: $LOG_FILE"

exit 0

