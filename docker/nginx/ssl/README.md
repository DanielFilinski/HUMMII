# SSL Certificate Placeholder

This directory should contain your SSL certificates for HTTPS.

## Production Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get certificates for all domains
sudo certbot certonly --standalone -d hummy.ca -d www.hummy.ca
sudo certbot certonly --standalone -d api.hummy.ca
sudo certbot certonly --standalone -d admin.hummy.ca

# Copy to this directory
sudo cp /etc/letsencrypt/live/hummy.ca/fullchain.pem ./fullchain.pem
sudo cp /etc/letsencrypt/live/hummy.ca/privkey.pem ./privkey.pem
sudo chown $USER:$USER ./*.pem
```

### Option 2: Self-Signed (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=CA/ST=Ontario/L=Toronto/O=Hummy/CN=hummy.ca"
```

### Option 3: Commercial Certificate

If you purchased an SSL certificate:

1. Place the certificate chain in `fullchain.pem`
2. Place the private key in `privkey.pem`
3. Ensure file permissions: `chmod 600 *.pem`

## Required Files

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

**⚠️ NEVER commit these files to Git!**

They are already in `.gitignore`.

## Auto-Renewal (Let's Encrypt)

Add to crontab:
```bash
0 3 * * * certbot renew --quiet && docker compose -f /path/to/docker-compose.prod.yml restart nginx
```

## Verification

Test your SSL configuration:
- https://www.ssllabs.com/ssltest/
- https://securityheaders.com/

## Troubleshooting

### Certificate Expired
```bash
sudo certbot renew --force-renewal
sudo cp /etc/letsencrypt/live/hummy.ca/*.pem ./docker/nginx/ssl/
docker compose restart nginx
```

### Permission Denied
```bash
sudo chown -R $USER:$USER ./docker/nginx/ssl/
chmod 600 ./docker/nginx/ssl/*.pem
```

