# Firewall Setup Guide - Hummii

> **Infrastructure security configuration for production servers**  
> **Version:** 1.0 | **Updated:** November 3, 2025

---

## Overview

This guide covers firewall configuration for Hummii production servers to implement defense-in-depth security strategy. Firewall rules should be configured at the server level (not in application code).

---

## Requirements

### Port Access Policy

| Port | Protocol | Purpose | Access |
|------|----------|---------|--------|
| **22** | TCP | SSH (Admin access) | Restricted to specific IPs |
| **80** | TCP | HTTP (Let's Encrypt, redirect to HTTPS) | Public |
| **443** | TCP | HTTPS (Web traffic) | Public |
| **3000** | TCP | API/Frontend (Docker internal) | **BLOCKED** (Nginx proxy only) |
| **5432** | TCP | PostgreSQL | **BLOCKED** (Docker internal) |
| **6379** | TCP | Redis | **BLOCKED** (Docker internal) |

**CRITICAL:** Only ports 22, 80, and 443 should be accessible from the internet. All other ports must be blocked.

---

## Option 1: UFW (Ubuntu/Debian) - Recommended

### Installation

```bash
# Install UFW (Ubuntu/Debian)
sudo apt update
sudo apt install ufw -y
```

### Configuration

```bash
# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL: do this first to avoid locking yourself out)
sudo ufw allow 22/tcp comment 'SSH access'

# Allow HTTP (for Let's Encrypt challenges and redirects)
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (main traffic)
sudo ufw allow 443/tcp comment 'HTTPS'

# IMPORTANT: Deny direct access to Docker services
sudo ufw deny 3000/tcp comment 'Block direct API access'
sudo ufw deny 5432/tcp comment 'Block PostgreSQL'
sudo ufw deny 6379/tcp comment 'Block Redis'

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status verbose
```

### Expected Output

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere                   # SSH access
80/tcp                     ALLOW IN    Anywhere                   # HTTP
443/tcp                    ALLOW IN    Anywhere                   # HTTPS
3000/tcp                   DENY IN     Anywhere                   # Block direct API access
5432/tcp                   DENY IN     Anywhere                   # Block PostgreSQL
6379/tcp                   DENY IN     Anywhere                   # Block Redis
```

### Restrict SSH to Specific IPs (Recommended)

```bash
# Remove the general SSH rule
sudo ufw delete allow 22/tcp

# Allow SSH only from your office/VPN IP
sudo ufw allow from 1.2.3.4 to any port 22 proto tcp comment 'SSH from office'
sudo ufw allow from 5.6.7.8 to any port 22 proto tcp comment 'SSH from VPN'

# Verify
sudo ufw status numbered
```

---

## Option 2: iptables (Advanced)

### Save Current Rules (Backup)

```bash
sudo iptables-save > /root/iptables-backup-$(date +%Y%m%d).rules
```

### Configure Rules

```bash
#!/bin/bash
# /root/firewall-setup.sh

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Set default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (change 1.2.3.4 to your IP)
iptables -A INPUT -p tcp -s 1.2.3.4 --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Explicitly deny Docker ports
iptables -A INPUT -p tcp --dport 3000 -j DROP
iptables -A INPUT -p tcp --dport 5432 -j DROP
iptables -A INPUT -p tcp --dport 6379 -j DROP

# Log dropped packets (optional, for debugging)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables-dropped: " --log-level 7

# Drop everything else
iptables -A INPUT -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

### Make Rules Persistent

```bash
# Install iptables-persistent
sudo apt install iptables-persistent -y

# Save current rules
sudo netfilter-persistent save

# Verify
sudo iptables -L -v -n
```

---

## Option 3: Cloud Firewall (AWS, DigitalOcean, etc.)

### AWS Security Groups

```yaml
# Example Security Group Configuration
Inbound Rules:
  - Type: SSH
    Protocol: TCP
    Port: 22
    Source: 1.2.3.4/32 (Your office IP)
    Description: SSH from office

  - Type: HTTP
    Protocol: TCP
    Port: 80
    Source: 0.0.0.0/0
    Description: HTTP traffic

  - Type: HTTPS
    Protocol: TCP
    Port: 443
    Source: 0.0.0.0/0
    Description: HTTPS traffic

Outbound Rules:
  - Type: All traffic
    Protocol: All
    Port: All
    Destination: 0.0.0.0/0
    Description: Allow all outbound
```

### DigitalOcean Firewall

```yaml
# Example DigitalOcean Firewall Configuration
Inbound Rules:
  - Type: SSH
    Sources: Your Office IP (1.2.3.4)
    
  - Type: HTTP
    Sources: All IPv4, All IPv6
    
  - Type: HTTPS
    Sources: All IPv4, All IPv6

Outbound Rules:
  - Protocol: All TCP
    Destinations: All IPv4, All IPv6
    
  - Protocol: All UDP
    Destinations: All IPv4, All IPv6
```

---

## Verification Steps

### 1. Test Open Ports (from external machine)

```bash
# Install nmap on your local machine
sudo apt install nmap

# Scan your server
nmap -p 22,80,443,3000,5432,6379 your-server-ip

# Expected output:
# 22/tcp   open     ssh
# 80/tcp   open     http
# 443/tcp  open     https
# 3000/tcp filtered unknown  (or closed)
# 5432/tcp filtered postgresql (or closed)
# 6379/tcp filtered redis-server (or closed)
```

### 2. Test HTTPS Connection

```bash
# Should work (200 OK)
curl -I https://hummii.ca

# Should work (200 OK)
curl -I https://api.hummii.ca/health

# Should fail (connection refused or timeout)
curl -I http://your-server-ip:3000
```

### 3. Check Firewall Status

```bash
# UFW
sudo ufw status verbose

# iptables
sudo iptables -L -v -n

# Cloud firewall
# Check your cloud provider's console
```

---

## DDoS Protection (Additional)

### Rate Limiting (iptables)

```bash
# Limit SSH connections (prevent brute force)
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Limit HTTP connections per IP
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 50 -j REJECT
iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 50 -j REJECT
```

**Note:** Nginx already has rate limiting configured (see `docker/nginx/nginx.conf`). This is an additional layer.

---

## Monitoring and Logging

### UFW Logs

```bash
# Enable logging
sudo ufw logging on

# View logs
sudo tail -f /var/log/ufw.log

# Analyze blocked connections
sudo grep "UFW BLOCK" /var/log/ufw.log | tail -20
```

### iptables Logs

```bash
# View kernel logs (where iptables logs go)
sudo dmesg | grep iptables-dropped

# Or check syslog
sudo tail -f /var/log/syslog | grep iptables-dropped
```

---

## Troubleshooting

### Locked Out of SSH

**Prevention:** Always test firewall rules before enabling:

```bash
# Test mode (rules will revert after 30 seconds)
sudo ufw --dry-run enable
```

**Recovery (if locked out):**
1. Access server via cloud provider console (AWS Systems Manager, DigitalOcean Console)
2. Disable firewall:
   ```bash
   sudo ufw disable
   ```
3. Fix SSH rule:
   ```bash
   sudo ufw allow 22/tcp
   ```
4. Re-enable:
   ```bash
   sudo ufw enable
   ```

### Docker Services Not Working

**Issue:** Docker containers can't communicate.

**Solution:** Allow Docker bridge network:

```bash
# UFW
sudo ufw allow in on docker0

# iptables (add before DROP rule)
iptables -A INPUT -i docker0 -j ACCEPT
```

### Let's Encrypt Certificate Renewal Failing

**Issue:** Port 80 blocked, certbot can't verify domain.

**Solution:** Ensure port 80 is open:

```bash
sudo ufw allow 80/tcp
```

---

## Best Practices

1. **SSH Security:**
   - Restrict SSH to specific IPs
   - Use SSH keys instead of passwords
   - Change default SSH port (optional: port 2222)
   - Disable root login (`PermitRootLogin no` in `/etc/ssh/sshd_config`)

2. **Regular Audits:**
   - Review firewall rules monthly
   - Check logs for suspicious activity
   - Update IP whitelists as needed

3. **Defense in Depth:**
   - Firewall (this guide)
   - Nginx rate limiting (already configured)
   - Application-level rate limiting (NestJS @Throttle)
   - Fail2ban (optional, see below)

4. **Fail2ban (Optional):**
   ```bash
   # Install fail2ban for automatic IP blocking
   sudo apt install fail2ban -y
   
   # Configure (edit /etc/fail2ban/jail.local)
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

---

## Checklist

- [ ] Firewall installed (UFW or iptables or cloud firewall)
- [ ] Default policy: deny all incoming
- [ ] SSH restricted to specific IPs (or protected with Fail2ban)
- [ ] Ports 80 and 443 open for web traffic
- [ ] Docker ports (3000, 5432, 6379) explicitly blocked
- [ ] Rules tested with nmap
- [ ] Firewall enabled and persistent (survives reboots)
- [ ] Monitoring/logging enabled
- [ ] Backup of firewall rules created
- [ ] Team documented with emergency access procedure

---

## Emergency Contacts

| Role | Contact | Access Method |
|------|---------|---------------|
| DevOps Lead | devops@hummii.ca | SSH, Cloud Console |
| System Admin | admin@hummii.ca | SSH, Cloud Console |
| Emergency | security@hummii.ca | Cloud Console Only |

---

**Last updated:** November 3, 2025  
**Next review:** December 1, 2025  
**Owner:** DevOps Team

