# Environment Configuration Setup

## Backend (.env file)

Create `/api/.env` file with the following content:

```env
# Environment
NODE_ENV=development

# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://hummii_user:hummii_password@localhost:5432/hummii_db?schema=public"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
# Generate secrets with: openssl rand -base64 64
JWT_ACCESS_SECRET=your-access-secret-here-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-here-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration - IMPORTANT for HTTP-only cookies!
# Development
FRONTEND_URL=http://localhost:3001
# Production: FRONTEND_URL=https://hummii.ca

# API URL
API_URL=http://localhost:3000

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hummii.ca

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ca-central-1
AWS_S3_BUCKET=hummii-uploads

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## Frontend (.env.local file)

Create `/frontend/.env.local` file with the following content:

```env
# API Configuration - IMPORTANT for HTTP-only cookies!
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
# Production: NEXT_PUBLIC_API_URL=https://api.hummii.ca/api/v1

# WebSocket URL (for real-time features)
# Development
NEXT_PUBLIC_WS_URL=ws://localhost:3000
# Production: NEXT_PUBLIC_WS_URL=wss://api.hummii.ca

# Stripe Public Key (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Environment
NODE_ENV=development
```

## Quick Setup Commands

```bash
# Backend
cd api
cp .env.example .env  # (use the content above)
# Edit .env with your actual values

# Frontend
cd ../frontend
cp .env.local.example .env.local  # (use the content above)
# Edit .env.local with your actual values
```

## Important Notes

### CORS Configuration
- **FRONTEND_URL** in backend `.env` MUST match the URL where frontend runs
- This is CRITICAL for HTTP-only cookies to work correctly
- Development: `http://localhost:3001`
- Production: `https://hummii.ca`

### API URL Configuration
- **NEXT_PUBLIC_API_URL** in frontend `.env.local` MUST match backend URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.hummii.ca/api/v1`

### Security
- NEVER commit `.env` or `.env.local` files to Git
- Generate strong secrets for JWT tokens (use `openssl rand -base64 64`)
- Use different secrets for development and production
- Store production secrets securely (e.g., AWS Secrets Manager, Vault)

## Testing HTTP-only Cookies

After setup, verify CORS and cookies work:

```bash
# 1. Start backend
cd api
npm run start:dev

# 2. Start frontend (in another terminal)
cd frontend
npm run dev

# 3. Test login flow
# Open http://localhost:3001/login
# Login with test credentials
# Check browser DevTools -> Application -> Cookies
# You should see: accessToken and refreshToken cookies
# with HttpOnly flag enabled
```

## Troubleshooting

### Cookies not being set?
- Check `FRONTEND_URL` in backend `.env` matches frontend URL exactly
- Verify `credentials: true` in CORS config (`api/src/main.ts`)
- Ensure `credentials: 'include'` in API client (`frontend/lib/api/client.ts`)

### 401 Unauthorized errors?
- Verify JWT secrets are set in backend `.env`
- Check cookies are being sent with requests (DevTools -> Network -> Request Headers)
- Ensure cookies haven't expired

