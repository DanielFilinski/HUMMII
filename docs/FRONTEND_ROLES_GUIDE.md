# Frontend Role Integration Guide - Hummii Platform

**Date:** January 2025  
**Status:** ✅ Complete  
**Version:** 1.0

---

## 📋 Overview

This guide explains how to use the role-based access control (RBAC) system on the frontend of Hummii platform.

---

## 🎭 Available Roles

- **CLIENT** - Users who create orders and hire contractors
- **CONTRACTOR** - Service providers who respond to orders
- **ADMIN** - Platform administrators with full access

---

## 🛠️ Implementation Components

### 1. **useRole() Hook**

Located: `frontend/hooks/use-role.ts`

Custom hook for checking user roles in components.

```typescript
import { useRole } from '@/hooks/use-role';

function MyComponent() {
  const { role, hasRole, isClient, isContractor, isAdmin } = useRole();

  // Check specific role
  if (isAdmin()) {
    return <AdminPanel />;
  }

  // Check multiple roles
  if (hasRole(['CLIENT', 'CONTRACTOR'])) {
    return <OrdersList />;
  }

  // Get current role
  console.log(role); // 'CLIENT' | 'CONTRACTOR' | 'ADMIN' | undefined

  return <div>Content</div>;
}
```

**Available methods:**
- `role` - Current user role (or undefined)
- `hasRole(roles)` - Check if user has one of the roles
- `isClient()` - Check if user is CLIENT
- `isContractor()` - Check if user is CONTRACTOR
- `isAdmin()` - Check if user is ADMIN
- `hasAnyRole(...roles)` - Check if user has any of the roles
- `isAuthenticated` - Check if user is logged in

---

### 2. **RoleGuard Component**

Located: `frontend/components/auth/role-guard.tsx`

Protects entire pages/sections based on roles.

```typescript
import { RoleGuard } from '@/components/auth/role-guard';

// Basic usage - redirect if no access
export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminPanel />
    </RoleGuard>
  );
}

// With custom fallback
export default function OrdersPage() {
  return (
    <RoleGuard 
      allowedRoles={['CLIENT', 'CONTRACTOR']}
      showFallback={true}
      fallback={<div>You need to be logged in</div>}
    >
      <OrdersList />
    </RoleGuard>
  );
}

// HOC version
import { withRoleGuard } from '@/components/auth/role-guard';

function AdminPage() {
  return <div>Admin Content</div>;
}

export default withRoleGuard(AdminPage, ['ADMIN']);
```

**Props:**
- `allowedRoles` - Array of roles that can access the content
- `redirectTo` - Redirect path if no access (default: '/login')
- `fallback` - Component to show instead of content
- `showFallback` - Show fallback instead of redirecting

---

### 3. **RequireRole Component**

Located: `frontend/components/auth/require-role.tsx`

Inline conditional rendering based on roles (doesn't redirect).

```typescript
import { RequireRole, OnlyFor, HideFor } from '@/components/auth/require-role';

function Dashboard() {
  return (
    <div>
      {/* Show button only for ADMIN */}
      <RequireRole roles="ADMIN">
        <button>Delete User</button>
      </RequireRole>

      {/* Show for CLIENT and CONTRACTOR */}
      <RequireRole roles={['CLIENT', 'CONTRACTOR']}>
        <button>Create Order</button>
      </RequireRole>

      {/* Alternative: OnlyFor single role */}
      <OnlyFor role="ADMIN">
        <AdminButton />
      </OnlyFor>

      {/* Alternative: Hide for specific role */}
      <HideFor role="ADMIN">
        <UpgradeButton />
      </HideFor>
    </div>
  );
}
```

---

### 4. **Middleware Protection**

Located: `frontend/middleware.ts`

Protects routes at the Next.js middleware level.

**Protected routes defined:**
```typescript
const protectedRoutes = {
  '/admin': ['ADMIN'],
  '/contractor/dashboard': ['CONTRACTOR', 'ADMIN'],
  '/contractor/services': ['CONTRACTOR', 'ADMIN'],
  '/orders/create': ['CLIENT', 'ADMIN'],
};
```

**How it works:**
1. Checks if route is protected
2. Gets user role from `auth-storage` cookie
3. Verifies user has required role
4. Redirects to login if not authenticated
5. Redirects to home if insufficient permissions

---

### 5. **API Client Error Handling**

Located: `frontend/lib/api/client.ts`

Automatically handles role-related API errors.

**Error handling:**
- **401 Unauthorized** - Clears auth, redirects to login
- **403 Forbidden** - Shows error toast, stays on page
- **404 Not Found** - Throws error
- **429 Too Many Requests** - Shows rate limit warning
- **500 Server Error** - Shows server error message

```typescript
import { apiClient } from '@/lib/api/client';

// API requests automatically handle errors
try {
  const users = await apiClient.get('/admin/users');
  // Success
} catch (error) {
  // 403 error already shown to user via toast
  // Error already logged
}
```

---

## 📝 Usage Examples

### Example 1: Navbar with Role-Based Links

```typescript
// components/layouts/navbar.tsx
'use client';

import { useRole } from '@/hooks/use-role';
import Link from 'next/link';

export function Navbar() {
  const { isAdmin, isContractor, isClient } = useRole();

  return (
    <nav className="flex gap-4">
      <Link href="/">Home</Link>

      {/* CLIENT only */}
      {isClient() && (
        <Link href="/orders/create">Create Order</Link>
      )}

      {/* CONTRACTOR only */}
      {isContractor() && (
        <>
          <Link href="/contractor/dashboard">Dashboard</Link>
          <Link href="/contractor/services">My Services</Link>
        </>
      )}

      {/* ADMIN only */}
      {isAdmin() && (
        <Link href="/admin">Admin Panel</Link>
      )}

      {/* CLIENT and CONTRACTOR */}
      {(isClient() || isContractor()) && (
        <Link href="/orders">Browse Orders</Link>
      )}
    </nav>
  );
}
```

---

### Example 2: Conditional Button Rendering

```typescript
// components/orders/order-card.tsx
'use client';

import { useRole } from '@/hooks/use-role';
import { RequireRole } from '@/components/auth/require-role';

export function OrderCard({ order }) {
  const { isContractor } = useRole();

  return (
    <div className="border p-4 rounded">
      <h3>{order.title}</h3>
      <p>{order.description}</p>

      {/* Only CONTRACTOR can apply */}
      <RequireRole roles="CONTRACTOR">
        <button 
          onClick={() => applyToOrder(order.id)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply to Order
        </button>
      </RequireRole>

      {/* Only order owner (CLIENT) can edit */}
      {order.clientId === user?.id && (
        <button 
          onClick={() => editOrder(order.id)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Edit Order
        </button>
      )}
    </div>
  );
}
```

---

### Example 3: Protected Admin Page

```typescript
// app/[locale]/admin/users/page.tsx
'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { useRole } from '@/hooks/use-role';

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div>
        <h1>User Management</h1>
        <UsersList />
      </div>
    </RoleGuard>
  );
}

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // API call will auto-handle 403 if user loses admin role
    apiClient.get('/admin/users')
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <table>
      {/* User table */}
    </table>
  );
}
```

---

### Example 4: Dynamic Menu Based on Role

```typescript
// components/layouts/sidebar.tsx
'use client';

import { useRole } from '@/hooks/use-role';
import Link from 'next/link';

export function Sidebar() {
  const { role, hasRole } = useRole();

  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/', 
      roles: ['CLIENT', 'CONTRACTOR', 'ADMIN'] 
    },
    { 
      label: 'Create Order', 
      href: '/orders/create', 
      roles: ['CLIENT'] 
    },
    { 
      label: 'My Services', 
      href: '/contractor/services', 
      roles: ['CONTRACTOR'] 
    },
    { 
      label: 'Portfolio', 
      href: '/contractor/portfolio', 
      roles: ['CONTRACTOR'] 
    },
    { 
      label: 'Admin Panel', 
      href: '/admin', 
      roles: ['ADMIN'] 
    },
    { 
      label: 'User Management', 
      href: '/admin/users', 
      roles: ['ADMIN'] 
    },
  ];

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav>
        {menuItems
          .filter(item => hasRole(item.roles))
          .map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              className="block py-2 px-4 hover:bg-gray-200 rounded"
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
```

---

## 🔒 Security Best Practices

### ✅ Always Protect on Both Sides

```typescript
// ❌ BAD - Only frontend protection
<RequireRole roles="ADMIN">
  <button onClick={deleteUser}>Delete</button>
</RequireRole>

// ✅ GOOD - Frontend + Backend protection
<RequireRole roles="ADMIN">
  <button onClick={deleteUser}>Delete</button>
</RequireRole>

// Backend (API) also checks:
// @Roles(UserRole.ADMIN)
// @Delete('users/:id')
```

### ✅ Never Trust Client-Side Checks

```typescript
// ❌ BAD - Relies only on frontend
if (role === 'ADMIN') {
  // Make admin API call without backend verification
}

// ✅ GOOD - Backend always verifies
// Frontend shows UI, backend enforces security
const response = await apiClient.delete(`/admin/users/${id}`);
// Backend RolesGuard will return 403 if not admin
```

### ✅ Handle 403 Errors Gracefully

```typescript
// ✅ GOOD - Show user-friendly error
try {
  await apiClient.post('/admin/users', data);
  toast.success('User created');
} catch (error) {
  // API client already showed error toast for 403
  // Just handle the failure state
  console.error('Failed to create user:', error);
}
```

---

## 🧪 Testing

### Test Role Checks

```typescript
// __tests__/hooks/use-role.test.ts
import { renderHook } from '@testing-library/react';
import { useRole } from '@/hooks/use-role';

describe('useRole', () => {
  it('returns correct role for admin user', () => {
    // Mock auth store with ADMIN user
    const { result } = renderHook(() => useRole());
    
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isClient()).toBe(false);
    expect(result.current.hasRole(['ADMIN'])).toBe(true);
  });
});
```

### Test Protected Routes

```typescript
// __tests__/middleware.test.ts
import { middleware } from '@/middleware';

describe('Middleware role protection', () => {
  it('redirects non-admin users from /admin', () => {
    const request = new NextRequest('/admin/users');
    // Mock CLIENT user in cookies
    
    const response = middleware(request);
    
    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('location')).toContain('/?error=access_denied');
  });
});
```

---

## 📊 Role Matrix

| Route | CLIENT | CONTRACTOR | ADMIN |
|-------|--------|------------|-------|
| `/` | ✅ | ✅ | ✅ |
| `/orders` | ✅ | ✅ | ✅ |
| `/orders/create` | ✅ | ❌ | ✅ |
| `/contractor/dashboard` | ❌ | ✅ | ✅ |
| `/contractor/services` | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ✅ |
| `/admin/users` | ❌ | ❌ | ✅ |

---

## ✅ Checklist

Frontend integration is complete when:

- [x] ✅ `useRole()` hook created
- [x] ✅ `RoleGuard` component created
- [x] ✅ `RequireRole` component created
- [x] ✅ Middleware protects routes
- [x] ✅ API client handles 403 errors
- [x] ✅ Types updated for strict role typing
- [x] ✅ Documentation created
- [ ] ⏳ Tests added for role checks
- [ ] ⏳ E2E tests for protected routes

---

## 🚀 Quick Start

1. **Use in a component:**
```typescript
import { useRole } from '@/hooks/use-role';

const { isAdmin } = useRole();
if (isAdmin()) {
  // Show admin content
}
```

2. **Protect a page:**
```typescript
import { RoleGuard } from '@/components/auth/role-guard';

<RoleGuard allowedRoles={['ADMIN']}>
  <YourPage />
</RoleGuard>
```

3. **Conditional rendering:**
```typescript
import { RequireRole } from '@/components/auth/require-role';

<RequireRole roles="CONTRACTOR">
  <ContractorButton />
</RequireRole>
```

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready

