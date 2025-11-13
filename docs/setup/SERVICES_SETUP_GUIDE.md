# 🚀 Полное руководство по настройке сервисов Hummii

**Дата создания:** 10 ноября 2025  
**Статус:** В разработке

---

## 📋 Содержание

1. [Обзор необходимых сервисов](#обзор-необходимых-сервисов)
2. [1Password - Управление секретами](#1-1password---управление-секретами)
3. [Cloudflare - DNS и защита](#2-cloudflare---dns-и-защита)
4. [Stripe - Платёжная система](#3-stripe---платёжная-система)
5. [SendGrid - Email сервис](#4-sendgrid---email-сервис)
6. [Дополнительные сервисы](#5-дополнительные-сервисы)
7. [Интеграция с проектом](#6-интеграция-с-проектом)
8. [Checklist финальной проверки](#7-checklist-финальной-проверки)

---

## 📦 Обзор необходимых сервисов

### ✅ Уже созданы аккаунты

| Сервис | Назначение | Приоритет |
|--------|-----------|----------|
| **1Password** | Хранение паролей и секретов | 🔴 Критично |
| **Cloudflare** | DNS, CDN, DDoS защита, SSL | 🔴 Критично |
| **Stripe** | Обработка платежей | 🔴 Критично |
| **SendGrid** | Email рассылки | 🔴 Критично |

### 🔜 Необходимо создать

| Сервис | Назначение | Приоритет | Стоимость |
|--------|-----------|----------|-----------|
| **AWS / DigitalOcean** | Хостинг сервера | 🔴 Критично | ~$20-50/мес |
| **Google Cloud** | Maps API, OAuth | 🔴 Критично | ~$200 кредит |
| **Sentry** | Мониторинг ошибок | 🟡 Важно | Бесплатно |
| **OneSignal** | Push уведомления | 🟢 Опционально | Бесплатно |
| **Twilio** | SMS верификация | 🟢 Опционально | Pay-as-you-go |
| **Apple Developer** | Apple Sign In | 🟢 Опционально | $99/год |

---

## 1. 1Password - Управление секретами

### 🎯 Цель
Безопасное хранение всех паролей, API ключей и секретов проекта.

### 📝 Настройка

#### Шаг 1: Организация структуры

Создайте **Vault** (хранилище) для проекта:

```
Hummii Project
├── 🔐 Production Secrets
│   ├── Database Credentials
│   ├── JWT Secrets
│   ├── API Keys (Stripe, SendGrid, etc.)
│   └── SSL Certificates Info
├── 🧪 Development Secrets
│   └── Test API Keys
├── 🌐 Domain & Hosting
│   ├── Domain Registrar (hummii.ca)
│   ├── Cloudflare Account
│   └── Server SSH Keys
└── 💳 Service Accounts
    ├── Stripe Account
    ├── SendGrid Account
    ├── Google Cloud
    └── AWS/DigitalOcean
```

#### Шаг 2: Что хранить в 1Password

**Обязательно:**
- ✅ Database passwords (PostgreSQL, Redis)
- ✅ JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- ✅ SESSION_SECRET
- ✅ Stripe API keys (secret, publishable, webhook secret)
- ✅ SendGrid API key
- ✅ Server SSH private keys
- ✅ Cloudflare API tokens
- ✅ Admin panel credentials

**Рекомендуется:**
- Google Maps API keys
- OAuth client secrets (Google, Apple)
- Sentry DSN
- OneSignal API keys
- Twilio credentials

#### Шаг 3: Генерация секретов

Используйте 1Password для генерации надёжных паролей:

```bash
# Или через OpenSSL на сервере:
openssl rand -base64 64  # Для JWT secrets
openssl rand -base64 32  # Для session secrets
openssl rand -hex 32     # Для webhook secrets
```

#### Шаг 4: Интеграция с командой

1. **Создайте отдельные vaults:**
   - `Hummii Production` - только для владельца
   - `Hummii Development` - для всей команды разработки

2. **Настройте доступ:**
   - Production: только вы
   - Development: команда (read-only для test keys)

---

## 2. Cloudflare - DNS и защита

### 🎯 Цель
Управление доменом hummii.ca, SSL сертификаты, CDN, защита от DDoS.

### 📝 Настройка

#### Шаг 1: Добавление домена

1. **Войдите в Cloudflare Dashboard**
2. **Add a Site** → Введите `hummii.ca`
3. **Выберите план:** Free (достаточно для начала)
4. **Cloudflare покажет nameservers:**
   ```
   NS: charlie.ns.cloudflare.com
   NS: iris.ns.cloudflare.com
   ```

#### Шаг 2: Обновление Nameservers у регистратора

Перейдите к регистратору домена (GoDaddy, Namecheap, etc.) и замените nameservers на Cloudflare nameservers.

**⏱ Время ожидания:** 2-48 часов

#### Шаг 3: Настройка DNS записей

После активации домена добавьте DNS записи:

| Тип | Имя | Значение | Proxy | Описание |
|-----|-----|----------|-------|----------|
| A | @ | `YOUR_SERVER_IP` | ✅ | Главный сайт |
| A | www | `YOUR_SERVER_IP` | ✅ | www версия |
| A | api | `YOUR_SERVER_IP` | ✅ | Backend API |
| A | admin | `YOUR_SERVER_IP` | ✅ | Админ панель |
| CNAME | * | hummii.ca | ❌ | Wildcard (опционально) |

**Важно:** Proxy Status (оранжевое облако) должен быть включён для защиты и CDN.

#### Шаг 4: SSL/TLS настройка

1. **SSL/TLS → Overview**
   - Выберите: **Full (strict)** ← Рекомендуется
   - Это требует SSL сертификат на сервере

2. **Edge Certificates:**
   - ✅ Always Use HTTPS: ON
   - ✅ HTTP Strict Transport Security (HSTS): Enable
   - ✅ Minimum TLS Version: TLS 1.2
   - ✅ Automatic HTTPS Rewrites: ON

3. **Origin Server:**
   - Create Certificate (для вашего сервера)
   - Скачайте и установите на Nginx

#### Шаг 5: Настройка Page Rules (опционально)

```
1. https://hummii.ca/api/*
   → Cache Level: Bypass
   → Security Level: High

2. https://hummii.ca/*
   → Browser Cache TTL: 4 hours
   → Cache Level: Standard
```

#### Шаг 6: Настройка Firewall

**Security → WAF:**
- ✅ Enable для защиты от атак

**Security → Bots:**
- ✅ Fight Mode для ботов

**Security → Rate Limiting:**
```
Rule: API Rate Limit
- If URL matches: api.hummii.ca/api/v1/auth/*
- Then: Block when rate exceeds 10 requests per 1 minute
```

#### Шаг 7: API Token для автоматизации (опционально)

1. **Profile → API Tokens → Create Token**
2. **Permissions:**
   - Zone → DNS → Edit
   - Zone → Zone Settings → Read
3. Сохраните токен в 1Password

---

## 3. Stripe - Платёжная система

### 🎯 Цель
Обработка подписок и платежей от пользователей.

### 📝 Настройка

#### Шаг 1: Активация аккаунта

1. **Войдите в Stripe Dashboard**
2. **Complete account setup:**
   - Business details
   - Banking information
   - Identity verification

#### Шаг 2: Настройка Products (Тарифные планы)

**Products → Create Product:**

1. **Standard Plan**
   - Name: `Standard Subscription`
   - Description: `Basic features for handymen`
   - Pricing:
     - $29.99 CAD / month
     - Recurring: Monthly
   - Скопируйте **Price ID**: `price_xxxxxxxxxxxxx`

2. **Professional Plan**
   - Name: `Professional Subscription`
   - $49.99 CAD / month
   - Price ID: `price_yyyyyyyyyyyyy`

3. **Advanced Plan**
   - Name: `Advanced Subscription`
   - $79.99 CAD / month
   - Price ID: `price_zzzzzzzzzzzzz`

#### Шаг 3: API Keys

**Developers → API Keys:**

**Test Mode (для разработки):**
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

**Live Mode (для production):**
- Publishable key: `pk_live_...`
- Secret key: `sk_live_...`

⚠️ **Сохраните в 1Password!**

#### Шаг 4: Webhooks

**Developers → Webhooks → Add endpoint:**

**Test Mode:**
```
URL: https://api.hummii.ca/api/v1/webhooks/stripe
Events:
  ✅ customer.subscription.created
  ✅ customer.subscription.updated
  ✅ customer.subscription.deleted
  ✅ invoice.payment_succeeded
  ✅ invoice.payment_failed
  ✅ checkout.session.completed
```

Скопируйте **Signing secret**: `whsec_...` → в 1Password

**Live Mode:** (повторите для production)

#### Шаг 5: Настройка Email уведомлений

**Settings → Email:**
- ✅ Successful payments
- ✅ Failed payments
- ✅ Refunds

#### Шаг 6: Тестовые карты

Для разработки используйте:
```
Успешная оплата: 4242 4242 4242 4242
Отклонена: 4000 0000 0000 0002
Требует 3D Secure: 4000 0025 0000 3155

Любой CVV: 123
Любая дата: 12/34
```

#### Шаг 7: Environment Variables

Добавьте в `.env`:
```bash
# Test Mode (development)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRICE_STANDARD=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_yyyyyyyyyyyyy
STRIPE_PRICE_ADVANCED=price_zzzzzzzzzzzzz
STRIPE_CURRENCY=CAD

# Live Mode (production) - закомментировать для dev
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 4. SendGrid - Email сервис

### 🎯 Цель
Отправка транзакционных email (регистрация, восстановление пароля, уведомления).

### 📝 Настройка

#### Шаг 1: Создание API Key

1. **Settings → API Keys → Create API Key**
2. **Name:** `Hummii Production API Key`
3. **Permissions:** Full Access (или Restricted для безопасности)
4. **Скопируйте ключ:** `SG.xxxxxxxxxxxxx`

⚠️ **Сохраните в 1Password! Ключ показывается только один раз!**

#### Шаг 2: Верификация отправителя

**Settings → Sender Authentication → Verify a Single Sender:**

```
From Name: Hummii
From Email: noreply@hummii.ca
Reply To: support@hummii.ca
```

Подтвердите email через письмо.

#### Шаг 3: Domain Authentication (рекомендуется)

**Settings → Sender Authentication → Authenticate Your Domain:**

1. Выберите домен: `hummii.ca`
2. SendGrid предоставит DNS записи:

```
Добавьте в Cloudflare DNS:

CNAME: em1234.hummii.ca → u12345.wl.sendgrid.net
CNAME: s1._domainkey.hummii.ca → s1.domainkey.u12345.wl.sendgrid.net
CNAME: s2._domainkey.hummii.ca → s2.domainkey.u12345.wl.sendgrid.net
```

3. **Verify DNS** - проверка может занять до 48 часов

#### Шаг 4: Email Templates

**Email API → Dynamic Templates → Create Template:**

**1. Welcome Email**
```html
Subject: Welcome to Hummii! 👋

Hi {{firstName}},

Welcome to Hummii - your trusted platform for finding reliable handymen!

Get started: {{verificationLink}}

Best regards,
The Hummii Team
```

**2. Password Reset**
```html
Subject: Reset Your Password

Hi {{firstName}},

Click here to reset your password: {{resetLink}}

This link expires in 1 hour.

If you didn't request this, please ignore.
```

**3. Subscription Confirmation**
```html
Subject: Subscription Activated

Hi {{firstName}},

Your {{planName}} subscription is now active!

Invoice: {{invoiceUrl}}
```

Скопируйте **Template IDs** для использования в коде.

#### Шаг 5: Настройка Webhook (опционально)

**Settings → Mail Settings → Event Webhook:**

```
URL: https://api.hummii.ca/api/v1/webhooks/sendgrid
Events:
  ✅ Delivered
  ✅ Opened
  ✅ Clicked
  ✅ Bounced
  ✅ Spam Report
```

#### Шаг 6: Environment Variables

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@hummii.ca
EMAIL_FROM_NAME=Hummii

# Template IDs (опционально)
SENDGRID_TEMPLATE_WELCOME=d-xxxxxxxxxxxx
SENDGRID_TEMPLATE_RESET=d-yyyyyyyyyyyy
SENDGRID_TEMPLATE_SUBSCRIPTION=d-zzzzzzzzzzzz
```

#### Шаг 7: Тестирование

В development режиме используйте **console email provider**:
```bash
EMAIL_PROVIDER=console  # Логи в консоль
# EMAIL_PROVIDER=sendgrid  # Реальная отправка
```

---

## 5. Дополнительные сервисы

### 5.1 AWS / DigitalOcean - Хостинг сервера

#### Выбор провайдера

| Провайдер | Стоимость | Плюсы | Минусы |
|-----------|-----------|-------|--------|
| **DigitalOcean** | $20-40/мес | Простота, документация | Меньше сервисов |
| **AWS EC2** | $30-50/мес | Масштабируемость, много сервисов | Сложность |
| **Hetzner** | €10-20/мес | Дёшево | Нет в Канаде |

**Рекомендация:** DigitalOcean для старта, AWS для масштабирования.

#### DigitalOcean Droplet

**Минимальные требования:**
- **CPU:** 2 vCPU
- **RAM:** 4GB
- **Storage:** 80GB SSD
- **Region:** Toronto (Канада)
- **OS:** Ubuntu 22.04 LTS

**Настройка:**
```bash
# 1. Создайте Droplet на DO
# 2. Добавьте SSH ключ
# 3. Получите IP адрес
# 4. Обновите DNS в Cloudflare с этим IP
```

### 5.2 Google Cloud - Maps API & OAuth

#### Шаг 1: Создание проекта

1. Перейдите на https://console.cloud.google.com
2. **Create Project** → `Hummii`
3. Получите **$300 бесплатных кредитов**

#### Шаг 2: Enable APIs

**APIs & Services → Library:**
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Google+ API (для OAuth)

#### Шаг 3: API Keys

**APIs & Services → Credentials → Create Credentials:**

**Maps API Key:**
```
Name: Hummii Maps Key
Restrictions:
  - HTTP referrers: hummii.ca, *.hummii.ca
  - API restrictions: Maps, Places, Geocoding
```

**Server API Key:**
```
Name: Hummii Server Key
Restrictions:
  - IP addresses: YOUR_SERVER_IP
  - API restrictions: Geocoding, Distance Matrix
```

#### Шаг 4: OAuth 2.0 (Google Sign In)

**Create OAuth Client ID:**
```
Type: Web application
Name: Hummii Web Client

Authorized redirect URIs:
  - http://localhost:3000/api/v1/auth/google/callback (dev)
  - https://api.hummii.ca/api/v1/auth/google/callback (prod)
```

Получите:
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxx`

#### Environment Variables
```bash
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXX
GOOGLE_MAPS_API_KEY_SERVER=AIzaSyYYYYYYYYYYYY
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=https://api.hummii.ca/api/v1/auth/google/callback
```

### 5.3 Sentry - Мониторинг ошибок

**Бесплатно:** До 5,000 ошибок/месяц

1. Создайте аккаунт на https://sentry.io
2. **Create Project:**
   - Platform: Node.js + React
   - Name: Hummii

3. Получите **DSN:**
```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

### 5.4 OneSignal - Push Notifications (опционально)

**Бесплатно:** Unlimited notifications

1. Создайте аккаунт на https://onesignal.com
2. **New App:** Hummii
3. **Platforms:** Web Push
4. Настройте домен: `https://hummii.ca`

```bash
ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ONESIGNAL_REST_API_KEY=your_rest_api_key
```

### 5.5 Twilio - SMS Verification (опционально)

**Стоимость:** ~$0.01 за SMS

1. Создайте аккаунт на https://www.twilio.com
2. Получите **$15 trial credit**
3. **Phone Numbers → Buy a Number** (канадский +1)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 6. Интеграция с проектом

### Шаг 1: Создайте Production .env

```bash
cd /root/Garantiny_old/HUMMII
cp .env.example .env
```

### Шаг 2: Заполните переменные

Используйте данные из 1Password:

```bash
# ====================================
# PRODUCTION ENVIRONMENT
# ====================================
NODE_ENV=production

# URLs
APP_URL=https://hummii.ca
FRONTEND_URL=https://hummii.ca
API_URL=https://api.hummii.ca
ADMIN_URL=https://admin.hummii.ca

# Database (сгенерируйте надёжный пароль!)
DATABASE_URL=postgresql://hummii:SECURE_PASSWORD@localhost:5432/hummii
DATABASE_PASSWORD=SECURE_PASSWORD

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=SECURE_REDIS_PASSWORD

# JWT Secrets (используйте openssl rand -base64 64)
JWT_ACCESS_SECRET=your-256-bit-secret-from-1password
JWT_REFRESH_SECRET=your-256-bit-secret-from-1password
SESSION_SECRET=your-session-secret-from-1password

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STANDARD=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_yyyyy
STRIPE_PRICE_ADVANCED=price_zzzzz

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@hummii.ca

# Google
GOOGLE_MAPS_API_KEY=AIzaSyXXXXX
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# OneSignal (опционально)
ONESIGNAL_APP_ID=xxxxxxxx
ONESIGNAL_REST_API_KEY=xxxxx

# Cloudflare (для API, если нужно)
CLOUDFLARE_API_TOKEN=your_cf_token
```

### Шаг 3: Защита .env файла

```bash
# НИКОГДА не коммитьте .env в Git!
chmod 600 .env
echo ".env" >> .gitignore
```

---

## 7. Checklist финальной проверки

### ✅ 1Password
- [ ] Создан Vault для проекта
- [ ] Сохранены все секреты
- [ ] Настроен доступ для команды
- [ ] Резервное копирование включено

### ✅ Cloudflare
- [ ] Домен hummii.ca добавлен
- [ ] Nameservers обновлены у регистратора
- [ ] DNS записи настроены (A, CNAME)
- [ ] SSL/TLS: Full (strict)
- [ ] Always Use HTTPS включён
- [ ] WAF и Rate Limiting настроены

### ✅ Stripe
- [ ] Аккаунт активирован
- [ ] Products созданы (Standard, Pro, Advanced)
- [ ] API keys скопированы в 1Password
- [ ] Webhooks настроены (test + live)
- [ ] Тестовые платежи проверены

### ✅ SendGrid
- [ ] API key создан и сохранён
- [ ] Sender верифицирован
- [ ] Domain authentication настроена
- [ ] Email templates созданы
- [ ] Тестовая отправка email работает

### ✅ Хостинг
- [ ] Сервер создан (DigitalOcean/AWS)
- [ ] SSH доступ настроен
- [ ] Docker установлен
- [ ] IP адрес добавлен в Cloudflare DNS
- [ ] SSL сертификаты установлены

### ✅ Google Cloud
- [ ] Проект создан
- [ ] Maps APIs включены
- [ ] API keys созданы и ограничены
- [ ] OAuth 2.0 настроен
- [ ] Billing account привязан

### ✅ Дополнительно
- [ ] Sentry проект создан
- [ ] OneSignal настроен (если нужно)
- [ ] Twilio аккаунт (если нужно)
- [ ] Все переменные в .env
- [ ] .env в .gitignore

---

## 🚨 Важные напоминания

### Безопасность

1. **Никогда не коммитьте:**
   - `.env` файлы
   - API keys
   - Private keys
   - Пароли

2. **Используйте разные ключи:**
   - Test keys для development
   - Live keys для production

3. **Ограничьте доступ:**
   - API keys: по IP/домену
   - Database: только с сервера
   - Redis: пароль обязателен

### Мониторинг

1. **Настройте алерты:**
   - Sentry: критичные ошибки → email
   - Stripe: неудачные платежи → notification
   - Server: мониторинг uptime

2. **Логи:**
   - Проверяйте логи ежедневно
   - Настройте ротацию логов
   - Храните логи минимум 30 дней

### Резервное копирование

1. **Database:**
   - Автоматический backup ежедневно
   - Проверяйте восстановление регулярно

2. **Files:**
   - Backup uploads (S3/Cloudinary)
   - Git repository backup

---

## 📞 Поддержка

Если возникают проблемы:

| Сервис | Документация | Поддержка |
|--------|--------------|-----------|
| Cloudflare | https://developers.cloudflare.com | Community |
| Stripe | https://stripe.com/docs | Email/Chat |
| SendGrid | https://docs.sendgrid.com | Email |
| DigitalOcean | https://docs.digitalocean.com | Tickets |
| Google Cloud | https://cloud.google.com/docs | Forums |

---

## 📚 Следующие шаги

После настройки всех сервисов:

1. **[Deployment Guide](../DEPLOYMENT.md)** - Развёртывание на production
2. **[Security Best Practices](../../SECURITY_BEST_PRACTICES.md)** - Безопасность
3. **[Monitoring Setup](../infrastructure/monitoring.md)** - Мониторинг

---

**Удачи с настройкой! 🚀**
