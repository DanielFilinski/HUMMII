# 🐝 Hummii

**Hummii** — платформа для связи клиентов с исполнителями услуг в Канаде.  
A platform connecting clients with service providers in Canada.

[![CI/CD](https://github.com/DanielFilinski/HUMMII/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/DanielFilinski/HUMMII/actions)
[![Security](https://github.com/DanielFilinski/HUMMII/workflows/Security%20Checks/badge.svg)](https://github.com/DanielFilinski/HUMMII/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Security & Compliance](#security--compliance)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Hummii is a modern service marketplace platform designed for the Canadian market, featuring:

- 🔍 **Service Search** - Find contractors by location, category, and ratings
- 💬 **Real-time Chat** - Secure messaging between clients and contractors
- 💳 **Payment Processing** - Secure payments via Stripe (CAD)
- ⭐ **Rating System** - Review and rate service providers
- 📱 **Mobile-First** - Responsive design for all devices
- 🔒 **PIPEDA Compliant** - Full compliance with Canadian privacy laws

---

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Prisma/TypeORM** - Database ORM
- **Socket.io** - Real-time communication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Server state management
- **Zustand** - Client state management

### Admin Panel
- **Refine** - React-based admin framework
- **Next.js** - Modern React framework

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipelines
- **AWS/DigitalOcean** - Cloud hosting

### External Services
- **Stripe** - Payment processing & identity verification
- **Google Maps** - Geolocation & mapping
- **OneSignal** - Email & push notifications
- **OpenAI** - AI chatbot support
- **Sentry** - Error tracking

📖 **For detailed stack information, see:**
- 🌟 [**Stack_EN.md**](docs/Stack_EN.md) - **Primary technical documentation** (English, fully aligned with coding rules)
- 📄 [Stack.md](docs/Stack.md) - Quick reference (redirects to Stack_EN.md)
- 📄 [TS.md](docs/TS.md) - Technical specification (Russian)

---

## 📁 Project Structure

```
Hummii/
├── .github/              # GitHub Actions workflows
│   ├── workflows/
│   │   ├── ci.yml       # CI/CD pipeline
│   │   └── security.yml # Security scans
│   └── dependabot.yml   # Dependency updates
│
├── api/                 # Backend (NestJS)
│   ├── src/
│   ├── test/
│   ├── logs/            # Winston logs (in container)
│   └── package.json
│
├── frontend/            # User-facing app (Next.js)
│   ├── app/
│   ├── components/
│   └── package.json
│
├── admin/               # Admin panel (Next.js)
│   ├── app/
│   ├── components/
│   └── package.json
│
├── docker/              # Docker configurations
│   ├── api.Dockerfile
│   ├── frontend.Dockerfile
│   ├── admin.Dockerfile
│   └── postgres/
│
├── docs/                # Documentation
│   ├── api/            # API documentation
│   ├── modules/        # Feature specifications
│   ├── configs/        # Configuration guides
│   ├── plan.md         # Project roadmap
│   ├── security.md     # Security measures
│   └── Stack.md        # Tech stack details
│
├── docker-compose.yml   # Local development
├── .env.example         # Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Docker Desktop** (recommended) or Docker Engine
- **pnpm** (recommended) or npm/yarn
- **Git**

### Quick Start with Docker

```bash
# 1. Clone repository
git clone git@github.com:DanielFilinski/HUMMII.git
cd Hummii

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your values (see .env.example for details)
nano .env

# 4. Start all services
docker-compose up -d

# 5. Access services
# API: http://localhost:3000
# Frontend: http://localhost:3001
# Admin: http://localhost:3002
```

For detailed Docker setup, see [docker/README.md](docker/README.md).

### Manual Setup (without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. Install Dependencies

```bash
# Backend
cd api
pnpm install

# Frontend
cd ../frontend
pnpm install

# Admin
cd ../admin
pnpm install
```

#### 2. Setup Databases

```bash
# Install PostgreSQL 15
brew install postgresql@15  # macOS
# or use apt-get on Linux

# Install Redis
brew install redis  # macOS

# Start services
brew services start postgresql@15
brew services start redis
```

#### 3. Configure Environment

```bash
# Copy environment files for each service
cp .env.example api/.env
cp .env.example frontend/.env
cp .env.example admin/.env

# Edit each .env file
```

#### 4. Run Migrations

```bash
cd api
pnpm run migration:run
pnpm run seed  # Optional: seed test data
```

#### 5. Start Development Servers

```bash
# Terminal 1 - API
cd api
pnpm run start:dev

# Terminal 2 - Frontend
cd frontend
pnpm run dev

# Terminal 3 - Admin
cd admin
pnpm run dev
```

</details>

---

## 💻 Development

### Available Scripts

Each service (api, frontend, admin) has these scripts:

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier
pnpm run test         # Run unit tests
pnpm run test:e2e     # Run E2E tests
pnpm run type-check   # TypeScript type checking
```

### Database Commands (API)

```bash
pnpm run migration:generate -- -n MigrationName
pnpm run migration:run
pnpm run migration:revert
pnpm run seed
```

### Code Quality

```bash
# Run all checks before committing
pnpm run lint
pnpm run format
pnpm run type-check
pnpm run test
```

### Viewing Logs

Winston logger writes structured logs with automatic PII masking (PIPEDA compliant):

```bash
# Using helper script (recommended)
./scripts/view-logs.sh stats           # Show statistics
./scripts/view-logs.sh tail            # Tail all logs in real-time
./scripts/view-logs.sh tail error      # Tail only errors
./scripts/view-logs.sh errors          # Show recent errors
./scripts/view-logs.sh search "text"   # Search logs
./scripts/view-logs.sh help            # Show all commands

# Direct file access
tail -f logs/api/combined.log          # All logs
tail -f logs/api/error.log             # Only errors
tail -f logs/api/audit.log             # Audit logs (PIPEDA)

# Inside Docker container
docker exec hummii-api tail -f /app/logs/combined.log

# Copy logs from container to host
docker cp hummii-api:/app/logs/. ./logs/api/
```

**Log Files:**
- `combined.log` - All logs (8211+ lines)
- `error.log` - Only errors (38 lines)
- `audit.log` - Audit trail for PIPEDA compliance (3023+ lines)
- `exceptions.log` - Unhandled exceptions
- `rejections.log` - Promise rejections

All logs automatically mask PII: emails (`j***@example.com`), phones (`******7890`), passwords, tokens, credit cards.

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Push and create PR
git push origin feature/your-feature-name
```

**Commit Convention**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Tests
- `security:` - Security fixes

---

## 🔒 Security & Compliance

Hummii is designed with security as a priority, especially for Canadian market compliance:

### Key Security Features

✅ **Authentication & Authorization**
- JWT with HTTP-only cookies
- OAuth2 (Google, Apple)
- Email verification mandatory
- Role-based access control (RBAC)

✅ **Data Protection**
- Encryption at rest (PostgreSQL TDE)
- Encryption in transit (TLS 1.3)
- Field-level encryption for PII
- Secure session management

✅ **API Security**
- Rate limiting (global, auth, chat)
- CORS policy (whitelisted domains)
- Helmet.js security headers
- Input validation & sanitization

✅ **Chat Security**
- Content moderation (phone, email, links)
- Message rate limiting
- Spam detection
- Report/flag system

✅ **PIPEDA Compliance**
- Data minimization
- User rights (access, rectification, erasure)
- Clear privacy policy
- Data retention policies
- Breach notification procedures

For full security documentation, see [docs/security.md](docs/security.md).

### Security Scanning

GitHub Actions automatically runs:
- **Dependency scanning** (npm audit, Snyk)
- **Code analysis** (CodeQL)
- **Secret scanning** (TruffleHog, GitLeaks)
- **Container scanning** (Trivy)
- **OWASP checks**

---

## 📚 Documentation

### Core Documentation
- 🌟 [**Stack_EN.md**](docs/Stack_EN.md) - **Complete technical stack** (English, primary reference)
- 📄 [Technical Specification (TS.md)](docs/TS.md) - Full project specification (Russian)
- 📊 [Documentation Alignment Summary](docs/ALIGNMENT_SUMMARY.md) - Documentation consistency report
- 📝 [CHANGELOG_TS.md](docs/CHANGELOG_TS.md) - Documentation change history

### Setup & Configuration
- ⚙️ [**Services Setup Guide**](docs/setup/SERVICES_SETUP_GUIDE.md) - **Complete guide for all external services** (1Password, Cloudflare, Stripe, SendGrid, etc.)
- ✅ [Services Checklist](docs/setup/SERVICES_CHECKLIST.md) - Quick checklist for service configuration
- 🏗️ [Services Architecture](docs/setup/SERVICES_ARCHITECTURE.md) - Visual architecture and data flows
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment guide
- 🌍 [Environment Setup](ENV_SETUP.md) - Environment variables configuration

### Guides & References
- 📋 [Project Plan](docs/plan.md) - Roadmap and milestones
- 🔒 [Security](docs/security.md) - Security measures and PIPEDA compliance
- 🐙 [GitHub Setup](docs/GITHUB_SETUP.md) - Repository configuration

### Feature Documentation
- 📡 [API Documentation](docs/api/) - API endpoints and integrations
  - [Geolocation](docs/api/geolocation.md)
  - [OneSignal](docs/api/onesignal.md)
  - [Verification](docs/api/verification.md)
- 🎨 [Modules](docs/modules/) - Feature specifications
  - [Chat System](docs/modules/chat.md)
  - [Rating System](docs/modules/rating.md)
  - [Partner Portal](docs/modules/Partner%20Portal.md)
- ⚙️ [Configurations](docs/configs/)
  - [SEO Configuration](docs/configs/SEO.md)

### Development
- 🐳 [Docker Setup](docker/README.md) - Container development guide
- 🎯 [Coding Rules](.cursor/rules/) - nest.mdc & next.mdc

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Review Process

- All PRs require at least one approval
- CI/CD checks must pass
- Security scans must pass
- Code coverage should not decrease

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Daniel Filinski** - Project Lead & Developer

---

## 📞 Contact

- **Email**: admin@hummii.ca
- **Website**: [hummii.ca](https://hummii.ca) (coming soon)
- **GitHub**: [DanielFilinski/HUMMII](https://github.com/DanielFilinski/HUMMII)

---

## 🙏 Acknowledgments

- NestJS community
- Next.js team
- All open-source contributors
- Canadian tech community

---

**Made with ❤️ in Canada 🍁**

