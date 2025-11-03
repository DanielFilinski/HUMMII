# Phase 6: Payments Module - Stripe Integration

**Priority:** 🔴 CRITICAL (MVP)  
**Duration:** Week 13-15 (3 weeks)  
**Dependencies:** Phase 3 (Orders), Phase 5 (Reviews & Ratings)

> **📝 Note:** Stripe Identity для верификации подрядчиков реализуется в **Phase 2 (User Management Module)**, так как это часть профиля пользователя и KYC процесса. См. `docs/plans/backend/tasks/Phase 2/phase-2-unified.md`.

---

## 📋 Overview

Интеграция платежной системы Stripe с поддержкой escrow-модели, 3D Secure, возвратов и полной PCI DSS compliance. Этот модуль обеспечивает безопасную обработку платежей между клиентами и подрядчиками.

---

## 🎯 Business Requirements

### Payment Flow
1. **Order Created** → Payment Intent создаётся
2. **Client Confirms Payment** → Средства холдируются (escrow)
3. **Order Completed** → Средства переводятся подрядчику (minus platform fee)
4. **Order Disputed** → Средства удерживаются до разрешения
5. **Order Cancelled** → Полный или частичный возврат средств

### Stripe Products Integration
- **Stripe Payments** - основная обработка платежей
- **Stripe Connect** - выплаты подрядчикам (transfer to connected accounts)
- **Stripe Radar** - fraud detection
- **Stripe 3D Secure** - SCA compliance для EU/Canada
- **Stripe Webhooks** - event-driven architecture

### Platform Economics
- **Platform Fee:** 10% от суммы заказа
- **Stripe Fee:** ~2.9% + $0.30 CAD
- **Contractor Receives:** Order Amount - Platform Fee - Stripe Fee
- **Minimum Order Amount:** $20 CAD
- **Maximum Order Amount:** $10,000 CAD (можно увеличить после верификации)

---

## 📊 Database Schema

### Payments Table
```prisma
model Payment {
  id                String          @id @default(cuid())
  orderId           String          @unique
  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Stripe data
  stripePaymentIntentId    String          @unique
  stripeChargeId           String?         @unique
  stripeCustomerId         String
  stripePaymentMethodId    String?
  
  // Payment details
  amount            Int             // in cents (e.g., 10000 = $100.00)
  currency          String          @default("cad")
  platformFee       Int             // in cents
  stripeFee         Int             // in cents (estimated)
  contractorPayout  Int             // in cents (amount - platformFee - stripeFee)
  
  // Status tracking
  status            PaymentStatus   @default(PENDING)
  escrowStatus      EscrowStatus    @default(HELD)
  
  // Metadata
  description       String?
  metadata          Json?           // Custom metadata for tracking
  
  // Refund tracking
  refundAmount      Int?            @default(0)
  refundReason      String?
  
  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  paidAt            DateTime?
  releasedAt        DateTime?       // When funds released to contractor
  refundedAt        DateTime?
  
  // Relations
  transactions      Transaction[]
  refunds           Refund[]
  
  @@index([orderId])
  @@index([stripePaymentIntentId])
  @@index([status])
  @@index([createdAt])
  @@map("payments")
}

enum PaymentStatus {
  PENDING           // Payment Intent created, awaiting confirmation
  PROCESSING        // Payment being processed (3DS, etc.)
  SUCCEEDED         // Payment confirmed, funds in escrow
  FAILED            // Payment failed
  CANCELLED         // Payment cancelled before completion
  REFUNDED          // Full refund issued
  PARTIALLY_REFUNDED // Partial refund issued
}

enum EscrowStatus {
  HELD              // Funds held in escrow
  RELEASED          // Funds released to contractor
  REFUNDED          // Funds refunded to client
  PARTIALLY_REFUNDED // Partial refund issued
  DISPUTED          // In dispute, funds frozen
}
```

### Transactions Table (Audit Trail)
```prisma
model Transaction {
  id                String          @id @default(cuid())
  paymentId         String
  payment           Payment         @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  
  // Transaction details
  type              TransactionType
  amount            Int             // in cents
  description       String
  
  // Stripe references
  stripeTransferId  String?         @unique
  stripeRefundId    String?         @unique
  
  // Status
  status            String          // succeeded, failed, pending
  errorMessage      String?
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime        @default(now())
  
  @@index([paymentId])
  @@index([type])
  @@index([createdAt])
  @@map("transactions")
}

enum TransactionType {
  CHARGE            // Initial charge to client
  HOLD              // Escrow hold
  RELEASE           // Release to contractor
  REFUND            // Refund to client
  PLATFORM_FEE      // Platform fee collection
  STRIPE_FEE        // Stripe fee (for tracking)
}
```

### Refunds Table
```prisma
model Refund {
  id                String          @id @default(cuid())
  paymentId         String
  payment           Payment         @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  
  // Refund details
  stripeRefundId    String          @unique
  amount            Int             // in cents
  reason            RefundReason
  description       String?
  
  // Initiated by
  initiatedBy       String          // userId who requested refund
  approvedBy        String?         // admin userId (for disputed refunds)
  
  // Status
  status            String          // pending, succeeded, failed, cancelled
  errorMessage      String?
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime        @default(now())
  processedAt       DateTime?
  
  @@index([paymentId])
  @@index([stripeRefundId])
  @@index([createdAt])
  @@map("refunds")
}

enum RefundReason {
  REQUESTED_BY_CUSTOMER     // Client requested before work started
  DUPLICATE                 // Duplicate payment
  FRAUDULENT                // Fraudulent transaction
  ORDER_CANCELLED           // Order cancelled by mutual agreement
  DISPUTE_RESOLVED          // Dispute resolved in favor of client
  SERVICE_NOT_PROVIDED      // Contractor didn't fulfill order
  POOR_QUALITY              // Work quality issues (partial refund)
}
```

### Stripe Customer Mapping
```prisma
model StripeCustomer {
  id                String          @id @default(cuid())
  userId            String          @unique
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeCustomerId  String          @unique
  
  // Payment methods
  defaultPaymentMethodId  String?
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([userId])
  @@index([stripeCustomerId])
  @@map("stripe_customers")
}

model StripeConnectedAccount {
  id                String          @id @default(cuid())
  contractorId      String          @unique
  contractor        Contractor      @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  stripeAccountId   String          @unique
  
  // Account status
  chargesEnabled    Boolean         @default(false)
  payoutsEnabled    Boolean         @default(false)
  detailsSubmitted  Boolean         @default(false)
  
  // Requirements
  currentlyDue      Json?           // Fields currently due
  eventuallyDue     Json?           // Fields eventually due
  pastDue           Json?           // Fields past due
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([contractorId])
  @@index([stripeAccountId])
  @@map("stripe_connected_accounts")
}
```

---

## 🔧 Task Decomposition

### Week 13: Stripe Setup & Core Integration

#### Task 6.1: Stripe Configuration & Environment Setup
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 4 hours

**Subtasks:**
- [ ] 6.1.1: Install Stripe SDK (`npm install stripe @stripe/stripe-js`)
- [ ] 6.1.2: Setup environment variables in `.env`
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_CONNECT_CLIENT_ID=ca_...
  STRIPE_API_VERSION=2024-11-20.acacia
  ```
- [ ] 6.1.3: Create `StripeModule` with configuration
- [ ] 6.1.4: Initialize Stripe client in service
- [ ] 6.1.5: Setup Stripe webhook endpoint listener
- [ ] 6.1.6: Verify connection with test API call

**Files to Create:**
- `src/payments/stripe.config.ts`
- `src/payments/payments.module.ts`

**Acceptance Criteria:**
- ✅ Stripe SDK connected successfully
- ✅ Webhook endpoint responds with 200
- ✅ Environment variables validated on startup

---

#### Task 6.2: Database Schema Implementation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 6 hours

**Subtasks:**
- [ ] 6.2.1: Add Prisma models for Payment, Transaction, Refund
- [ ] 6.2.2: Add StripeCustomer and StripeConnectedAccount models
- [ ] 6.2.3: Create migration: `npx prisma migrate dev --name add_payments_module`
- [ ] 6.2.4: Generate Prisma client
- [ ] 6.2.5: Create DTOs for payment operations
- [ ] 6.2.6: Create entities/interfaces for type safety

**Files to Create:**
- Update: `prisma/schema.prisma`
- `src/payments/dto/create-payment-intent.dto.ts`
- `src/payments/dto/confirm-payment.dto.ts`
- `src/payments/dto/refund-payment.dto.ts`
- `src/payments/entities/payment.entity.ts`

**Acceptance Criteria:**
- ✅ All tables created without errors
- ✅ Relations properly set up
- ✅ Indexes created for performance
- ✅ DTOs validate correctly

---

#### Task 6.3: Payment Intent Creation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] 6.3.1: Create `PaymentsService.createPaymentIntent(orderId)`
- [ ] 6.3.2: Calculate amounts (total, platformFee, stripeFee, contractorPayout)
- [ ] 6.3.3: Create or retrieve Stripe Customer
- [ ] 6.3.4: Create Payment Intent with metadata
- [ ] 6.3.5: Save payment record to database
- [ ] 6.3.6: Implement idempotency key handling
- [ ] 6.3.7: Add input validation (min/max amounts)
- [ ] 6.3.8: Add error handling for Stripe API errors

**Business Logic:**
```typescript
// Amount calculation
orderAmount = order.price * 100; // convert to cents
platformFee = Math.round(orderAmount * 0.10); // 10%
stripeFee = Math.round(orderAmount * 0.029 + 30); // ~2.9% + $0.30
contractorPayout = orderAmount - platformFee - stripeFee;

// Validation
if (orderAmount < 2000) throw new Error('Minimum order: $20 CAD');
if (orderAmount > 1000000) throw new Error('Maximum order: $10,000 CAD');
```

**Files to Create:**
- `src/payments/payments.service.ts`
- `src/payments/payments.controller.ts`

**Acceptance Criteria:**
- ✅ Payment Intent created successfully
- ✅ Correct amount calculations
- ✅ Idempotency keys prevent duplicate intents
- ✅ Customer created/retrieved automatically
- ✅ Payment record saved to database

---

#### Task 6.4: Payment Confirmation & 3D Secure
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] 6.4.1: Create `confirmPayment(paymentIntentId)` endpoint
- [ ] 6.4.2: Handle 3D Secure (SCA) challenges
- [ ] 6.4.3: Update payment status on confirmation
- [ ] 6.4.4: Create Transaction record (CHARGE)
- [ ] 6.4.5: Update Order status to `in_progress`
- [ ] 6.4.6: Send confirmation notification to both parties
- [ ] 6.4.7: Handle payment failures (card declined, etc.)
- [ ] 6.4.8: Implement retry logic for transient errors

**SCA Flow:**
```
Client confirms payment → Stripe returns requires_action
→ Frontend shows 3DS modal → User authenticates
→ Payment succeeds → Webhook confirms → Update DB
```

**Files to Update:**
- `src/payments/payments.service.ts`
- `src/payments/payments.controller.ts`

**Acceptance Criteria:**
- ✅ Payment confirmation works with 3DS
- ✅ Order status updated correctly
- ✅ Transaction audit trail created
- ✅ Notifications sent
- ✅ Error handling for all failure scenarios

---

#### Task 6.5: Stripe Webhooks Implementation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 10 hours

**Subtasks:**
- [ ] 6.5.1: Create webhook controller at `/api/v1/webhooks/stripe`
- [ ] 6.5.2: Implement signature verification (MANDATORY)
- [ ] 6.5.3: Handle `payment_intent.succeeded` event
- [ ] 6.5.4: Handle `payment_intent.payment_failed` event
- [ ] 6.5.5: Handle `payment_intent.canceled` event
- [ ] 6.5.6: Handle `charge.refunded` event
- [ ] 6.5.7: Handle `charge.dispute.created` event
- [ ] 6.5.8: Implement idempotency (prevent duplicate processing)
- [ ] 6.5.9: Add webhook event logging to database
- [ ] 6.5.10: Add retry logic for webhook processing failures

**Critical Security:**
```typescript
// MANDATORY signature verification
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Files to Create:**
- `src/payments/webhooks/stripe-webhook.controller.ts`
- `src/payments/webhooks/stripe-webhook.service.ts`
- `src/payments/entities/webhook-event.entity.ts`

**Acceptance Criteria:**
- ✅ Signature verification works (rejects invalid signatures)
- ✅ All events processed correctly
- ✅ Idempotency prevents duplicate actions
- ✅ Webhook events logged to database
- ✅ Error handling and retry logic

---

### Week 14: Escrow & Payouts

#### Task 6.6: Escrow Management
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] 6.6.1: Create `holdFundsInEscrow(paymentId)` logic
- [ ] 6.6.2: Update escrow status to `HELD` after payment
- [ ] 6.6.3: Create `releaseFundsToContractor(paymentId)` endpoint
- [ ] 6.6.4: Validate order completion before release
- [ ] 6.6.5: Calculate final amounts (including fees)
- [ ] 6.6.6: Create Transaction records (HOLD, RELEASE)
- [ ] 6.6.7: Update escrow status to `RELEASED`
- [ ] 6.6.8: Add permission guards (only admin or automatic trigger)

**Business Rules:**
- Funds held in escrow until order status = `completed`
- Release triggered automatically 24h after order completion
- Manual release by admin if needed
- Funds frozen if dispute opened

**Files to Update:**
- `src/payments/payments.service.ts`
- `src/payments/payments.controller.ts`

**Acceptance Criteria:**
- ✅ Funds held correctly after payment
- ✅ Release only after order completed
- ✅ Transaction audit trail complete
- ✅ Escrow status tracked accurately

---

#### Task 6.7: Stripe Connect - Contractor Accounts
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 12 hours

**Subtasks:**
- [ ] 6.7.1: Create `StripeConnectService`
- [ ] 6.7.2: Implement `createConnectedAccount(contractorId)` (Express or Standard)
- [ ] 6.7.3: Generate onboarding link for contractors
- [ ] 6.7.4: Handle `account.updated` webhook
- [ ] 6.7.5: Track account status (chargesEnabled, payoutsEnabled)
- [ ] 6.7.6: Implement `transferToContractor(paymentId, contractorId)`
- [ ] 6.7.7: Calculate platform fee collection
- [ ] 6.7.8: Handle transfer failures and retries
- [ ] 6.7.9: Add verification requirements tracking
- [ ] 6.7.10: Create contractor payout dashboard endpoint

**Stripe Connect Flow:**
```
Contractor registers → Create Connect Account
→ Redirect to Stripe onboarding → Complete verification
→ Account enabled → Can receive payouts
```

**Platform Fee Collection:**
```typescript
// Transfer with application fee
const transfer = await stripe.transfers.create({
  amount: contractorPayout,
  currency: 'cad',
  destination: stripeAccountId,
  transfer_group: orderId,
  metadata: { orderId, paymentId }
});

// Platform fee is retained automatically
```

**Files to Create:**
- `src/payments/stripe-connect.service.ts`
- `src/payments/dto/create-connected-account.dto.ts`

**Acceptance Criteria:**
- ✅ Connected accounts created successfully
- ✅ Onboarding link generated
- ✅ Transfers work correctly
- ✅ Platform fee collected
- ✅ Account status tracked

---

#### Task 6.8: Automated Payout Release
**Priority:** 🟡 HIGH  
**Estimated Time:** 6 hours

**Subtasks:**
- [ ] 6.8.1: Create scheduled job for payout processing
- [ ] 6.8.2: Query payments with status=SUCCEEDED, escrow=HELD
- [ ] 6.8.3: Check if order completed + 24h passed
- [ ] 6.8.4: Validate no active disputes
- [ ] 6.8.5: Trigger transfer to contractor
- [ ] 6.8.6: Update payment and escrow status
- [ ] 6.8.7: Send payout notification to contractor
- [ ] 6.8.8: Log all actions for audit

**Automation Schedule:**
- Run every 1 hour
- Process eligible payments in batches
- Retry failed transfers after 1 hour

**Files to Create:**
- `src/payments/jobs/payout-release.job.ts`

**Acceptance Criteria:**
- ✅ Job runs on schedule
- ✅ Eligible payments processed
- ✅ Failed transfers retried
- ✅ Notifications sent

---

### Week 15: Refunds & Security

#### Task 6.9: Refund System
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 10 hours

**Subtasks:**
- [ ] 6.9.1: Create `refundPayment(paymentId, amount, reason)` endpoint
- [ ] 6.9.2: Implement full refund logic
- [ ] 6.9.3: Implement partial refund logic
- [ ] 6.9.4: Validate refund eligibility (time limits, status)
- [ ] 6.9.5: Create Refund record in database
- [ ] 6.9.6: Call Stripe refund API with idempotency key
- [ ] 6.9.7: Handle `charge.refunded` webhook
- [ ] 6.9.8: Update payment and order status
- [ ] 6.9.9: Create Transaction record (REFUND)
- [ ] 6.9.10: Send refund notifications
- [ ] 6.9.11: Add permission guards (client, admin)

**Refund Rules:**
- Full refund: if order not started or cancelled before work
- Partial refund: dispute resolution, poor quality
- Refund window: 90 days from payment
- Disputes block automatic refunds

**Files to Create:**
- `src/payments/refunds/refunds.service.ts`
- `src/payments/refunds/refunds.controller.ts`

**Acceptance Criteria:**
- ✅ Full refunds work correctly
- ✅ Partial refunds work correctly
- ✅ Webhook updates status
- ✅ Audit trail complete
- ✅ Notifications sent

---

#### Task 6.10: Payment Security Implementation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] 6.10.1: Implement rate limiting (10 payment attempts/hour)
- [ ] 6.10.2: Add fraud detection (unusual amounts, patterns)
- [ ] 6.10.3: Validate payment amounts server-side
- [ ] 6.10.4: Implement idempotency keys for all operations
- [ ] 6.10.5: Add webhook signature verification tests
- [ ] 6.10.6: Mask card data in logs (never log full numbers)
- [ ] 6.10.7: Add transaction amount validation (min/max)
- [ ] 6.10.8: Implement Stripe Radar fraud rules
- [ ] 6.10.9: Add IP-based fraud detection
- [ ] 6.10.10: Create security audit logging

**Security Checklist:**
- [ ] Never store card data (PCI DSS)
- [ ] All amounts validated server-side
- [ ] Webhook signatures verified
- [ ] Idempotency keys prevent duplicates
- [ ] Rate limiting active
- [ ] Audit logging enabled
- [ ] No sensitive data in logs

**Files to Update:**
- `src/payments/guards/payment-security.guard.ts`
- `src/payments/interceptors/payment-audit.interceptor.ts`

**Acceptance Criteria:**
- ✅ All security measures implemented
- ✅ PCI DSS compliance verified
- ✅ Fraud detection working
- ✅ Audit logs complete

---

#### Task 6.11: Customer Portal & Payment Methods
**Priority:** 🟡 HIGH  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] 6.11.1: Create endpoint to add payment method
- [ ] 6.11.2: Create endpoint to list payment methods
- [ ] 6.11.3: Create endpoint to set default payment method
- [ ] 6.11.4: Create endpoint to remove payment method
- [ ] 6.11.5: Get transaction history
- [ ] 6.11.6: Generate invoice/receipt PDF
- [ ] 6.11.7: Email invoice to customer
- [ ] 6.11.8: Add payment method validation

**Stripe Customer Portal:**
- Alternative: Use Stripe Customer Portal (hosted)
- Or build custom with Stripe Elements

**Files to Create:**
- `src/payments/customer-portal/customer-portal.service.ts`
- `src/payments/customer-portal/customer-portal.controller.ts`

**Acceptance Criteria:**
- ✅ Payment methods manageable
- ✅ Transaction history accessible
- ✅ Invoices generated correctly
- ✅ Email delivery working

---

#### Task 6.12: Testing & Documentation
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 12 hours

**Subtasks:**
- [ ] 6.12.1: Unit tests for PaymentsService (80%+ coverage)
- [ ] 6.12.2: Unit tests for StripeConnectService
- [ ] 6.12.3: Unit tests for RefundsService
- [ ] 6.12.4: E2E test: Complete payment flow
- [ ] 6.12.5: E2E test: 3D Secure payment
- [ ] 6.12.6: E2E test: Payment failure handling
- [ ] 6.12.7: E2E test: Refund flow
- [ ] 6.12.8: E2E test: Webhook processing
- [ ] 6.12.9: Security test: Webhook signature validation
- [ ] 6.12.10: Security test: Idempotency verification
- [ ] 6.12.11: Load test: Concurrent payments
- [ ] 6.12.12: Update Swagger documentation

**Test Scenarios:**
```typescript
// Critical flows to test
1. Happy path: Payment → Completion → Payout
2. Payment failure: Card declined
3. 3D Secure: Authentication required
4. Refund: Full refund after cancellation
5. Refund: Partial refund after dispute
6. Webhook: payment_intent.succeeded
7. Webhook: Invalid signature (should reject)
8. Idempotency: Duplicate payment intent creation
9. Concurrent: Multiple payments at same time
10. Security: Rate limiting enforcement
```

**Files to Create:**
- `src/payments/payments.service.spec.ts`
- `test/payments.e2e-spec.ts`
- `test/stripe-webhooks.e2e-spec.ts`

**Acceptance Criteria:**
- ✅ 80%+ unit test coverage
- ✅ All E2E tests passing
- ✅ Security tests passing
- ✅ Swagger documentation complete

---

## 🔒 Security Requirements (from security-checklist.md)

### PCI DSS Compliance
- [x] NEVER store card data (use Stripe Elements)
- [x] Stripe webhook signature verification MANDATORY
- [x] Idempotency keys for all payment operations
- [x] Transaction amount validation (server-side)
- [x] 3D Secure (SCA) enabled for card payments
- [x] Refund fraud detection

### Stripe Integration Security
- [x] Use Stripe Elements on frontend (card data never touches servers)
- [x] Webhook signature verification on every event
- [x] Store idempotency keys in database
- [x] Handle all webhook events idempotently
- [x] Error handling for declined cards
- [x] Transaction logging (masked card data)

### Rate Limiting
- [x] Payment creation: 10 requests/hour per user
- [x] Refund requests: 5 requests/hour per user
- [x] Webhook endpoints: No rate limit (Stripe controlled)

### Audit Logging
- [x] All payment transactions logged
- [x] All refunds logged with reason
- [x] Webhook events logged
- [x] Failed payments logged
- [x] Admin actions logged

---

## 📚 API Endpoints

### Payment Endpoints

```typescript
// Create payment intent
POST /api/v1/payments/create-intent
Body: { orderId: string }
Response: { clientSecret: string, paymentId: string }

// Confirm payment
POST /api/v1/payments/confirm
Body: { paymentIntentId: string }
Response: { status: string, payment: Payment }

// Get payment details
GET /api/v1/payments/:id
Response: Payment

// Get payment history
GET /api/v1/payments/history
Query: { page, limit, status }
Response: { payments: Payment[], total: number }

// Refund payment
POST /api/v1/payments/:id/refund
Body: { amount?: number, reason: RefundReason, description?: string }
Response: Refund
Guards: [JwtAuthGuard, OwnerOrAdminGuard]
```

### Stripe Connect Endpoints

```typescript
// Create connected account
POST /api/v1/stripe-connect/create-account
Response: { accountId: string, onboardingUrl: string }
Guards: [JwtAuthGuard, ContractorGuard]

// Get account status
GET /api/v1/stripe-connect/account-status
Response: { chargesEnabled: boolean, payoutsEnabled: boolean, requirements: object }

// Get payout history
GET /api/v1/stripe-connect/payouts
Response: { payouts: Transfer[] }
```

### Customer Portal Endpoints

```typescript
// Add payment method
POST /api/v1/customer-portal/payment-methods
Body: { paymentMethodId: string }
Response: PaymentMethod

// List payment methods
GET /api/v1/customer-portal/payment-methods
Response: PaymentMethod[]

// Set default payment method
PUT /api/v1/customer-portal/payment-methods/:id/default
Response: { success: boolean }

// Remove payment method
DELETE /api/v1/customer-portal/payment-methods/:id
Response: { success: boolean }

// Get transaction history
GET /api/v1/customer-portal/transactions
Query: { page, limit, type }
Response: { transactions: Transaction[], total: number }

// Download invoice
GET /api/v1/customer-portal/invoices/:paymentId
Response: PDF file
```

### Webhook Endpoint

```typescript
// Stripe webhooks
POST /api/v1/webhooks/stripe
Headers: { stripe-signature: string }
Body: Raw Stripe event
Response: { received: true }
Security: Signature verification MANDATORY
```

---

## 🧪 Testing Strategy

### Unit Tests (80%+ coverage)
- Payment amount calculations
- Stripe API mocking
- Error handling
- Validation logic
- Idempotency key generation

### Integration Tests
- Database operations
- Stripe API integration (test mode)
- Webhook processing
- Transaction creation

### E2E Tests
- Complete payment flow
- 3D Secure flow
- Refund flow
- Webhook event processing
- Error scenarios

### Security Tests
- Webhook signature validation
- Idempotency enforcement
- Rate limiting
- Amount validation
- PCI DSS compliance

### Load Tests
- Concurrent payment processing
- Webhook handling under load
- Database performance
- Redis caching

---

## 📊 Success Criteria

### Functional
- ✅ Payments processed successfully with 3D Secure
- ✅ Escrow system holds and releases funds correctly
- ✅ Refunds work for full and partial amounts
- ✅ Stripe Connect payouts to contractors
- ✅ Webhook events processed correctly
- ✅ Payment methods manageable

### Security
- ✅ PCI DSS compliance (via Stripe)
- ✅ All webhooks signature-verified
- ✅ No card data stored
- ✅ Idempotency prevents duplicates
- ✅ Rate limiting active
- ✅ Audit logging complete

### Performance
- ✅ Payment creation < 2s
- ✅ Webhook processing < 5s
- ✅ 99.9% uptime for payment endpoints
- ✅ Handle 100 concurrent payments

### Testing
- ✅ 80%+ unit test coverage
- ✅ All E2E tests passing
- ✅ Security tests passing
- ✅ Load tests passing

---

## 📖 Resources

### Stripe Documentation
- [Stripe API Reference](https://stripe.com/docs/api)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Webhooks](https://stripe.com/docs/webhooks)
- [3D Secure](https://stripe.com/docs/payments/3d-secure)
- [Refunds](https://stripe.com/docs/refunds)

### Security
- [PCI DSS](https://www.pcisecuritystandards.org/)
- [Stripe Security](https://stripe.com/docs/security/stripe)
- [PIPEDA Compliance](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)

### Testing
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Test Cards](https://stripe.com/docs/testing#cards)

---

## 📝 Notes

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
3DS Required: 4000 0027 6000 3184
Declined: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

### Platform Fee Calculation
```typescript
// Example: Order amount = $100 CAD
orderAmount = 10000; // cents
platformFee = 1000; // 10% = $10
stripeFee = 320; // 2.9% + $0.30 = $3.20
contractorPayout = 8680; // $86.80
```

### Webhook Event Priority
1. **payment_intent.succeeded** - Update payment status
2. **payment_intent.payment_failed** - Handle failure
3. **charge.refunded** - Process refund
4. **account.updated** - Update Connect account status
5. **charge.dispute.created** - Freeze funds

---

## ✅ Definition of Done

- [ ] All 12 tasks completed
- [ ] Database schema migrated and tested
- [ ] All endpoints implemented and documented
- [ ] 80%+ test coverage achieved
- [ ] Security checklist verified
- [ ] PCI DSS compliance confirmed
- [ ] Stripe webhooks tested in production
- [ ] Load testing completed
- [ ] Documentation updated (Swagger + README)
- [ ] Code reviewed and approved
- [ ] Deployed to staging environment
- [ ] Integration tested with frontend
- [ ] Performance benchmarks met

---

**Next Phase:** [Phase 7: Disputes Module](./phase-7-disputes.md)
