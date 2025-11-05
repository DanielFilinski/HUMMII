# Disaster Recovery Plan - Hummii Production

**Version:** 1.0  
**Last Updated:** January 6, 2025  
**Status:** Production Ready

## Overview

This document outlines the disaster recovery procedures for the Hummii production environment. It covers backup restoration, service recovery, and data recovery procedures.

## Recovery Objectives

### Recovery Time Objective (RTO)
- **Critical Services:** 4 hours
- **Standard Services:** 8 hours
- **Non-Critical Services:** 24 hours

### Recovery Point Objective (RPO)
- **Database:** 24 hours (daily backups)
- **Application:** 1 hour (continuous deployment)
- **Configuration:** 1 hour (version controlled)

## Backup Strategy

### Backup Frequency
- **PostgreSQL:** Daily backups (30 days retention), Weekly backups (52 weeks retention)
- **Redis:** Daily backups (30 days retention), Weekly backups (52 weeks retention)
- **Application Logs:** 90 days retention
- **Configuration Files:** Version controlled (Git)

### Backup Storage
- **Local Storage:** `/opt/hummii/backups/`
- **Remote Storage:** AWS S3 (encrypted backups)
- **Encryption:** AES-256-CBC with backup encryption key

### Backup Verification
- Automated verification after each backup
- Weekly manual verification of restore procedures
- Monthly full disaster recovery drill

## Disaster Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Database connection errors
- Data integrity issues
- Application errors related to database

**Recovery Steps:**
1. Stop application services
2. Identify latest valid backup
3. Restore database from backup
4. Verify database integrity
5. Restart application services
6. Verify application functionality

**Commands:**
```bash
# Stop services
docker compose -f /opt/hummii/docker-compose.prod.yml stop api

# Restore database
/opt/hummii/scripts/backup/restore-database.sh /opt/hummii/backups/postgres/postgres-backup-YYYYMMDD-HHMMSS.sql.gz.enc --force

# Start services
docker compose -f /opt/hummii/docker-compose.prod.yml start api
```

**Estimated Recovery Time:** 2-4 hours

---

### Scenario 2: Complete Server Failure

**Symptoms:**
- Server unreachable
- All services down
- No access to server

**Recovery Steps:**
1. Provision new server
2. Install Docker and Docker Compose
3. Clone repository
4. Restore database from S3 backup
5. Restore Redis from S3 backup
6. Configure environment variables
7. Start all services
8. Verify all services

**Commands:**
```bash
# Provision new server (Ubuntu 22.04 LTS)
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/your-org/HUMMII.git /opt/hummii
cd /opt/hummii

# Restore database from S3
aws s3 cp s3://your-backup-bucket/postgres/latest-backup.sql.gz.enc /tmp/
openssl enc -aes-256-cbc -d -in /tmp/latest-backup.sql.gz.enc -out /tmp/backup.sql.gz -k "$BACKUP_ENCRYPTION_KEY"
gunzip /tmp/backup.sql.gz
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d hummii < /tmp/backup.sql

# Start services
docker compose -f docker-compose.prod.yml up -d
```

**Estimated Recovery Time:** 4-8 hours

---

### Scenario 3: Data Loss (Accidental Deletion)

**Symptoms:**
- Missing data in database
- User reports missing information
- Application errors related to missing data

**Recovery Steps:**
1. Identify affected data
2. Identify point-in-time for recovery
3. Restore database from backup before deletion
4. Export affected data only
5. Merge with current database (if needed)
6. Verify data integrity

**Estimated Recovery Time:** 2-6 hours

---

### Scenario 4: Security Breach

**Symptoms:**
- Unauthorized access detected
- Suspicious activity in logs
- Data exfiltration attempts

**Recovery Steps:**
1. Isolate affected services
2. Revoke compromised credentials
3. Rotate all secrets and keys
4. Restore from pre-breach backup
5. Verify system integrity
6. Conduct security audit
7. Update security measures

**Estimated Recovery Time:** 4-12 hours

---

## Recovery Procedures

### Database Restoration

**Prerequisites:**
- Backup file (encrypted or unencrypted)
- Database credentials
- Access to PostgreSQL container

**Procedure:**
1. Stop application services
2. Verify backup file integrity
3. Decrypt backup (if encrypted)
4. Decompress backup (if compressed)
5. Restore database using pg_restore or psql
6. Verify database integrity
7. Start application services

**Script:**
```bash
/opt/hummii/scripts/backup/restore-database.sh <backup-file> [--force]
```

### Redis Restoration

**Prerequisites:**
- Backup file (RDB format)
- Redis credentials
- Access to Redis container

**Procedure:**
1. Stop application services
2. Stop Redis service
3. Replace RDB file
4. Start Redis service
5. Verify Redis data
6. Start application services

### Application Restoration

**Prerequisites:**
- Git repository access
- Docker images
- Environment variables

**Procedure:**
1. Clone repository
2. Configure environment variables
3. Pull Docker images
4. Start services using docker-compose
5. Verify all services

---

## Testing & Validation

### Monthly DR Drill

**Schedule:** First Monday of each month

**Procedure:**
1. Create test environment
2. Restore latest backup
3. Verify all services
4. Test critical user flows
5. Document issues and improvements
6. Update DR plan if needed

### Backup Verification

**Schedule:** Weekly

**Procedure:**
1. Run backup verification script
2. Check backup integrity
3. Verify backup size
4. Test restore procedure
5. Document results

**Script:**
```bash
/opt/hummii/scripts/backup/verify-backup.sh
```

---

## Communication Plan

### Incident Response Team

- **Technical Lead:** Primary contact for technical issues
- **DevOps Engineer:** Infrastructure and deployment
- **Database Administrator:** Database restoration
- **Security Officer:** Security incidents

### Notification Procedures

1. **Immediate Notification:** Critical incidents (email, Slack)
2. **Status Updates:** Every 2 hours during recovery
3. **Post-Incident:** Full report within 24 hours

### Stakeholder Communication

- **Users:** Status page updates
- **Management:** Daily updates during recovery
- **Legal/Compliance:** Immediate notification for data breaches

---

## Post-Recovery Procedures

### Verification Checklist

- [ ] All services running
- [ ] Database integrity verified
- [ ] Application functionality tested
- [ ] Monitoring and alerting active
- [ ] Backups working correctly
- [ ] Security measures verified

### Documentation

- [ ] Incident report completed
- [ ] Root cause analysis documented
- [ ] Recovery procedures updated
- [ ] Lessons learned documented
- [ ] Action items assigned

---

## Maintenance

### Backup Retention Policy

- **Daily Backups:** 30 days
- **Weekly Backups:** 52 weeks (1 year)
- **Monthly Backups:** 7 years (for compliance)

### Backup Rotation

- Automatically managed by backup scripts
- Old backups deleted after retention period
- Weekly backups archived to S3

---

## Contacts

### Emergency Contacts

- **Technical Lead:** [Contact Information]
- **DevOps Engineer:** [Contact Information]
- **Database Administrator:** [Contact Information]
- **Security Officer:** [Contact Information]

### Vendor Contacts

- **Cloud Provider:** [Contact Information]
- **Database Vendor:** [Contact Information]
- **Monitoring Service:** [Contact Information]

---

**Last Updated:** January 6, 2025  
**Next Review:** February 2025  
**Approved By:** [Name]

