# Hummii Frontend

Frontend application for Hummii service marketplace platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 14** with App Router
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling

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
├── app/                # App Router pages and layouts
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── loading.tsx     # Loading UI
│   ├── error.tsx       # Error boundary
│   └── not-found.tsx   # 404 page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── features/      # Feature-specific components
│   └── layouts/       # Layout components
├── lib/               # Utilities and helpers
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## Environment Variables

See `.env.local.example` for required environment variables.

## Security

This project follows strict security practices:
- HTTPS only in production
- Security headers configured in `next.config.js`
- No sensitive data in client-side code
- PIPEDA compliance for Canadian market

## License

ISC

