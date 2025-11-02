# Protected Actions Flow Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Button     │  │   Button     │  │   Button     │         │
│  │ Create Order │  │ Send Message │  │ Apply Order  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                    │
│                           ▼                                    │
│              ┌────────────────────────┐                        │
│              │  useProtectedAction    │                        │
│              │       Hook             │                        │
│              └────────────┬───────────┘                        │
│                           │                                    │
│              ┌────────────┴────────────┐                       │
│              │                         │                       │
│         ✅ Authenticated?        ❌ Not Authenticated          │
│              │                         │                       │
│              │                         ▼                       │
│              │              ┌──────────────────┐               │
│              │              │   AuthModal      │               │
│              │              │  - Show reason   │               │
│              │              │  - Register btn  │               │
│              │              │  - Login btn     │               │
│              │              └──────────────────┘               │
│              │                                                 │
│              ▼                                                 │
│    ┌─────────────────┐                                        │
│    │ Has Required    │                                        │
│    │     Role?       │                                        │
│    └────┬────────┬───┘                                        │
│         │        │                                            │
│    ✅ Yes   ❌ No                                              │
│         │        │                                            │
│         │        └───► Show Error / Callback                  │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │   Execute   │                                             │
│  │  Callback   │                                             │
│  └──────┬──────┘                                             │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API REQUEST                              │
│                                                                 │
│  POST /api/v1/orders                                            │
│  Headers: Cookie (JWT token in HTTP-only cookie)               │
│                                                                 │
│                           │                                     │
│                           ▼                                     │
│              ┌────────────────────────┐                        │
│              │    JwtAuthGuard        │                        │
│              │  Validate JWT Token    │                        │
│              └────────────┬───────────┘                        │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              │                         │                       │
│         ✅ Valid Token           ❌ Invalid Token               │
│              │                         │                       │
│              │                         ▼                       │
│              │              ┌──────────────────┐               │
│              │              │ 401 Unauthorized │               │
│              │              │ code: SESSION_   │               │
│              │              │      EXPIRED     │               │
│              │              └──────────────────┘               │
│              │                                                 │
│              ▼                                                 │
│    ┌─────────────────┐                                        │
│    │   RolesGuard    │                                        │
│    │  Check User     │                                        │
│    │     Role        │                                        │
│    └────┬────────┬───┘                                        │
│         │        │                                            │
│    ✅ Has Role  ❌ No Role                                      │
│         │        │                                            │
│         │        ▼                                            │
│         │    ┌──────────────────┐                            │
│         │    │ 403 Forbidden    │                            │
│         │    │ code: INSUFFICIENT│                           │
│         │    │      _ROLE       │                            │
│         │    └──────────────────┘                            │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │  Execute    │                                             │
│  │  Endpoint   │                                             │
│  │  Logic      │                                             │
│  └──────┬──────┘                                             │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │ 200/201 OK  │                                             │
│  │  Response   │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed User Flow

### Scenario 1: User NOT Authenticated

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: User clicks "Create Order" button                   │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: useProtectedAction checks isAuthenticated           │
│  Result: false ❌                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Show AuthModal                                      │
│  - Display reason: "To create an order"                      │
│  - Display action: "You need to register as a client"       │
│  - Buttons: [Create Account] [Sign In]                      │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: User clicks "Create Account"                        │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Save current URL to sessionStorage                  │
│  sessionStorage.setItem('redirect_after_auth', '/orders')    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 6: Redirect to /register                               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 7: User fills registration form and submits            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 8: After successful registration                        │
│  - Read redirect path from sessionStorage                    │
│  - Clear sessionStorage                                      │
│  - Redirect to /orders (saved path)                         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 9: User is now on /orders page                         │
│  User can create order ✅                                    │
└──────────────────────────────────────────────────────────────┘
```

### Scenario 2: User Authenticated, Correct Role

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: User clicks "Create Order" button                   │
│  User state: { authenticated: true, role: 'CLIENT' }        │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: useProtectedAction checks                           │
│  - isAuthenticated: true ✅                                  │
│  - hasRole(['CLIENT']): true ✅                              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Execute callback immediately                         │
│  router.push('/orders/create')                               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: User redirected to order creation page              │
│  No modal shown ✅                                           │
└──────────────────────────────────────────────────────────────┘
```

### Scenario 3: User Authenticated, Wrong Role

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: CONTRACTOR clicks "Create Order" button             │
│  User state: { authenticated: true, role: 'CONTRACTOR' }    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: useProtectedAction checks                           │
│  - isAuthenticated: true ✅                                  │
│  - hasRole(['CLIENT']): false ❌                             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Callback NOT executed                               │
│  Call onInsufficientRole callback (if provided)              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Show error message                                  │
│  "You need to be a CLIENT to perform this action"           │
└──────────────────────────────────────────────────────────────┘
```

## Error Code Flow

### AUTH_REQUIRED (401)

```
API Call without token
         ↓
JwtAuthGuard fails
         ↓
Return 401 with code: AUTH_REQUIRED
         ↓
apiClient intercepts
         ↓
Check error.code === 'AUTH_REQUIRED'
         ↓
Dispatch 'auth:required' event
         ↓
Can be caught globally to show modal
```

### INSUFFICIENT_ROLE (403)

```
API Call with valid token but wrong role
         ↓
RolesGuard checks role
         ↓
User role doesn't match required roles
         ↓
Return 403 with code: INSUFFICIENT_ROLE
         ↓
apiClient intercepts
         ↓
Show error toast with role details
```

## Component Hierarchy

```
Page Component
│
├─ CreateOrderButton (or any protected component)
│  │
│  ├─ useProtectedAction hook
│  │  ├─ useAuthStore (check auth state)
│  │  ├─ useState (modal state)
│  │  └─ useCallback (execute function)
│  │
│  ├─ button (onClick handler)
│  │
│  └─ AuthModal
│     ├─ Backdrop (onClick close)
│     ├─ Modal Container
│     │  ├─ Close Button
│     │  ├─ Icon
│     │  ├─ Title
│     │  ├─ Description (reason + action)
│     │  ├─ Action Buttons
│     │  │  ├─ Create Account Button
│     │  │  └─ Sign In Button
│     │  └─ Benefits List
│     │
│     └─ useEffect (prevent body scroll)
```

## State Management

```
┌─────────────────────────────────────┐
│     Zustand Auth Store              │
│  (frontend/lib/store/auth-store.ts) │
├─────────────────────────────────────┤
│ State:                              │
│ - isAuthenticated: boolean          │
│ - user: {                           │
│     id: string                      │
│     email: string                   │
│     name: string                    │
│     role: UserRole                  │
│   } | null                          │
├─────────────────────────────────────┤
│ Actions:                            │
│ - setUser(user)                     │
│ - logout()                          │
└─────────────────────────────────────┘
           ↕ Used by
┌─────────────────────────────────────┐
│   useProtectedAction Hook           │
├─────────────────────────────────────┤
│ Reads:                              │
│ - isAuthenticated                   │
│ - user.role                         │
└─────────────────────────────────────┘
```

## Session Storage

```
┌─────────────────────────────────────────┐
│   Browser sessionStorage                │
├─────────────────────────────────────────┤
│ Key: 'redirect_after_auth'              │
│ Value: '/orders/create'                 │
├─────────────────────────────────────────┤
│ Lifecycle:                              │
│ 1. Set: When modal opens               │
│ 2. Read: After login/register           │
│ 3. Clear: After redirect                │
│ 4. Expires: When browser tab closes     │
└─────────────────────────────────────────┘
```

---

**Legend:**
- ✅ = Success / Allowed
- ❌ = Failure / Denied
- ↓ = Flow direction
- │ = Hierarchy / Connection

