# Production Environment Variables Setup Guide

> **Security Guide for Production Deployment**  
> **Date:** November 2, 2025  
> **Status:** Production Ready

## 🔒 Security Checklist

Before deploying to production, ensure ALL items are completed:

### Critical Security Items

- [ ] **JWT Secrets:** Generated with `openssl rand -base64 64` (256-bit minimum)
- [ ] **Redis Password:** Set with 16+ characters (generated with `openssl rand -base64 24`)
- [ ] **PostgreSQL:** Strong password (16+ characters) + SSL enabled
- [ ] **DATABASE_URL:** Includes `?sslmode=require` parameter
- [ ] **All URLs:** Use HTTPS only (no `http://`)
- [ ] **Stripe:** Use LIVE keys (`sk_live_`, `pk_live_`, `whsec_`)
- [ ] **AWS IAM:** User has minimal S3 permissions only (no admin access)
- [ ] **SSL Certificates:** Valid and not expired (Let's Encrypt recommended)
- [ ] **.env files:** NOT committed to git (in `.gitignore`)
- [ ] **Secrets Storage:** Stored in secure vault (1Password, AWS Secrets Manager, etc.)

### Infrastructure Security

- [ ] **Firewall:** Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- [ ] **SSH:** Key-based authentication only (password login disabled)
- [ ] **Backups:** Automated daily backups configured (PostgreSQL, Redis, S3)
- [ ] **Monitoring:** Error tracking (Sentry) and logging configured
- [ ] **Docker:** Production images use multi-stage builds (no dev dependencies)
- [ ] **Nginx:** Security headers configured (HSTS, CSP, X-Frame-Options)

---

## 📝 Production Environment Variables

### Example `.env.production` File

```bash
# ==============================================================================
# PRODUCTION ENVIRONMENT VARIABLES FOR HUMMII API
# ==============================================================================
# ⚠️ SECURITY WARNING:
# - NEVER commit this file to version control
# - Store securely (1Password, AWS Secrets Manager, HashiCorp Vault)
# - Rotate secrets regularly (JWT secrets every 90 days, passwords every 30 days)
# - Use strong random values (openssl rand -base64 64)
# ==============================================================================

# ==============================================================================
# NODE ENVIRONMENT
# ==============================================================================
NODE_ENV=production
PORT=3000

# ==============================================================================
# DATABASE CONFIGURATION (PostgreSQL with SSL)
# ==============================================================================
# ⚠️ CRITICAL: Must include SSL parameters in production
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
DATABASE_URL=postgresql://hummii_prod:YOUR_DB_PASSWORD@postgres:5432/hummii_production?sslmode=require

# Database credentials (used by docker-compose)
DATABASE_NAME=hummii_production
DATABASE_USER=hummii_prod
DATABASE_PASSWORD=YOUR_STRONG_DB_PASSWORD_16_CHARS

# ==============================================================================
# REDIS CONFIGURATION (with Password Authentication)
# ==============================================================================
# ⚠️ CRITICAL: Password is REQUIRED in production (min 16 characters)
# Generate: openssl rand -base64 24
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_MIN_16_CHARS

# ==============================================================================
# JWT TOKEN SECRETS
# ==============================================================================
# ⚠️ CRITICAL: Must be 256-bit minimum (32+ characters)
# Generate DIFFERENT secrets for access and refresh tokens
# Command: openssl rand -base64 64
JWT_ACCESS_SECRET=YOUR_ACCESS_SECRET_MIN_32_CHARS_BASE64
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET_DIFFERENT_FROM_ACCESS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ==============================================================================
# APPLICATION URLS (HTTPS ONLY IN PRODUCTION)
# ==============================================================================
# ⚠️ MUST use HTTPS in production (no http://)
FRONTEND_URL=https://hummii.ca
API_URL=https://api.hummii.ca
NEXT_PUBLIC_API_URL=https://api.hummii.ca

# ==============================================================================
# STRIPE PAYMENT PROCESSING
# ==============================================================================
# ⚠️ Use LIVE keys in production (sk_live_..., pk_live_...)
# Webhook secret from Stripe Dashboard → Developers → Webhooks
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY

# ==============================================================================
# AWS S3 FILE STORAGE
# ==============================================================================
# ⚠️ Use IAM user with minimal permissions (S3 PutObject, GetObject only)
AWS_S3_BUCKET=hummii-production-uploads
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ca-central-1

# ==============================================================================
# EMAIL SERVICE (SendGrid or AWS SES)
# ==============================================================================
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY

# ==============================================================================
# GOOGLE OAUTH (OPTIONAL)
# ==============================================================================
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://api.hummii.ca/api/auth/google/callback

# ==============================================================================
# SSL CERTIFICATE PATHS
# ==============================================================================
SSL_CERT_PATH=/etc/ssl/certs
SSL_KEY_PATH=/etc/ssl/private

# ==============================================================================
# MONITORING & ANALYTICS
# ==============================================================================
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID
```

---

## 🔐 Generating Secure Secrets

### 1. JWT Secrets (256-bit)

```bash
# Generate JWT Access Secret
openssl rand -base64 64

# Generate JWT Refresh Secret (DIFFERENT from access)
openssl rand -base64 64
```

**Example output:**
```
X7k9mP2vN5qR8tW4aD1eF6hJ3lK0oS7uY9bC2xZ5mQ8nR4wE1tY6uI3oP0aS9dF7gH2jK5lZ8xC3vB6nM1qW4e
```

### 2. Redis Password (16+ chars)

```bash
openssl rand -base64 24
```

**Example output:**
```
ZxC9kL2mN5qR8tW4aD1eF6hJ3lK0
```

### 3. PostgreSQL Password (16+ chars)

```bash
openssl rand -base64 24
```

### 4. Verify Environment Variables at Startup

The application will automatically validate all environment variables when it starts. If any required variable is missing or invalid, it will throw an error with a helpful message.

**Example validation error:**

```
Error: An instance of EnvironmentVariables has failed the validation:
 - property JWT_ACCESS_SECRET has failed the following constraints: 
   * JWT_ACCESS_SECRET must be at least 32 characters (256-bit). Generate with: openssl rand -base64 64
```

---

## 🚀 Deployment Steps

### 1. Generate Secrets

```bash
# Create .env.production file
cp .env.production.example .env.production

# Generate all secrets
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 64)" >> .env.production
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)" >> .env.production
echo "REDIS_PASSWORD=$(openssl rand -base64 24)" >> .env.production
echo "DATABASE_PASSWORD=$(openssl rand -base64 24)" >> .env.production
```

### 2. Setup SSL Certificates

```bash
# Option 1: Let's Encrypt (Recommended - Free)
sudo certbot certonly --standalone -d hummii.ca -d www.hummii.ca -d api.hummii.ca -d admin.hummii.ca

# Option 2: Custom SSL Certificates
# Place certificates in:
# - /etc/ssl/certs/postgres-server.crt
# - /etc/ssl/private/postgres-server.key
# - /etc/ssl/certs/postgres-client.crt
# - /etc/ssl/private/postgres-client.key
```

### 3. Configure PostgreSQL SSL

```bash
# Copy SSL certificates to postgres container
docker cp /etc/ssl/certs/postgres-server.crt hummii-postgres-prod:/var/lib/postgresql/server.crt
docker cp /etc/ssl/private/postgres-server.key hummii-postgres-prod:/var/lib/postgresql/server.key

# Set permissions
docker exec hummii-postgres-prod chown postgres:postgres /var/lib/postgresql/server.crt
docker exec hummii-postgres-prod chown postgres:postgres /var/lib/postgresql/server.key
docker exec hummii-postgres-prod chmod 600 /var/lib/postgresql/server.key
```

### 4. Deploy with Docker Compose

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f api

# Check health
docker compose -f docker-compose.prod.yml ps
```

### 5. Run Database Migrations

```bash
# Run Prisma migrations
docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate:deploy

# Generate Prisma Client
docker compose -f docker-compose.prod.yml exec api npm run prisma:generate
```

---

## 🔍 Verification

### Test SSL Connection to PostgreSQL

```bash
# From API container
docker compose -f docker-compose.prod.yml exec api psql "${DATABASE_URL}" -c "SELECT version();"

# Check SSL is enabled
docker compose -f docker-compose.prod.yml exec api psql "${DATABASE_URL}" -c "SHOW ssl;"
# Should output: ssl | on
```

### Test Redis Authentication

```bash
# Should fail without password
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
# Error: NOAUTH Authentication required

# Should succeed with password
docker compose -f docker-compose.prod.yml exec redis redis-cli -a "${REDIS_PASSWORD}" ping
# PONG
```

### Test API Health

```bash
# Check API is running
curl https://api.hummii.ca/api/health

# Check CORS
curl -H "Origin: https://hummii.ca" https://api.hummii.ca/api/health -I

# Check security headers
curl -I https://api.hummii.ca/api/health | grep -E "Strict-Transport-Security|X-Frame-Options|Content-Security-Policy"
```

---

## 🔄 Secret Rotation Policy

### JWT Secrets
- **Rotation:** Every 90 days
- **Process:**
  1. Generate new secret
  2. Update `.env.production`
  3. Restart API container
  4. Users will need to re-login

### Redis Password
- **Rotation:** Every 30 days
- **Process:**
  1. Generate new password
  2. Update `.env.production`
  3. Restart Redis container
  4. Restart API container
  5. Sessions will be invalidated

### Database Password
- **Rotation:** Every 90 days
- **Process:**
  1. Create new PostgreSQL user with new password
  2. Grant permissions to new user
  3. Update `.env.production`
  4. Restart API container
  5. Remove old user after verification

---

## 📊 Monitoring

### Check Environment Variables Validation

The application validates all environment variables at startup using `class-validator`.

**Validation includes:**
- JWT secrets are 256-bit minimum (32+ characters)
- Redis password is 16+ characters in production
- All URLs use HTTPS in production
- Stripe keys match format (`sk_live_`, `whsec_`)
- AWS credentials meet minimum length requirements

**If validation fails:**
- Application will NOT start
- Error message will indicate which variable is invalid
- Error message will suggest how to fix it

---

## ⚠️ Common Issues

### Issue: API fails to start with "JWT_ACCESS_SECRET must be at least 32 characters"

**Solution:**
```bash
# Generate new secret
openssl rand -base64 64

# Update .env.production
JWT_ACCESS_SECRET=<paste generated secret>

# Restart container
docker compose -f docker-compose.prod.yml restart api
```

### Issue: PostgreSQL connection fails with "SSL connection required"

**Solution:**
Ensure `DATABASE_URL` includes `?sslmode=require` parameter:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Issue: Redis connection fails with "NOAUTH Authentication required"

**Solution:**
Ensure `REDIS_PASSWORD` is set in `.env.production` and Redis is started with password:
```bash
command: redis-server --requirepass ${REDIS_PASSWORD}
```

---

**Last updated:** November 2, 2025  
**Status:** Production Ready  
**Security Level:** PIPEDA Compliant

