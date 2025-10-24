# Hummii - Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop or Docker Engine (v24+)
- Docker Compose (v2+)
- At least 4GB RAM available for Docker

### 1. Initial Setup

```bash
# Clone the repository
git clone git@github.com:DanielFilinski/HUMMII.git
cd Hummii

# Copy environment file
cp .env.example .env

# Edit .env file with your actual values
nano .env  # or use your preferred editor
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Start specific service
docker-compose up -d postgres redis

# Start with tools (PgAdmin, Redis Commander)
docker-compose --profile tools up -d
```

### 3. Access Services

- **API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **PgAdmin**: http://localhost:5050 (with `--profile tools`)
- **Redis Commander**: http://localhost:8081 (with `--profile tools`)

### 4. Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild specific service
docker-compose build api

# Restart specific service
docker-compose restart frontend

# View service logs
docker-compose logs -f api

# Execute command in container
docker-compose exec api npm run migration:run
docker-compose exec postgres psql -U hummii -d hummii_dev
```

## Development Workflow

### Database Migrations

```bash
# Generate migration
docker-compose exec api npm run migration:generate -- -n MigrationName

# Run migrations
docker-compose exec api npm run migration:run

# Revert migration
docker-compose exec api npm run migration:revert
```

### Install New Packages

```bash
# API
docker-compose exec api pnpm add package-name

# Frontend
docker-compose exec frontend pnpm add package-name

# Admin
docker-compose exec admin pnpm add package-name

# Rebuild after adding dependencies
docker-compose build api
```

### Database Access

```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U hummii -d hummii_dev

# Backup database
docker-compose exec postgres pg_dump -U hummii hummii_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U hummii -d hummii_dev < backup.sql
```

### Redis Access

```bash
# Redis CLI
docker-compose exec redis redis-cli

# Monitor Redis
docker-compose exec redis redis-cli MONITOR

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

## Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the port
lsof -i :3000
# or
netstat -an | grep 3000

# Kill the process or change port in .env file
```

### Permission Issues

```bash
# Fix ownership of volumes
sudo chown -R $USER:$USER ./uploads ./logs

# Reset Docker
docker system prune -a --volumes
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Out of Memory

```bash
# Check Docker memory usage
docker stats

# Increase Docker Desktop memory in settings
# Or stop unused services
docker-compose stop admin  # if not needed
```

## Environment Variables

Key variables to configure in `.env`:

```bash
# Required for development
DATABASE_PASSWORD=your_secure_password
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# Required for production
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=AIza...
ONESIGNAL_APP_ID=...
AWS_ACCESS_KEY_ID=...
```

## Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate strong JWT secrets (use `openssl rand -base64 64`)
- [ ] Never commit `.env` file
- [ ] Use different secrets for dev/staging/production
- [ ] Enable SSL/TLS in production
- [ ] Restrict database access to app containers only
- [ ] Regular security updates via Dependabot
- [ ] Monitor logs for suspicious activity

## CI/CD Integration

GitHub Actions workflows are configured in `.github/workflows/`:

- `ci.yml` - Continuous Integration (lint, test, build)
- `security.yml` - Security scans (dependencies, secrets, docker)

See [GitHub Actions Setup](#github-actions-setup) below.

## Performance Tips

1. **Use volumes for node_modules**: Already configured in docker-compose.yml
2. **Enable BuildKit**: Add to `~/.docker/config.json`:
   ```json
   {
     "features": {
       "buildkit": true
     }
   }
   ```
3. **Use layer caching**: GitHub Actions already configured
4. **Limit log size**: Configure in docker-compose.yml

## Next Steps

1. Initialize databases:
   ```bash
   docker-compose exec api npm run migration:run
   docker-compose exec api npm run seed
   ```

2. Create admin user:
   ```bash
   docker-compose exec api npm run create-admin
   ```

3. Test services:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001
   curl http://localhost:3002
   ```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/DanielFilinski/HUMMII/issues
- Documentation: `/docs/`

