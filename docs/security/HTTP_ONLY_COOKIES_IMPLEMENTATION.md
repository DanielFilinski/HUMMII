# HTTP-Only Cookies Implementation

## Overview

Implemented HTTP-only cookies for JWT token storage to prevent XSS attacks and improve security compliance with PIPEDA requirements for the Canadian market.

## What Changed

### Files Created
- `/api/src/config/cookie.config.ts` - Cookie configuration with security settings

### Files Modified
- `/api/src/main.ts` - Added cookie-parser middleware
- `/api/src/auth/strategies/jwt.strategy.ts` - Updated to read tokens from cookies with Authorization header fallback
- `/api/src/auth/auth.controller.ts` - Updated all auth endpoints to use HTTP-only cookies

### Dependencies Added
- `cookie-parser` - Parse Cookie header and populate req.cookies
- `@types/cookie-parser` - TypeScript definitions

## Security Features

### Cookie Configuration
- **httpOnly: true** - Prevents JavaScript access (XSS protection)
- **secure: true** - HTTPS only in production
- **sameSite: 'strict'** - CSRF protection
- **Access token expiry**: 15 minutes
- **Refresh token expiry**: 7 days

## API Changes

### Login Endpoint
**Before:**
```json
POST /api/auth/login
Response: {
  "user": {...},
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**After:**
```json
POST /api/auth/login
Response: {
  "user": {...}
}
Set-Cookie: accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict
```

### Refresh Endpoint
- Reads refresh token from cookie (or body for backward compatibility)
- Implements token rotation - issues new refresh token on each refresh

### Logout Endpoints
- Clears both access and refresh token cookies
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions

### Google OAuth Callback
- Also sets tokens in HTTP-only cookies after successful authentication

## Backward Compatibility

API clients (Postman, mobile apps) can still use Authorization header:
```
Authorization: Bearer <token>
```

The system will first check for tokens in cookies, then fall back to Authorization header.

## Testing

### Manual Testing with curl
```bash
# Login (tokens in cookies)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Use protected endpoint with cookies
curl http://localhost:3000/api/users/me \
  -b cookies.txt

# Logout (clear cookies)
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Frontend Integration Notes

Frontend applications should:
1. **NOT store tokens in localStorage/sessionStorage**
2. Enable credentials in API calls:
```typescript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```
3. Remove any manual token storage/management code

## Security Checklist

- [x] HTTP-only cookies prevent XSS attacks
- [x] Secure flag ensures HTTPS-only transmission in production
- [x] SameSite=Strict prevents CSRF attacks
- [x] Short access token lifetime (15min) limits exposure
- [x] Token rotation on refresh for enhanced security
- [x] Proper cookie clearing on logout
- [x] Backward compatibility for API clients

## Next Steps

1. Update frontend applications to use cookies
2. Test authentication flow in development
3. Verify HTTPS configuration in production
4. Update API documentation
5. Test logout functionality
6. Verify cross-origin requests work with CORS settings

## Related Security Improvements

This implementation is part of a larger security initiative. Next priorities:
1. CORS whitelist configuration
2. Enhanced Helmet.js CSP settings
3. Global rate limiting with ThrottlerGuard
4. PostgreSQL SSL connections
5. PII masking in logs

