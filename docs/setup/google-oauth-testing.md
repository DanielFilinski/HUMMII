# Google OAuth Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Google Cloud Console** configured with OAuth 2.0 credentials
2. **Backend** `.env` file with:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   FRONTEND_URL=http://localhost:3001
   ```
3. **Frontend** `.env.local` file with:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

## Testing Steps

### Step 1: Start Backend

```bash
cd api
npm run start:dev
```

**Expected output:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Listening on port 3000
```

**Verify GoogleStrategy loaded:**
- Check logs for "GoogleStrategy initialized" or similar
- No errors about GOOGLE_CLIENT_ID

### Step 2: Test Backend OAuth Endpoint

Open browser and navigate to:
```
http://localhost:3000/auth/google
```

**Expected behavior:**
- Redirects to Google login page
- Shows "Sign in with Google" screen
- Displays your app name: "Hummii Platform"

**If you see error:**
- `redirect_uri_mismatch` → Check redirect URI in Google Cloud Console
- `invalid_client` → Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- `access_denied` → OAuth consent screen not configured

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
- Local:        http://localhost:3001
- ready started server on 0.0.0.0:3001
```

### Step 4: Test Full OAuth Flow

1. **Navigate to login page:**
   ```
   http://localhost:3001/login
   ```

2. **Verify UI:**
   - See email/password form
   - See "OR" divider
   - See "Continue with Google" button with Google icon

3. **Click "Continue with Google":**
   - Redirects to `http://localhost:3000/auth/google`
   - Then redirects to Google login page

4. **Complete Google authentication:**
   - Select your Google account
   - Grant permissions (email, profile)
   - Click "Allow"

5. **Verify redirect back:**
   - Redirects to `http://localhost:3001/auth/callback?success=true`
   - Shows loading spinner with "Processing authentication..."
   - Then redirects to home page (`/`)

6. **Verify user logged in:**
   - Open browser DevTools → Application → Cookies
   - Check for `accessToken` cookie (HTTP-only, Secure in prod)
   - Check for `refreshToken` cookie (HTTP-only, Secure in prod)
   - User name/avatar displayed in UI

### Step 5: Verify Database

Check PostgreSQL database:

```sql
-- Find the newly created OAuth user
SELECT id, email, name, avatar, "isVerified", "createdAt"
FROM "User"
WHERE email = 'your-google-email@gmail.com';

-- Should show:
-- isVerified = true (OAuth emails are pre-verified)
-- password = '' (empty for OAuth users)
-- name and avatar from Google
```

### Step 6: Check Audit Logs

```sql
-- Find OAuth registration event
SELECT action, entity, metadata, "createdAt"
FROM "AuditLog"
WHERE action = 'OAUTH_REGISTER'
ORDER BY "createdAt" DESC
LIMIT 5;

-- Should show metadata with:
-- provider: 'google'
-- email: user's email
-- name: user's name
```

### Step 7: Test Existing User OAuth Login

1. **Create user via regular registration** with same email as your Google account
2. **Try logging in with Google OAuth** using that email
3. **Expected behavior:**
   - OAuth login succeeds
   - Links to existing user account (no duplicate created)
   - Audit log shows `OAUTH_LOGIN` instead of `OAUTH_REGISTER`

### Step 8: Test Error Handling

#### Test 1: User denies OAuth consent

1. Click "Continue with Google"
2. On Google consent screen, click "Cancel" or "Deny"
3. **Expected:** Redirects to `http://localhost:3001/login?error=oauth_failed`
4. **Expected:** Error message displayed on login page

#### Test 2: Network error during OAuth

1. Turn off internet connection
2. Click "Continue with Google"
3. **Expected:** Browser shows connection error
4. Turn internet back on and retry

#### Test 3: Invalid callback URL

1. Temporarily change `GOOGLE_CALLBACK_URL` in backend `.env` to invalid URL
2. Restart backend
3. Try OAuth login
4. **Expected:** Google shows `redirect_uri_mismatch` error

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch"

**Cause:** Redirect URI in code doesn't match Google Cloud Console

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Add exact URI: `http://localhost:3000/auth/google/callback`
4. Include protocol (http) and port (3000)
5. No trailing slash

### Issue: "invalid_client"

**Cause:** Wrong GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET

**Solution:**
1. Re-check values in Google Cloud Console
2. Copy again carefully (no extra spaces)
3. Update `.env` file
4. Restart backend (`npm run start:dev`)

### Issue: Google login works but redirect fails

**Cause:** FRONTEND_URL not set or wrong

**Solution:**
1. Check `FRONTEND_URL=http://localhost:3001` in backend `.env`
2. Restart backend
3. Clear browser cookies
4. Try again

### Issue: Cookies not set

**Cause:** CORS configuration

**Solution:**
1. Check `CORS_ORIGIN=http://localhost:3001` in backend `.env`
2. Verify `credentials: true` in CORS config
3. Check browser console for CORS errors

### Issue: "/users/me" API call fails after OAuth

**Cause:** JWT token not recognized

**Solution:**
1. Check `accessToken` cookie exists in browser
2. Verify JWT_ACCESS_SECRET in backend `.env`
3. Check backend logs for JWT errors

## Manual API Testing (Optional)

### Test Google OAuth callback directly:

```bash
# This won't work directly (needs Google auth), but useful for debugging
curl -X GET "http://localhost:3000/auth/google/callback" -L -v
```

### Test /users/me with valid token:

```bash
# Get accessToken from browser cookies first
curl -X GET "http://localhost:3000/api/v1/users/me" \
  -H "Cookie: accessToken=your-token-here" \
  -v
```

## Performance Checks

### OAuth flow should complete in:
- Google redirect: < 500ms
- Google authentication: User-dependent (2-5 seconds)
- Callback processing: < 200ms
- Database user creation: < 100ms
- Frontend redirect: < 100ms

**Total:** < 3-6 seconds for first-time user

### Monitoring

Check backend logs for:
```
[OAuth] User registered via Google: user@example.com
[OAuth] Login successful: user@example.com
[Audit] OAUTH_REGISTER event logged
```

## Security Verification

After successful OAuth login, verify:

- [ ] `accessToken` cookie is HTTP-only
- [ ] `refreshToken` cookie is HTTP-only
- [ ] Cookies have `SameSite=strict` attribute
- [ ] Cookies have `Secure=true` in production
- [ ] User password field is empty in database (OAuth users)
- [ ] Audit log contains OAuth event with IP and user agent
- [ ] No sensitive data in browser localStorage
- [ ] No tokens exposed in URL query parameters

## Next Steps

After testing passes:

1. Deploy to staging environment
2. Update Google Cloud Console with production URLs:
   - `https://api.hummii.ca/auth/google/callback`
3. Test on staging
4. Update Privacy Policy to mention Google OAuth
5. Deploy to production

---

**Last updated:** November 3, 2025
**Status:** Ready for testing

