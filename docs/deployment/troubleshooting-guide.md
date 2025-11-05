# Troubleshooting Guide - Hummii Production

**Version:** 1.0  
**Last Updated:** January 6, 2025  
**Status:** Production Ready

## Overview

This guide provides troubleshooting procedures for common issues in the Hummii production environment.

## Common Issues

### Issue 1: API Service Not Starting

**Symptoms:**
- API container exits immediately
- Health check fails
- Connection errors

**Diagnosis:**
```bash
# Check API logs
docker compose -f docker-compose.prod.yml logs api

# Check container status
docker compose -f docker-compose.prod.yml ps api

# Check container exit code
docker compose -f docker-compose.prod.yml ps api | grep Exit
```

**Solutions:**
1. **Missing Environment Variables:**
   ```bash
   # Check environment variables
   docker compose -f docker-compose.prod.yml config
   
   # Verify .env.production file exists
   ls -la /opt/hummii/.env.production
   ```

2. **Database Connection Issues:**
   ```bash
   # Check database is running
   docker compose -f docker-compose.prod.yml ps postgres
   
   # Test database connection
   docker compose -f docker-compose.prod.yml exec api npm run prisma:studio
   ```

3. **Port Already in Use:**
   ```bash
   # Check if port is in use
   netstat -tuln | grep 3000
   
   # Kill process using port
   sudo fuser -k 3000/tcp
   ```

4. **Insufficient Resources:**
   ```bash
   # Check system resources
   free -h
   df -h
   
   # Check Docker resource usage
   docker stats
   ```

---

### Issue 2: Database Connection Errors

**Symptoms:**
- "Connection refused" errors
- "SSL connection required" errors
- "Authentication failed" errors

**Diagnosis:**
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "SELECT 1;"
```

**Solutions:**
1. **Database Not Running:**
   ```bash
   # Start database
   docker compose -f docker-compose.prod.yml start postgres
   
   # Check database health
   docker compose -f docker-compose.prod.yml ps postgres
   ```

2. **SSL Configuration Issues:**
   ```bash
   # Verify DATABASE_URL includes sslmode=require
   echo $DATABASE_URL
   
   # Check SSL certificates
   ls -la /opt/hummii/docker/nginx/ssl/certs/
   ```

3. **Authentication Issues:**
   ```bash
   # Verify database credentials
   docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "\du"
   
   # Check .env.production file
   grep DATABASE_ /opt/hummii/.env.production
   ```

---

### Issue 3: Redis Connection Errors

**Symptoms:**
- "NOAUTH Authentication required" errors
- "Connection refused" errors
- Cache not working

**Diagnosis:**
```bash
# Check Redis logs
docker compose -f docker-compose.prod.yml logs redis

# Test Redis connection
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

**Solutions:**
1. **Redis Not Running:**
   ```bash
   # Start Redis
   docker compose -f docker-compose.prod.yml start redis
   
   # Check Redis health
   docker compose -f docker-compose.prod.yml ps redis
   ```

2. **Authentication Issues:**
   ```bash
   # Verify Redis password
   docker compose -f docker-compose.prod.yml exec redis redis-cli -a "${REDIS_PASSWORD}" ping
   
   # Check .env.production file
   grep REDIS_ /opt/hummii/.env.production
   ```

3. **Memory Issues:**
   ```bash
   # Check Redis memory usage
   docker compose -f docker-compose.prod.yml exec redis redis-cli info memory
   
   # Clear Redis cache (if needed)
   docker compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL
   ```

---

### Issue 4: Nginx Not Starting

**Symptoms:**
- Nginx container exits
- 502 Bad Gateway errors
- SSL certificate errors

**Diagnosis:**
```bash
# Check Nginx logs
docker compose -f docker-compose.prod.yml logs nginx

# Test Nginx configuration
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

**Solutions:**
1. **Configuration Errors:**
   ```bash
   # Test Nginx configuration
   docker compose -f docker-compose.prod.yml exec nginx nginx -t
   
   # Fix configuration errors
   # Edit docker/nginx/nginx.conf
   # Restart Nginx
   docker compose -f docker-compose.prod.yml restart nginx
   ```

2. **SSL Certificate Issues:**
   ```bash
   # Check SSL certificates
   ls -la /opt/hummii/docker/nginx/ssl/certs/
   ls -la /opt/hummii/docker/nginx/ssl/private/
   
   # Renew certificates if needed
   sudo /opt/hummii/scripts/ssl/certbot-renew.sh
   ```

3. **Port Conflicts:**
   ```bash
   # Check if ports 80/443 are in use
   netstat -tuln | grep -E '80|443'
   
   # Kill process using ports
   sudo fuser -k 80/tcp
   sudo fuser -k 443/tcp
   ```

---

### Issue 5: High Memory Usage

**Symptoms:**
- Containers being killed
- OOM (Out of Memory) errors
- Slow performance

**Diagnosis:**
```bash
# Check system memory
free -h

# Check Docker memory usage
docker stats --no-stream

# Check container memory limits
docker compose -f docker-compose.prod.yml config | grep -A 5 mem_limit
```

**Solutions:**
1. **Increase Memory Limits:**
   ```bash
   # Edit docker-compose.prod.yml
   # Add memory limits to services
   # Restart services
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **Optimize Application:**
   ```bash
   # Check for memory leaks
   docker compose -f docker-compose.prod.yml logs api | grep -i memory
   
   # Restart services
   docker compose -f docker-compose.prod.yml restart api
   ```

3. **Add Swap Space:**
   ```bash
   # Check swap
   free -h
   
   # Add swap if needed
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

---

### Issue 6: Slow Database Queries

**Symptoms:**
- High API response times
- Database connection timeouts
- Slow query logs

**Diagnosis:**
```bash
# Check slow queries
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "
    SELECT query, calls, total_time, mean_time
    FROM pg_stat_statements
    WHERE mean_time > 100
    ORDER BY mean_time DESC
    LIMIT 10;
"

# Check database connections
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "
    SELECT count(*) FROM pg_stat_activity;
"
```

**Solutions:**
1. **Optimize Database:**
   ```bash
   # Run optimization script
   /opt/hummii/scripts/optimization/optimize-database.sh
   ```

2. **Add Missing Indexes:**
   ```bash
   # Check for missing indexes
   docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "
       SELECT schemaname, tablename, attname, n_distinct
       FROM pg_stats
       WHERE n_distinct > 100
       AND correlation < 0.1;
   "
   
   # Add indexes as needed
   ```

3. **Increase Connection Pool:**
   ```bash
   # Edit .env.production
   DATABASE_POOL_SIZE=50
   DATABASE_POOL_MAX=100
   
   # Restart API
   docker compose -f docker-compose.prod.yml restart api
   ```

---

## Diagnostic Commands

### System Health
```bash
# Check system resources
free -h
df -h
uptime

# Check Docker resources
docker stats --no-stream
docker system df
```

### Service Health
```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Check service logs
docker compose -f docker-compose.prod.yml logs --tail=100

# Check specific service
docker compose -f docker-compose.prod.yml logs api --tail=100
```

### Network Health
```bash
# Check network connectivity
ping -c 4 api.hummii.ca
curl -I https://api.hummii.ca/api/health

# Check DNS resolution
nslookup api.hummii.ca
dig api.hummii.ca
```

### Database Health
```bash
# Check database status
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Check database connections
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "
    SELECT count(*) FROM pg_stat_activity;
"

# Check database size
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hummii -c "
    SELECT pg_size_pretty(pg_database_size('hummii'));
"
```

---

## Emergency Procedures

### Complete System Failure

**Symptoms:**
- All services down
- Server unreachable
- Complete outage

**Procedure:**
1. Check server status
2. Check network connectivity
3. Restart Docker services
4. If needed, restore from backup
5. Notify stakeholders

### Data Corruption

**Symptoms:**
- Database errors
- Data inconsistencies
- Application errors

**Procedure:**
1. Stop application services
2. Identify latest valid backup
3. Restore database from backup
4. Verify data integrity
5. Restart services

### Security Breach

**Symptoms:**
- Unauthorized access
- Suspicious activity
- Data exfiltration

**Procedure:**
1. Isolate affected services
2. Revoke compromised credentials
3. Rotate all secrets
4. Restore from pre-incident backup
5. Conduct security audit
6. Notify stakeholders

---

## Log Locations

### Application Logs
- **API Logs:** `/opt/hummii/logs/api/app.log`
- **Frontend Logs:** `/opt/hummii/logs/frontend/app.log`
- **Admin Logs:** `/opt/hummii/logs/admin/app.log`

### System Logs
- **Docker Logs:** `docker compose -f docker-compose.prod.yml logs`
- **Nginx Logs:** `/opt/hummii/logs/nginx/access.log`, `/opt/hummii/logs/nginx/error.log`
- **System Logs:** `/var/log/syslog`

### Monitoring Logs
- **Prometheus Logs:** `docker compose -f docker-compose.monitoring.yml logs prometheus`
- **Grafana Logs:** `docker compose -f docker-compose.monitoring.yml logs grafana`

---

## Support Contacts

### Technical Support
- **DevOps Team:** [Contact Information]
- **Database Administrator:** [Contact Information]
- **Security Officer:** [Contact Information]

### Vendor Support
- **Cloud Provider:** [Contact Information]
- **Database Vendor:** [Contact Information]
- **Monitoring Service:** [Contact Information]

---

**Last Updated:** January 6, 2025  
**Next Review:** February 2025  
**Maintained By:** DevOps Team

