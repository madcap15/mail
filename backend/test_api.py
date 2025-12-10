# backend/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app, get_db, SessionLocal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Test database setup
TEST_DATABASE_URL = "postgresql://test:test@localhost/test_mail"

@pytest.fixture(scope="module")
def test_db():
    """Create test database and yield session."""
    try:
        engine = create_engine(TEST_DATABASE_URL)
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        # Create tables
        from main import Base
        Base.metadata.create_all(bind=engine)
        yield TestingSessionLocal()
    except Exception as e:
        print(f"Database error: {e}")
        yield None

@pytest.fixture
def client(test_db):
    """Create test client."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self, client):
        """Test GET /health returns 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

class TestAuthentication:
    """Test authentication endpoints."""
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials returns 401."""
        response = client.post(
            "/token",
            data={"username": "invalid", "password": "invalid"}
        )
        assert response.status_code == 401
        assert "detail" in response.json()
    
    def test_login_valid_credentials(self, client):
        """Test login with valid credentials returns token."""
        # Default credentials from init.sql
        response = client.post(
            "/token",
            data={"username": "admin", "password": "changeme"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

class TestDomainsEndpoints:
    """Test domain management endpoints."""
    
    def test_get_domains_unauthorized(self, client):
        """Test GET /domains without token returns 403."""
        response = client.get("/domains")
        assert response.status_code in [401, 403]
    
    def test_create_domain(self, client):
        """Test POST /domains creates new domain."""
        # First get token
        token_response = client.post(
            "/token",
            data={"username": "admin", "password": "changeme"}
        )
        token = token_response.json()["access_token"]
        
        # Create domain
        response = client.post(
            "/domains",
            json={"domain_name": "test.com"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["name"] == "test.com"
    
    def test_delete_domain(self, client):
        """Test DELETE /domains/{domain_name} deletes domain."""
        # Get token
        token_response = client.post(
            "/token",
            data={"username": "admin", "password": "changeme"}
        )
        token = token_response.json()["access_token"]
        
        # Delete domain
        response = client.delete(
            "/domains/test.com",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code in [200, 204]

class TestUsersEndpoints:
    """Test user management endpoints."""
    
    def test_get_users_unauthorized(self, client):
        """Test GET /users without token returns 403."""
        response = client.get("/users")
        assert response.status_code in [401, 403]
    
    def test_create_user(self, client):
        """Test POST /users creates new mail user."""
        # Get token
        token_response = client.post(
            "/token",
            data={"username": "admin", "password": "changeme"}
        )
        token = token_response.json()["access_token"]
        
        # Create user
        response = client.post(
            "/users",
            json={"email": "user@example.com", "password": "securepass"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["email"] == "user@example.com"
    
    def test_delete_user(self, client):
        """Test DELETE /users/{email} deletes mail user."""
        # Get token
        token_response = client.post(
            "/token",
            data={"username": "admin", "password": "changeme"}
        )
        token = token_response.json()["access_token"]
        
        # Delete user
        response = client.delete(
            "/users/user@example.com",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code in [200, 204]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
