# Production Deployment Runbook - Hummii

**Version:** 1.0  
**Last Updated:** January 6, 2025  
**Status:** Production Ready

## Overview

This runbook provides step-by-step procedures for deploying Hummii to production. Follow these procedures carefully to ensure a successful deployment.

## Prerequisites

### Before Deployment
- [ ] All code changes reviewed and merged to `main` branch
- [ ] All tests passing (unit, E2E, integration)
- [ ] Security audit completed (no CRITICAL or HIGH vulnerabilities)
- [ ] Performance testing completed (meets targets)
- [ ] Backup verification completed
- [ ] Environment variables configured
- [ ] SSL certificates obtained and configured
- [ ] DNS records configured
- [ ] Firewall rules configured
- [ ] Monitoring and alerting configured

### Required Access
- [ ] SSH access to production server
- [ ] Docker and Docker Compose installed
- [ ] GitHub Actions access (for CI/CD)
- [ ] AWS S3 access (for backups)
- [ ] Monitoring dashboard access

## Deployment Procedures

### Automated Deployment (Recommended)

**When:** Merge to `main` branch or manual trigger

**Procedure:**
1. **Push to Main Branch:**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

2. **Monitor GitHub Actions:**
   - Go to GitHub Actions tab
   - Monitor `deploy-production` workflow
   - Check all jobs pass:
     - Pre-deployment checks
     - Tests
     - Security scan
     - Build
     - Deploy

3. **Verify Deployment:**
   ```bash
   # Check API health
   curl https://api.hummii.ca/api/health
   
   # Check frontend
   curl https://hummii.ca
   
   # Check admin panel
   curl https://admin.hummii.ca
   ```

4. **Monitor Logs:**
   ```bash
   # Watch API logs
   docker compose -f docker-compose.prod.yml logs -f api
   
   # Check for errors
   docker compose -f docker-compose.prod.yml logs api | grep -i error
   ```

**Estimated Time:** 15-30 minutes

---

### Manual Deployment

**When:** Automated deployment fails or emergency deployment

**Procedure:**
1. **SSH to Production Server:**
   ```bash
   ssh user@production-server
   cd /opt/hummii
   ```

2. **Pull Latest Code:**
   ```bash
   git pull origin main
   ```

3. **Run Deployment Script:**
   ```bash
   export VERSION="main-$(git rev-parse --short HEAD)-$(date +%Y%m%d%H%M%S)"
   export REGISTRY="ghcr.io"
   export IMAGE_PREFIX="your-org/hummii"
   export GITHUB_TOKEN="your-github-token"
   
   ./scripts/deploy-production.sh
   ```

4. **Verify Deployment:**
   ```bash
   # Check service health
   docker compose -f docker-compose.prod.yml ps
   
   # Check API health
   curl http://localhost/api/health
   
   # Check logs
   docker compose -f docker-compose.prod.yml logs -f api
   ```

**Estimated Time:** 20-40 minutes

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Backup verification completed
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Firewall rules configured

### During Deployment
- [ ] Pre-deployment checks passed
- [ ] Tests executed successfully
- [ ] Security scan completed
- [ ] Docker images built successfully
- [ ] Images pushed to registry
- [ ] Services started successfully
- [ ] Health checks passing

### Post-Deployment
- [ ] API health check passed
- [ ] Frontend accessible
- [ ] Admin panel accessible
- [ ] Database migrations completed
- [ ] All services healthy
- [ ] Monitoring active
- [ ] No critical errors in logs
- [ ] User flows tested

---

## Rollback Procedures

### Automated Rollback

If deployment fails, GitHub Actions will automatically rollback:

1. **Check Rollback Status:**
   - Go to GitHub Actions
   - Check deployment workflow
   - Rollback will be triggered automatically on failure

2. **Verify Rollback:**
   ```bash
   # Check service health
   docker compose -f docker-compose.prod.yml ps
   
   # Check API health
   curl http://localhost/api/health
   ```

### Manual Rollback

**When:** Need to rollback to previous version

**Procedure:**
1. **Identify Rollback Version:**
   ```bash
   # List available backups
   ls -lt /opt/hummii/backups/docker-compose.prod.yml.backup-*
   
   # Or use latest backup
   ./scripts/rollback.sh --latest
   ```

2. **Rollback to Specific Version:**
   ```bash
   ./scripts/rollback.sh <version>
   ```

3. **Verify Rollback:**
   ```bash
   # Check service health
   docker compose -f docker-compose.prod.yml ps
   
   # Check API health
   curl http://localhost/api/health
   ```

**Estimated Time:** 10-15 minutes

---

## Verification Procedures

### Health Checks

**API Health:**
```bash
curl https://api.hummii.ca/api/health
# Expected: {"status":"ok","message":"Hummii API is running","timestamp":"..."}
```

**Frontend Health:**
```bash
curl https://hummii.ca
# Expected: HTTP 200 OK
```

**Admin Panel Health:**
```bash
curl https://admin.hummii.ca
# Expected: HTTP 200 OK
```

### Service Verification

**Check All Services:**
```bash
docker compose -f docker-compose.prod.yml ps
# All services should show "Up" status
```

**Check Service Logs:**
```bash
# API logs
docker compose -f docker-compose.prod.yml logs api --tail=100

# Frontend logs
docker compose -f docker-compose.prod.yml logs frontend --tail=100

# Database logs
docker compose -f docker-compose.prod.yml logs postgres --tail=100
```

### Database Verification

**Check Database Connection:**
```bash
docker compose -f docker-compose.prod.yml exec api npm run prisma:studio
# Or
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "SELECT 1;"
```

**Check Database Migrations:**
```bash
docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate:status
```

---

## Troubleshooting

### Deployment Fails

**Symptoms:**
- GitHub Actions workflow fails
- Docker images fail to build
- Services fail to start

**Solutions:**
1. Check GitHub Actions logs
2. Check Docker build logs
3. Verify environment variables
4. Check service logs
5. Verify resource availability

### Services Not Starting

**Symptoms:**
- Services show "Exited" status
- Health checks failing
- Connection errors

**Solutions:**
1. Check service logs: `docker compose -f docker-compose.prod.yml logs <service>`
2. Verify environment variables
3. Check resource limits
4. Verify dependencies (database, Redis)
5. Check network connectivity

### Database Connection Issues

**Symptoms:**
- API errors about database connection
- Database connection timeout
- SSL connection errors

**Solutions:**
1. Verify database is running: `docker compose -f docker-compose.prod.yml ps postgres`
2. Check database logs: `docker compose -f docker-compose.prod.yml logs postgres`
3. Verify DATABASE_URL includes `?sslmode=require`
4. Check SSL certificates
5. Verify database credentials

---

## Emergency Procedures

### Service Outage

**Immediate Actions:**
1. Check service status: `docker compose -f docker-compose.prod.yml ps`
2. Check logs: `docker compose -f docker-compose.prod.yml logs --tail=100`
3. Restart services: `docker compose -f docker-compose.prod.yml restart`
4. If restart fails, rollback: `./scripts/rollback.sh --latest`

### Database Corruption

**Immediate Actions:**
1. Stop application services
2. Identify latest valid backup
3. Restore database: `./scripts/backup/restore-database.sh <backup-file> --force`
4. Verify database integrity
5. Restart services

### Security Incident

**Immediate Actions:**
1. Isolate affected services
2. Revoke compromised credentials
3. Rotate all secrets
4. Restore from pre-incident backup
5. Conduct security audit
6. Notify stakeholders

---

## Post-Deployment Tasks

### Immediate (First Hour)
- [ ] Monitor service health
- [ ] Check error logs
- [ ] Verify user flows
- [ ] Test critical endpoints
- [ ] Monitor performance metrics

### Short-term (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor security alerts
- [ ] Verify backup procedures

### Long-term (First Week)
- [ ] Review monitoring dashboards
- [ ] Analyze performance trends
- [ ] Review security audit results
- [ ] Update documentation
- [ ] Conduct post-mortem (if issues)

---

## Communication

### Stakeholder Notification
- **Before Deployment:** Notify team of deployment schedule
- **During Deployment:** Real-time status updates
- **After Deployment:** Deployment summary report

### Status Page Updates
- **Maintenance:** Update status page before deployment
- **Deployment:** Update status page during deployment
- **Completion:** Update status page after successful deployment

---

**Last Updated:** January 6, 2025  
**Next Review:** February 2025  
**Maintained By:** DevOps Team

