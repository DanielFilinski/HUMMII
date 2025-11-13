# 🚀 Quick Reference - Сервисы Hummii

**Последнее обновление:** 10 ноября 2025

---

## 🎯 Созданные аккаунты

- [x] **1Password** - Управление секретами
- [x] **Cloudflare** - DNS, CDN, SSL
- [x] **Stripe** - Платежи
- [x] **SendGrid** - Email

## 🔜 Нужно создать

- [ ] **Хостинг** (DigitalOcean/AWS)
- [ ] **Google Cloud** (Maps + OAuth)
- [ ] **Sentry** (Мониторинг ошибок)

---

## 📞 Контакты служб поддержки

| Сервис | Dashboard | Документация | Support |
|--------|-----------|--------------|---------|
| **1Password** | [my.1password.com](https://my.1password.com) | [support.1password.com](https://support.1password.com) | Email |
| **Cloudflare** | [dash.cloudflare.com](https://dash.cloudflare.com) | [developers.cloudflare.com](https://developers.cloudflare.com) | Community |
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com) | [stripe.com/docs](https://stripe.com/docs) | Chat/Email |
| **SendGrid** | [app.sendgrid.com](https://app.sendgrid.com) | [docs.sendgrid.com](https://docs.sendgrid.com) | Email |
| **DigitalOcean** | [cloud.digitalocean.com](https://cloud.digitalocean.com) | [docs.digitalocean.com](https://docs.digitalocean.com) | Tickets |
| **Google Cloud** | [console.cloud.google.com](https://console.cloud.google.com) | [cloud.google.com/docs](https://cloud.google.com/docs) | Support |
| **Sentry** | [sentry.io](https://sentry.io) | [docs.sentry.io](https://docs.sentry.io) | Email |

---

## 🔑 Где хранятся ключи

### В 1Password:
```
Hummii Production/
├── API Keys/
│   ├── Stripe (Live)
│   ├── SendGrid
│   ├── Google Maps
│   └── Sentry DSN
├── Secrets/
│   ├── JWT_ACCESS_SECRET
│   ├── JWT_REFRESH_SECRET
│   └── SESSION_SECRET
├── Database/
│   ├── PostgreSQL password
│   └── Redis password
└── OAuth/
    ├── Google Client ID/Secret
    └── Apple credentials
```

### В .env файле на сервере:
```bash
/opt/hummii/.env              # Production
/opt/hummii/api/.env          # API specific
/opt/hummii/frontend/.env     # Frontend specific
```

**⚠️ ВАЖНО:** Никогда не коммитить .env в Git!

---

## 🌐 Домены и URL

| Сервис | URL | Назначение |
|--------|-----|-----------|
| **Main** | https://hummii.ca | Frontend (пользователи) |
| **API** | https://api.hummii.ca | Backend API |
| **Admin** | https://admin.hummii.ca | Админ панель |
| **WWW** | https://www.hummii.ca | Redirect → hummii.ca |

### DNS записи в Cloudflare:
```
Type  Name   Value            Proxy
A     @      YOUR_SERVER_IP   ON (оранжевое облако)
A     www    YOUR_SERVER_IP   ON
A     api    YOUR_SERVER_IP   ON
A     admin  YOUR_SERVER_IP   ON
```

---

## 💳 API Keys (Test vs Live)

### Stripe

**Test Mode (Development):**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Live Mode (Production):**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### SendGrid

**API Key:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
```

**Sender:**
```bash
EMAIL_FROM=noreply@hummii.ca
EMAIL_FROM_NAME=Hummii
```

### Google Cloud

**Maps API:**
```bash
GOOGLE_MAPS_API_KEY=AIzaSy_client_key  # Frontend (ограничен по домену)
GOOGLE_MAPS_API_KEY_SERVER=AIzaSy_server_key  # Backend (ограничен по IP)
```

**OAuth 2.0:**
```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=https://api.hummii.ca/api/v1/auth/google/callback
```

---

## 🔒 Генерация секретов

### JWT & Session Secrets:
```bash
# JWT Access Secret (256-bit)
openssl rand -base64 64

# JWT Refresh Secret (256-bit)
openssl rand -base64 64

# Session Secret (128-bit)
openssl rand -base64 32

# Redis Password
openssl rand -base64 32

# Webhook Secret (hex)
openssl rand -hex 32
```

### PostgreSQL Password:
```bash
# Минимум 16 символов, буквы + цифры + спецсимволы
openssl rand -base64 24
```

**⚠️ Сразу сохраняйте в 1Password!**

---

## 🐳 Docker команды

### Первый запуск:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Просмотр логов:
```bash
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f nginx
```

### Перезапуск:
```bash
docker compose restart api
```

### Остановка:
```bash
docker compose down
```

### Rebuild:
```bash
docker compose build --no-cache
docker compose up -d
```

### Миграции базы данных:
```bash
docker compose exec api npm run migration:run
```

### Создать админа:
```bash
docker compose exec api npm run create-admin
```

---

## 🔍 Health Checks

### API:
```bash
curl https://api.hummii.ca/health
# Ответ: {"status":"ok","timestamp":"..."}
```

### Database:
```bash
docker compose exec postgres psql -U hummii -d hummii -c "SELECT 1;"
```

### Redis:
```bash
docker compose exec redis redis-cli ping
# Ответ: PONG
```

### SSL Certificate:
```bash
curl -vI https://hummii.ca 2>&1 | grep -i "SSL certificate verify ok"
```

---

## 📧 Webhook URLs

### Stripe Webhooks:
```
URL: https://api.hummii.ca/api/v1/webhooks/stripe
Events:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
```

### SendGrid Webhooks (опционально):
```
URL: https://api.hummii.ca/api/v1/webhooks/sendgrid
Events:
  - delivered
  - opened
  - clicked
  - bounced
```

---

## 🚨 Troubleshooting

### DNS не работает
```bash
# Проверить nameservers
dig NS hummii.ca

# Проверить A записи
dig A hummii.ca
dig A api.hummii.ca

# Проверить propagation
https://dnschecker.org
```

### SSL ошибки
```bash
# Проверить сертификат
openssl s_client -connect hummii.ca:443 -servername hummii.ca

# Обновить сертификат
sudo certbot renew --force-renewal
```

### API не отвечает
```bash
# Проверить контейнер
docker ps
docker logs hummii-api

# Проверить порт
netstat -tulpn | grep 3000

# Перезапустить
docker compose restart api
```

### База данных не подключается
```bash
# Проверить пароль в .env
cat .env | grep DATABASE

# Проверить PostgreSQL
docker compose exec postgres psql -U hummii -d hummii

# Проверить логи
docker logs hummii-postgres
```

### Email не отправляются
```bash
# Проверить SendGrid API key
curl -H "Authorization: Bearer $SENDGRID_API_KEY" \
     https://api.sendgrid.com/v3/user/email

# Проверить sender verification
# Dashboard → Settings → Sender Authentication

# Проверить логи
docker logs hummii-api | grep -i email
```

---

## 📊 Мониторинг

### Uptime Monitoring (настроить):
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://www.pingdom.com) - Paid
- [StatusCake](https://www.statuscake.com) - Free tier

**Мониторить:**
- https://hummii.ca (каждые 5 мин)
- https://api.hummii.ca/health (каждые 5 мин)
- https://admin.hummii.ca (каждые 10 мин)

### Sentry Alerts:
```
Настроить уведомления:
  - Email при critical errors
  - Slack/Discord integration
  - Issue assignment
```

### Server Monitoring:
```bash
# CPU & Memory
docker stats

# Disk usage
df -h

# Logs size
du -sh /var/log/*
```

---

## 🔄 Backup

### База данных (автоматический):
```bash
# Создать backup
docker compose exec postgres pg_dump -U hummii hummii > backup.sql

# Восстановить
docker compose exec -T postgres psql -U hummii hummii < backup.sql
```

**Настроить cron:**
```bash
# Каждый день в 3:00 AM
0 3 * * * /opt/hummii/scripts/backup-db.sh
```

### .env файлы:
```bash
# Backup в 1Password
# Вручную, никогда не в Git!
```

---

## 💰 Текущие затраты

| Сервис | План | Стоимость |
|--------|------|-----------|
| 1Password | Team | $8/мес |
| Cloudflare | Free | $0 |
| Stripe | Pay-as-you-go | 2.9% + $0.30 |
| SendGrid | Free → Essentials | $0-20/мес |
| DigitalOcean | 4GB Droplet | $24/мес |
| Google Cloud | Free tier | $0 (с кредитом) |
| Sentry | Developer | $0 |
| **ИТОГО** | | **~$32-52/мес** |

---

## 📚 Документация

- 📖 [Полное руководство по настройке](./SERVICES_SETUP_GUIDE.md)
- ✅ [Чеклист настройки](./SERVICES_CHECKLIST.md)
- 🏗️ [Архитектура сервисов](./SERVICES_ARCHITECTURE.md)
- 💰 [Стоимость и сроки](./SERVICES_COSTS_TIMELINE.md)
- 🚀 [Deployment Guide](../DEPLOYMENT.md)

---

## 🆘 Быстрая помощь

### Срочная проблема?
1. Проверить статус: `docker compose ps`
2. Посмотреть логи: `docker compose logs -f`
3. Проверить health: `curl https://api.hummii.ca/health`
4. Перезапустить: `docker compose restart`

### Нужна поддержка?
- Stripe: Dashboard → Support → Chat
- SendGrid: Help → Contact Support
- DigitalOcean: Support → Submit Ticket
- Community: [NestJS Discord](https://discord.gg/nestjs)

---

**💡 Совет:** Добавьте эту страницу в закладки для быстрого доступа!
