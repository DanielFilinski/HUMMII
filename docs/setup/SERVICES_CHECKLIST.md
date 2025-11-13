# 🚀 Быстрый чеклист настройки сервисов

**Порядок действий для запуска Hummii в production**

---

## 📋 Phase 1: Критичные сервисы (Сделать сейчас)

### ☑️ 1. 1Password
```
□ Создать Vault "Hummii Production"
□ Создать Vault "Hummii Development"
□ Включить 2FA
□ Добавить Emergency Kit в безопасное место
```

### ☑️ 2. Cloudflare
```
□ Добавить домен hummii.ca
□ Скопировать nameservers
□ Обновить nameservers у регистратора
□ Дождаться активации (2-48ч)

После активации:
□ Добавить DNS A запись: @ → SERVER_IP
□ Добавить DNS A запись: www → SERVER_IP
□ Добавить DNS A запись: api → SERVER_IP
□ Добавить DNS A запись: admin → SERVER_IP
□ Включить SSL/TLS: Full (strict)
□ Включить Always Use HTTPS
□ Включить HSTS
□ Настроить WAF
```

### ☑️ 3. Stripe
```
□ Завершить регистрацию аккаунта
□ Добавить банковскую информацию
□ Пройти верификацию
□ Создать Product: Standard ($29.99 CAD/mo)
□ Создать Product: Professional ($49.99 CAD/mo)
□ Создать Product: Advanced ($79.99 CAD/mo)
□ Скопировать Price IDs
□ Получить Test API keys
□ Получить Live API keys (после активации)
□ Настроить Webhook для test
□ Настроить Webhook для live
□ Сохранить всё в 1Password
```

### ☑️ 4. SendGrid
```
□ Создать API Key
□ Сохранить в 1Password
□ Verify Single Sender (noreply@hummii.ca)
□ Подтвердить email

После активации DNS Cloudflare:
□ Authenticate Domain (hummii.ca)
□ Добавить CNAME записи в Cloudflare
□ Verify DNS
□ Создать Email Template: Welcome
□ Создать Email Template: Password Reset
□ Создать Email Template: Subscription
□ Протестировать отправку
```

### ☑️ 5. Хостинг (DigitalOcean рекомендован)
```
□ Создать аккаунт
□ Добавить payment method
□ Создать Droplet:
   - Ubuntu 22.04 LTS
   - 4GB RAM / 2 vCPU
   - 80GB SSD
   - Toronto region
□ Добавить SSH ключ
□ Записать IP адрес
□ Обновить Cloudflare DNS с этим IP
□ SSH подключение работает
```

---

## 📋 Phase 2: Важные сервисы (Сделать перед запуском)

### ☑️ 6. Google Cloud
```
□ Создать аккаунт
□ Активировать $300 credit
□ Создать проект "Hummii"
□ Enable APIs:
   □ Maps JavaScript API
   □ Places API
   □ Geocoding API
   □ Distance Matrix API
   □ Google+ API

□ Создать API Key (Maps):
   - Ограничить по домену
□ Создать API Key (Server):
   - Ограничить по IP сервера
□ Настроить OAuth 2.0:
   - Добавить redirect URIs
   - Получить Client ID & Secret
□ Сохранить в 1Password
```

### ☑️ 7. Sentry (мониторинг ошибок)
```
□ Создать аккаунт на sentry.io
□ Создать проект "Hummii"
□ Выбрать платформу: Node.js + React
□ Скопировать DSN
□ Сохранить в 1Password
□ Добавить в .env
```

---

## 📋 Phase 3: Опциональные сервисы (Можно позже)

### ☑️ 8. OneSignal (Push уведомления)
```
□ Создать аккаунт
□ Создать app "Hummii"
□ Настроить Web Push
□ Получить App ID & API Keys
□ Сохранить в 1Password
```

### ☑️ 9. Twilio (SMS верификация)
```
□ Создать аккаунт
□ Получить $15 trial credit
□ Купить канадский номер (+1)
□ Получить Account SID & Auth Token
□ Сохранить в 1Password
```

### ☑️ 10. Apple Developer (Apple Sign In)
```
□ Зарегистрироваться ($99/год)
□ Создать App ID
□ Настроить Sign in with Apple
□ Получить credentials
□ Сохранить в 1Password
```

---

## 📋 Phase 4: Подготовка сервера

### ☑️ 11. Установка на сервер
```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Обновление системы
□ sudo apt update && sudo apt upgrade -y

# Установка Docker
□ curl -fsSL https://get.docker.com -o get-docker.sh
□ sudo sh get-docker.sh
□ sudo usermod -aG docker $USER
□ docker --version

# Установка Docker Compose
□ sudo apt install docker-compose-plugin
□ docker compose version

# Клонирование репозитория
□ cd /opt
□ sudo git clone git@github.com:DanielFilinski/HUMMII.git hummii
□ cd hummii
□ sudo chown -R $USER:$USER .

# SSL сертификаты (Let's Encrypt)
□ sudo apt install certbot
□ sudo certbot certonly --standalone -d hummii.ca
□ sudo certbot certonly --standalone -d www.hummii.ca
□ sudo certbot certonly --standalone -d api.hummii.ca
□ sudo certbot certonly --standalone -d admin.hummii.ca
□ sudo cp /etc/letsencrypt/live/hummii.ca/*.pem ./docker/nginx/ssl/
□ sudo chown $USER:$USER ./docker/nginx/ssl/*.pem

# Настройка Firewall
□ sudo ufw allow 22/tcp
□ sudo ufw allow 80/tcp
□ sudo ufw allow 443/tcp
□ sudo ufw enable
```

---

## 📋 Phase 5: Конфигурация проекта

### ☑️ 12. Environment Variables
```bash
# На сервере
cd /opt/hummii

# Создать .env файл
□ cp .env.example .env
□ nano .env

# Заполнить все переменные из 1Password:
□ NODE_ENV=production
□ DATABASE_URL (с надёжным паролем)
□ JWT_ACCESS_SECRET (openssl rand -base64 64)
□ JWT_REFRESH_SECRET (openssl rand -base64 64)
□ SESSION_SECRET (openssl rand -base64 32)
□ REDIS_PASSWORD (openssl rand -base64 32)
□ STRIPE_SECRET_KEY (из Stripe)
□ STRIPE_WEBHOOK_SECRET (из Stripe)
□ SENDGRID_API_KEY (из SendGrid)
□ GOOGLE_MAPS_API_KEY (из Google Cloud)
□ GOOGLE_CLIENT_ID (из Google Cloud)
□ SENTRY_DSN (из Sentry)
□ APP_URL=https://hummii.ca
□ FRONTEND_URL=https://hummii.ca
□ API_URL=https://api.hummii.ca
□ ADMIN_URL=https://admin.hummii.ca

# Проверить права
□ chmod 600 .env
```

---

## 📋 Phase 6: Deployment

### ☑️ 13. Первый запуск
```bash
# Build images
□ docker compose -f docker-compose.prod.yml build

# Start services
□ docker compose -f docker-compose.prod.yml up -d

# Проверить логи
□ docker compose -f docker-compose.prod.yml logs -f

# Запустить миграции
□ docker compose -f docker-compose.prod.yml exec api npm run migration:run

# Создать admin пользователя
□ docker compose -f docker-compose.prod.yml exec api npm run create-admin

# Проверить статус
□ docker compose -f docker-compose.prod.yml ps
```

### ☑️ 14. Верификация
```
□ Открыть https://hummii.ca (должен загрузиться frontend)
□ Открыть https://api.hummii.ca/health (должен вернуть {"status":"ok"})
□ Открыть https://admin.hummii.ca (админ панель)
□ Попробовать регистрацию
□ Проверить email от SendGrid
□ Проверить Google Sign In
□ Попробовать тестовый платёж Stripe
□ Проверить логи в Sentry
```

---

## 📋 Phase 7: Мониторинг и обслуживание

### ☑️ 15. Настройка мониторинга
```
□ Настроить алерты в Sentry
□ Настроить алерты в Stripe
□ Добавить uptime monitoring (UptimeRobot/Pingdom)
□ Настроить автоматический backup БД
□ Настроить ротацию логов
□ Настроить auto-renewal SSL (certbot)
```

---

## 🎯 Приоритетность

### 🔴 Критично (без этого не запустится):
1. Cloudflare (DNS)
2. Хостинг сервера
3. Stripe (платежи)
4. SendGrid (emails)
5. Google Cloud (Maps + OAuth)

### 🟡 Важно (запустится, но не полный функционал):
6. Sentry (нет мониторинга ошибок)
7. SSL сертификаты (можно временно self-signed)

### 🟢 Можно позже:
8. OneSignal (push уведомления)
9. Twilio (SMS)
10. Apple Sign In

---

## 📝 Чек-лист перед launch

```
Финальная проверка:

Безопасность:
□ Все секреты в 1Password
□ .env не в Git
□ Firewall настроен
□ SSL сертификаты валидны
□ HTTPS redirect работает
□ CORS правильно настроен

Функциональность:
□ Регистрация работает
□ Email приходят
□ Google OAuth работает
□ Платежи Stripe работают
□ Maps отображается
□ Загрузка файлов работает
□ Admin панель доступна

Производительность:
□ Database индексы созданы
□ Redis кеширование работает
□ CDN (Cloudflare) активен
□ Image optimization настроена

Мониторинг:
□ Sentry получает ошибки
□ Логи пишутся корректно
□ Backup БД автоматический
□ Uptime monitoring настроен
```

---

## 💰 Примерная стоимость в месяц

| Сервис | План | Стоимость |
|--------|------|-----------|
| DigitalOcean | 4GB Droplet | $24/мес |
| Cloudflare | Free | $0 |
| Stripe | Pay-as-you-go | 2.9% + $0.30 |
| SendGrid | Free | $0 (до 100 emails/day) |
| Google Cloud | Free tier | $0 (с кредитом $300) |
| Sentry | Developer | $0 (до 5k errors) |
| Domain | Renewal | ~$15/год |
| **ИТОГО** | | **~$25-30/мес** |

---

## 📞 Помощь

Если что-то непонятно, смотрите:
- **[Полное руководство](./SERVICES_SETUP_GUIDE.md)** - подробные инструкции
- **[Deployment Guide](../DEPLOYMENT.md)** - развёртывание
- **[ENV Setup](../../ENV_SETUP.md)** - переменные окружения

---

**Время на настройку:** ~4-6 часов  
**Сложность:** Средняя  

Удачи! 🚀
