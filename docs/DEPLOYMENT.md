# Production Deployment Guide

This guide covers deploying Hummy to production using Docker.

## Prerequisites

- Server with Docker and Docker Compose installed
- Domain name configured (hummy.ca, api.hummy.ca, admin.hummy.ca)
- SSL certificates (Let's Encrypt recommended)
- Database backups configured
- Monitoring tools setup

---

## 1. Server Setup

### Minimum Requirements

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS or later

### Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## 2. Setup SSL Certificates

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d hummy.ca -d www.hummy.ca
sudo certbot certonly --standalone -d api.hummy.ca
sudo certbot certonly --standalone -d admin.hummy.ca

# Copy certificates to project
sudo cp /etc/letsencrypt/live/hummy.ca/fullchain.pem ./docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/hummy.ca/privkey.pem ./docker/nginx/ssl/
sudo chown $USER:$USER ./docker/nginx/ssl/*

# Setup auto-renewal
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.prod.yml restart nginx
```

### Manual SSL Setup

```bash
# Place your SSL certificates in:
# ./docker/nginx/ssl/fullchain.pem
# ./docker/nginx/ssl/privkey.pem
```

---

## 3. Configure Production Environment

```bash
# Clone repository
cd /opt
sudo git clone git@github.com:DanielFilinski/HUMMII.git hummy
cd hummy
sudo chown -R $USER:$USER .

# Create production .env file
cp .env.example .env
nano .env
```

### Critical Environment Variables

```bash
# Change these from defaults!
NODE_ENV=production
DATABASE_PASSWORD=super-secure-password-change-this
JWT_ACCESS_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# API URLs
APP_URL=https://hummy.ca
NEXT_PUBLIC_API_URL=https://api.hummy.ca
FRONTEND_URL=https://hummy.ca
ADMIN_URL=https://admin.hummy.ca

# Production services
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=...
ONESIGNAL_APP_ID=...
SENTRY_DSN=...
```

---

## 4. Prepare Data Directories

```bash
# Create data directories
sudo mkdir -p /data/postgres /data/redis
sudo chown -R $USER:$USER /data

# Create logs directory
mkdir -p logs/api logs/nginx
```

---

## 5. Build and Deploy

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker compose -f docker-compose.prod.yml ps
```

---

## 6. Database Setup

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# Create admin user (optional)
docker compose -f docker-compose.prod.yml exec api npm run create-admin
```

---

## 7. Verify Deployment

### Health Checks

```bash
# API health
curl https://api.hummy.ca/health

# Frontend
curl https://hummy.ca

# Admin
curl https://admin.hummy.ca
```

### Test Services

1. **Frontend**: https://hummy.ca
2. **API**: https://api.hummy.ca/api
3. **Admin Panel**: https://admin.hummy.ca
4. **WebSocket**: Test chat functionality

---

## 8. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Block direct access to services
sudo ufw deny 3000  # API
sudo ufw deny 5432  # PostgreSQL
sudo ufw deny 6379  # Redis
```

---

## 9. Setup Monitoring

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/hummy

# Add:
/opt/hummy/logs/**/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    sharedscripts
    postrotate
        docker compose -f /opt/hummy/docker-compose.prod.yml restart nginx
    endscript
}
```

### Monitoring Tools

```bash
# Install monitoring stack (optional)
docker run -d \
  --name=prometheus \
  -p 9090:9090 \
  prom/prometheus

docker run -d \
  --name=grafana \
  -p 3001:3000 \
  grafana/grafana
```

---

## 10. Backups

### Database Backups

```bash
# Create backup script
cat > /opt/hummy/scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/hummy/backups"
mkdir -p $BACKUP_DIR

docker compose -f /opt/hummy/docker-compose.prod.yml exec -T postgres \
  pg_dump -U hummy hummy_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
EOF

chmod +x /opt/hummy/scripts/backup-db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /opt/hummy/scripts/backup-db.sh
```

### Restore from Backup

```bash
# Stop services
docker compose -f docker-compose.prod.yml stop api frontend admin

# Restore database
gunzip -c backups/db_20250101_020000.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U hummy -d hummy_prod

# Restart services
docker compose -f docker-compose.prod.yml up -d
```

---

## 11. Updates and Maintenance

### Update Application

```bash
# Pull latest changes
cd /opt/hummy
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run migrations if needed
docker compose -f docker-compose.prod.yml exec api npm run migration:run
```

### Update Docker Images

```bash
# Pull new base images
docker compose -f docker-compose.prod.yml pull

# Rebuild with new images
docker compose -f docker-compose.prod.yml build --no-cache

# Restart services
docker compose -f docker-compose.prod.yml up -d
```

---

## 12. Scaling

### Horizontal Scaling

```bash
# Scale API service
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Scale frontend
docker compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancer

For production, consider using:
- **AWS ALB** (Application Load Balancer)
- **DigitalOcean Load Balancer**
- **Cloudflare** (DDoS protection + CDN)

---

## 13. Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs --tail=100 api

# Check container status
docker compose -f docker-compose.prod.yml ps

# Restart specific service
docker compose -f docker-compose.prod.yml restart api
```

### Database Connection Issues

```bash
# Check postgres logs
docker compose -f docker-compose.prod.yml logs postgres

# Connect to database
docker compose -f docker-compose.prod.yml exec postgres psql -U hummy -d hummy_prod

# Test connection from API
docker compose -f docker-compose.prod.yml exec api npm run db:test
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart services to clear memory
docker compose -f docker-compose.prod.yml restart
```

---

## 14. Security Checklist

Before going live:

- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets
- [ ] SSL certificates installed and working
- [ ] Firewall configured correctly
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Monitoring tools setup
- [ ] Sentry error tracking configured
- [ ] Rate limiting tested
- [ ] Security headers verified
- [ ] CORS configured for production domains
- [ ] Environment variables secured
- [ ] Admin panel access restricted
- [ ] Database migrations tested
- [ ] Health checks working

---

## 15. Rollback Plan

If deployment fails:

```bash
# Stop current version
docker compose -f docker-compose.prod.yml down

# Revert to previous git commit
git reset --hard HEAD~1

# Restore database backup
./scripts/backup-db.sh restore

# Start previous version
docker compose -f docker-compose.prod.yml up -d
```

---

## Support

- **Documentation**: `/docs/`
- **Issues**: https://github.com/DanielFilinski/HUMMII/issues
- **Email**: admin@hummy.ca

---

**Last Updated**: October 2025

