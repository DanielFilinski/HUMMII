# Security Implementation Checklist - Hummii Backend

**Critical for Canada (PIPEDA Compliance)**  
**Last Updated:** January 2025

---

## 🔒 Authentication & Authorization

### JWT Tokens
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens expire in 7 days
- [ ] Tokens stored in HTTP-only cookies (secure flag)
- [ ] SameSite=Strict for CSRF protection
- [ ] Token rotation on refresh
- [ ] Token revocation on logout
- [ ] Refresh tokens stored in database for revocation
- [ ] Strong JWT secrets (256-bit minimum, stored in env)

### Password Security
- [ ] Bcrypt hashing with cost factor 12+ (or Argon2)
- [ ] Password complexity requirements enforced:
  - Minimum 12 characters
  - Uppercase + lowercase + number + special character
- [ ] Password never logged or returned in API responses
- [ ] Password reset flow with secure token (time-limited)
- [ ] Failed login attempt tracking (max 5, then lockout)
- [ ] Account lockout after N failed attempts (15 minutes)

### Email Verification
- [ ] Mandatory email verification before profile activation
- [ ] Verification token expires in 24 hours
- [ ] Secure token generation (crypto.randomBytes)
- [ ] One-time use tokens
- [ ] Email send rate limiting

### OAuth2.0 (Google, Apple)
- [ ] PKCE flow for mobile apps
- [ ] State parameter validation
- [ ] User ID mapping to prevent account takeover
- [ ] Email verification still required

### Session Management
- [ ] Sessions stored in Redis
- [ ] Session expiration (inactivity timeout: 30 min)
- [ ] Logout on all devices option
- [ ] Device fingerprinting and tracking
- [ ] Location tracking (IP-based, for security alerts)

---

## 🛡️ API Security

### Rate Limiting
- [ ] **Global:** 100 requests/min per IP
- [ ] **Auth endpoints:** 5 requests/min (login, register, password reset)
- [ ] **Chat/messaging:** 20 messages/min per user
- [ ] **Order creation:** 10 requests/hour per user
- [ ] **Profile updates:** 5 requests/hour per user
- [ ] **File uploads:** 10 uploads/hour per user
- [ ] User-based rate limiting (not just IP)
- [ ] Rate limit headers returned to client

### CORS Configuration
- [ ] Whitelist only production domains (no wildcard)
- [ ] Credentials: true for cookie-based auth
- [ ] Preflight request handling
- [ ] Origin validation

### Security Headers (Helmet.js)
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS): 1 year
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured

### CSRF Protection
- [ ] CSRF tokens for state-changing operations
- [ ] SameSite=Strict cookies
- [ ] Origin/Referer header verification
- [ ] Use POST/PUT/DELETE for mutations (never GET)

### Request Validation
- [ ] DTO validation on all endpoints (class-validator)
- [ ] whitelist: true (strip unknown properties)
- [ ] forbidNonWhitelisted: true (throw on unknown properties)
- [ ] transform: true (automatic type conversion)
- [ ] Request size limits (10MB max)
- [ ] File size limits (5MB per image)

---

## 🔐 Data Protection

### Encryption at Rest
- [ ] PostgreSQL TDE (Transparent Data Encryption)
- [ ] Field-level encryption for sensitive data (AES-256):
  - [ ] SIN numbers
  - [ ] Credit card info (last 4 digits only)
  - [ ] Passport numbers
- [ ] Database backups encrypted

### Encryption in Transit
- [ ] TLS 1.3 only (HTTPS everywhere)
- [ ] No HTTP redirects (force HTTPS)
- [ ] Certificate pinning (optional, for mobile apps)
- [ ] Database connection over SSL
- [ ] WebSocket connection over WSS

### Environment Variables
- [ ] All secrets in `.env` file (never in code)
- [ ] `.env` file in `.gitignore`
- [ ] No secrets in git history
- [ ] Production secrets different from development
- [ ] Secrets stored in secure vault (AWS Secrets Manager, Vault)
- [ ] Environment variable validation on startup

### PII Masking in Logs
- [ ] Never log: passwords, tokens, credit cards, SIN
- [ ] Mask emails: `u***@example.com`
- [ ] Mask phone numbers: `***-***-1234`
- [ ] Use correlation IDs instead of user IDs
- [ ] Structured logging (Winston/Pino)
- [ ] Log rotation configured (90 days retention minimum)

---

## 📝 Input Validation & Sanitization

### Backend Validation
- [ ] class-validator + class-transformer for all DTOs
- [ ] Custom validators for business logic:
  - [ ] Canadian postal codes
  - [ ] Canadian phone numbers (+1 format)
  - [ ] Email format
  - [ ] SIN validation (Luhn algorithm)
- [ ] SQL injection prevention (ORM parameterized queries only)
- [ ] No direct database queries (always use ORM)

### XSS Prevention
- [ ] Sanitize all HTML input (DOMPurify)
- [ ] Block script tags in content
- [ ] Escape special characters in output
- [ ] Content Security Policy headers

### File Upload Security
- [ ] MIME type validation (whitelist only):
  - [ ] Images: `image/jpeg`, `image/png`, `image/webp`
  - [ ] Documents: `application/pdf` (for verification)
- [ ] File size limits: 5MB per image, 20MB total
- [ ] File signature validation (magic numbers)
- [ ] EXIF metadata stripping (remove location, camera info)
- [ ] Image processing with Sharp (resize, optimize)
- [ ] Virus scanning (ClamAV or cloud service)
- [ ] File hash verification
- [ ] Private S3 storage (not public)
- [ ] Signed URLs with expiration (1 hour)
- [ ] No executable files (.exe, .sh, .bat)

### Phone/Email Validation
- [ ] Canadian phone format: `+1XXXXXXXXXX`
- [ ] Email format validation
- [ ] Disposable email detection
- [ ] Phone verification via SMS (Twilio Verify)

---

## 💬 Chat Content Moderation

### Automatic Moderation
- [ ] Block phone numbers (regex patterns) → replace with `***`
- [ ] Block email addresses (regex) → replace with `***`
- [ ] Block external links (except platform URLs) → `[link removed]`
- [ ] Block social media handles (@instagram, @telegram, etc.)
- [ ] Profanity filter (Canadian English + French)
- [ ] Spam detection (repeated identical messages 3+ times)

### Moderation Implementation
- [ ] Configurable regex patterns
- [ ] Return moderation flags (phone, email, link, social, profanity)
- [ ] Log moderation events for analytics
- [ ] Report/flag system for abusive messages
- [ ] Auto-suspend after threshold (3 reports)
- [ ] Admin review queue

### Message Security
- [ ] Rate limiting: 20 messages/min per user
- [ ] Message length limits (2000 characters max)
- [ ] Message history stored permanently (audit trail)
- [ ] Chat auto-close 30 days after order completion
- [ ] Encrypt messages in transit (WSS)
- [ ] End-to-end encryption (optional, consider libsodium)

---

## 💳 Payment Security (Stripe)

### PCI DSS Compliance
- [ ] NEVER store card data (use Stripe Elements)
- [ ] Stripe webhook signature verification MANDATORY
- [ ] Idempotency keys for all payment operations
- [ ] Transaction amount validation (server-side)
- [ ] 3D Secure (SCA) enabled for card payments
- [ ] Refund fraud detection

### Stripe Integration
- [ ] Use Stripe Elements on frontend (card data never touches servers)
- [ ] Webhook signature verification on every event
- [ ] Store idempotency keys in database
- [ ] Handle all webhook events idempotently
- [ ] Error handling for declined cards
- [ ] Transaction logging (masked card data)

---

## 🗄️ Database Security

### Connection Security
- [ ] SSL/TLS required for database connection
- [ ] Connection pooling configured (Prisma)
- [ ] Database user has minimal permissions (principle of least privilege)
- [ ] Separate read/write database users (if applicable)
- [ ] Connection string in environment variables

### Row-Level Security (RLS)
- [ ] Enable RLS on sensitive tables:
  - [ ] users
  - [ ] contractors
  - [ ] orders
- [ ] Users can only see their own data
- [ ] Contractors can only see their own orders
- [ ] Clients can only see their own orders
- [ ] Admins can see everything

### Backups
- [ ] Automated daily backups
- [ ] Encrypted backups (.gpg)
- [ ] Upload to S3 (encrypted)
- [ ] Backup retention: 30 days minimum
- [ ] Backup restoration tested monthly
- [ ] Database activity monitoring

---

## 🚫 Anti-Fraud & Bot Prevention

### CAPTCHA
- [ ] On registration (hCaptcha or reCAPTCHA v3)
- [ ] On sensitive actions (password reset, multiple order creation)
- [ ] Implementation before sensitive operations

### Bot Detection
- [ ] Honeypot fields in forms
- [ ] Behavioral analysis (detect automated patterns)
- [ ] IP reputation checking (IPQS, AbuseIPDB)
- [ ] Device fingerprinting (FingerprintJS)
- [ ] Rate limiting by behavior patterns

### Fraud Prevention
- [ ] Email validation (disposable email detection)
- [ ] Phone verification via SMS (Twilio Verify)
- [ ] Account age verification
- [ ] Payment method validation
- [ ] Refund fraud detection
- [ ] Suspicious activity monitoring

---

## 📊 Audit Logging

### What to Log
- [ ] All data access and modifications
- [ ] Authentication attempts (success and failures)
- [ ] Admin actions (moderation, user management, disputes)
- [ ] Payment transactions
- [ ] Profile changes
- [ ] File uploads
- [ ] Account creation/deletion
- [ ] Login/logout events
- [ ] Password changes
- [ ] Email verification

### What NOT to Log
- [ ] Passwords (never)
- [ ] Tokens (never)
- [ ] Credit cards (never)
- [ ] SIN numbers (never)
- [ ] Full email addresses (mask if needed)
- [ ] Sensitive PII in full

### Log Configuration
- [ ] Structured logging (JSON format)
- [ ] Log levels: error, warn, info, debug
- [ ] Correlation IDs for request tracking
- [ ] Log rotation (daily, 90 days retention)
- [ ] Centralized log aggregation (optional)

---

## 🧪 Security Testing

### Before Production
- [ ] Penetration testing
- [ ] Dependency vulnerability scanning (npm audit, Snyk)
- [ ] Secret scanning (TruffleHog, GitLeaks)
- [ ] Container scanning (Trivy)
- [ ] Code analysis (CodeQL, SonarQube)
- [ ] OWASP ZAP security scans

### Testing Checklist
- [ ] SQL injection tests
- [ ] XSS tests
- [ ] CSRF tests
- [ ] Authentication bypass tests
- [ ] Rate limiting tests
- [ ] File upload security tests
- [ ] Token validation tests

---

## 🇨🇦 PIPEDA Compliance (Canada)

### Data Minimization
- [ ] Collect only necessary data
- [ ] Document purpose for each data field
- [ ] Mark optional fields explicitly
- [ ] Explain why data is needed (tooltips, help text)

### User Rights
- [ ] **Right to Access** - export all data (GET /users/me/export)
- [ ] **Right to Rectification** - edit profile (PATCH /users/me)
- [ ] **Right to Erasure** - full account deletion (DELETE /users/me)
- [ ] **Right to Data Portability** - download data (GET /users/me/data-portability)
- [ ] **Right to Object** - opt-out of marketing emails
- [ ] **Right to Withdraw Consent** - clear consent management

### Transparency
- [ ] Privacy Policy (English + French)
- [ ] Terms of Service (English + French)
- [ ] Cookie consent banner (non-essential cookies only)
- [ ] Data breach notification (within 72 hours)
- [ ] List of third-party data processors
- [ ] Contact email for privacy concerns (privacy@hummii.ca)

### Data Retention
- [ ] **Active accounts:** indefinite
- [ ] **Inactive accounts (2+ years):** notify → delete
- [ ] **Chat messages:** until account deletion (read-only after 30 days)
- [ ] **Payment records:** 7 years (Canadian tax law)
- [ ] **Audit logs:** 90 days minimum
- [ ] **Marketing data:** until consent withdrawal
- [ ] Automated cleanup scripts (cron jobs)

### Data Sharing
- [ ] No selling user data to third parties
- [ ] Minimal data sharing (Stripe, Google Maps, OneSignal only)
- [ ] Data Processing Agreements (DPA) with all vendors
- [ ] User consent before sharing
- [ ] Anonymize data for analytics (no PII in Google Analytics)

### Incident Response
- [ ] Incident response plan documented
- [ ] Data breach protocol:
  - [ ] Contain breach immediately
  - [ ] Assess impact
  - [ ] Notify affected users (within 72h)
  - [ ] Notify Privacy Commissioner if serious
  - [ ] Implement fixes
- [ ] Regular security audits (quarterly)
- [ ] Annual penetration testing

---

## 🚀 Production Deployment Security

### SSL/TLS
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Certificate auto-renewal configured
- [ ] HTTPS redirect from HTTP
- [ ] TLS 1.3 enabled
- [ ] HSTS header configured (1 year)
- [ ] SSL Labs rating A+ verified

### Firewall
- [ ] Security groups/firewall rules configured
- [ ] Only necessary ports open (22, 80, 443)
- [ ] Block direct access to services (3000, 5432, 6379)
- [ ] SSH key authentication only (no password)
- [ ] IP whitelist for admin access (optional)

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring (New Relic/DataDog)
- [ ] Uptime monitoring configured
- [ ] Alert thresholds configured
- [ ] Log monitoring active
- [ ] Security incident alerts

### Infrastructure
- [ ] VPC isolation (private subnets for databases)
- [ ] Running as non-root user
- [ ] Resource limits configured
- [ ] Container security scanning passed
- [ ] Secrets management (AWS Secrets Manager/Vault)
- [ ] Immutable infrastructure (Infrastructure as Code)

---

## ✅ Pre-Launch Security Audit

### Critical (Must Pass)
- [ ] All secrets secured
- [ ] Rate limiting active on all endpoints
- [ ] CORS configured for production domains
- [ ] Helmet.js security headers
- [ ] Input validation on all endpoints
- [ ] Password hashing (bcrypt cost 12+)
- [ ] Email verification mandatory
- [ ] File upload validation active
- [ ] Content moderation active
- [ ] SSL/TLS configured and working

### Important
- [ ] CAPTCHA on registration
- [ ] Privacy Policy + Terms of Service published
- [ ] Cookie consent banner implemented
- [ ] GDPR data export/deletion endpoints tested
- [ ] Error tracking configured
- [ ] Logging configured with PII masking
- [ ] Database backups automated and tested
- [ ] Stripe webhooks signature verification
- [ ] Admin panel protected with strong auth
- [ ] Security incident response plan documented

### Optional (Post-Launch)
- [ ] 2FA/MFA
- [ ] End-to-end encryption
- [ ] Penetration testing (annual)
- [ ] Bug bounty program
- [ ] Advanced fraud detection

---

## 📞 Emergency Contacts

- **Project Lead:** admin@hummii.ca
- **Security Issues:** security@hummii.ca
- **Privacy Issues:** privacy@hummii.ca
- **Privacy Commissioner of Canada:** https://www.priv.gc.ca/en/report-a-concern/

---

**Last Updated:** January 2025  
**Review Frequency:** Quarterly or after any security incident  
**Next Review:** April 2025

