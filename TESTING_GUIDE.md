# HTTP-only Cookies Testing Guide

## Prerequisites

Before testing, ensure you have:

1. ✅ Backend running on `http://localhost:3000`
2. ✅ Frontend running on `http://localhost:3001`
3. ✅ PostgreSQL running
4. ✅ Redis running (optional, but recommended)

## Step 1: Create Environment Files

### Backend (.env)

Create `/api/.env`:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://hummii_user:hummii_password@localhost:5432/hummii_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=test-access-secret-change-in-production
JWT_REFRESH_SECRET=test-refresh-secret-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000
```

### Frontend (.env.local)

Create `/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NODE_ENV=development
```

## Step 2: Start Services

### Terminal 1: Backend

```bash
cd api
npm run start:dev
```

Expected output:
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api/docs
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
```

## Step 3: Test Registration

1. Open browser: `http://localhost:3001/register`
2. Fill registration form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123!@#456` (12+ chars, uppercase, lowercase, number, special)
3. Submit form
4. Expected: Redirect to `/verify-email-sent`

## Step 4: Verify Email (Development)

Since we're in development, check backend logs for verification link:

```
[EmailService] Email verification link: http://localhost:3001/verify-email?token=...
```

Or manually verify in database:

```bash
# Connect to PostgreSQL
psql -U hummii_user -d hummii_db

# Verify user manually
UPDATE users SET "isVerified" = true WHERE email = 'test@example.com';
\q
```

## Step 5: Test Login with HTTP-only Cookies

### 5.1 Open DevTools

1. Open `http://localhost:3001/login`
2. Open Chrome DevTools (F12)
3. Go to **Network** tab
4. Check **Preserve log**

### 5.2 Login

1. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#456`
2. Click **Sign In**

### 5.3 Verify Cookies are Set

After successful login:

1. Go to **Application** tab in DevTools
2. Navigate to **Cookies** → `http://localhost:3001`
3. You should see **two cookies**:

| Name | Value | HttpOnly | Secure | SameSite | Path |
|------|-------|----------|--------|----------|------|
| `accessToken` | `eyJhbG...` | ✅ Yes | ❌ No (dev) | Strict | / |
| `refreshToken` | `eyJhbG...` | ✅ Yes | ❌ No (dev) | Strict | / |

**Important checks:**
- ✅ `HttpOnly` flag is **enabled** (JavaScript cannot access these cookies)
- ✅ `SameSite` is **Strict** (CSRF protection)
- ❌ `Secure` is **disabled** in development (will be enabled in production with HTTPS)

### 5.4 Verify Cookies are Sent with Requests

1. Go to **Network** tab
2. Make any authenticated request (e.g., navigate to protected page)
3. Click on any API request (e.g., `/api/v1/users/me`)
4. Check **Request Headers**
5. You should see:

```
Cookie: accessToken=eyJhbG...; refreshToken=eyJhbG...
```

## Step 6: Test Protected Route

1. Navigate to: `http://localhost:3001/examples/simple-protected`
2. Expected: Page loads successfully (cookies automatically sent)
3. Check Network tab → API request includes cookies

## Step 7: Test Logout

### 7.1 Logout

1. Click **Logout** button
2. Check **Network** tab

Expected request:
```
POST /api/v1/auth/logout
Cookie: accessToken=...; refreshToken=...
```

Expected response:
```
200 OK
Set-Cookie: accessToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict
Set-Cookie: refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict
```

### 7.2 Verify Cookies are Cleared

1. Go to **Application** tab → **Cookies**
2. Cookies should be **removed** or have empty values
3. Try accessing protected route
4. Expected: Redirect to login page

## Step 8: Test Token Expiration

### 8.1 Manual Token Expiration

For testing, temporarily change token expiration in backend:

```typescript
// api/src/config/env.validation.ts (or .env)
JWT_ACCESS_EXPIRATION=10s  // 10 seconds instead of 15m
```

### 8.2 Test Auto-Logout

1. Login again
2. Wait 10 seconds
3. Make any API request
4. Expected: 401 Unauthorized → auto-logout → redirect to login

## Step 9: Security Testing

### 9.1 Test XSS Protection

Open browser console and try:

```javascript
// Try to access tokens (should fail - HttpOnly protection)
document.cookie
// Output: Should NOT show accessToken or refreshToken

// Try to steal tokens (should fail)
console.log(document.cookie);
// Output: Empty or other non-HttpOnly cookies only
```

**Expected:** ✅ Tokens are NOT accessible via JavaScript

### 9.2 Test CSRF Protection

1. Open different domain (e.g., `http://localhost:8000`)
2. Try to make request to API from different origin:

```javascript
fetch('http://localhost:3000/api/v1/users/me', {
  credentials: 'include'
})
```

**Expected:** ❌ Request should be blocked by CORS

### 9.3 Test Cookie Scope

1. Login to `http://localhost:3001`
2. Try accessing cookies from different subdomain (if available)
3. **Expected:** Cookies should NOT be accessible from different domain

## Troubleshooting

### Issue: Cookies not being set

**Symptoms:** Login succeeds but no cookies in DevTools

**Solutions:**

1. **Check CORS configuration:**
   ```typescript
   // api/src/main.ts
   app.enableCors({
     origin: 'http://localhost:3001', // Must match frontend URL EXACTLY
     credentials: true, // MUST be true
   });
   ```

2. **Check FRONTEND_URL in .env:**
   ```bash
   # api/.env
   FRONTEND_URL=http://localhost:3001  # No trailing slash!
   ```

3. **Check frontend API client:**
   ```typescript
   // frontend/lib/api/client.ts
   credentials: 'include', // Line 171
   ```

4. **Restart both servers** after changing .env files

### Issue: 401 Unauthorized after login

**Symptoms:** Login successful but immediate 401 on next request

**Solutions:**

1. **Check JWT secrets are set:**
   ```bash
   # api/.env
   JWT_ACCESS_SECRET=your-secret-here
   JWT_REFRESH_SECRET=your-secret-here
   ```

2. **Check cookies are being sent:**
   - Open Network tab
   - Click on API request
   - Check Request Headers for `Cookie:` header

3. **Check cookie domain:**
   - Cookies must be set for correct domain
   - Verify in Application → Cookies

### Issue: CORS errors

**Symptoms:** 
```
Access to fetch at 'http://localhost:3000/api/v1/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Solutions:**

1. **Verify CORS origin matches:**
   ```typescript
   // api/src/main.ts - Line 30
   origin: process.env.FRONTEND_URL || 'http://localhost:3001',
   ```

2. **Check .env file:**
   ```bash
   # api/.env
   FRONTEND_URL=http://localhost:3001  # MUST match exactly
   ```

3. **Restart backend** after changing .env

### Issue: Cookies not sent with requests

**Symptoms:** Login works but protected routes fail

**Solutions:**

1. **Check `credentials: 'include'`:**
   ```typescript
   // frontend/lib/api/client.ts - Line 171
   credentials: 'include',
   ```

2. **Check same-origin:**
   - Frontend and backend must be on same top-level domain
   - `localhost:3001` → `localhost:3000` ✅ OK
   - `frontend.com` → `backend.com` ❌ WILL NOT WORK

3. **Production setup:**
   - Use same domain with different paths or subdomains
   - Example: `hummii.ca` (frontend) → `api.hummii.ca` (backend)

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Registration works
- [ ] Email verification works (or manually verified)
- [ ] Login successful
- [ ] Cookies visible in DevTools with `HttpOnly` flag
- [ ] Cookies automatically sent with API requests
- [ ] Protected routes accessible after login
- [ ] Logout clears cookies
- [ ] Cannot access tokens via JavaScript (XSS protection)
- [ ] CORS blocks requests from different origins (CSRF protection)
- [ ] Token expiration triggers logout

## Production Deployment Notes

When deploying to production:

1. **Enable HTTPS:**
   - Set `Secure` flag on cookies
   - Update cookie config in backend

2. **Update FRONTEND_URL:**
   ```bash
   # Production .env
   FRONTEND_URL=https://hummii.ca
   ```

3. **Update API_URL:**
   ```bash
   # Production frontend .env
   NEXT_PUBLIC_API_URL=https://api.hummii.ca/api/v1
   ```

4. **Generate strong secrets:**
   ```bash
   openssl rand -base64 64
   ```

5. **Enable Secure cookies:**
   ```typescript
   // api/src/config/cookie.config.ts
   secure: process.env.NODE_ENV === 'production', // Force HTTPS
   ```

---

**Last updated:** November 2, 2025
**Status:** Ready for testing

