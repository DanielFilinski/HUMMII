[1 tool called]

Отличные идеи! Это добавит уникальную ценность для исполнителей. Давайте разберем архитектуру этого функционала.

---

## Архитектура решения партнерской программы с магазинами

### **Рекомендация: Создать отдельный модуль "Partner Portal"**

**Почему отдельный модуль, а не админка:**

1. **Разные роли и доступы**:
   - Админы управляют всей платформой
   - Партнеры-магазины управляют только своими скидками и статистикой
   - Это разные домены ответственности

2. **Безопасность**:
   - Партнеры не должны иметь доступ к админке
   - Админы должны видеть всех партнеров
   - Партнеры видят только свою статистику

3. **Масштабируемость**:
   - Могут быть сотни/тысячи партнеров
   - У них будут свои требования к UI/UX
   - Могут появиться мобильные приложения для партнеров

---

## Архитектура системы (3 портала)

```
┌─────────────────────────────────────────────────────┐
│                   HUMMII ECOSYSTEM                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Frontend   │  │ Admin Panel  │  │  Partner  │ │
│  │   (Client/   │  │  (Internal)  │  │  Portal   │ │
│  │ Contractor)  │  │              │  │  (Shops)  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │       │
│         └─────────────────┼────────────────┘       │
│                           │                        │
│                    ┌──────▼──────┐                 │
│                    │  Backend    │                 │
│                    │  API        │                 │
│                    └─────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## Структура модулей

### **1. Admin Panel** (для вас - владельцев платформы)

**Функции:**
- ✅ Верификация исполнителей (просмотр документов, одобрение/отклонение)
- ✅ Модерация контента (отзывы, профили, заказы)
- ✅ Статистика платформы (пользователи, заказы, revenue)
- ✅ Управление партнерами (добавление магазинов, настройка условий)
- ✅ Управление подписками (тарифы, цены, льготы)
- ✅ Поддержка и жалобы (просмотр тикетов, чатов)
- ✅ Настройки платформы (категории, регионы)

**Дашборд для админа:**
```typescript
Admin Dashboard:
├── Verification Queue
│   ├── Pending contractors (12) ⚠️
│   ├── Documents to review (8) ⚠️
│   └── Verification history
├── Platform Statistics
│   ├── Total Users: 15,432
│   ├── Active Orders: 234
│   ├── Revenue (this month): $45,678
│   └── Partner Discounts Used: 1,234 times
├── User Management
│   ├── Clients
│   ├── Contractors
│   └── Banned/Suspended
├── Partner Management
│   ├── Active Partners (45 shops)
│   ├── Pending Applications (3)
│   └── Partner Statistics
├── Content Moderation
│   ├── Flagged Reviews (5)
│   ├── Reported Users (2)
│   └── Support Tickets (18 open)
└── Settings
    ├── Subscription Plans
    ├── Discount Tiers
    └── Categories
```

---

### **2. Partner Portal** (для магазинов-партнеров)

**Функции:**
- ✅ Регистрация и верификация магазина
- ✅ Настройка скидок по уровням подписки
- ✅ QR-код для валидации клиентов
- ✅ Статистика использования скидок
- ✅ История транзакций
- ✅ Управление профилем магазина

**Дашборд для партнера:**
```typescript
Partner Dashboard:
├── Shop Profile
│   ├── Name, Address, Logo
│   ├── Contact Information
│   └── Working Hours
├── Discount Settings
│   ├── Standard Subscription: 5%
│   ├── Professional Subscription: 10%
│   └── Advanced Subscription: 15%
├── Validation Tools
│   ├── QR Scanner (mobile app)
│   ├── Manual Code Entry
│   └── Contractor ID Lookup
├── Statistics
│   ├── Discounts Used This Month: 87
│   ├── Total Savings Provided: $2,340
│   ├── Top Contractors (by visits)
│   └── Revenue Impact Analysis
└── Financial
    ├── Billing from Hummii (if any)
    └── Reports
```

---

## Как работает система скидок (User Flow)

### **Процесс для исполнителя:**

```
1. Contractor with subscription
   ↓
2. Opens Hummii App → "Partner Discounts" section
   ↓
3. Sees list of partner shops near them
   ↓
4. Selects shop → Gets unique QR code or discount code
   ↓
5. Goes to shop → Shows QR/code to cashier
   ↓
6. Cashier scans → System validates subscription tier
   ↓
7. Discount applied automatically
   ↓
8. Transaction logged in both systems
```

### **Процесс для магазина:**

```
1. Cashier receives contractor with QR code
   ↓
2. Scans QR via Partner Portal app/web
   ↓
3. System shows:
   - Contractor name
   - Subscription tier
   - Discount percentage
   - Valid/Invalid status
   ↓
4. Cashier confirms purchase amount
   ↓
5. System logs transaction
   ↓
6. Discount applied at checkout
```

---

## Техническая реализация

### **Database Schema:**

```typescript
// Subscription Tiers
enum SubscriptionTier {
  STANDARD = 'standard',      // 5% discount
  PROFESSIONAL = 'professional', // 10% discount
  ADVANCED = 'advanced'        // 15% discount
}

// Partner Shop Model
interface PartnerShop {
  id: string;
  name: string;
  logo: string;
  category: string; // 'building_materials', 'tools', 'equipment'
  address: string;
  geoloc: { lat: number; lng: number };
  
  // Discount configuration
  discounts: {
    [SubscriptionTier.STANDARD]: number;    // 5
    [SubscriptionTier.PROFESSIONAL]: number; // 10
    [SubscriptionTier.ADVANCED]: number;     // 15
  };
  
  // Status
  verified: boolean;
  active: boolean;
  
  // Statistics
  totalDiscountsGiven: number;
  totalSavingsProvided: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Discount Transaction Model
interface DiscountTransaction {
  id: string;
  contractorId: string;
  partnerId: string;
  
  subscriptionTier: SubscriptionTier;
  discountPercentage: number;
  purchaseAmount: number;
  discountAmount: number;
  
  validatedAt: Date;
  validatedBy: string; // partner employee
  
  // For QR validation
  qrCode: string;
  usedAt: Date;
}

// Contractor Subscription Model (расширение)
interface ContractorSubscription {
  id: string;
  contractorId: string;
  tier: SubscriptionTier;
  
  // Partner benefits
  partnerDiscountsEnabled: boolean;
  discountsUsedThisMonth: number;
  totalSavings: number;
  
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}
```

### **API Endpoints:**

```typescript
// For Admin Panel
POST   /admin/partners                    // Add new partner
GET    /admin/partners                    // List all partners
PUT    /admin/partners/:id                // Update partner
DELETE /admin/partners/:id                // Remove partner
GET    /admin/partners/:id/statistics     // Partner stats
GET    /admin/partners/transactions       // All transactions

// For Partner Portal
POST   /partner/auth/register             // Partner registration
POST   /partner/auth/login                // Partner login
GET    /partner/profile                   // Get own profile
PUT    /partner/profile                   // Update profile
PUT    /partner/discounts                 // Update discount settings
POST   /partner/validate-qr               // Validate contractor QR
POST   /partner/transactions              // Log transaction
GET    /partner/transactions              // Get own transactions
GET    /partner/statistics                // Get own statistics

// For Contractor (Frontend)
GET    /contractors/partners              // List partner shops nearby
POST   /contractors/partners/:id/qr       // Generate QR for specific shop
GET    /contractors/discounts/history     // Discount usage history
GET    /contractors/discounts/savings     // Total savings
```

### **QR Code Generation & Validation:**

```typescript
// Generate QR for contractor
interface QRCodePayload {
  contractorId: string;
  subscriptionTier: SubscriptionTier;
  partnerId: string;
  expiresAt: Date; // Valid for 15 minutes
  signature: string; // JWT or HMAC signature
}

// When partner scans QR:
function validateQR(qrData: string): ValidationResult {
  const payload = decodeQR(qrData);
  
  // Validate signature
  if (!verifySignature(payload)) {
    return { valid: false, error: 'Invalid QR code' };
  }
  
  // Check expiration
  if (payload.expiresAt < new Date()) {
    return { valid: false, error: 'QR code expired' };
  }
  
  // Check subscription status
  const subscription = getContractorSubscription(payload.contractorId);
  if (!subscription.active) {
    return { valid: false, error: 'Subscription inactive' };
  }
  
  return {
    valid: true,
    contractor: getContractorInfo(payload.contractorId),
    discountPercentage: getDiscountForTier(payload.subscriptionTier),
    tier: payload.subscriptionTier
  };
}
```

---

## UI/UX в основном приложении (Frontend)

### **Добавить раздел "Partner Benefits" в профиль исполнителя:**

```typescript
Contractor Profile:
├── ... existing sections ...
├── 📦 Partner Benefits (NEW) 🔒 Premium Feature
│   ├── "Get discounts at 45 partner shops!"
│   ├── Your Subscription: Professional (10% discount)
│   ├── Total Savings: $1,234
│   │
│   ├── 🗺️ Partner Shops Near You (map view)
│   │   ├── Hardware Store (2.3 km) - 10% OFF
│   │   ├── Tool Rental Shop (3.1 km) - 10% OFF
│   │   └── Paint & Supplies (4.5 km) - 10% OFF
│   │
│   └── 📊 Your Discount History
│       ├── Jan 2025: $234 saved (12 purchases)
│       └── Dec 2024: $178 saved (8 purchases)
```

---

## Стек технологий для Partner Portal

```typescript
Partner Portal Stack:
├── Frontend: Next.js + Refine (consistent with Admin)
├── UI: Ant Design или Tailwind
├── Auth: Separate JWT for partners
├── QR Scanner: 
│   ├── Web: @zxing/browser (WebRTC camera access)
│   └── Mobile: React Native QR scanner (future)
└── Analytics: Chart.js или Recharts
```

---

## Roadmap внедрения

### **Phase 1: Admin Panel + Subscription System**
1. Создать админку с модерацией и верификацией
2. Внедрить систему подписок для исполнителей
3. Добавить управление тарифами в админке

### **Phase 2: Partner Integration**
1. Создать базовую модель партнеров в БД
2. Добавить раздел Partners в админку
3. Реализовать API для валидации

### **Phase 3: Partner Portal**
1. Создать отдельное приложение Partner Portal
2. Регистрация и профиль партнера
3. QR-сканер и валидация

### **Phase 4: Frontend Integration**
1. Добавить раздел "Partner Benefits" для исполнителей
2. Карта с партнерскими магазинами
3. Генерация QR-кодов

### **Phase 5: Mobile App (optional)**
1. Мобильное приложение для партнеров (быстрое сканирование)

---

## Монетизация для Hummii

Варианты, как вы можете зарабатывать на этом:

1. **Комиссия с партнеров**: 
   - Партнер платит фиксированную сумму/месяц за присутствие в системе
   - Или процент от транзакций

2. **Премиум-размещение**:
   - Партнеры могут платить за топ-позиции в списке

3. **Аналитика для партнеров**:
   - Базовая статистика бесплатно
   - Расширенная аналитика - платно

4. **Дополнительная ценность подписки**:
   - Исполнители платят за подписку не только за видимость, но и за скидки

---

**Итоговая структура:**

1. ✅ **Admin Panel** (Refine + Next.js) - для вас, управление всем
2. ✅ **Partner Portal** (Refine + Next.js) - отдельное приложение для магазинов
3. ✅ **Frontend** - добавить раздел Partner Benefits для исполнителей
4. ✅ **Backend API** - единый бэкенд для всех модулей с разными роутами

Хотите, чтобы я создал детальный технический план по этой системе для добавления в документацию?