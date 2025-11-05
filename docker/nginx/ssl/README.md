# SSL Certificate Setup and Management

**Version:** 1.0  
**Last Updated:** January 6, 2025

## Overview

This directory contains SSL certificates for the Hummii production environment. Certificates are managed using Let's Encrypt with automatic renewal.

## Certificate Management

### Initial Certificate Setup

1. **Install Certbot:**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. **Obtain Certificates:**
   ```bash
   sudo certbot certonly --standalone \
     -d hummii.ca \
     -d www.hummii.ca \
     -d api.hummii.ca \
     -d admin.hummii.ca \
     --email admin@hummii.ca \
     --agree-tos \
     --non-interactive
   ```

3. **Copy Certificates:**
   ```bash
   sudo cp /etc/letsencrypt/live/hummii.ca/fullchain.pem ./certs/fullchain.pem
   sudo cp /etc/letsencrypt/live/hummii.ca/privkey.pem ./private/privkey.pem
   sudo chmod 644 ./certs/fullchain.pem
   sudo chmod 600 ./private/privkey.pem
   ```

### Automatic Renewal

Certificates are automatically renewed using a cron job:

```bash
# Add to crontab (run daily at 3 AM)
0 3 * * * /opt/hummii/scripts/ssl/certbot-renew.sh >> /opt/hummii/logs/certbot-renew.log 2>&1
```

**Renewal Script:** `/opt/hummii/scripts/ssl/certbot-renew.sh`

The script:
- Checks certificate expiration
- Renews certificates if needed (within 30 days of expiration)
- Copies certificates to project directory
- Reloads Nginx automatically

### Manual Renewal

To manually renew certificates:

```bash
sudo /opt/hummii/scripts/ssl/certbot-renew.sh
```

Or using certbot directly:

```bash
sudo certbot renew
sudo /opt/hummii/scripts/ssl/certbot-renew.sh
```

## Certificate Locations

### Let's Encrypt (Source)
- **Certificates:** `/etc/letsencrypt/live/<domain>/fullchain.pem`
- **Private Keys:** `/etc/letsencrypt/live/<domain>/privkey.pem`

### Project Directory (Nginx)
- **Certificates:** `./certs/fullchain.pem`
- **Private Keys:** `./private/privkey.pem`

## Certificate Verification

### Check Certificate Expiration

```bash
# Check expiration date
openssl x509 -in ./certs/fullchain.pem -noout -dates

# Check days until expiration
openssl x509 -in ./certs/fullchain.pem -noout -enddate | cut -d= -f2 | xargs -I {} date -d {} +%s | awk '{print int(($1 - '$(date +%s)') / 86400)}'
```

### Test SSL Configuration

```bash
# Test SSL Labs rating
curl -I https://hummii.ca

# Test certificate chain
openssl s_client -connect hummii.ca:443 -showcerts
```

## Security Best Practices

1. **Private Key Protection:**
   - Never commit private keys to git
   - Use file permissions 600 for private keys
   - Store private keys securely

2. **Certificate Rotation:**
   - Certificates auto-renew every 60 days
   - Monitor renewal logs for failures
   - Test renewal process monthly

3. **Backup:**
   - Backup certificates before renewal
   - Store backups in secure location
   - Test restore procedure

## Troubleshooting

### Certificate Renewal Fails

**Symptoms:**
- Certbot renewal fails
- Nginx shows certificate errors
- SSL Labs rating drops

**Solutions:**
1. Check certbot logs: `/var/log/letsencrypt/letsencrypt.log`
2. Verify domain ownership: `dig hummii.ca`
3. Check firewall rules: Port 80 and 443 must be open
4. Verify Nginx configuration: `nginx -t`
5. Test renewal manually: `sudo certbot renew --dry-run`

### Certificate Not Found

**Symptoms:**
- Nginx fails to start
- Certificate errors in logs
- 502 errors

**Solutions:**
1. Verify certificates exist: `ls -la /etc/letsencrypt/live/`
2. Check file permissions: `ls -la ./certs/ ./private/`
3. Re-run certificate setup: Follow initial setup steps
4. Check Nginx configuration: Verify SSL paths

### Nginx Reload Fails

**Symptoms:**
- Certificates renewed but Nginx not reloaded
- Old certificates still in use

**Solutions:**
1. Check Nginx logs: `docker logs hummii-nginx-prod`
2. Test Nginx configuration: `docker exec hummii-nginx-prod nginx -t`
3. Manually reload Nginx: `docker compose -f docker-compose.prod.yml exec nginx nginx -s reload`
4. Restart Nginx container if needed: `docker compose -f docker-compose.prod.yml restart nginx`

## Domains

The following domains require SSL certificates:

- `hummii.ca` (main domain)
- `www.hummii.ca` (www subdomain)
- `api.hummii.ca` (API subdomain)
- `admin.hummii.ca` (Admin panel subdomain)

## Environment Variables

Required environment variables:

- `CERTBOT_EMAIL`: Email address for Let's Encrypt notifications
- `SSL_CERT_PATH`: Path to SSL certificates directory (default: `/opt/hummii/docker/nginx/ssl/certs`)
- `SSL_KEY_PATH`: Path to SSL private keys directory (default: `/opt/hummii/docker/nginx/ssl/private`)

## Monitoring

### Certificate Expiration Monitoring

Monitor certificate expiration using Prometheus alerting:

```yaml
- alert: SSLCertificateExpiringSoon
  expr: ssl_certificate_expiry_days < 30
  for: 24h
  labels:
    severity: warning
  annotations:
    summary: "SSL certificate expiring soon"
    description: "SSL certificate for {{ $labels.domain }} expires in {{ $value }} days"
```

### Renewal Log Monitoring

Monitor renewal script logs:

```bash
# Check recent renewals
tail -f /opt/hummii/logs/certbot-renew.log

# Check for errors
grep -i error /opt/hummii/logs/certbot-renew.log
```

---

**Last Updated:** January 6, 2025  
**Maintained By:** DevOps Team
