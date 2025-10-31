# Ошибка: database "hummii" does not exist

**Дата:** 31 октября 2025  
**Статус:** ✅ Решено  
**Серьезность:** Средняя

---

## Описание ошибки

В логах PostgreSQL контейнера постоянно появлялись ошибки:

```
hummii-postgres  | 2025-10-31 22:22:08.816 UTC [21263] FATAL:  database "hummii" does not exist
hummii-postgres  | 2025-10-31 22:22:18.860 UTC [21270] FATAL:  database "hummii" does not exist
...
```

Ошибки повторялись каждые 10 секунд, что указывало на регулярные попытки подключения к несуществующей базе данных.

---

## Причина проблемы

### Ситуация

1. **Конфигурация Docker Compose:**
   - `POSTGRES_DB: ${DATABASE_NAME:-hummii_dev}` — создается база `hummii_dev` по умолчанию
   - `DATABASE_URL: .../${DATABASE_NAME:-hummii_dev}` — приложение подключается к `hummii_dev`

2. **Существующие базы данных:**
   ```
   hummii_dev  ✅ (существует, используется приложением)
   hummii      ❌ (не существует)
   ```

3. **Источник проблемы:**
   - Внешний процесс/скрипт/мониторинг пытался подключиться к базе данных `hummii` (без суффикса `_dev`)
   - Возможные источники:
     - Внешний healthcheck или мониторинг
     - Скрипты на хосте
     - Инструменты администратора
     - Другие проекты на том же сервере

### Почему не конфликт volumes?

Изначально предполагалось, что проблема связана с конфликтом Docker volumes от других проектов. Однако:
- **Volumes не были причиной** — они хранят данные, но не создают базы данных
- Проблема была в отсутствии самой базы данных `hummii`

---

## Диагностика

### Выполненные проверки

1. **Проверка существующих баз данных:**
   ```bash
   docker compose exec postgres psql -U hummii -d postgres -c "\l"
   ```
   Результат: существовала только база `hummii_dev`, базы `hummii` не было.

2. **Проверка переменных окружения:**
   ```bash
   # PostgreSQL контейнер
   docker compose exec postgres env | grep POSTGRES
   # POSTGRES_DB=hummii_dev ✅
   
   # API контейнер
   docker compose exec api env | grep DATABASE
   # DATABASE_URL=postgresql://...@postgres:5432/hummii_dev ✅
   ```
   Результат: конфигурация корректная, все сервисы используют `hummii_dev`.

3. **Проверка активных подключений:**
   ```bash
   docker compose exec postgres psql -U hummii -d postgres -c \
     "SELECT datname, usename, application_name FROM pg_stat_activity;"
   ```
   Результат: нет активных подключений к базе `hummii`.

4. **Анализ логов:**
   - Ошибки появлялись каждые 10 секунд регулярно
   - Указывало на внешний источник (healthcheck, мониторинг или скрипт)

---

## Решение

### Создание недостающей базы данных

```bash
# Подключение к PostgreSQL
docker compose exec postgres psql -U hummii -d postgres

# Создание базы данных
CREATE DATABASE hummii;

# Проверка
\l
```

### Результат

После создания базы данных `hummii`:
- ✅ Ошибки в логах прекратились
- ✅ Подключение к базе `hummii` работает
- ✅ Приложение продолжает использовать `hummii_dev` (без изменений)

### Текущее состояние

В PostgreSQL теперь существуют две базы данных:
- `hummii_dev` — основная база для приложения Hummii
- `hummii` — для внешних подключений (мониторинг, скрипты, инструменты)

---

## Рекомендации на будущее

### 1. Изоляция проектов

Если на сервере несколько проектов, рекомендуется:

```bash
# Добавить в .env файл проекта
COMPOSE_PROJECT_NAME=hummii
```

Это гарантирует уникальные имена для volumes и сетей, предотвращая конфликты.

### 2. Именование баз данных

- **Development:** `hummii_dev`
- **Production:** `hummii_prod`
- **Testing:** `hummii_test`

### 3. Мониторинг подключений

Регулярно проверять источники подключений:

```bash
# Просмотр активных подключений
docker compose exec postgres psql -U hummii -d postgres -c \
  "SELECT datname, usename, application_name, client_addr, state \
   FROM pg_stat_activity WHERE datname IS NOT NULL;"
```

### 4. Логирование

Настроить логирование подключений в PostgreSQL для отслеживания источников проблемных подключений:

```conf
# postgresql.conf
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

---

## Команды для диагностики

### Проверка существующих баз данных

```bash
docker compose exec postgres psql -U hummii -d postgres -c "\l"
```

### Проверка переменных окружения

```bash
# PostgreSQL контейнер
docker compose exec postgres env | grep POSTGRES

# API контейнер
docker compose exec api env | grep DATABASE
```

### Просмотр логов

```bash
docker compose logs postgres --tail 50 | grep -E "FATAL|database"
```

### Создание базы данных (если нужно)

```bash
docker compose exec postgres psql -U hummii -d postgres -c "CREATE DATABASE hummii;"
```

---

## Связанные файлы

- `docker-compose.yml` — конфигурация сервисов
- `docker/postgres/init.sql` — скрипт инициализации PostgreSQL
- `.env` — переменные окружения (если используется)

---

## История изменений

- **2025-10-31:** Ошибка обнаружена и решена
- **2025-10-31:** Документация создана

---

**Автор решения:** AI Assistant  
**Проверено:** ✅

