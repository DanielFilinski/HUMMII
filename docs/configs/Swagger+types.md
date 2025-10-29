# Swagger + TypeScript Types — Hummii

> **Автоматическая генерация типов TypeScript из OpenAPI/Swagger схемы**
> **Версия:** 1.0 | **Обновлено:** 29 октября 2025

---

## Обзор

Используем `openapi-typescript` для автоматической генерации типов TypeScript из Swagger-документации NestJS API. Это обеспечивает синхронизацию типов между бэкендом и фронтендом.

### Преимущества

- ✅ **Type-safe API** — типы всегда синхронизированы с бэкендом
- ✅ **Автоматизация** — типы генерируются автоматически
- ✅ **DX** — автокомплит для endpoints и response types
- ✅ **Бесплатно** — MIT License, open-source
- ✅ **Поддержка OpenAPI 3.x** — полная совместимость с NestJS Swagger

---

## Установка

### 1. Backend (API) — уже настроен

Swagger уже настроен в `api/src/main.ts`:

```typescript
// api/src/main.ts
const config = new DocumentBuilder()
  .setTitle('Hummii API')
  .setDescription('Service Marketplace Platform API for Canada')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Swagger доступен по адресу:**
- UI: `http://localhost:3001/api/docs`
- JSON: `http://localhost:3001/api/docs-json`

### 2. Установка openapi-typescript

```bash
# В корне проекта или в frontend/admin
pnpm add -D openapi-typescript

# Глобально (опционально, для удобства)
pnpm add -g openapi-typescript
```

---

## Настройка для Frontend

### 1. Добавить скрипт в `frontend/package.json`

```json
{
  "scripts": {
    "generate-types": "openapi-typescript http://localhost:3001/api/docs-json -o types/api.d.ts",
    "generate-types:prod": "openapi-typescript ${NEXT_PUBLIC_API_URL}/api/docs-json -o types/api.d.ts",
    "dev": "pnpm generate-types && next dev",
    "build": "pnpm generate-types && next build",
    "type-check": "tsc --noEmit"
  }
}
```

### 2. Генерация типов

```bash
# Убедитесь, что backend запущен
cd api
pnpm run start:dev

# В другом терминале
cd frontend
pnpm run generate-types
```

### 3. Результат

Будет создан файл `frontend/types/api.d.ts` с типами:

```typescript
// Автоматически сгенерированный файл
export interface paths {
  "/api/v1/auth/register": {
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["RegisterDto"];
        };
      };
      responses: {
        201: {
          content: {
            "application/json": {
              accessToken: string;
              refreshToken: string;
            };
          };
        };
      };
    };
  };
  // ... все endpoints
}

export interface components {
  schemas: {
    RegisterDto: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    };
    LoginDto: {
      email: string;
      password: string;
    };
    User: {
      id: string;
      email: string;
      name: string;
      role: "CLIENT" | "CONTRACTOR" | "ADMIN" | "PARTNER";
      // ...
    };
  };
}
```

---

## Использование типов

### Вариант 1: Импорт компонентов (рекомендуется)

```typescript
// frontend/types/index.ts
import type { components } from './api';

// Экспортируем удобные алиасы
export type User = components['schemas']['User'];
export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type UpdateUserDto = components['schemas']['UpdateUserDto'];

// API Response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  statusCode: number;
  error?: string;
};
```

### Вариант 2: Type-safe API client

```typescript
// frontend/lib/api/typed-client.ts
import type { paths, components } from '@/types/api';

type ApiPaths = paths;

// Извлечение типов для эндпоинтов
type GetEndpoint<Path extends keyof ApiPaths> = 
  ApiPaths[Path] extends { get: { responses: { 200: { content: { 'application/json': infer R } } } } } 
    ? R 
    : never;

type PostEndpoint<Path extends keyof ApiPaths> = 
  ApiPaths[Path] extends { post: { responses: { 200 | 201: { content: { 'application/json': infer R } } } } } 
    ? R 
    : never;

type PostBody<Path extends keyof ApiPaths> = 
  ApiPaths[Path] extends { post: { requestBody: { content: { 'application/json': infer B } } } } 
    ? B 
    : never;

// Type-safe методы
export const typedApi = {
  get: async <Path extends keyof ApiPaths>(
    path: Path
  ): Promise<GetEndpoint<Path>> => {
    // implementation
  },

  post: async <Path extends keyof ApiPaths>(
    path: Path,
    body: PostBody<Path>
  ): Promise<PostEndpoint<Path>> => {
    // implementation
  },
};

// Использование
const user = await typedApi.get('/api/v1/users/me'); // user: User
const result = await typedApi.post('/api/v1/auth/register', {
  name: 'John',
  email: 'john@example.com',
  password: 'SecurePass123!',
}); // result: { accessToken: string, refreshToken: string }
```

### Вариант 3: React Query hooks

```typescript
// frontend/hooks/use-auth.ts
import { useMutation } from '@tanstack/react-query';
import type { components } from '@/types/api';
import { apiClient } from '@/lib/api/client';

type RegisterDto = components['schemas']['RegisterDto'];
type LoginDto = components['schemas']['LoginDto'];
type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDto) =>
      apiClient.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      // data.accessToken — типизирован
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) =>
      apiClient.post<AuthResponse>('/auth/login', data),
  });
}
```

---

## Настройка для Admin Panel

Аналогично frontend:

```bash
cd admin
pnpm add -D openapi-typescript
```

```json
// admin/package.json
{
  "scripts": {
    "generate-types": "openapi-typescript http://localhost:3001/api/docs-json -o types/api.d.ts",
    "dev": "pnpm generate-types && next dev",
    "build": "pnpm generate-types && next build"
  }
}
```

---

## Автоматизация с помощью Monorepo

### Вариант: Shared Types Package

Создать общий пакет `shared/types` для всего монорепозитория:

```
/Volumes/FilinSky/PROJECTS/Hummii/
├── pnpm-workspace.yaml
├── shared/
│   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           └── generated/
│               └── api.d.ts    # Сгенерированные типы
```

#### 1. Создать `pnpm-workspace.yaml` в корне:

```yaml
packages:
  - 'api'
  - 'frontend'
  - 'admin'
  - 'shared/*'
```

#### 2. Создать `shared/types/package.json`:

```json
{
  "name": "@hummii/shared-types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "generate": "openapi-typescript http://localhost:3001/api/docs-json -o src/generated/api.d.ts",
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "openapi-typescript": "^7.0.0",
    "typescript": "^5.3.3"
  }
}
```

#### 3. Создать `shared/types/src/index.ts`:

```typescript
// Re-export generated types
export * from './generated/api';

// Custom types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### 4. Использовать в frontend/admin:

```json
// frontend/package.json
{
  "dependencies": {
    "@hummii/shared-types": "workspace:*"
  }
}
```

```typescript
// frontend/lib/api/client.ts
import type { components } from '@hummii/shared-types';

type User = components['schemas']['User'];
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/type-check.yml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start API
        run: |
          cd api
          pnpm run start:dev &
          sleep 10
      
      - name: Generate types
        run: |
          cd frontend
          pnpm run generate-types
      
      - name: Type check
        run: |
          cd frontend
          pnpm run type-check
```

---

## Продвинутая настройка

### 1. Кастомизация генерации

```bash
# Более продвинутые опции
openapi-typescript http://localhost:3001/api/docs-json \
  -o types/api.d.ts \
  --path-params-as-types \
  --alphabetize \
  --default-non-nullable
```

### 2. Генерация из локального файла

```json
// api/package.json
{
  "scripts": {
    "export-swagger": "ts-node scripts/export-swagger.ts"
  }
}
```

```typescript
// api/scripts/export-swagger.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function exportSwagger() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Hummii API')
    .setDescription('API Description')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  
  await app.close();
}

exportSwagger();
```

```bash
# Генерация из файла
cd api
pnpm run export-swagger

cd ../frontend
openapi-typescript ../api/swagger.json -o types/api.d.ts
```

### 3. Watch mode (для разработки)

```json
// frontend/package.json
{
  "scripts": {
    "watch-types": "nodemon --watch ../api/src --ext ts --exec 'pnpm run generate-types'"
  }
}
```

---

## Troubleshooting

### Проблема: Backend не запущен

```bash
# Ошибка: ECONNREFUSED
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Решение:** Убедитесь, что API запущен:
```bash
cd api
pnpm run start:dev
```

### Проблема: CORS при генерации типов

Если API требует аутентификацию или блокирует CORS:

```bash
# Используйте экспорт в файл (см. выше)
cd api
pnpm run export-swagger

cd ../frontend
openapi-typescript ../api/swagger.json -o types/api.d.ts
```

### Проблема: Устаревшие типы

Всегда генерируйте типы перед сборкой:

```json
{
  "scripts": {
    "prebuild": "pnpm run generate-types",
    "build": "next build"
  }
}
```

---

## Альтернативы

### 1. swagger-typescript-api

Генерирует готовый API client с типами:

```bash
pnpm add -D swagger-typescript-api

# Генерация
npx swagger-typescript-api \
  -p http://localhost:3001/api/docs-json \
  -o src/lib/api \
  -n client.ts
```

### 2. NestJS CLI Plugin

Автоматически добавляет Swagger декораторы:

```typescript
// nest-cli.json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

---

## Рекомендуемый подход для Hummii

### Этап 1: Быстрый старт (текущий)

1. Добавить скрипт генерации в `frontend/package.json`
2. Генерировать типы перед dev/build
3. Использовать сгенерированные типы в API client

### Этап 2: Монорепозиторий (будущее)

1. Создать `shared/types` пакет
2. Настроить `pnpm-workspace.yaml`
3. Переиспользовать типы в `frontend`, `admin`, и будущих приложениях

### Этап 3: Продвинутая настройка

1. Type-safe API client с автокомплитом endpoints
2. Автоматическая генерация React Query hooks
3. CI/CD интеграция для проверки типов

---

## Команды

```bash
# Frontend
cd frontend
pnpm run generate-types        # Генерация типов
pnpm run type-check            # Проверка типов
pnpm run dev                   # Dev с автогенерацией

# Admin
cd admin
pnpm run generate-types
pnpm run type-check

# Backend (экспорт Swagger)
cd api
pnpm run export-swagger        # После создания скрипта
```

---

## Ресурсы

- [openapi-typescript Documentation](https://openapi-ts.dev)
- [NestJS Swagger Module](https://docs.nestjs.com/openapi/introduction)
- [GitHub: openapi-typescript](https://github.com/drwpow/openapi-typescript)

---

**Последнее обновление:** 29 октября 2025
**Статус:** Готово к внедрению
**Лицензия:** MIT (бесплатно)

