# backend/main.py
# Основной файл FastAPI приложения.
import os
import requests
from datetime import timedelta
from fastapi import FastAPI, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
)

# Создание экземпляра FastAPI
app = FastAPI()

MAILSERVER_API_URL = "http://mail_server:9090/api/v1"
ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
MAILSERVER_API_KEY = os.environ.get("MAILSERVER_API_KEY")

# Headers for mailserver API
api_headers = {"X-Api-Key": MAILSERVER_API_KEY}


def handle_mailserver_request(method, url, **kwargs):
    """Helper function to handle requests to the mailserver API."""
    try:
        response = requests.request(method, url, headers=api_headers, **kwargs)
        response.raise_for_status()
        # For DELETE requests with 204 No Content, response.json() will fail
        if response.status_code == 204:
            return {"success": True}
        return response.json()
    except requests.exceptions.HTTPError as e:
        # Try to get more specific error from mailserver response
        try:
            error_details = e.response.json()
        except ValueError:
            error_details = e.response.text
        raise HTTPException(
            status_code=e.response.status_code, detail=error_details
        ) from e
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Provides an access token for the admin user.
    """
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


@app.get("/")
def read_root():
    """
    Корневой эндпоинт, возвращает приветственное сообщение.
    """
    return {"message": "Welcome to the Mail Service API"}


@app.post("/users")
def create_user(
    email: str = Body(...),
    password: str = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Эндпоинт для создания нового пользователя.
    """
    return handle_mailserver_request(
        "POST",
        f"{MAILSERVER_API_URL}/users",
        json={"username": email, "password": password},
    )


@app.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    """
    Эндпоинт для получения списка пользователей.
    """
    users_data = handle_mailserver_request("GET", f"{MAILSERVER_API_URL}/users")
    return {"users": users_data}


@app.delete("/users/{email}")
def delete_user(email: str, current_user: dict = Depends(get_current_user)):
    """
    Эндпоинт для удаления пользователя.
    """
    handle_mailserver_request("DELETE", f"{MAILSERVER_API_URL}/users/{email}")
    return {"message": f"User {email} deleted successfully"}


@app.put("/users/{email}/password")
def update_user_password(
    email: str,
    new_password: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
):
    """
    Эндпоинт для обновления пароля пользователя.
    """
    handle_mailserver_request(
        "POST",
        f"{MAILSERVER_API_URL}/users/{email}/password",
        json={"password": new_password},
    )
    return {"message": f"Password for user {email} updated successfully"}


@app.get("/domains")
def get_domains(current_user: dict = Depends(get_current_user)):
    """
    Эндпоинт для получения списка доменов.
    """
    domains_data = handle_mailserver_request("GET", f"{MAILSERVER_API_URL}/domains")
    return {"domains": domains_data}


@app.post("/domains")
def create_domain(
    domain_name: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
):
    """
    Эндпоинт для создания нового домена.
    """
    return handle_mailserver_request(
        "POST", f"{MAILSERVER_API_URL}/domains", json={"name": domain_name}
    )


@app.delete("/domains/{domain_name}")
def delete_domain(domain_name: str, current_user: dict = Depends(get_current_user)):
    """
    Эндпоинт для удаления домена.
    """
    handle_mailserver_request("DELETE", f"{MAILSERVER_API_URL}/domains/{domain_name}")
    return {"message": f"Domain {domain_name} deleted successfully"}


# Для запуска: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
