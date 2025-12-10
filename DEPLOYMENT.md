# Deployment Guide for Mail Service Administration Panel

## Overview

This guide provides comprehensive instructions for deploying the Mail Service Administration Panel in production environments. The system consists of multiple containerized services managed via Docker Compose.

## Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)
- A server with at least 2GB RAM and 10GB disk space
- A domain name (for HTTPS/TLS)
- Basic knowledge of command line and system administration

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/madcap15/mail.git
cd mail
```

### Step 2: Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

# Database Credentials
POSTGRES_USER=sogo
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sogo
DATABASE_URL=postgresql://sogo:your_secure_password@sogo-postgresql/sogo

# Mail Configuration
SMTP_DOMAIN=your-domain.com
SMTP_PORT=25
SOGO_MAIL_DOMAIN=your-domain.com

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# HTTPS (Optional)
HTTPS_ENABLED=false
CERT_PATH=/etc/nginx/certs/cert.pem
KEY_PATH=/etc/nginx/certs/key.pem
```

### Step 3: Build and Start Services

```bash
docker-compose up -d
```

This will start all services:
- **Frontend**: React application (port 3000)
- **Backend**: FastAPI application (port 8000)
- **Nginx**: Reverse proxy (port 80)
- **PostgreSQL**: Database (port 5432 - internal)
- **SOGo**: Webmail interface (port 5000 - internal)
- **Mailserver**: Mail server services

### Step 4: Verify Services are Running

```bash
docker-compose ps
```

All services should show status `Up`.

### Step 5: Access the Application

- **Admin Panel**: http://localhost/  (or http://your-domain.com)
- **API Documentation**: http://localhost:8000/docs
- **SOGo Webmail**: http://localhost/SOGo

## Initial Admin Setup

### Login to Admin Panel

1. Open http://localhost in your browser
2. Login with default credentials:
   - Username: `admin`
   - Password: `changeme` (default from init.sql)

**⚠️ Change the default admin password immediately after first login!**

### Add a Mail Domain

1. Navigate to "Domains" section
2. Click "Add Domain"
3. Enter your domain name (e.g., `example.com`)
4. Click "Create"

The domain is now available for creating mail users.

### Create Mail Users

1. Navigate to "Users" section
2. Click "Add User"
3. Enter email address (e.g., `user@example.com`)
4. Set a secure password
5. Click "Create"

Users can now access webmail via SOGo interface.

## Domain Configuration

### DNS Records

Configure your DNS provider with these records:

```
# MX Record
mail.example.com MX 10 mail.example.com

# A Record
mail.example.com A 192.0.2.1  (replace with your server IP)

# SPF Record
example.com TXT v=spf1 mx ~all

# DKIM (if enabled)
_domainkey.example.com TXT v=DKIM1; ...

# DMARC
_dmarc.example.com TXT v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com
```

### Verify Domain Configuration

```bash
# Test MX record
nslookup -query=mx example.com

# Test mail server connectivity
telnet mail.example.com 25
```

## HTTPS/TLS Configuration

### Using Let's Encrypt (Recommended)

1. Install Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:

```bash
sudo certbot certonly --standalone -d mail.example.com
```

3. Update `.env`:

```
HTTPS_ENABLED=true
CERT_PATH=/etc/letsencrypt/live/mail.example.com/fullchain.pem
KEY_PATH=/etc/letsencrypt/live/mail.example.com/privkey.pem
```

4. Mount certificate in docker-compose.yml:

```yaml
services:
  nginx:
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

5. Restart services:

```bash
docker-compose restart nginx
```

## Backup and Recovery

### Backup Database

```bash
docker-compose exec -T sogo-postgresql pg_dump -U sogo -d sogo > backup.sql
```

### Restore Database

```bash
docker-compose exec -T sogo-postgresql psql -U sogo -d sogo < backup.sql
```

### Backup Configuration

```bash
tar -czf backup_config.tar.gz .env docker-compose.yml nginx/
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sogo-postgresql
```

### Health Check

```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Services Won't Start

1. Check Docker daemon: `sudo systemctl status docker`
2. Verify ports are free: `sudo netstat -tuln`
3. Check logs: `docker-compose logs`

### Database Connection Errors

```bash
# Restart database service
docker-compose restart sogo-postgresql

# Wait 30 seconds and restart other services
docker-compose restart backend frontend
```

### Frontend Cannot Connect to Backend

1. Verify CORS is enabled in backend/main.py
2. Check network connectivity: `docker-compose exec frontend ping backend`
3. Verify API is running: `curl http://backend:8000/health`

### Mail Not Sending

1. Check mailserver logs: `docker-compose logs -f mailserver`
2. Verify DNS records are configured correctly
3. Check firewall rules (port 25, 587, 465 may be blocked)

## Production Deployment Checklist

- [ ] Change all default passwords (admin, database, etc.)
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Set up automated backups
- [ ] Configure proper DNS records
- [ ] Set up log rotation and monitoring
- [ ] Test email delivery (send test emails)
- [ ] Set up firewall rules
- [ ] Enable automated security updates
- [ ] Document your configuration
- [ ] Set up incident response procedures

## Performance Tuning

### Docker Compose

Optimize resource limits in docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Database

For high-load environments, optimize PostgreSQL in docker-compose.yml:

```yaml
environment:
  POSTGRES_INITDB_ARGS: "-c max_connections=200 -c shared_buffers=256MB"
```

## Scaling

For multiple mail domains:

1. Create additional user accounts via admin panel
2. Load balancing is handled by Nginx
3. Database will automatically support multiple domains

## Security Considerations

- Keep Docker and system packages updated
- Use strong passwords (minimum 16 characters)
- Enable firewall (UFW on Ubuntu)
- Configure fail2ban for brute-force protection
- Regular security audits
- Monitor system logs
- Use TLS for all communications
- Keep backups in secure location

## Support and Documentation

- Project Repository: https://github.com/madcap15/mail
- API Documentation: http://localhost:8000/docs
- Issue Tracker: https://github.com/madcap15/mail/issues

## License

MIT License - See LICENSE file for details
