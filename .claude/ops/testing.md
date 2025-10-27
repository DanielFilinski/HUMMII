# Testing Guide - Hummii

> **Версия:** 1.0
> **Последнее обновление:** 27 октября 2025
> **Проект:** Hummii Service Marketplace Platform

---

## Содержание

1. [Стратегия тестирования](#стратегия-тестирования)
2. [Backend тестирование (Jest + Supertest)](#backend-тестирование)
3. [Frontend тестирование (React Testing Library)](#frontend-тестирование)
4. [Цели покрытия](#цели-покрытия)
5. [Мокирование внешних сервисов](#мокирование-внешних-сервисов)
6. [Запуск тестов](#запуск-тестов)
7. [Отладка тестов](#отладка-тестов)

---

## Стратегия тестирования

### Пирамида тестирования

```
       /\
      /  \      E2E тесты (5%)
     /____\     - Критичные пользовательские потоки
    /      \
   /  Inte  \   Integration тесты (20%)
  /__gration_\  - API endpoints
 /            \
/    Unit      \ Unit тесты (75%)
/____Tests_____\ - Бизнес-логика, утилиты, компоненты
```

### Уровни тестирования

**Unit Tests (75% покрытия):**
- Бизнес-логика в сервисах
- Утилиты и хелперы
- React компоненты
- Валидационные схемы

**Integration Tests (20% покрытия):**
- API endpoints (E2E для backend)
- Database операции
- Интеграция с внешними API (мокированные)

**E2E Tests (5% покрытия):**
- Критичные пользовательские сценарии
- Процесс оплаты
- Регистрация и логин
- Создание заказа

---

## Backend тестирование

### Настройка Jest (NestJS)

```typescript
// api/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Unit тесты для сервисов

```typescript
// api/src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const inputUser = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const expectedUser = {
        id: '123',
        email: inputUser.email,
        name: inputUser.name,
        password: 'hashedPassword',
        createdAt: new Date(),
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser as any);

      const result = await service.create(inputUser);

      expect(result.password).not.toBe(inputUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(inputUser.password, 12);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      const inputUser = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: '456',
        email: inputUser.email,
      } as any);

      await expect(service.create(inputUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return user if exists', async () => {
      const userId = '123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(expectedUser as any);

      const result = await service.findById(userId);

      expect(result).toEqual(expectedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### E2E тесты для API

```typescript
// api/test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  describe('/auth/register (POST)', () => {
    it('should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          name: 'New User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('newuser@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',
          name: 'Test',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password');
        });
    });

    it('should reject duplicate email', async () => {
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'First User',
        });

      // Try to create again
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password456!',
          name: 'Second User',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
          name: 'Existing User',
        });
    });

    it('should return access token on successful login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('Protected routes', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'Password123!',
          name: 'Protected User',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'Password123!',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('protected@example.com');
        });
    });

    it('should reject access without token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });
});
```

---

## Frontend тестирование

### Настройка Jest (React Testing Library)

```typescript
// frontend/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

```typescript
// frontend/jest.setup.js
import '@testing-library/jest-dom';
```

### Component тесты

```typescript
// frontend/components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './login-form';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    expect(
      await screen.findByText(/password must be at least 12 characters/i)
    ).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ accessToken: 'token' }),
      })
    ) as jest.Mock;

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });
  });

  it('disables submit button during submission', async () => {
    global.fetch = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    ) as jest.Mock;

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
```

### Integration тесты с React Query

```typescript
// frontend/components/user-profile.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from './user-profile';

describe('UserProfile Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  afterEach(() => {
    queryClient.clear();
  });

  it('displays user data when loaded', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        }),
      })
    ) as jest.Mock;

    render(<UserProfile userId="1" />, { wrapper });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API error'))
    ) as jest.Mock;

    render(<UserProfile userId="1" />, { wrapper });

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('refetches data on retry', async () => {
    let callCount = 0;

    global.fetch = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('API error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        }),
      });
    }) as jest.Mock;

    const { rerender } = render(<UserProfile userId="1" />, { wrapper });

    expect(await screen.findByText(/error/i)).toBeInTheDocument();

    // Trigger retry
    rerender(<UserProfile userId="1" />);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });
});
```

---

## Цели покрытия

### Критичные пути (80%+ покрытия)

**Backend:**
- ✅ Аутентификация (auth module)
- ✅ Обработка платежей (payments module)
- ✅ Разрешение споров (disputes module)
- ✅ Управление подписками (subscriptions module)
- ✅ Модерация контента (moderation service)
- ✅ PIPEDA endpoints (user data access/deletion)

**Frontend:**
- ✅ Формы аутентификации
- ✅ Процесс оплаты
- ✅ Валидация форм
- ✅ Критичные UI компоненты

### Отчет о покрытии

```bash
# Backend
cd api
pnpm run test:cov

# Output:
# Statements   : 85%
# Branches     : 80%
# Functions    : 82%
# Lines        : 84%

# Frontend
cd frontend
pnpm run test:cov

# Output:
# Statements   : 78%
# Branches     : 75%
# Functions    : 80%
# Lines        : 77%
```

---

## Мокирование внешних сервисов

### Stripe

```typescript
// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test',
        client_secret: 'secret_test',
        status: 'succeeded',
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test',
        status: 'succeeded',
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test',
            metadata: { orderId: 'order_123' },
          },
        },
      }),
    },
  }));
});
```

### OneSignal

```typescript
// Mock OneSignal
jest.mock('@onesignal/node-onesignal', () => ({
  createNotification: jest.fn().mockResolvedValue({
    id: 'notification_id',
    recipients: 1,
  }),
}));
```

### Socket.io

```typescript
// Mock Socket.io
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));
```

### Google Maps API

```typescript
// Mock Google Maps
global.fetch = jest.fn((url) => {
  if (url.includes('maps.googleapis.com')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        results: [
          {
            formatted_address: 'Toronto, ON, Canada',
            geometry: {
              location: {
                lat: 43.6532,
                lng: -79.3832,
              },
            },
          },
        ],
      }),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
}) as jest.Mock;
```

---

## Запуск тестов

### Основные команды

```bash
# Unit тесты
cd api
pnpm run test

cd frontend
pnpm run test

# E2E тесты (API)
cd api
pnpm run test:e2e

# Watch режим (для разработки)
pnpm run test:watch

# Покрытие кода
pnpm run test:cov

# Запустить конкретный тестовый файл
pnpm run test users.service.spec.ts

# Запустить тесты с конкретным pattern
pnpm run test -- --testNamePattern="should create user"
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm run lint

      - name: Run tests
        run: pnpm run test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

---

## Отладка тестов

### VSCode Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasename}",
        "--config",
        "jest.config.js"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest All Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--config",
        "jest.config.js"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Полезные флаги Jest

```bash
# Запустить только failed тесты
pnpm run test --onlyFailures

# Verbose output
pnpm run test --verbose

# Run in band (последовательно, полезно для debugging)
pnpm run test --runInBand

# Обновить snapshots
pnpm run test -u

# Показать покрытие в терминале
pnpm run test --coverage --coverageReporters=text
```

---

## Связанные документы

- **[CLAUDE.md](/Volumes/FilinSky/PROJECTS/Hummii/CLAUDE.md)** - Полное руководство по проекту
- **[.claude/backend/nestjs-guide.md](/Volumes/FilinSky/PROJECTS/Hummii/.claude/backend/nestjs-guide.md)** - NestJS паттерны
- **[.claude/frontend/nextjs-guide.md](/Volumes/FilinSky/PROJECTS/Hummii/.claude/frontend/nextjs-guide.md)** - Next.js паттерны

---

**Последнее обновление:** 27 октября 2025
