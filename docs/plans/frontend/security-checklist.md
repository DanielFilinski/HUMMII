# Frontend Security Checklist - Hummii Platform

**Critical for Canada (PIPEDA Compliance - Client-Side)**
**Last Updated:** January 2025

---

## 🔒 Authentication & Session Management

### Token Storage
- [ ] **NEVER** store tokens in localStorage
- [ ] **NEVER** store tokens in sessionStorage
- [ ] **NEVER** store tokens in cookies (client-side)
- [ ] Tokens must be in HTTP-only cookies (set by backend)
- [ ] No access to tokens from JavaScript

### Session Security
- [ ] Auto-logout on token expiration
- [ ] Session timeout warning modal (5 min before expiration)
- [ ] Clear sensitive data on logout
- [ ] Secure logout (call API to invalidate session)
- [ ] Multi-tab logout synchronization (BroadcastChannel API)

### Authentication UI
- [ ] Password visibility toggle
- [ ] Password strength indicator
- [ ] CAPTCHA on registration and login
- [ ] Rate limiting feedback (display error messages)
- [ ] Account lockout feedback (show remaining time)
- [ ] Email verification mandatory (block access until verified)

---

## 🛡️ Input Validation & Sanitization

### Client-Side Validation
- [ ] **Zod schemas** for all forms
- [ ] Validate on blur (not on every keystroke for UX)
- [ ] Display clear error messages
- [ ] Prevent form submission if validation fails
- [ ] Never trust client-side validation alone (server-side validation required)

### XSS Prevention
- [ ] Sanitize user input before rendering (DOMPurify)
- [ ] Never use `dangerouslySetInnerHTML` without sanitization
- [ ] Use React's built-in XSS protection (JSX escaping)
- [ ] Avoid `eval()`, `Function()`, `setTimeout(string)`, `setInterval(string)`
- [ ] Content Security Policy (CSP) headers

### Canadian-Specific Validation
- [ ] Canadian phone number: `+1XXXXXXXXXX`
- [ ] Canadian postal code: `A1A 1A1`
- [ ] Bilingual support (EN/FR)

---

## 🔐 Data Protection

### Sensitive Data
- [ ] **NEVER** log sensitive data to console
  - Passwords
  - Tokens
  - Credit card numbers
  - Social Insurance Numbers (SIN)
  - Full email addresses (mask in logs)
  - Phone numbers (mask in logs)
- [ ] Clear sensitive form fields on unmount
- [ ] Mask credit card numbers (show last 4 digits only)
- [ ] Disable autocomplete for sensitive fields

### Privacy Controls
- [ ] Privacy Policy link (footer, registration)
- [ ] Terms of Service link (footer, registration)
- [ ] Cookie consent banner (non-essential cookies only)
- [ ] Clear consent checkboxes (pre-checked not allowed)
- [ ] Data export functionality (PIPEDA right to access)
- [ ] Account deletion with confirmation (PIPEDA right to erasure)

### Data Minimization
- [ ] Request only necessary data
- [ ] Mark optional fields explicitly
- [ ] Explain why data is needed (tooltips, help text)
- [ ] Allow anonymous browsing (before login)

---

## 📤 File Upload Security

### Client-Side Validation
- [ ] File type validation (whitelist only):
  - Images: `image/jpeg`, `image/png`, `image/webp`
  - Documents: `application/pdf` (for verification only)
- [ ] File size limits: **5MB per image**
- [ ] Maximum number of files (e.g., 5 images per order)
- [ ] Display file validation errors clearly

### Upload Security
- [ ] Use `multipart/form-data` for file uploads
- [ ] Show upload progress (visual feedback)
- [ ] Handle upload errors gracefully
- [ ] Cancel upload functionality
- [ ] Preview images before upload (without executing scripts)
- [ ] Never execute files on client-side

---

## 🌐 External Links & Resources

### Link Security
- [ ] `rel="noopener noreferrer"` on all external links
- [ ] Display warning for external links
- [ ] Validate URLs before navigation
- [ ] Block `javascript:` protocol in URLs
- [ ] Block `data:` protocol in URLs (except for images)

### API Key Protection
- [ ] **NEVER** expose API keys in client code
- [ ] Use server-side proxy for Google Maps API
- [ ] Use server-side proxy for OneSignal API
- [ ] Only use `NEXT_PUBLIC_` prefix for non-sensitive config
- [ ] Stripe publishable key is safe (but secret key NEVER)

---

## 🔗 CSRF Protection

### Token Handling
- [ ] CSRF tokens for state-changing operations
- [ ] Include CSRF token in request headers (X-CSRF-Token)
- [ ] Validate CSRF token on backend
- [ ] SameSite=Strict cookies

### Form Security
- [ ] Use POST/PUT/DELETE for mutations (never GET)
- [ ] Include CSRF token in forms
- [ ] Validate form origin (referer header check on backend)

---

## 🚫 Content Security Policy (CSP)

### CSP Headers (Next.js Configuration)
- [ ] `default-src 'self'`
- [ ] `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (minimize inline scripts)
- [ ] `style-src 'self' 'unsafe-inline'` (minimize inline styles)
- [ ] `img-src 'self' data: https:`
- [ ] `font-src 'self' data:`
- [ ] `connect-src 'self' https://api.hummii.ca wss://api.hummii.ca`
- [ ] `frame-ancestors 'none'` (prevent clickjacking)

---

## 🔒 Secure Communication

### HTTPS
- [ ] Enforce HTTPS in production
- [ ] Redirect HTTP to HTTPS
- [ ] HSTS header configured (backend)
- [ ] No mixed content (all resources loaded over HTTPS)

### WebSocket Security
- [ ] Use WSS (WebSocket Secure) only
- [ ] Authenticate WebSocket connections (token in handshake)
- [ ] Validate all incoming WebSocket messages
- [ ] Rate limiting on WebSocket events (client-side feedback)
- [ ] Auto-reconnect with exponential backoff

---

## 💳 Payment Security (Stripe)

### Stripe Integration
- [ ] Use Stripe.js library (official, not CDN)
- [ ] Use Stripe Elements (card data never touches our servers)
- [ ] **NEVER** store card data
- [ ] **NEVER** log card data
- [ ] Load Stripe.js from `https://js.stripe.com` only
- [ ] Validate Stripe publishable key format
- [ ] Handle 3D Secure (SCA) redirects

### Checkout Security
- [ ] Display order summary before payment
- [ ] Confirm payment amount with user
- [ ] Validate payment amount on backend (client amount is just UI)
- [ ] Show clear error messages for declined cards
- [ ] Secure redirect after payment
- [ ] Receipt generation (PDF download)

---

## 🗺️ Maps & Geolocation

### Google Maps API
- [ ] API key hidden (server-side proxy)
- [ ] No direct calls to Google Maps API from client
- [ ] Validate autocomplete results before using
- [ ] Rate limit autocomplete requests (debounce)

### Geolocation Privacy
- [ ] Request user permission before accessing location
- [ ] Display location accuracy indicator
- [ ] Allow manual location input (fallback)
- [ ] Fuzzy location display (±500m for privacy)
- [ ] Precise address only after order acceptance
- [ ] Clear consent for location sharing

---

## 🧪 Security Testing

### Client-Side Testing
- [ ] XSS prevention tests (input sanitization)
- [ ] CSRF protection tests
- [ ] File upload validation tests
- [ ] Input validation tests (Zod schemas)
- [ ] Authentication flow tests (E2E)
- [ ] Session timeout tests

### Browser Security
- [ ] Test in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test browser extension compatibility
- [ ] Test private/incognito mode
- [ ] Test with ad blockers enabled
- [ ] Test with DevTools open (no secrets exposed)

---

## 📊 Monitoring & Error Handling

### Error Tracking
- [ ] Sentry integration for error tracking
- [ ] **NEVER** send sensitive data to Sentry
- [ ] Sanitize error messages before sending
- [ ] Track user actions (breadcrumbs) without PII
- [ ] Set up error alerts for critical issues

### User Feedback
- [ ] Display user-friendly error messages
- [ ] Avoid exposing technical details to users
- [ ] Provide clear recovery steps
- [ ] Log errors for debugging (without sensitive data)

---

## 🌍 Accessibility & Inclusivity

### WCAG 2.1 AA Compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility (ARIA labels)
- [ ] Color contrast ratio 4.5:1 minimum
- [ ] Focus indicators visible
- [ ] Skip to main content link
- [ ] Alt text for all images

### Bilingual Support (EN/FR)
- [ ] Language switcher (EN-CA, FR-CA)
- [ ] All UI text translated
- [ ] Error messages translated
- [ ] Privacy Policy and ToS in both languages

---

## 🚀 Performance Security

### Code Splitting
- [ ] Dynamic imports for heavy components
- [ ] Route-based code splitting
- [ ] Lazy load below-the-fold content
- [ ] Bundle size < 300KB (gzipped)

### Resource Security
- [ ] Subresource Integrity (SRI) for external scripts
- [ ] No inline scripts (move to external files)
- [ ] No inline styles (use Tailwind classes)
- [ ] Minimize third-party scripts

---

## 🔍 SEO & Privacy

### Metadata
- [ ] No sensitive data in metadata
- [ ] OpenGraph tags (social sharing)
- [ ] Canonical URLs
- [ ] Robots.txt configured
- [ ] Sitemap.xml generated

### Analytics Privacy
- [ ] PIPEDA-compliant analytics (Google Analytics 4)
- [ ] Anonymize IP addresses
- [ ] Cookie consent before analytics
- [ ] Opt-out option available
- [ ] No PII in analytics events

---

## ✅ Pre-Launch Security Audit

### Critical (Must Pass)
- [ ] No tokens in localStorage/sessionStorage
- [ ] All forms validated (Zod schemas)
- [ ] XSS prevention active (DOMPurify)
- [ ] CSRF protection implemented
- [ ] File upload validation active
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Stripe Elements used (no raw card data)
- [ ] API keys hidden (server-side proxy)
- [ ] Privacy Policy + Terms of Service displayed

### Important
- [ ] Cookie consent banner implemented
- [ ] Session timeout warning modal
- [ ] Account deletion flow tested
- [ ] Data export functionality tested
- [ ] Accessibility (WCAG 2.1 AA) passed
- [ ] Error tracking configured (Sentry)
- [ ] Security headers verified (security headers.com)
- [ ] Lighthouse security score 90+

### Optional (Post-Launch)
- [ ] 2FA/MFA UI
- [ ] Progressive Web App (PWA)
- [ ] Offline mode
- [ ] Advanced fraud detection feedback

---

## 🛠️ Development Best Practices

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No `any` types
- [ ] ESLint security rules enabled
- [ ] Prettier code formatting
- [ ] Pre-commit hooks (Husky)

### Environment Variables
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Use `NEXT_PUBLIC_` prefix only for non-sensitive values
- [ ] Validate environment variables on startup

### Dependencies
- [ ] Regular `npm audit` checks
- [ ] Automated dependency updates (Dependabot)
- [ ] Review dependency licenses
- [ ] Minimize third-party dependencies
- [ ] Pin dependency versions (no `^` or `~`)

---

## 📞 Emergency Contacts

- **Project Lead:** admin@hummii.ca
- **Security Issues:** security@hummii.ca
- **Privacy Issues:** privacy@hummii.ca
- **Privacy Commissioner of Canada:** https://www.priv.gc.ca/en/report-a-concern/

---

## 🔗 Related Documents

- **[Backend Security Checklist](../backend/security-checklist.md)** - Server-side security
- **[SECURITY_BEST_PRACTICES.md](../../SECURITY_BEST_PRACTICES.md)** - Comprehensive guide
- **[.claude/core/security-compliance.md](../../.claude/core/security-compliance.md)** - PIPEDA requirements
- **[docs/security.md](../../docs/security.md)** - Security measures

---

**Last Updated:** January 2025
**Review Frequency:** Quarterly or after any security incident
**Next Review:** April 2025
