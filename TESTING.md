# Testing Guide for Mail Service Administration Panel

## Overview

This document provides comprehensive testing instructions for the Mail Service Administration Panel project, covering unit tests, integration tests, and manual testing procedures.

## Unit Testing with pytest

### Setup

1. Install test dependencies:

```bash
pip install pytest pytest-cov fastapi[all]
```

2. Install project dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Running Tests

#### Run all tests:

```bash
pytest backend/test_api.py -v
```

#### Run specific test class:

```bash
pytest backend/test_api.py::TestHealthEndpoint -v
pytest backend/test_api.py::TestAuthentication -v
pytest backend/test_api.py::TestDomainsEndpoints -v
pytest backend/test_api.py::TestUsersEndpoints -v
```

#### Run with coverage:

```bash
pytest backend/test_api.py --cov=backend --cov-report=html
```

## Test Scenarios

### 1. Health Check Endpoint

**Test**: `test_health_check`
**Expected**: GET /health returns 200 OK with status "healthy"
**Command**: `curl http://localhost:8000/health`

### 2. Authentication Tests

#### Invalid Credentials
**Test**: `test_login_invalid_credentials`
**Expected**: Returns 401 Unauthorized
**Command**:
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=invalid&password=invalid"
```

#### Valid Credentials
**Test**: `test_login_valid_credentials`
**Expected**: Returns JWT token
**Command**:
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme"
```

### 3. Domain Management Tests

#### Get All Domains (Unauthorized)
**Test**: `test_get_domains_unauthorized`
**Expected**: Returns 401 or 403 without token
**Command**:
```bash
curl http://localhost:8000/domains
```

#### Create Domain
**Test**: `test_create_domain`
**Expected**: Returns 200/201 with domain object
**Command**:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme" | jq -r '.access_token')

curl -X POST http://localhost:8000/domains \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain_name": "example.com"}'
```

#### Delete Domain
**Test**: `test_delete_domain`
**Expected**: Returns 200/204 on success
**Command**:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme" | jq -r '.access_token')

curl -X DELETE http://localhost:8000/domains/example.com \
  -H "Authorization: Bearer $TOKEN"
```

### 4. User Management Tests

#### Get All Users (Unauthorized)
**Test**: `test_get_users_unauthorized`
**Expected**: Returns 401 or 403 without token
**Command**:
```bash
curl http://localhost:8000/users
```

#### Create User
**Test**: `test_create_user`
**Expected**: Returns 200/201 with user object
**Command**:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme" | jq -r '.access_token')

curl -X POST http://localhost:8000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass"}'
```

#### Delete User
**Test**: `test_delete_user`
**Expected**: Returns 200/204 on success
**Command**:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme" | jq -r '.access_token')

curl -X DELETE http://localhost:8000/users/user@example.com \
  -H "Authorization: Bearer $TOKEN"
```

## Manual Testing Workflow

### Prerequisites

1. Start Docker containers:
```bash
docker-compose up -d
```

2. Wait for services to be ready (~30 seconds)

3. Verify services are running:
```bash
docker-compose ps
```

### Test Workflow

#### Step 1: Access Admin Panel
1. Open http://localhost in browser
2. Expected: Login page appears
3. Verify frontend is loaded correctly

#### Step 2: Login
1. Username: `admin`
2. Password: `changeme` (default from init.sql)
3. Expected: Redirected to dashboard, no errors

#### Step 3: Add Domain
1. Navigate to "Domains" section
2. Click "Add Domain"
3. Enter domain name: `test.example.com`
4. Click "Create"
5. Expected: Domain appears in list, no errors

#### Step 4: Create Mail User
1. Navigate to "Users" section
2. Click "Add User"
3. Enter email: `test@test.example.com`
4. Enter password: `TestPass123!`
5. Click "Create"
6. Expected: User appears in list, no errors

#### Step 5: Delete User
1. In Users list, find `test@test.example.com`
2. Click "Delete" button
3. Expected: User removed from list, no errors

#### Step 6: Delete Domain
1. In Domains list, find `test.example.com`
2. Click "Delete" button
3. Expected: Domain removed from list, no errors

## API Documentation

Access interactive API documentation:

```
http://localhost:8000/docs
```

Features:
- View all endpoints
- Try requests directly
- See response schemas
- Authenticate with token

## Database Testing

### Connect to Database

```bash
docker-compose exec sogo-postgresql psql -U sogo -d sogo
```

### Verify Tables

```sql
-- Check domains table
SELECT * FROM domains;

-- Check users table
SELECT * FROM users;

-- Check admins table
SELECT * FROM admins;
```

### Test Database Operations

```sql
-- Insert test domain
INSERT INTO domains (name) VALUES ('test.com');

-- Verify foreign key constraint
-- This should fail (domain_id 999 doesn't exist)
INSERT INTO users (email, password, domain_id) 
VALUES ('test@test.com', 'hash', 999);
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install ab
sudo apt-get install apache2-utils

# Test health endpoint (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:8000/health

# Expected: ~100+ requests/second
```

### Load Testing with Locust

```bash
pip install locust

# Create locustfile.py with load test scenarios
locust -f locustfile.py --host=http://localhost:8000
```

## CORS Testing

Verify CORS is enabled:

```bash
curl -i -X OPTIONS http://localhost:8000/domains \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

Expected headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: *`
- `Access-Control-Allow-Headers: *`

## Security Testing

### Test Secret Key Validation

Verify that SECRET_KEY is mandatory:

```bash
# Start backend without SECRET_KEY (should fail)
unset SECRET_KEY
python backend/main.py

# Expected: ValueError about missing SECRET_KEY
```

### Test Password Hashing

```python
from backend.auth import get_password_hash, verify_password

# Test hashing
password = "TestPassword123!"
hashed = get_password_hash(password)

# Test verification
assert verify_password(password, hashed) == True
assert verify_password("WrongPassword", hashed) == False
```

## Troubleshooting

### Test Database Connection Errors

```bash
# Check if database is running
docker-compose ps sogo-postgresql

# View logs
docker-compose logs sogo-postgresql

# Restart database
docker-compose restart sogo-postgresql
```

### Test Backend Not Starting

```bash
# View backend logs
docker-compose logs backend

# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

### Test CORS Issues

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# View nginx logs
docker-compose logs nginx
```

## CI/CD Testing

For GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - run: pip install -r requirements.txt pytest
      - run: pytest backend/test_api.py -v
```

## Test Results Summary

After running all tests, you should see:

```
========================= test session starts ==========================
collected 12 items

backend/test_api.py::TestHealthEndpoint::test_health_check PASSED
backend/test_api.py::TestAuthentication::test_login_invalid_credentials PASSED
backend/test_api.py::TestAuthentication::test_login_valid_credentials PASSED
backend/test_api.py::TestDomainsEndpoints::test_get_domains_unauthorized PASSED
backend/test_api.py::TestDomainsEndpoints::test_create_domain PASSED
backend/test_api.py::TestDomainsEndpoints::test_delete_domain PASSED
backend/test_api.py::TestUsersEndpoints::test_get_users_unauthorized PASSED
backend/test_api.py::TestUsersEndpoints::test_create_user PASSED
backend/test_api.py::TestUsersEndpoints::test_delete_user PASSED

========================== 12 passed in 2.34s ==========================
```

## Support

For issues or questions about testing:

1. Check the logs: `docker-compose logs`
2. Review test output for specific errors
3. Check GitHub issues: https://github.com/madcap15/mail/issues
4. Review API documentation: `http://localhost:8000/docs`
