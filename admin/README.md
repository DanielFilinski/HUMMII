# Hummii Admin Panel

Administrative panel for the Hummii platform built with Refine.dev and Next.js 14.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Admin Framework:** Refine.dev
- **UI Library:** Ant Design
- **Language:** TypeScript
- **Backend API:** NestJS (http://localhost:3000)

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3002
```

### Docker

```bash
# Start with docker-compose
docker-compose up admin

# Access
# http://localhost:3002
```

## Project Structure

```
/admin/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Dashboard page
│   └── providers/
│       └── auth-provider.ts  # Authentication logic (placeholder)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Future Development

This is a basic setup ready for future implementation:

- [ ] Authentication with NestJS backend
- [ ] User management (CRUD)
- [ ] Moderation queues
- [ ] Analytics dashboard
- [ ] Dispute resolution
- [ ] Audit log viewer

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Documentation

- [Refine.dev Docs](https://refine.dev/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Ant Design](https://ant.design/)

## Security

- Admin-only access (role check required)
- Audit logging for all admin actions
- Rate limiting on backend endpoints
- PIPEDA compliance for Canadian market

---

**Status:** Basic setup complete ✅  
**Last Updated:** October 29, 2025

