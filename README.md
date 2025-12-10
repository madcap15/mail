# Mail Service Administration Panel

A comprehensive web-based administration panel for managing a mail server built with Docker, FastAPI, and React.

## Overview

This project provides a modern, user-friendly interface for managing mail services. It includes:

- **`docker-mailserver`** instance for mail functionality
- **FastAPI** backend with JWT authentication
- **React** frontend for the administration panel UI
- **PostgreSQL** database for user and configuration management
- **SOGo** for webmail and calendar management
- **Nginx** as a reverse proxy

## Project Structure

- `backend/` - FastAPI application that acts as an API gateway to docker-mailserver and manages authentication
- `frontend/` - React application for the administration panel UI
- `docker-data/` - Persistent volumes for docker-mailserver (mail data, state, configuration)
- `docker-compose.yml` - Defines all services, networks, and volumes for the entire application
- `mailserver-config/` - Configuration for postfix integration
- `nginx/` - Nginx reverse proxy configuration
- `.env.example` - Template for environment variables (copy to `.env` and customize)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for frontend development, optional)
- [Python 3.8+](https://www.python.org/downloads/) (for backend development, optional)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/madcap15/mail.git
cd mail
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the following:

- `SECRET_KEY` - Generate a random string for JWT: `openssl rand -hex 32`
- `SOGO_MAIL_DOMAIN` - Your actual mail domain
- `DB_PASSWORD` - Strong database password
- `ADMIN_USER` / `ADMIN_PASSWORD` - Admin panel credentials

**IMPORTANT:** Never commit `.env` to version control!

### 3. Build and Start Services

```bash
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Backend Docs:** http://localhost:8000/docs
- **Mailserver REST API:** http://localhost:5000/api/v1 (if enabled)

## Initial Setup

### Create Admin User

After the containers start, create an admin user for the panel:

```bash
docker-compose exec backend python -c "
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from auth import get_password_hash
import os

DB_URL = os.environ.get('DATABASE_URL', 'postgresql://sogo:dev_sogo_pass@sogo-postgresql/sogo')
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)
session = Session()

from main import Admin
admin = Admin(
    username=os.environ.get('ADMIN_USER', 'admin'),
    password_hash=get_password_hash(os.environ.get('ADMIN_PASSWORD', 'changeme'))
)
session.add(admin)
session.commit()
print('Admin user created successfully')
"
```

### Login

1. Open http://localhost:3000
2. Login with your admin credentials
3. Start managing users and domains

## Features

### Current Features

- ✅ **User Management**: Create, list, delete, and update mail users
- ✅ **Password Management**: Change user passwords securely
- ✅ **Domain Management**: Add, list, and delete mail domains
- ✅ **JWT Authentication**: Secure admin panel access
- ✅ **Database Integration**: PostgreSQL for persistent data storage
- ✅ **Reverse Proxy**: Nginx for routing and SSL termination
- ✅ **Webmail**: SOGo for webmail and calendar access

### Planned Features

- 🔄 **CORS Support**: Allow frontend and backend separation
- 🔄 **Advanced User Filters**: Search and filter users by criteria
- 🔄 **Quota Management**: Set mailbox quotas per user
- 🔄 **Alias Management**: Create and manage mail aliases
- 🔄 **Backup/Restore**: Automated backup functionality
- 🔄 **Role-Based Access Control**: Multiple admin roles with different permissions
- 🔄 **Email Templates**: Configurable welcome emails for new users
- 🔄 **Audit Logging**: Track all administrative actions

## Security Considerations

⚠️ **Important Security Notes:**

1. **Environment Variables**: All sensitive data (passwords, API keys) MUST be stored in `.env`
   - Never commit `.env` to version control
   - Use strong, randomly generated passwords and secrets
   - Use different passwords for each service

2. **SSL/TLS**: For production:
   - Configure proper SSL certificates in Nginx
   - Use Let's Encrypt for free certificates
   - Enable HTTPS on port 443

3. **Database Security**:
   - Change default database credentials immediately
   - Use strong passwords (minimum 16 characters recommended)
   - Restrict database access to localhost only

4. **Admin Panel**:
   - Change default admin credentials after first login
   - Implement rate limiting on login attempts
   - Use long, random JWT secret keys
   - Enable HTTPS in production

5. **Mailserver**:
   - Configure SPF, DKIM, and DMARC records
   - Enable mail server authentication
   - Set up proper firewall rules

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DB_USER=sogo
DB_PASSWORD=strong_password_here
DB_NAME=sogo

# Mail Domain
SOGO_MAIL_DOMAIN=mail.example.com

# Admin Panel
ADMIN_USER=admin
ADMIN_PASSWORD=strong_password_here
SECRET_KEY=random_secret_key_generated_with_openssl
```

### Docker Compose

The `docker-compose.yml` file orchestrates all services:

- **nginx**: Reverse proxy (ports 80, 443)
- **backend**: FastAPI application (port 8000)
- **frontend**: React development server (port 3000)
- **mailserver**: Docker-mailserver (ports 25, 143, 465, 587, 993)
- **postgresql**: Database (port 5432)
- **sogo**: Webmail interface (port 20000)

## API Documentation

Once running, visit http://localhost:8000/docs for interactive Swagger documentation.

### Authentication

All API endpoints except `/token` require JWT authentication:

```bash
# Get token
curl -X POST http://localhost:8000/token \
  -d "username=admin&password=yourpassword"

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/users
```

### Endpoints

- `POST /token` - Get JWT access token
- `GET /users` - List all mail users
- `POST /users` - Create new mail user
- `DELETE /users/{id}` - Delete mail user
- `GET /domains` - List all domains
- `POST /domains` - Create new domain
- `DELETE /domains/{id}` - Delete domain

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgresql

# View PostgreSQL logs
docker-compose logs postgresql

# Reset database
docker-compose down -v
docker-compose up -d
```

### Backend Errors

```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend Connection Issues

```bash
# Check frontend logs
docker-compose logs frontend

# Ensure backend is accessible
curl http://localhost:8000/docs
```

## Development

### Local Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Local Frontend Development

```bash
cd frontend
npm install
npm start
```

## Production Deployment

For production deployment:

1. **Use managed SSL certificates**: Configure Nginx with Let's Encrypt
2. **Change all default passwords and secrets**
3. **Set up proper backups**: Regular PostgreSQL and mail data backups
4. **Configure mail server records**: SPF, DKIM, DMARC
5. **Use strong access controls**: Firewall rules, VPN for admin access
6. **Monitor logs**: Set up centralized logging
7. **Regular updates**: Keep Docker images and packages updated

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Changelog

### v1.1.0 (2025-12-10)
- ✨ Added `.gitignore` for security
- ✨ Created `.env.example` template
- ✨ Moved all credentials to environment variables
- ✨ Added health checks to all services
- ✨ Improved docker-compose configuration
- 📝 Comprehensive README documentation

### v1.0.0 (Initial Release)
- User management (CRUD operations)
- Domain management (CRUD operations)
- JWT authentication
- PostgreSQL integration
- Docker containerization
