# Admin Panel Integration Checklist

**Last Updated:** November 13, 2025  
**Status:** API Ready for Frontend Integration

---

## Quick Reference

### API Implementation Status
- **Total Backend Endpoints:** 122+
- **Admin Endpoints Available:** 59+
- **Currently Integrated to Admin Panel:** 11 endpoints (17%)
- **Missing in Admin Panel:** 48 endpoints (83%)

---

## Implementation Checklist

### Phase 1: Critical Features (Weeks 1-4)

#### Order Management Dashboard
- [ ] Create Orders List Page
  - [ ] GET `/admin/orders` - List with pagination
  - [ ] GET `/admin/orders/:id` - View order details
  - [ ] PATCH `/admin/orders/:id/status` - Update status
  - [ ] PATCH `/admin/orders/:id/cancel` - Cancel order
  - [ ] GET `/admin/orders/stats` - Order metrics
  - **Filters Needed:** search, status, category, client, contractor, budget, date range
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Review Moderation Queue
- [ ] Create Moderation Page
  - [ ] GET `/admin/reviews/pending` - Pending queue
  - [ ] GET `/admin/reviews/flagged` - Flagged reviews
  - [ ] PATCH `/admin/reviews/:id/moderate` - Approve/reject
  - [ ] GET `/admin/reviews/reports` - Reports queue
  - [ ] PATCH `/admin/reviews/reports/:id/resolve` - Resolve report
  - [ ] DELETE `/admin/reviews/:id` - Delete review
  - [ ] POST `/admin/reviews/:id/response` - Platform response
  - [ ] POST `/admin/reviews/bulk-moderate` - Bulk moderation
  - **Max 100 reviews per bulk operation**
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Subscription Management
- [ ] Create Subscriptions List Page
  - [ ] GET `/admin/subscriptions` - List with filtering
  - [ ] GET `/admin/subscriptions/:id` - View subscription
  - [ ] PATCH `/admin/subscriptions/:id/tier` - Change tier
  - [ ] PATCH `/admin/subscriptions/:id/extend` - Extend period
  - [ ] PATCH `/admin/subscriptions/:id/cancel` - Cancel subscription
  - [ ] GET `/admin/subscriptions/stats` - Subscription metrics
  - **Filters:** search, tier, status, contractor, date range
  - **Sorting:** createdAt, updatedAt, tier, status, currentPeriodEnd
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

---

### Phase 2: Important Features (Weeks 5-8)

#### Dispute Resolution
- [ ] Create Disputes Queue Page
  - [ ] GET `/admin/disputes` - Disputes list
  - [ ] GET `/admin/disputes/:id` - View dispute
  - [ ] POST `/admin/disputes/:id/resolve` - Resolve dispute
  - [ ] PATCH `/admin/disputes/:id/status` - Update status
  - [ ] GET `/admin/disputes/stats` - Dispute metrics
  - **Filters:** status, priority, orderId
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Notification System
- [ ] Create Notifications Page
  - [ ] POST `/admin/notifications/bulk` - Send bulk notifications
  - [ ] GET `/admin/notifications/stats` - Delivery statistics
  - [ ] GET `/admin/notifications/templates` - List templates
  - [ ] GET `/admin/notifications/:id` - View notification
  - [ ] GET `/admin/notifications/user/:userId` - User history
  - **Max 1000 users per bulk notification**
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### System Settings
- [ ] Create Settings Page
  - [ ] GET `/admin/settings` - List all settings
  - [ ] GET `/admin/settings/:key` - Get specific setting
  - [ ] PATCH `/admin/settings` - Update setting
  - [ ] PATCH `/admin/settings/bulk` - Bulk update (max 50)
  - [ ] DELETE `/admin/settings/:key` - Delete setting
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Feature Flags
- [ ] Create Feature Flags Page
  - [ ] GET `/admin/feature-flags` - List flags
  - [ ] GET `/admin/feature-flags/:name` - Get flag
  - [ ] POST `/admin/feature-flags` - Create flag
  - [ ] PATCH `/admin/feature-flags/:name` - Update flag
  - [ ] DELETE `/admin/feature-flags/:name` - Delete flag
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

---

### Phase 3: Additional Features (Weeks 9-12)

#### Advanced Analytics
- [ ] Create Analytics Dashboard
  - [ ] GET `/v1/admin/analytics/overview` - Overview stats
  - [ ] GET `/v1/admin/analytics/contractors` - Contractor performance
  - [ ] GET `/v1/admin/analytics/searches` - Search analytics
  - [ ] GET `/v1/admin/analytics/conversions` - Conversion data
  - [ ] GET `/v1/admin/analytics/export` - Export data (CSV/JSON)
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Portfolio Moderation
- [ ] Create Portfolio Moderation Page
  - [ ] GET `/admin/portfolio/pending` - Pending items
  - [ ] PATCH `/admin/portfolio/:id/approve` - Approve
  - [ ] PATCH `/admin/portfolio/:id/reject` - Reject
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### Category Analytics
- [ ] Add to Analytics/Dashboard
  - [ ] GET `/admin/categories/analytics` - Category usage stats
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

#### SEO Management
- [ ] Create SEO Management Page
  - [ ] POST `/admin/seo/refresh-sitemap` - Refresh sitemap
  - [ ] POST `/admin/seo/revalidate/:contractorId` - Revalidate cache
  - [ ] POST `/admin/seo/warm-cache` - Warm cache
  - **API Call Already Tested:** YES
  - **Auth Guard:** JwtAuthGuard + RolesGuard (ADMIN)

---

## Already Implemented (Current Status)

### Completed Endpoints
- [x] GET `/admin/users` - User list (Users page)
- [x] GET `/admin/users/:id` - User details (partial)
- [x] PATCH `/admin/users/:id/lock` - Lock user (Users page)
- [x] PATCH `/admin/users/:id/unlock` - Unlock user (Users page)
- [x] POST `/admin/users/:id/roles` - Add role (Users page)
- [x] DELETE `/admin/users/:id/roles` - Remove role (Users page)
- [x] GET `/admin/contractors/pending` - Pending contractors (Moderation page)
- [x] PATCH `/admin/contractors/:id/verify` - Verify contractor (Moderation page)
- [x] PATCH `/admin/contractors/:id/reject` - Reject contractor (Moderation page)
- [x] GET `/admin/stats` - Platform stats (Dashboard)
- [x] GET `/admin/audit-logs` - Audit logs (Audit Logs page)
- [x] GET `/admin/audit-logs/:id` - Audit log details (partial)

### Pages with Stubs
- [ ] `/admin/dashboard` - Stats page (incomplete)
- [ ] `/admin/settings` - Settings page (empty)
- [ ] `/admin/profile` - Admin profile (empty)

---

## API Client Implementation

### Current API Client Location
**File:** `/root/Garantiny_old/HUMMII/admin/src/lib/api/admin-client.ts`

### Methods Already Implemented
```typescript
// User Management
getUsers(params: UserListParams)
getUserById(id: string)
addUserRole(userId: string, role: UserRole)
removeUserRole(userId: string, role: UserRole)
lockUser(userId: string, reason?: string)
unlockUser(userId: string)
deleteUser(userId: string)

// Contractor Verification
getPendingContractors(params)
verifyContractor(contractorId: string, data)
rejectContractor(contractorId: string, reason?: string)

// Audit Logs
getAuditLogs(params: AuditLogParams)
getAuditLogById(id: string)

// Statistics
getPlatformStats()
getUserStats(period)
```

### Methods to Add (In Priority Order)

#### Phase 1 Priority
```typescript
// Orders
getOrders(params: AdminOrderQueryDto)
getOrderById(id: string)
updateOrderStatus(orderId: string, dto: AdminUpdateOrderStatusDto)
cancelOrder(orderId: string, dto: CancelOrderDto)
getOrderStats(params)

// Reviews
getPendingReviews(params)
getFlaggedReviews(params)
moderateReview(reviewId: string, dto: ModerateReviewDto)
getReviewReports(params)
resolveReviewReport(reportId: string, resolution, status)
deleteReview(reviewId: string, reason?: string)
createPlatformResponse(reviewId: string, dto)
bulkModerateReviews(dto: BulkModerateReviewsDto)

// Subscriptions
getSubscriptions(params: AdminSubscriptionQueryDto)
getSubscriptionById(id: string)
changeSubscriptionTier(subscriptionId: string, dto)
extendSubscription(subscriptionId: string, dto)
cancelSubscription(subscriptionId: string, reason?: string)
getSubscriptionStats(params)
```

---

## Type Definitions Needed

### Create/Update in Admin Types
```typescript
// admin.ts types file should include:

// Orders
AdminOrderQueryDto
AdminUpdateOrderStatusDto
CancelOrderDto

// Reviews
ModerateReviewDto
BulkModerateReviewsDto

// Subscriptions
AdminSubscriptionQueryDto
ChangeSubscriptionTierDto
ExtendSubscriptionDto

// Disputes
DisputeQueryDto
ResolveDisputeDto
UpdateDisputeStatusDto

// Notifications
SendBulkNotificationDto
NotificationStatsQueryDto

// Settings
UpdateSettingsDto
BulkUpdateSettingsDto

// Feature Flags
CreateFeatureFlagDto
UpdateFeatureFlagDto
```

---

## Testing Checklist

### Before Deploying Each Feature

- [ ] Test with valid JWT token
- [ ] Test with invalid/expired token (should fail)
- [ ] Test with non-admin role (should fail)
- [ ] Test pagination (page, limit parameters)
- [ ] Test filtering (all filter options)
- [ ] Test sorting (all sort options)
- [ ] Test error handling (show user-friendly messages)
- [ ] Test loading states (skeleton loaders)
- [ ] Test empty states (no data message)
- [ ] Test form validation
- [ ] Test bulk operations (rate limiting)
- [ ] Check console for API errors
- [ ] Verify audit logs are recorded

---

## Security Checklist

All endpoints require:
- [ ] JwtAuthGuard (validates JWT token)
- [ ] RolesGuard (validates ADMIN role)
- [ ] Input validation (server + client side)
- [ ] Rate limiting (throttle decorator applied)
- [ ] Error handling (no sensitive data in responses)
- [ ] HTTPS/TLS (in production)
- [ ] CSRF protection (verified in middleware)
- [ ] Audit logging (all admin actions logged)

**Note:** All security measures are already implemented in backend

---

## Quick API Reference

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.hummii.ca/api/v1
```

### Headers Required
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Common Query Parameters
```
page: number (1-based, default: 1)
limit: number (default: 20, max: 100)
search: string (partial match search)
sortBy: string (field name)
sortOrder: 'asc' | 'desc'
```

### Response Format
```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Useful Resources

### API Documentation
- Backend Swagger UI: `http://localhost:3000/api/docs`
- API Endpoints Analysis: `docs/API_ENDPOINTS_ANALYSIS.md`
- Admin Controller Source: `api/src/admin/admin.controller.ts`

### Frontend Components
- Admin Client: `admin/src/lib/api/admin-client.ts`
- Layout Component: `admin/src/components/layouts/AdminLayout.tsx`
- Query Provider: `admin/src/providers/QueryProvider.tsx`

### Testing
- Run admin in dev: `cd admin && npm run dev`
- Run API in dev: `cd api && npm run start:dev`
- Mock data toggle: `admin/src/lib/api/admin-client.ts` line 18 (`USE_MOCK_DATA`)

---

## Contact & Support

For questions about API endpoints:
1. Check `API_ENDPOINTS_ANALYSIS.md` (detailed reference)
2. Review controller source files in `api/src/admin/`
3. Check Swagger UI documentation at `/api/docs`
4. Review existing implementations in `admin/src/app/admin/`

