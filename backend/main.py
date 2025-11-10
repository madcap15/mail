# backend/main.py
import os
import requests
from datetime import timedelta
from typing import List

from fastapi import FastAPI, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
)

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class PasswordUpdate(BaseModel):
    new_password: str

class DomainCreate(BaseModel):
    domain_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserInfo(BaseModel):
    email: EmailStr
    # Add other user fields if needed in the future

class DomainInfo(BaseModel):
    name: str

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Configuration ---
MAILSERVER_API_URL = "http://mail_server:9090/api/v1"
MAILSERVER_API_KEY = os.environ.get("POSTFIX_REST_SERVER_API_KEY")
ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

# --- Helper Functions ---
def get_mailserver_auth_headers():
    if not MAILSERVER_API_KEY:
        raise HTTPException(
            status_code=500, detail="Mailserver API key is not configured"
        )
    return {"X-API-Key": MAILSERVER_API_KEY}

# --- Authentication Endpoint ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if not (form_data.username == ADMIN_USER and form_data.password == ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- User Management Endpoints ---
@app.get("/users", response_model=List[UserInfo])
def get_users(
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.get(f"{MAILSERVER_API_URL}/users", headers=auth_headers)
        response.raise_for_status()
        # The API returns a list of strings, we convert it to a list of UserInfo objects
        return [{"email": email} for email in response.json()]
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users")
def create_user(
    user: UserCreate,
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.post(
            f"{MAILSERVER_API_URL}/users",
            json={"username": user.email, "password": user.password},
            headers=auth_headers,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{email}")
def delete_user(
    email: str,
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.delete(
            f"{MAILSERVER_API_URL}/users/{email}", headers=auth_headers
        )
        response.raise_for_status()
        return {"message": f"User {email} deleted successfully"}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{email}/password")
def update_user_password(
    email: str,
    password_data: PasswordUpdate,
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.post(
            f"{MAILSERVER_API_URL}/users/{email}/password",
            json={"password": password_data.new_password},
            headers=auth_headers,
        )
        response.raise_for_status()
        return {"message": f"Password for user {email} updated successfully"}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Domain Management Endpoints ---
@app.get("/domains", response_model=List[DomainInfo])
def get_domains(
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.get(f"{MAILSERVER_API_URL}/domains", headers=auth_headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/domains")
def create_domain(
    domain: DomainCreate,
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.post(
            f"{MAILSERVER_API_URL}/domains",
            json={"name": domain.domain_name},
            headers=auth_headers,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/domains/{domain_name}")
def delete_domain(
    domain_name: str,
    current_user: dict = Depends(get_current_user),
    auth_headers: dict = Depends(get_mailserver_auth_headers),
):
    try:
        response = requests.delete(
            f"{MAILSERVER_API_URL}/domains/{domain_name}", headers=auth_headers
        )
        response.raise_for_status()
        return {"message": f"Domain {domain_name} deleted successfully"}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))