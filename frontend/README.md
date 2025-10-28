# Hummii Frontend

Frontend application for Hummii service marketplace platform built with Next.js 16, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **React Query** (@tanstack/react-query) for server state management
- **Zustand** for client state management
- **React Hook Form + Zod** for form validation
- **Socket.io-client** for real-time features
- **next-intl** for internationalization (English + French)
- **clsx + tailwind-merge** for utility classes

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
```

### Development

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes (en, fr)
│   │   ├── layout.tsx     # Locale layout with i18n
│   │   └── page.tsx       # Home page
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # React Query & other providers
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error boundary
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── ui/               # Reusable UI components (Button, Input)
│   ├── features/         # Feature-specific components (chat, orders)
│   ├── layouts/          # Layout components (header, footer)
│   └── shared/           # Shared business logic components
├── hooks/                 # Custom React hooks
│   └── use-socket.ts     # Socket.io hook
├── i18n/                  # Internationalization config
│   ├── request.ts        # i18n request config
│   └── routing.ts        # i18n routing config
├── lib/                   # Utilities and helpers
│   ├── api/              # API client
│   ├── store/            # Zustand stores
│   └── utils.ts          # Utility functions (cn, etc.)
├── messages/              # Translation files
│   ├── en.json           # English translations
│   └── fr.json           # French translations
├── middleware.ts          # Next.js middleware (i18n, security)
├── public/                # Static assets
│   └── robots.txt        # SEO robots file
└── types/                 # TypeScript type definitions
```

## Environment Variables

Create `.env.local` file with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_V1_URL=http://localhost:3001/api/v1

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Socket.io (optional)
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# External Services (Add your keys when needed)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key_here
```

## Key Features

### Internationalization (i18n)
- Support for English and French (Canadian requirement)
- Automatic locale detection
- Language switching via URL (`/en/...` or `/fr/...`)

### State Management
- **React Query**: Server state, caching, and API calls
- **Zustand**: Client-side global state (auth, UI preferences)

### Forms & Validation
- **React Hook Form**: Performant form handling
- **Zod**: Type-safe schema validation

### Real-time Features
- **Socket.io**: WebSocket connection for chat and notifications
- Custom `useSocket` hook for easy integration

## Security

This project follows strict security practices:
- HTTPS only in production
- Security headers configured in `next.config.js` and `middleware.ts`
- Content Security Policy (CSP) headers
- No sensitive data in client-side code
- HTTP-only cookies for authentication tokens
- PIPEDA compliance for Canadian market

## Development Guidelines

### Component Organization
- Server Components by default (App Router)
- Use `'use client'` directive only when needed (interactivity, hooks, browser APIs)
- UI components in `components/ui/`
- Feature-specific components in `components/features/`

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Mobile-first responsive design

### Code Quality
- TypeScript strict mode enabled
- ESLint configured
- Prettier for formatting
- No `any` types allowed

## License

ISC

