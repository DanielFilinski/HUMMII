# Rollback Procedures - Hummii Production

**Version:** 1.0  
**Last Updated:** January 6, 2025  
**Status:** Production Ready

## Overview

This document outlines rollback procedures for the Hummii production environment. Rollback should be performed when deployment fails or critical issues are discovered.

## Rollback Scenarios

### Scenario 1: Deployment Failure

**Symptoms:**
- Deployment workflow fails
- Services fail to start
- Health checks failing

**Procedure:**
1. Check deployment logs
2. Identify failure point
3. Execute automated rollback (if available)
4. Or perform manual rollback

**Estimated Time:** 10-15 minutes

---

### Scenario 2: Critical Bug in New Version

**Symptoms:**
- Application errors after deployment
- User reports of issues
- High error rates in monitoring

**Procedure:**
1. Verify issue is critical
2. Notify stakeholders
3. Execute rollback
4. Verify rollback success
5. Investigate issue

**Estimated Time:** 15-30 minutes

---

### Scenario 3: Performance Degradation

**Symptoms:**
- High response times
- Slow database queries
- Resource exhaustion

**Procedure:**
1. Verify performance degradation
2. Check if rollback will help
3. Execute rollback if needed
4. Monitor performance after rollback

**Estimated Time:** 20-40 minutes

---

## Rollback Methods

### Method 1: Automated Rollback (Recommended)

**When:** Deployment fails in GitHub Actions

**Procedure:**
1. GitHub Actions automatically triggers rollback on deployment failure
2. Previous version is restored
3. Services are restarted
4. Health checks are verified

**Advantages:**
- Fast (automatic)
- Consistent
- Less error-prone

---

### Method 2: Manual Rollback Script

**When:** Need to rollback manually

**Procedure:**
1. **SSH to Production Server:**
   ```bash
   ssh user@production-server
   cd /opt/hummii
   ```

2. **Execute Rollback Script:**
   ```bash
   # Rollback to latest backup
   ./scripts/rollback.sh --latest
   
   # Or rollback to specific version
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

### Method 3: Docker Compose Rollback

**When:** Need to rollback Docker Compose configuration

**Procedure:**
1. **Identify Previous Version:**
   ```bash
   # List available backups
   ls -lt /opt/hummii/backups/docker-compose.prod.yml.backup-*
   ```

2. **Restore Previous Configuration:**
   ```bash
   # Copy previous configuration
   cp /opt/hummii/backups/docker-compose.prod.yml.backup-<timestamp> \
      /opt/hummii/docker-compose.prod.yml
   ```

3. **Restart Services:**
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Verify Rollback:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   curl http://localhost/api/health
   ```

**Estimated Time:** 15-20 minutes

---

## Rollback Checklist

### Pre-Rollback
- [ ] Identify rollback version
- [ ] Verify backup exists
- [ ] Notify stakeholders
- [ ] Prepare rollback procedure
- [ ] Backup current state

### During Rollback
- [ ] Stop affected services
- [ ] Restore previous configuration
- [ ] Restore previous Docker images
- [ ] Restart services
- [ ] Verify service health

### Post-Rollback
- [ ] Verify all services healthy
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Notify stakeholders of completion

---

## Database Rollback

### Database-Only Rollback

**When:** Database migration causes issues

**Procedure:**
1. **Stop Application Services:**
   ```bash
   docker compose -f docker-compose.prod.yml stop api
   ```

2. **Restore Database:**
   ```bash
   ./scripts/backup/restore-database.sh <backup-file> --force
   ```

3. **Rollback Database Migration:**
   ```bash
   docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate:rollback
   ```

4. **Start Services:**
   ```bash
   docker compose -f docker-compose.prod.yml start api
   ```

**Estimated Time:** 30-60 minutes

---

## Verification After Rollback

### Service Health
- [ ] All services running
- [ ] Health checks passing
- [ ] No critical errors in logs

### Application Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Order creation works
- [ ] Chat functionality works
- [ ] Payment processing works

### Performance
- [ ] Response times normal
- [ ] Database queries fast
- [ ] No resource exhaustion

---

## Communication

### Stakeholder Notification
- **Before Rollback:** Notify team of rollback
- **During Rollback:** Real-time status updates
- **After Rollback:** Rollback summary report

### Status Page Updates
- **Rollback Started:** Update status page
- **Rollback Progress:** Regular updates
- **Rollback Completed:** Final status update

---

## Post-Rollback Actions

### Immediate (First Hour)
- [ ] Monitor service health
- [ ] Check error logs
- [ ] Verify user flows
- [ ] Test critical endpoints

### Short-term (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Investigate root cause

### Long-term (First Week)
- [ ] Fix issues in new version
- [ ] Re-test deployment
- [ ] Update deployment procedures
- [ ] Conduct post-mortem

---

## Prevention

### Pre-Deployment Checks
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Staging environment tested

### Deployment Monitoring
- [ ] Real-time monitoring during deployment
- [ ] Automated health checks
- [ ] Error rate monitoring
- [ ] Performance monitoring

### Post-Deployment Verification
- [ ] Automated smoke tests
- [ ] User flow testing
- [ ] Performance verification
- [ ] Security verification

---

**Last Updated:** January 6, 2025  
**Next Review:** February 2025  
**Maintained By:** DevOps Team

