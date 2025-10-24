# Changelog - Technical Specification Updates

**Date:** October 24, 2025

## Major Updates to docs/TS.md

### 1. System Roles Clarification ✅
- **BEFORE:** Unclear if users can be both client and performer
- **NOW:** One user can have BOTH roles simultaneously (like Avito, Profi.ru)
- Header switcher only changes VIEW, not actual role
- Users can act as client for some services and performer for others

### 2. Order Status Lifecycle ✅
- **ADDED:** Complete 7-step status flow:
  1. `draft` - Draft (created but not published)
  2. `published` - Published (waiting for responses)
  3. `in_progress` - Accepted, work in progress
  4. `pending_review` - Performer completed, waiting for client review
  5. `completed` - Finished (paid, reviews left)
  6. `cancelled` - Cancelled
  7. `disputed` - Dispute opened

### 3. Verification System ✅
- **CLARIFIED:** Mandatory for performers, optional for clients
- **PROVIDER:** Stripe Identity (automatic document verification)
- **DOCUMENTS:** Driver's License, Passport, Provincial ID Card
- **BADGE:** "✓ Verified" appears on profile after approval

### 4. Portfolio Moderation ✅
- **ADDED:** Complete moderation strategy
  - AI moderation (NSFW, duplicates, watermarks)
  - Manual review by admins
  - Platform orders auto-approved with client consent
  - External works require moderation
- **LIMITS:** Max 10 works, 5 photos per work, 5MB per file
- **FORMATS:** JPG, PNG, WebP

### 5. Rating System Details ✅
- **ADDED:** Complete rating criteria:
  - Clients rate performers: 4 criteria (Quality, Professionalism, Communication, Value)
  - Performers rate clients: 3 criteria (Communication, Professionalism, Payment)
- **FORMULA:** Weighted rating (70% avg + 20% experience + 10% verification)
- **RULES:** 14 days to leave review, rating mandatory, text optional

### 6. Chat System ✅
- **CLARIFIED:** Text-only (NO files, NO media)
- **FEATURES:**
  - Max 2000 characters per message
  - Edit within 5 minutes
  - Read receipts
  - "Typing..." indicator
- **MODERATION:** Auto-block phones, emails, links, social media
- **RETENTION:** Permanent until account deletion
- **CLOSURE:** Read-only after 30 days post-completion

### 7. Notification System ✅
- **ADDED:** Complete notification strategy
- **CHANNELS:** In-App (when online), Email (when offline), Push (if enabled)
- **PRIORITIES:**
  - HIGH: New response, order status, payment, disputes, security
  - MEDIUM: Messages, reviews, category orders
  - LOW: Profile views, reminders (weekly digest)
- **PROVIDER:** OneSignal (email + push)

### 8. Payment System ✅
- **ADDED:** Payment architecture
- **PROVIDER:** Stripe (PCI DSS compliant)
- **FEATURES:**
  - Cards, Apple Pay, Google Pay, ACH
  - Customer Portal for payment management
  - 3D Secure for security
  - Escrow for disputes

### 9. Disputes System ✅
- **ADDED:** Complete dispute resolution flow
- **PROCESS:**
  1. Open dispute → Upload evidence
  2. Freeze funds
  3. Admin reviews (3-5 business days)
  4. Decision: full/partial refund or payment
- **TRACKING:** Dispute count affects user rating

### 10. Geolocation & Maps ✅
- **ADDED:** Complete geolocation strategy
- **PRIVACY:** PIPEDA compliant
  - Public: district/city only
  - Fuzzy location on map (±500m)
  - Exact address only after order acceptance
- **PROVIDER:** Google Maps API + PostGIS
- **FILTERS:** 5km, 10km, 25km, city, province, online-only
- **REFERENCE:** docs/api/geolocation.md

### 11. Badges System ✅
- **CLARIFIED:** Three badge types:
  - **"Verified"** = Document verification via Stripe Identity
  - **"Top Pro"** = 20+ orders + 4.8★+ rating
  - **"New"** = Registered < 30 days ago

### 12. Statistics ✅
- **ADDED:** Two-tier statistics
- **PUBLIC:** Order count, rating, review count, registration date
- **PRIVATE:** Profile views, conversion rate, revenue, activity graphs

### 13. Order Types ✅
- **ADDED:** Two ordering methods:
  - **Direct Order:** Client contacts specific performer directly
  - **Public Request:** Client posts request, performers respond

### 14. SEO Implementation ✅
- **ADDED:** Complete SEO strategy
- **URLS:** Slug-based `/performer/name-city`
- **FEATURES:**
  - OpenGraph meta tags
  - Dynamic sitemap.xml
  - robots.txt
  - JSON-LD structured data
  - ISR (24h revalidation)
- **REFERENCE:** docs/configs/SEO.md

### 15. Security & PIPEDA Compliance ✅
- **ADDED:** Complete security measures
- **AUTH:** JWT, 2FA optional, OAuth (Google, Apple)
- **PROTECTION:** Rate limiting, CORS, Helmet.js, XSS/SQL injection prevention
- **PIPEDA:** Data export, deletion, portability, breach notification (72h)
- **REFERENCE:** docs/security.md

### 16. Partner Portal ✅
- **ADDED:** Partner discount program
- **CONCEPT:** Performers with subscriptions get discounts at partner shops
- **DISCOUNTS:** 5% (Standard), 10% (Professional), 15% (Advanced)
- **VALIDATION:** QR codes (15-min validity)
- **PORTAL:** Separate app for partner shops
- **REFERENCE:** docs/modules/Partner Portal.md

### 17. Technology Stack ✅
- **ADDED:** Complete tech stack specification
- **FRONTEND:** Next.js 14+ (App Router), TypeScript, Shadcn/ui, Zustand, React Query
- **BACKEND:** NestJS, TypeScript, PostgreSQL + PostGIS, Redis, Prisma, Socket.io
- **SERVICES:** Stripe, OneSignal, Google Maps API, OpenAI, Sentry
- **INFRASTRUCTURE:** Docker, GitHub Actions, Vercel + AWS/DigitalOcean
- **REFERENCE:** docs/Stack.md

---

## Summary

The technical specification is now **COMPLETE and READY for development**. All ambiguities and contradictions have been resolved. The document now includes:

- ✅ Clear role system (dual roles)
- ✅ Complete order lifecycle
- ✅ Payment and dispute systems
- ✅ Notification strategy
- ✅ Chat moderation
- ✅ Rating formulas
- ✅ Portfolio moderation
- ✅ Geolocation & privacy
- ✅ SEO implementation
- ✅ Security & PIPEDA compliance
- ✅ Partner program
- ✅ Technology stack

**Next Step:** Begin project infrastructure setup (Docker, NestJS, Next.js, Prisma schema)

---

*Generated: October 24, 2025*

---

## Updates - October 24, 2025 (Stack Alignment)

### Documentation Improvements ✅

**1. Created Stack_EN.md (English Version)**
- Complete English translation of technology stack
- Aligned with nest.mdc and next.mdc coding rules
- Added missing sections:
  - API Versioning (`/api/v1/`)
  - Backend Module Structure
  - Content Moderation Strategy
  - Background Jobs & Queues details
  - Rate Limiting specifications
  - PIPEDA Compliance details
  - Testing Strategy
  - Performance optimization

**2. Technology Decisions Finalized**
- **Admin Panel:** Refine (as per next.mdc recommendation)
- **i18n Library:** next-intl (English + French for Canada)
- **Languages:** English + French (removed Russian - not applicable for Canadian market)

**3. Security Enhancements**
- Detailed Rate Limiting configuration per endpoint type
- Content Moderation implementation strategy
- Field-level encryption for sensitive data (credit cards, SIN)
- PII masking in logs (emails, phones)
- User Rights API endpoints for PIPEDA compliance

**4. Testing Standards**
- Backend: 80%+ coverage for critical code, smoke test endpoint for each controller
- Frontend: React Testing Library (not Enzyme), accessibility tests with jest-axe
- Critical paths defined: payments, disputes, subscriptions, notifications, QR codes

**5. Backend Architecture**
- Module structure defined (core, shared, feature modules)
- Background job types specified (email, push, image processing, cleanup, webhooks)
- API versioning strategy: URI-based `/api/v1/`

---

**Summary of Alignment with Coding Rules:**

| Rule Category | Status | Notes |
|---------------|--------|-------|
| **Language & Documentation** | ✅ Aligned | Stack_EN.md in English |
| **Technology Stack** | ✅ Aligned | Matches nest.mdc + next.mdc |
| **Security** | ✅ Aligned | Rate limiting, PIPEDA, encryption |
| **Testing** | ✅ Aligned | Jest, Supertest, RTL, coverage targets |
| **Architecture** | ✅ Aligned | Modular NestJS structure |
| **Content Moderation** | ✅ Aligned | Auto-moderation + manual review |
| **API Versioning** | ✅ Aligned | `/api/v1/` URI versioning |

---

**Files Created/Updated:**
- ✅ Created: `docs/Stack_EN.md`
- ✅ Updated: `docs/CHANGELOG_TS.md`
- ✅ Updated: `docs/TS.md`

**Next Actions:**
- Review and approve Stack_EN.md
- Begin infrastructure setup (Docker, Prisma schema)
- Initialize NestJS module structure
- Initialize Next.js application structure

---

*Updated: October 24, 2025*

