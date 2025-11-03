# Google OAuth Security & PIPEDA Compliance

## Security Implementation Checklist

### ✅ Implemented Security Features

#### 1. HTTP-only Cookies
- [x] `accessToken` stored in HTTP-only cookie (not accessible via JavaScript)
- [x] `refreshToken` stored in HTTP-only cookie
- [x] XSS attack prevention (tokens cannot be stolen via script injection)
- [x] Configured in `CookieConfig` class

#### 2. Secure Cookie Attributes
- [x] `SameSite=strict` - CSRF protection
- [x] `Secure=true` in production (HTTPS only)
- [x] `maxAge` configured (15 min for access, 7 days for refresh)
- [x] Path restriction to API routes

#### 3. OAuth Email Verification
- [x] OAuth users marked as `isVerified=true` automatically
- [x] Bypass email verification step (Google already verified)
- [x] No verification token generated for OAuth users

#### 4. Empty Password for OAuth Users
- [x] OAuth users created with empty password field
- [x] Prevents password-based login for OAuth-only accounts
- [x] Clear separation between OAuth and password authentication

#### 5. Audit Logging
- [x] `OAUTH_REGISTER` event logged with metadata
- [x] `OAUTH_LOGIN` event logged for existing users
- [x] IP address and user agent tracked
- [x] Provider information stored (google, apple)

#### 6. Input Validation
- [x] Email validation in `validateOAuthUser`
- [x] Provider validation (only 'google' or 'apple')
- [x] Email normalization (toLowerCase)
- [x] UnauthorizedException thrown for invalid data

#### 7. Error Handling
- [x] Try-catch in callback endpoint
- [x] Graceful error redirect to frontend
- [x] No sensitive data exposed in error messages
- [x] Frontend displays user-friendly error

#### 8. Rate Limiting
- [x] OAuth endpoints protected by global rate limiter
- [x] Default: 100 requests per minute per IP
- [x] Prevents brute force attacks
- [x] Configured via `@nestjs/throttler`

#### 9. CORS Configuration
- [x] Whitelist only frontend URL (`FRONTEND_URL`)
- [x] `credentials: true` for cookie transmission
- [x] No wildcard (`*`) in production
- [x] Configured in `main.ts`

#### 10. Token Rotation
- [x] New refresh token issued on every refresh
- [x] Old refresh token invalidated
- [x] Prevents token replay attacks
- [x] Implemented in `auth.service.ts`

---

## PIPEDA Compliance for Google OAuth

### Data Collection

#### What Data We Receive from Google:
1. **Email address** (required)
2. **Full name** (first + last name)
3. **Profile photo URL** (optional)
4. **Google User ID** (provider ID)

#### What We Store:
```typescript
{
  email: string,           // User's email from Google
  name: string,            // Full name from Google
  avatar: string | null,   // Profile photo URL (optional)
  provider: 'google',      // OAuth provider identifier
  providerId: string,      // Google User ID (for linking)
  isVerified: true,        // Auto-verified via Google
  password: '',            // Empty for OAuth users
}
```

### PIPEDA Compliance Checklist

#### ✅ 1. Consent

**Requirement:** Users must consent before data collection

**Implementation:**
- [ ] **TODO:** Add consent checkbox on first OAuth login:
  ```typescript
  "By continuing with Google, you agree to our Privacy Policy and Terms of Service"
  ```
- [x] Google's OAuth consent screen shows what data is shared
- [ ] **TODO:** Privacy Policy updated to mention Google OAuth usage

**Privacy Policy Updates Needed:**
```markdown
### Third-Party Authentication

We offer Sign in with Google for your convenience. When you choose to use this feature:

- We receive your email address, name, and profile photo from Google
- We do not access your Google Drive, Calendar, Contacts, or other Google services
- We do not share your data back with Google
- Your email is automatically verified (no verification email needed)
- You can disconnect your Google account at any time

For more information, see Google's Privacy Policy: https://policies.google.com/privacy
```

#### ✅ 2. Data Minimization

**Requirement:** Collect only necessary data

**Implementation:**
- [x] OAuth scopes limited to `email` and `profile` only
- [x] No access to Google Drive, Calendar, Contacts
- [x] No excessive permissions requested
- [x] Avatar URL stored (not downloaded/cached) - minimal storage

**Code verification:**
```typescript
// api/src/auth/strategies/google.strategy.ts
scope: ['email', 'profile'],  // ONLY these two scopes
```

#### ✅ 3. Purpose Specification

**Requirement:** Clear purpose for data use

**Implementation:**
- [x] Email: User identification and authentication
- [x] Name: Profile display
- [x] Avatar: Profile photo (optional, for UX)
- [x] Provider ID: Account linking (prevent duplicates)

#### ✅ 4. Right to Access

**Requirement:** Users can export their data

**Implementation:**
- [x] Existing `/users/me/export` endpoint includes OAuth data
- [x] Returns JSON with all user information
- [x] Includes OAuth provider and linked accounts

#### ✅ 5. Right to Rectification

**Requirement:** Users can update their data

**Implementation:**
- [x] Users can update name and avatar via `/users/me` endpoint
- [x] Email changes require re-verification
- [ ] **TODO:** Allow users to disconnect Google OAuth
  ```typescript
  // Future endpoint:
  DELETE /auth/google/disconnect
  // Sets password = null, clears provider info
  ```

#### ✅ 6. Right to Erasure

**Requirement:** Users can delete their account

**Implementation:**
- [x] Existing `DELETE /users/me` endpoint
- [x] Deletes OAuth provider linkage
- [x] Anonymizes data in orders (PIPEDA allows)
- [x] Keeps transaction records for 7 years (tax law)

#### ✅ 7. Data Portability

**Requirement:** Machine-readable data export

**Implementation:**
- [x] `GET /users/me/export` returns JSON format
- [x] Includes OAuth provider information:
  ```json
  {
    "profile": {
      "email": "user@gmail.com",
      "name": "John Doe",
      "oauthProvider": "google"
    }
  }
  ```

#### ✅ 8. Security Safeguards

**Requirement:** Protect user data

**Implementation:**
- [x] HTTPS in production (TLS 1.3)
- [x] HTTP-only cookies (XSS protection)
- [x] Encrypted connection to database
- [x] Audit logs track access
- [x] Rate limiting prevents abuse

#### ⚠️ 9. Breach Notification

**Requirement:** Notify users within 72 hours of breach

**Implementation:**
- [ ] **TODO:** Incident response plan document
- [ ] **TODO:** Email template for breach notification
- [ ] **TODO:** Process for notifying Privacy Commissioner of Canada

**Recommended documentation:**
```
docs/security/incident-response-plan.md
docs/security/breach-notification-template.md
```

#### ✅ 10. Retention & Disposal

**Requirement:** Define data retention periods

**Implementation:**
```typescript
// Data Retention Policy (OAuth users):
- User account: Until user deletes account
- OAuth provider linkage: Until disconnected or account deleted
- Audit logs (OAuth events): 1 year
- Session data: 7 days (refresh token lifetime)
```

---

## OAuth-Specific Risks & Mitigations

### Risk 1: Account Takeover via Email Change

**Scenario:** User changes Google account email, causing mismatch

**Mitigation:**
- [x] We store email from Google at time of registration
- [x] User can update email in our system separately
- [ ] **TODO:** Periodic re-verification with Google (optional)

### Risk 2: Google OAuth Shutdown

**Scenario:** Google discontinues OAuth or changes terms

**Mitigation:**
- [x] Users can set password via "Forgot Password" flow
- [x] OAuth and password auth work independently
- [ ] **TODO:** Add "Set Password" feature for OAuth-only users

### Risk 3: Phishing Attacks

**Scenario:** Fake "Sign in with Google" button

**Mitigation:**
- [x] OAuth flow goes through Google's official domain
- [x] Users see Google's SSL certificate
- [x] We validate OAuth callback signature (Passport.js handles)
- [x] Domain verification in Google Cloud Console

### Risk 4: Session Hijacking

**Scenario:** Attacker steals user's cookies

**Mitigation:**
- [x] HTTP-only cookies (not accessible via JS)
- [x] SameSite=strict (CSRF protection)
- [x] Secure=true in production (HTTPS only)
- [x] Short access token lifetime (15 min)
- [x] Refresh token rotation

---

## Production Deployment Checklist

Before deploying Google OAuth to production:

### Backend Configuration
- [ ] `GOOGLE_CLIENT_ID` set to production value
- [ ] `GOOGLE_CLIENT_SECRET` set to production value
- [ ] `GOOGLE_CALLBACK_URL=https://api.hummii.ca/auth/google/callback`
- [ ] `FRONTEND_URL=https://hummii.ca`
- [ ] `NODE_ENV=production`
- [ ] All cookies have `Secure=true` in production

### Frontend Configuration
- [ ] `NEXT_PUBLIC_API_URL=https://api.hummii.ca`
- [ ] HTTPS enabled on frontend domain

### Google Cloud Console
- [ ] Production callback URL added: `https://api.hummii.ca/auth/google/callback`
- [ ] OAuth consent screen configured
- [ ] App verification submitted to Google (if required)
- [ ] Privacy Policy URL added to consent screen
- [ ] Terms of Service URL added to consent screen

### Legal & Compliance
- [ ] Privacy Policy updated with Google OAuth disclosure
- [ ] Terms of Service mention third-party authentication
- [ ] Cookie Policy mentions OAuth cookies
- [ ] PIPEDA compliance reviewed by legal team

### Monitoring & Logging
- [ ] OAuth events logged to monitoring system (Sentry)
- [ ] Audit logs enabled for OAUTH_REGISTER and OAUTH_LOGIN
- [ ] Error tracking configured
- [ ] Rate limiting alerts set up
- [ ] Failed OAuth attempts tracked

### Testing
- [ ] Test OAuth flow on staging environment
- [ ] Test error handling (denied consent, network failure)
- [ ] Test existing user OAuth login (same email)
- [ ] Test account deletion with OAuth user
- [ ] Test session timeout and refresh
- [ ] Load test OAuth endpoints

---

## Maintenance & Monitoring

### Monthly Tasks
- [ ] Review Google OAuth usage analytics
- [ ] Check for failed OAuth attempts (high failure rate = issue)
- [ ] Verify SSL certificate expiration (auto-renewed by Let's Encrypt)
- [ ] Review audit logs for suspicious activity

### Quarterly Tasks
- [ ] Review Google Cloud Console security settings
- [ ] Update Privacy Policy if data usage changes
- [ ] Security audit of OAuth implementation
- [ ] Review and rotate GOOGLE_CLIENT_SECRET (optional)

### Yearly Tasks
- [ ] Complete PIPEDA compliance audit
- [ ] Update OAuth consent screen branding
- [ ] Review Google's OAuth policy changes
- [ ] Security penetration test

---

## Support & Troubleshooting

### User Issues

**"I can't log in with Google"**
1. Check if Google account email matches existing Hummii account
2. Verify user granted all permissions on Google consent screen
3. Check if user's Google account is verified
4. Test OAuth flow yourself with user's email domain

**"I want to disconnect my Google account"**
1. Currently: User must contact support
2. **TODO:** Implement self-service disconnect feature
3. Process: Clear `provider` and `providerId` fields
4. Suggest setting a password for continued access

**"My Google profile photo doesn't update"**
1. Avatar URL cached from first login
2. Manual refresh: User updates avatar in Hummii settings
3. **TODO:** Implement periodic sync with Google (optional)

---

**Last updated:** November 3, 2025
**Compliance:** PIPEDA (Canada)
**Review frequency:** Quarterly

