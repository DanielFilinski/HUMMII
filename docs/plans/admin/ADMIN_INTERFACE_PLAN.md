# План реализации интерфейса Admin панели

**Версия:** 1.0  
**Дата создания:** 6 января 2025  
**Статус:** 📋 Планирование  
**Приоритет:** 🟡 HIGH

---

## 🎯 Цели и требования

### Дизайн-требования
- **Современный интерфейс** - использование актуальных UI паттернов и best practices
- **Красивый и лаконичный** - минималистичный дизайн без перегруженности
- **Плавные анимации** - все переходы и взаимодействия с плавными анимациями (framer-motion)
- **Адаптивность** - полная поддержка desktop, tablet, mobile
- **Темная тема** - поддержка dark mode (опционально)

### Технические требования
- **Next.js 14** (App Router) - уже настроен
- **Refine.dev** - admin framework (уже интегрирован)
- **Ant Design 5** - UI компоненты (уже установлен)
- **Framer Motion** - для анимаций (нужно добавить)
- **TypeScript** - строгая типизация (strict mode, no `any`)
- **@tanstack/react-query** - для server state management
- **React Hook Form + Zod** - для форм и валидации
- **Zustand** - для client state (если требуется)
- **DOMPurify** - для sanitization HTML
- **Tailwind CSS** - для кастомных стилей (опционально)

### Backend интеграция
- **API Base URL:** `http://localhost:3000/api/v1` (через env переменную)
- **Endpoints:** 52+ admin endpoints уже реализованы
- **Authentication:** JWT через **HTTP-only cookies** (backend устанавливает)
- **Role-based access:** ADMIN role required (проверка на backend)
- **CORS:** Настроен на backend (whitelist domains)
- **Rate limiting:** Настроен на backend (уже реализовано)

---

## 📦 Структура независимых блоков

План разделен на **8 независимых блоков**, которые можно разрабатывать параллельно:

1. **Блок 1: Базовая инфраструктура** (Layout, Navigation, Auth)
2. **Блок 2: Dashboard & Analytics**
3. **Блок 3: User Management**
4. **Блок 4: Moderation Queues**
5. **Блок 5: Dispute Resolution**
6. **Блок 6: System Settings & Feature Flags**
7. **Блок 7: Audit Logs Viewer**
8. **Блок 8: Notifications Management**

---

## 🏗️ Блок 1: Базовая инфраструктура

**Приоритет:** 🔴 CRITICAL  
**Время:** 3-4 дня  
**Зависимости:** Нет

### 1.1 Layout & Navigation

**Цель:** Создать основной layout с навигацией и sidebar

#### Задачи:
- [ ] **1.1.1** Создать основной Layout компонент
  - Sidebar с навигацией
  - Header с user menu и notifications
  - Main content area
  - Responsive design (mobile menu)

- [ ] **1.1.2** Реализовать Sidebar Navigation
  - Иконки для каждого раздела
  - Активное состояние с анимацией
  - Collapsible groups
  - Плавные переходы при переключении

- [ ] **1.1.3** Создать Header компонент
  - Breadcrumbs
  - User dropdown menu
  - Notifications bell (badge с количеством)
  - Search bar (глобальный поиск)

- [ ] **1.1.4** Добавить анимации для Layout
  - Плавное появление sidebar
  - Fade-in для content
  - Smooth transitions между страницами

**Файлы:**
```
admin/src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileMenu.tsx
│   └── common/
│       ├── Breadcrumbs.tsx
│       └── UserMenu.tsx
```

### 1.2 Authentication

**Цель:** Реализовать систему аутентификации для админов

#### Задачи:
- [ ] **1.2.1** Создать Login страницу
  - Красивый дизайн с анимацией
  - Валидация формы с **Zod** (email, password min 12 chars, complexity requirements)
  - **React Hook Form** для управления формой
  - Error handling (не показывать детальные ошибки безопасности)
  - Loading states
  - **Rate limiting на клиенте** (debounce submit button)
  - **Password visibility toggle** (безопасный)
  - **2FA input field** (TOTP code)
  - **Login attempt counter** (показывать оставшиеся попытки)
  - **CAPTCHA** после 3 неудачных попыток (защита от ботов)
  - **Device fingerprinting** (скрыто, для security)
  - **"Remember this device"** checkbox (только для trusted devices)

- [ ] **1.2.2** Реализовать Auth Provider для Refine
  - **JWT token handling через HTTP-only cookies** (backend устанавливает)
  - **НИКОГДА не хранить токены в localStorage/sessionStorage** (XSS уязвимость)
  - HTTP-only cookies support (automatic с credentials: 'include')
  - Role verification (ADMIN only) - проверка на backend
  - Auto-refresh token перед истечением
  - **Session timeout** (30 минут неактивности → logout, warning на 15 минут)
  - **Token refresh interceptor** для автоматического обновления
  - **2FA verification** перед доступом к admin панели
  - **Activity tracking** (mouse, keyboard для продления сессии)
  - **Concurrent session management** (максимум 2 сессии)
  - **Device management** (список устройств, возможность отозвать доступ)

- [ ] **1.2.3** Создать Protected Route wrapper
  - Redirect на login если не авторизован
  - Role check guard (ADMIN role required)
  - Loading state во время проверки
  - **Error boundary** для обработки ошибок аутентификации

- [ ] **1.2.4** Реализовать Logout функционал
  - **Clear HTTP-only cookies** (через API endpoint)
  - Clear client-side state
  - Redirect на login
  - Success notification
  - **Не логировать токены** при logout

**Файлы:**
```
admin/src/
├── app/
│   └── login/
│       └── page.tsx
├── providers/
│   ├── auth-provider.ts (обновить)
│   ├── auth-context.tsx
│   └── 2fa-provider.tsx (новый)
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── TwoFactorForm.tsx (новый)
│       ├── DeviceFingerprint.tsx (новый)
│       └── SessionWarning.tsx (новый)
└── lib/
    └── security/
        ├── device-fingerprint.ts (новый)
        ├── activity-tracker.ts (новый)
        └── session-manager.ts (новый)
```

### 1.3 Common Components

**Цель:** Создать переиспользуемые компоненты

#### Задачи:
- [ ] **1.3.1** Создать Loading компоненты
  - Page loader с анимацией
  - Skeleton loaders для таблиц
  - Button loading states

- [ ] **1.3.2** Создать Error компоненты
  - Error boundary
  - Error page (404, 403, 500)
  - Error notifications

- [ ] **1.3.3** Создать Empty States
  - Empty table state
  - No results state
  - Empty search results

**Файлы:**
```
admin/src/
├── components/
│   └── common/
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── SkeletonLoader.tsx
```

**Критерии приемки:**
- ✅ Layout работает на всех устройствах
- ✅ Navigation плавно переключается между разделами
- ✅ Authentication работает с backend API
- ✅ **2FA обязательна для admin аккаунтов**
- ✅ **Login attempt tracking работает**
- ✅ **Session timeout с warning работает**
- ✅ **Device fingerprinting работает**
- ✅ Все анимации плавные (60fps)
- ✅ Responsive design протестирован
- ✅ **Security headers настроены**
- ✅ **Rate limiting работает корректно**

---

## 📊 Блок 2: Dashboard & Analytics

**Приоритет:** 🟡 HIGH  
**Время:** 4-5 дней  
**Зависимости:** Блок 1

### 2.1 Dashboard Overview

**Цель:** Создать главную страницу с ключевыми метриками

#### Задачи:
- [ ] **2.1.1** Создать Dashboard страницу
  - Grid layout с карточками метрик
  - Real-time обновление данных
  - Animated counters для чисел
  - Color-coded indicators

- [ ] **2.1.2** Реализовать Stat Cards
  - Total Users (с иконкой и трендом)
  - Active Orders (с процентным изменением)
  - Revenue (с графиком мини)
  - Pending Moderation (с badge)
  - Active Disputes (с цветовым индикатором)

- [ ] **2.1.3** Добавить анимации
  - Fade-in для карточек (stagger animation)
  - Number counting animation
  - Hover effects
  - Loading skeletons

**API Endpoints:**
- `GET /admin/stats` - Overview statistics
- `GET /admin/stats/users` - User statistics

**Файлы:**
```
admin/src/
├── app/
│   └── dashboard/
│       └── page.tsx
└── components/
    └── dashboard/
        ├── StatCard.tsx
        ├── MetricCard.tsx
        └── DashboardGrid.tsx
```

### 2.2 Analytics Charts

**Цель:** Визуализация данных через графики

#### Задачи:
- [ ] **2.2.1** Интегрировать Chart библиотеку
  - Recharts или Chart.js
  - Responsive charts
  - Custom tooltips

- [ ] **2.2.2** Создать User Growth Chart
  - Line chart с трендом
  - Date range picker
  - Export functionality

- [ ] **2.2.3** Создать Revenue Chart
  - Area chart
  - Monthly/Weekly/Daily views
  - Interactive legend

- [ ] **2.2.4** Создать Order Status Distribution
  - Pie/Doughnut chart
  - Animated transitions
  - Click to filter

- [ ] **2.2.5** Создать Activity Timeline
  - Timeline компонент
  - Recent activities
  - Filter by type

**API Endpoints:**
- `GET /admin/analytics/overview` - Overview analytics
- `GET /admin/analytics/users` - User analytics
- `GET /admin/analytics/orders` - Order analytics
- `GET /admin/analytics/revenue` - Revenue analytics

**Файлы:**
```
admin/src/
├── components/
│   └── analytics/
│       ├── UserGrowthChart.tsx
│       ├── RevenueChart.tsx
│       ├── OrderStatusChart.tsx
│       ├── ActivityTimeline.tsx
│       └── DateRangePicker.tsx
└── lib/
    └── charts/
        └── chart-config.ts
```

### 2.3 Real-time Updates

**Цель:** Обновление данных в реальном времени

#### Задачи:
- [ ] **2.3.1** Настроить WebSocket подключение
  - Socket.io client
  - Reconnection logic
  - Error handling

- [ ] **2.3.2** Реализовать real-time updates для метрик
  - Auto-refresh каждые 30 секунд
  - Smooth number transitions
  - Notification для значительных изменений

**Критерии приемки:**
- ✅ Dashboard отображает все ключевые метрики
- ✅ Графики интерактивны и responsive
- ✅ Анимации плавные и не мешают работе
- ✅ Real-time updates работают корректно
- ✅ Date range picker функционален

---

## 👥 Блок 3: User Management

**Приоритет:** 🟡 HIGH  
**Время:** 5-6 дней  
**Зависимости:** Блок 1

### 3.1 User List & Search

**Цель:** Список пользователей с продвинутым поиском

#### Задачи:
- [ ] **3.1.1** Создать User List страницу
  - Table с сортировкой
  - Pagination
  - Row selection
  - Bulk actions

- [ ] **3.1.2** Реализовать Advanced Search
  - Search bar (email, name, phone) с **валидацией** (Zod)
  - **Input sanitization** (защита от XSS)
  - Filters (role, status, verified, suspended)
  - Date range filter с валидацией
  - Saved filters (безопасное хранение в localStorage, только non-sensitive data)
  - **Rate limiting** на поисковые запросы (debounce 300ms)

- [ ] **3.1.3** Добавить анимации
  - Smooth table row animations
  - Filter panel slide-in
  - Loading skeleton
  - Empty state animation

**API Endpoints:**
- `GET /admin/users` - List users with filters

**Файлы:**
```
admin/src/
├── app/
│   └── users/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
└── components/
    └── users/
        ├── UserList.tsx
        ├── UserTable.tsx
        ├── UserSearch.tsx
        └── UserFilters.tsx
```

### 3.2 User Detail View

**Цель:** Детальный просмотр профиля пользователя

#### Задачи:
- [ ] **3.2.1** Создать User Detail страницу
  - Tabs для разных секций
  - Profile info
  - Orders history
  - Reviews received
  - Audit logs

- [ ] **3.2.2** Реализовать Profile Tab
  - User information (**masked PII** - email, phone согласно PIPEDA)
  - Verification status
  - Subscription info
  - Statistics
  - **Не отображать пароли, токены, sensitive data**

- [ ] **3.2.3** Реализовать Orders Tab
  - List of orders
  - Status indicators
  - Quick actions

- [ ] **3.2.4** Реализовать Reviews Tab
  - Reviews received
  - Ratings breakdown
  - Moderation actions

**API Endpoints:**
- `GET /admin/users/:id` - Get user details

**Файлы:**
```
admin/src/
└── components/
    └── users/
        ├── UserDetail.tsx
        ├── UserProfileTab.tsx
        ├── UserOrdersTab.tsx
        └── UserReviewsTab.tsx
```

### 3.3 User Actions

**Цель:** Действия над пользователями (ban, verify, suspend)

#### Задачи:
- [ ] **3.3.1** Создать Action Modal
  - Select action type
  - **Reason input с валидацией** (Zod: min 10, max 500 chars)
  - **Input sanitization** (защита от XSS в reason)
  - Expiration date (для suspend) с валидацией
  - Notify user checkbox
  - **Confirmation dialog** для критических действий (ban, delete)
  - **Не логировать sensitive data** в reason

- [ ] **3.3.2** Реализовать Bulk Actions
  - Multi-select
  - Bulk action dropdown
  - Confirmation dialog
  - Progress indicator

- [ ] **3.3.3** Добавить анимации
  - Modal slide-in
  - Success/Error notifications
  - Row update animation

**API Endpoints:**
- `POST /admin/users/:id/actions` - Perform user action
- `PATCH /admin/users/:id/lock` - Lock user
- `PATCH /admin/users/:id/unlock` - Unlock user
- `DELETE /admin/users/:id` - Soft delete user

**Файлы:**
```
admin/src/
└── components/
    └── users/
        ├── UserActionModal.tsx
        ├── BulkActions.tsx
        └── ActionConfirmation.tsx
```

**Критерии приемки:**
- ✅ User list работает с фильтрами и поиском
- ✅ User detail показывает всю информацию
- ✅ Все user actions работают корректно
- ✅ Bulk actions выполняются успешно
- ✅ Анимации плавные и информативные

---

## ✅ Блок 4: Moderation Queues

**Приоритет:** 🟡 HIGH  
**Время:** 4-5 дней  
**Зависимости:** Блок 1

### 4.1 Moderation Queue List

**Цель:** Очередь модерации контента

#### Задачи:
- [ ] **4.1.1** Создать Moderation Queue страницу
  - Tabs для разных типов контента
  - Queue list с приоритетами
  - Status indicators
  - Time in queue

- [ ] **4.1.2** Реализовать Content Type Tabs
  - Profiles (pending verification)
  - Portfolio items
  - Reviews (pending/flagged)
  - Chat messages (reported)

- [ ] **4.1.3** Добавить анимации
  - Tab switching animation
  - Queue item animations
  - Priority highlighting

**API Endpoints:**
- `GET /admin/contractors/pending` - Pending verifications
- `GET /admin/portfolio/pending` - Pending portfolio
- `GET /admin/reviews/pending` - Pending reviews
- `GET /admin/reviews/flagged` - Flagged reviews

**Файлы:**
```
admin/src/
├── app/
│   └── moderation/
│       ├── page.tsx
│       └── [type]/
│           └── page.tsx
└── components/
    └── moderation/
        ├── ModerationQueue.tsx
        ├── QueueTabs.tsx
        └── QueueItem.tsx
```

### 4.2 Content Review

**Цель:** Просмотр и модерация контента

#### Задачи:
- [ ] **4.2.1** Создать Review Modal/Drawer
  - Content preview
  - User information
  - Context (related items)
  - Action buttons

- [ ] **4.2.2** Реализовать Approval/Rejection
  - Quick approve button
  - Reject with reason
  - Flag for review
  - Skip (defer)

- [ ] **4.2.3** Добавить Keyboard Shortcuts
  - `A` - Approve
  - `R` - Reject
  - `F` - Flag
  - `→` - Next item
  - `←` - Previous item

**API Endpoints:**
- `PATCH /admin/contractors/:id/verify` - Verify contractor
- `PATCH /admin/contractors/:id/reject` - Reject verification
- `PATCH /admin/portfolio/:id/approve` - Approve portfolio
- `PATCH /admin/portfolio/:id/reject` - Reject portfolio
- `PATCH /admin/reviews/:id/approve` - Approve review
- `PATCH /admin/reviews/:id/reject` - Reject review

**Файлы:**
```
admin/src/
└── components/
    └── moderation/
        ├── ContentReview.tsx
        ├── ReviewModal.tsx
        └── ModerationActions.tsx
```

### 4.3 Bulk Moderation

**Цель:** Массовая модерация контента

#### Задачи:
- [ ] **4.3.1** Реализовать Bulk Selection
  - Checkbox selection
  - Select all
  - Selection counter

- [ ] **4.3.2** Создать Bulk Action Panel
  - Bulk approve
  - Bulk reject
  - Bulk flag
  - Confirmation dialog

- [ ] **4.3.3** Добавить Progress Indicator
  - Progress bar
  - Success/Error count
  - Retry failed items

**API Endpoints:**
- `POST /admin/moderation/bulk-action` - Bulk moderation

**Файлы:**
```
admin/src/
└── components/
    └── moderation/
        ├── BulkModeration.tsx
        └── BulkActionPanel.tsx
```

**Критерии приемки:**
- ✅ Moderation queue отображает все типы контента
- ✅ Content review работает с keyboard shortcuts
- ✅ Bulk moderation выполняет действия корректно
- ✅ Анимации делают процесс приятным

---

## ⚖️ Блок 5: Dispute Resolution

**Приоритет:** 🟡 HIGH  
**Время:** 5-6 дней  
**Зависимости:** Блок 1

### 5.1 Dispute List

**Цель:** Список споров с фильтрацией

#### Задачи:
- [ ] **5.1.1** Создать Dispute List страницу
  - Table с фильтрами
  - Status indicators
  - Priority badges
  - SLA indicators (time remaining)

- [ ] **5.1.2** Реализовать Filters
  - Status filter
  - Date range
  - Order ID search
  - Priority filter

- [ ] **5.1.3** Добавить анимации
  - Row hover effects
  - Status change animations
  - Priority pulse animation

**API Endpoints:**
- `GET /admin/disputes` - List disputes

**Файлы:**
```
admin/src/
├── app/
│   └── disputes/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
└── components/
    └── disputes/
        ├── DisputeList.tsx
        └── DisputeTable.tsx
```

### 5.2 Dispute Detail & Resolution

**Цель:** Детальный просмотр и разрешение спора

#### Задачи:
- [ ] **5.2.1** Создать Dispute Detail страницу
  - Order information
  - Evidence gallery
  - Chat history
  - Timeline of events

- [ ] **5.2.2** Реализовать Evidence Viewer
  - Image gallery
  - File preview
  - Zoom functionality
  - Download option

- [ ] **5.2.3** Создать Resolution Panel
  - Resolution type selector
  - Payment distribution slider
  - Admin notes
  - Confirmation dialog

- [ ] **5.2.4** Реализовать Resolution Types
  - Full refund to client
  - Full payment to contractor
  - Partial split (custom %)
  - Block user option

**API Endpoints:**
- `GET /admin/disputes/:id` - Get dispute details
- `POST /admin/disputes/:id/resolve` - Resolve dispute

**Файлы:**
```
admin/src/
└── components/
    └── disputes/
        ├── DisputeDetail.tsx
        ├── EvidenceViewer.tsx
        ├── ResolutionPanel.tsx
        └── PaymentDistribution.tsx
```

### 5.3 Dispute Timeline

**Цель:** Визуализация истории спора

#### Задачи:
- [ ] **5.3.1** Создать Timeline компонент
  - Vertical timeline
  - Event markers
  - Status changes
  - Evidence submissions

- [ ] **5.3.2** Добавить анимации
  - Timeline item animations
  - Status change transitions
  - Evidence upload animation

**Критерии приемки:**
- ✅ Dispute list показывает все споры с фильтрами
- ✅ Dispute detail отображает всю информацию
- ✅ Resolution работает корректно
- ✅ Timeline визуализирует историю
- ✅ Анимации улучшают UX

---

## ⚙️ Блок 6: System Settings & Feature Flags

**Приоритет:** 🟢 MEDIUM  
**Время:** 3-4 дня  
**Зависимости:** Блок 1

### 6.1 System Settings

**Цель:** Управление системными настройками

#### Задачи:
- [ ] **6.1.1** Создать Settings страницу
  - Tabs для разных категорий
  - Form validation
  - Save/Cancel buttons
  - Success notifications

- [ ] **6.1.2** Реализовать Settings Categories
  - General settings
  - Email settings
  - Payment settings
  - Notification settings

- [ ] **6.1.3** Добавить анимации
  - Form field animations
  - Save button loading state
  - Success toast animation

**API Endpoints:**
- `GET /admin/settings` - Get settings
- `PATCH /admin/settings` - Update settings
- `POST /admin/settings/bulk-update` - Bulk update

**Файлы:**
```
admin/src/
├── app/
│   └── settings/
│       └── page.tsx
└── components/
    └── settings/
        ├── SettingsPage.tsx
        ├── SettingsTabs.tsx
        └── SettingsForm.tsx
```

### 6.2 Feature Flags

**Цель:** Управление feature flags

#### Задачи:
- [ ] **6.2.1** Создать Feature Flags страницу
  - List of flags
  - Toggle switches
  - Description and impact
  - Last modified info

- [ ] **6.2.2** Реализовать Flag Management
  - Create new flag
  - Edit flag
  - Delete flag
  - Enable/Disable toggle

- [ ] **6.2.3** Добавить анимации
  - Toggle switch animation
  - Flag card animations
  - Success/Error states

**API Endpoints:**
- `GET /admin/feature-flags` - List flags
- `POST /admin/feature-flags` - Create flag
- `PATCH /admin/feature-flags/:id` - Update flag
- `DELETE /admin/feature-flags/:id` - Delete flag

**Файлы:**
```
admin/src/
└── components/
    └── settings/
        ├── FeatureFlags.tsx
        └── FeatureFlagCard.tsx
```

**Критерии приемки:**
- ✅ Settings сохраняются корректно
- ✅ Feature flags работают с toggle
- ✅ Валидация форм работает
- ✅ Анимации плавные

---

## 📋 Блок 7: Audit Logs Viewer

**Приоритет:** 🟢 MEDIUM  
**Время:** 3-4 дня  
**Зависимости:** Блок 1

### 7.1 Audit Log List

**Цель:** Просмотр audit logs с фильтрацией

#### Задачи:
- [ ] **7.1.1** Создать Audit Logs страницу
  - Table с логами
  - Advanced filters
  - Export functionality
  - Real-time updates

- [ ] **7.1.2** Реализовать Filters
  - Action type filter
  - Admin filter
  - Target user filter
  - Date range picker

- [ ] **7.1.3** Добавить анимации
  - Row animations
  - Filter panel slide
  - Export progress

**API Endpoints:**
- `GET /admin/audit-logs` - List audit logs
- `GET /admin/audit-logs/:id` - Get log details

**Файлы:**
```
admin/src/
├── app/
│   └── audit-logs/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
└── components/
    └── audit-logs/
        ├── AuditLogList.tsx
        ├── AuditLogTable.tsx
        └── AuditLogFilters.tsx
```

### 7.2 Audit Log Detail

**Цель:** Детальный просмотр audit log

#### Задачи:
- [ ] **7.2.1** Создать Log Detail Modal
  - Full log information
  - JSON viewer для metadata
  - Related logs
  - Copy to clipboard

- [ ] **7.2.2** Реализовать JSON Viewer
  - Formatted JSON
  - Expandable objects
  - Search in JSON
  - Syntax highlighting

**Критерии приемки:**
- ✅ Audit logs отображаются с фильтрами
- ✅ Export работает корректно
- ✅ JSON viewer функционален
- ✅ Анимации плавные

---

## 🔔 Блок 8: Notifications Management

**Приоритет:** 🟢 MEDIUM  
**Время:** 3-4 дня  
**Зависимости:** Блок 1

### 8.1 Notification List

**Цель:** Управление уведомлениями

#### Задачи:
- [ ] **8.1.1** Создать Notifications страницу
  - List of notifications
  - Filters (type, status, date)
  - Bulk actions
  - Send new notification

- [ ] **8.1.2** Реализовать Notification Types
  - Email notifications
  - Push notifications
  - In-app notifications
  - SMS (future)

**API Endpoints:**
- `GET /admin/notifications` - List notifications
- `POST /admin/notifications` - Send notification
- `POST /admin/notifications/bulk-send` - Bulk send

**Файлы:**
```
admin/src/
├── app/
│   └── notifications/
│       └── page.tsx
└── components/
    └── notifications/
        ├── NotificationList.tsx
        ├── SendNotification.tsx
        └── NotificationTemplates.tsx
```

### 8.2 Notification Templates

**Цель:** Управление шаблонами уведомлений

#### Задачи:
- [ ] **8.2.1** Создать Templates страницу
  - List of templates
  - Edit template
  - Preview template
  - Variables support

- [ ] **8.2.2** Реализовать Template Editor
  - Rich text editor
  - Variable insertion
  - Preview mode
  - Save/Cancel

**Критерии приемки:**
- ✅ Notifications отправляются корректно
- ✅ Templates редактируются
- ✅ Bulk send работает
- ✅ Анимации плавные

---

## 🎨 Дизайн-система и анимации

### Цветовая палитра
- **Primary:** #1890ff (Ant Design blue)
- **Success:** #52c41a
- **Warning:** #faad14
- **Error:** #ff4d4f
- **Background:** #f0f2f5
- **Text:** #262626

### Анимации (Framer Motion)

#### Общие анимации:
```typescript
// Fade in
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
}

// Slide in
const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
}

// Stagger children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}
```

#### Специфичные анимации:
- **Page transitions:** Fade + slide
- **Modal/Drawer:** Slide from side + fade
- **Table rows:** Stagger fade-in
- **Cards:** Scale on hover
- **Buttons:** Ripple effect
- **Notifications:** Slide from top
- **Loading:** Skeleton pulse

### Typography
- **Headings:** Inter или System font
- **Body:** System font stack
- **Code:** Fira Code или JetBrains Mono

### Spacing
- Использовать Ant Design spacing scale (8px base)
- Consistent padding/margins

---

## 📦 Зависимости для установки

```json
{
  "dependencies": {
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "socket.io-client": "^4.5.0",
    "react-json-view": "^1.21.0",
    "zustand": "^4.4.0",
    "dompurify": "^3.0.0",
    "@types/dompurify": "^3.0.0"
  }
}
```

---

## 🧪 Тестирование

### Unit Tests
- Компоненты с React Testing Library
- Хуки с тестами
- Утилиты

### Integration Tests
- User flows
- API интеграция
- Form submissions

### E2E Tests
- Critical paths
- Authentication flow
- User management flow

---

## 🔒 Требования безопасности (CRITICAL)

### 🛡️ Защита Admin панели от взлома (КРИТИЧНО)

#### Multi-Factor Authentication (2FA)
- [ ] **2FA обязательна для всех admin аккаунтов**
  - TOTP (Time-based One-Time Password) через Google Authenticator / Authy
  - Backup codes для восстановления
  - QR code для настройки
  - Валидация на backend (не только frontend)
  - Fallback на SMS/Email если TOTP недоступен

#### Login Security
- [ ] **Login attempt tracking**
  - Логирование всех попыток входа (успешных и неудачных)
  - IP адрес, User-Agent, timestamp
  - Блокировка после 5 неудачных попыток (15 минут)
  - Уведомление admin при подозрительной активности

- [ ] **Device fingerprinting**
  - Отслеживание устройств для входа
  - Уведомление при входе с нового устройства
  - Возможность отозвать доступ к устройству

- [ ] **IP Whitelist (опционально, рекомендуется)**
  - Whitelist IP адресов для admin доступа
  - Настройка через admin settings
  - Fallback на 2FA если IP не в whitelist
  - Логирование попыток доступа с неразрешенных IP

#### Session Management
- [ ] **Строгий session timeout**
  - 15 минут неактивности → warning
  - 30 минут неактивности → автоматический logout
  - Activity tracking (mouse movement, keyboard input)
  - "Remember me" опция (только для trusted devices, 7 дней)

- [ ] **Concurrent session control**
  - Максимум 2 активных сессии на admin аккаунт
  - Уведомление при новой сессии
  - Возможность завершить другие сессии

#### Rate Limiting (строгий для admin)
- [ ] **Login endpoint**
  - 3 попытки в минуту
  - 10 попыток в час
  - Блокировка IP после превышения

- [ ] **Admin API endpoints**
  - 50 запросов в минуту (вместо 100)
  - 200 запросов в час
  - Bulk operations: 5 в минуту
  - Critical actions (ban, delete): 3 в минуту

#### Monitoring & Alerting
- [ ] **Real-time monitoring**
  - Подозрительная активность (множественные неудачные попытки)
  - Доступ с необычных IP/геолокаций
  - Массовые операции (bulk delete, bulk ban)
  - Изменения критических настроек

- [ ] **Alerting система**
  - Email уведомления для критических событий
  - SMS уведомления для экстренных случаев
  - Dashboard с real-time alerts
  - Интеграция с monitoring системами (Sentry, DataDog)

#### Security Headers
- [ ] **Content Security Policy (CSP)**
  - Строгий CSP для admin панели
  - Whitelist только необходимые источники
  - Block inline scripts/styles
  - Report violations

- [ ] **Additional Security Headers**
  - HSTS (Strict-Transport-Security)
  - X-Frame-Options: DENY (защита от clickjacking)
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy (ограничение browser features)

#### Audit & Logging
- [ ] **Comprehensive audit logging**
  - Все admin actions логируются
  - IP адрес, User-Agent, timestamp
  - До и после значения для изменений
  - Correlation ID для tracking
  - Immutable logs (нельзя удалить/изменить)

- [ ] **Security event logging**
  - Неудачные попытки входа
  - Подозрительные запросы
  - Изменения прав доступа
  - Доступ к sensitive data
  - Export данных

#### Backup & Recovery
- [ ] **Backup procedures**
  - Ежедневные backups базы данных
  - Backup audit logs (нельзя потерять)
  - Encrypted backups
  - Offsite backup storage

- [ ] **Recovery procedures**
  - Disaster recovery plan
  - Rollback procedures для критических изменений
  - Point-in-time recovery
  - Testing recovery procedures

#### Additional Security Measures
- [ ] **WAF (Web Application Firewall)**
  - Защита от SQL injection, XSS, CSRF
  - Rate limiting на уровне WAF
  - Geo-blocking (опционально)
  - DDoS protection

- [ ] **Security scanning**
  - Регулярные security scans (Snyk, Trivy)
  - Dependency vulnerability scanning
  - Penetration testing (ежегодно)
  - Code review для security issues

- [ ] **Incident response**
  - План реагирования на инциденты
  - Процедура блокировки скомпрометированных аккаунтов
  - Уведомление пользователей при data breach
  - Post-incident review

### Authentication & Tokens
- ✅ **HTTP-only cookies** для токенов (backend устанавливает)
- ❌ **НИКОГДА не хранить токены в localStorage/sessionStorage** (XSS уязвимость)
- ✅ **Auto-refresh token** перед истечением
- ✅ **Session timeout** (30 минут неактивности, с warning на 15 минут)
- ✅ **Role verification** на backend (ADMIN only)
- ✅ **2FA обязательна** для admin аккаунтов

### Input Validation & Sanitization
- ✅ **Zod schemas** для всех форм (client-side validation)
- ✅ **React Hook Form** для управления формами
- ✅ **DOMPurify** для sanitization HTML контента
- ✅ **Backend validation** обязательна (client-side не достаточен)
- ✅ **Rate limiting** на клиенте (debounce/throttle для поиска, submit)

### PII Data Protection (PIPEDA Compliance)
- ✅ **Маскирование email** в UI: `j*******@example.com`
- ✅ **Маскирование phone** в UI: `***-***-1234`
- ✅ **Не отображать пароли, токены, sensitive data**
- ✅ **Не логировать PII** в console.log
- ✅ **Data minimization** - запрашивать только необходимые данные

### XSS & CSRF Protection
- ✅ **Sanitize user input** перед отображением
- ✅ **Не использовать dangerouslySetInnerHTML** без sanitization
- ✅ **SameSite=Strict cookies** (backend настраивает)
- ✅ **CSRF tokens** для state-changing operations (если требуется)

### Error Handling
- ✅ **Generic error messages** для пользователей
- ✅ **Не показывать stack traces** в production
- ✅ **Не логировать sensitive data** в ошибках
- ✅ **Error boundaries** для graceful degradation

### API Security
- ✅ **HTTPS only** (production)
- ✅ **Credentials: 'include'** для cookies
- ✅ **CORS** настроен на backend (whitelist domains)
- ✅ **Rate limiting** на backend (уже реализовано)
- ✅ **Строгий rate limiting для admin** (3 login/min, 50 API/min)
- ✅ **IP whitelist** для admin (опционально)
- ✅ **WAF** для защиты от атак (опционально)

### Best Practices
- ✅ **TypeScript strict mode** (no `any` types)
- ✅ **Environment variables** для API URLs (не hardcode)
- ✅ **No console.log** в production code
- ✅ **Audit logging** на backend (все admin actions)
- ✅ **Security headers** (CSP, HSTS, X-Frame-Options)
- ✅ **Monitoring & alerting** для подозрительной активности
- ✅ **Backup & recovery** procedures
- ✅ **Security scanning** регулярно

---

## 📝 Примечания

1. **Независимость блоков:** Каждый блок можно разрабатывать параллельно после завершения Блока 1
2. **API готов:** Backend API уже реализован (85%), нужно только интегрировать
3. **Приоритеты:** Блоки 1-3 имеют высокий приоритет, остальные можно делать по очереди
4. **Анимации:** Все анимации должны быть плавными (60fps) и не мешать работе
5. **Responsive:** Все компоненты должны работать на mobile, tablet, desktop
6. **Безопасность:** Все требования безопасности обязательны для PIPEDA compliance

---

## 🧪 Security Checklist

### Общие требования безопасности
- [ ] Токены НЕ хранятся в localStorage/sessionStorage
- [ ] Все формы валидируются с Zod
- [ ] PII данные маскируются в UI
- [ ] Input sanitization работает (DOMPurify)
- [ ] Rate limiting на клиенте (debounce/throttle)
- [ ] Session timeout реализован
- [ ] Error handling не раскрывает sensitive data
- [ ] HTTPS только в production
- [ ] CORS настроен правильно
- [ ] Нет console.log в production
- [ ] TypeScript strict mode включен
- [ ] Все API endpoints используют credentials: 'include'

### 🛡️ Защита Admin панели от взлома (ОБЯЗАТЕЛЬНО)
- [ ] **2FA обязательна** для всех admin аккаунтов (TOTP)
- [ ] **Login attempt tracking** работает (5 попыток → блокировка)
- [ ] **Device fingerprinting** реализован
- [ ] **IP whitelist** настроен (опционально, но рекомендуется)
- [ ] **Session timeout** с warning (15 мин warning, 30 мин logout)
- [ ] **Concurrent session control** (максимум 2 сессии)
- [ ] **Activity tracking** для продления сессии
- [ ] **CAPTCHA** после 3 неудачных попыток
- [ ] **Rate limiting строгий** (3 login/min, 50 API/min)
- [ ] **Security headers** настроены (CSP, HSTS, X-Frame-Options)
- [ ] **Audit logging** всех admin actions
- [ ] **Monitoring & alerting** для подозрительной активности
- [ ] **Backup procedures** настроены
- [ ] **Recovery procedures** протестированы
- [ ] **WAF** настроен (опционально, но рекомендуется)
- [ ] **Security scanning** пройден (Snyk, Trivy)
- [ ] **Incident response plan** готов

---

**Время выполнения:** 30-40 дней (1-2 разработчика)  
**Следующий шаг:** Начать с Блока 1 (Базовая инфраструктура)  
**Приоритет безопасности:** 🔴 CRITICAL

