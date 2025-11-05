# backend/main.py
# Основной файл FastAPI приложения.

import requests
from fastapi import FastAPI, Body

# Создание экземпляра FastAPI
app = FastAPI()

MAILSERVER_API_URL = "http://mail_server:9090/api/v1"

@app.get("/")
def read_root():
    """
    Корневой эндпоинт, возвращает приветственное сообщение.
    """
    return {"message": "Welcome to the Mail Service API"}

@app.post("/users")
def create_user(email: str = Body(...), password: str = Body(...)):
    """
    Эндпоинт для создания нового пользователя.
    Отправляет запрос на создание пользователя в REST API docker-mailserver.
    """
    try:
        response = requests.post(f"{MAILSERVER_API_URL}/users", json={
            "username": email,
            "password": password
        })
        response.raise_for_status()  # Проверка на ошибки HTTP
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.get("/users")
def get_users():
    """
    Эндпоинт для получения списка пользователей.
    Получает список email-адресов из REST API docker-mailserver.
    """
    try:
        response = requests.get(f"{MAILSERVER_API_URL}/users")
        response.raise_for_status()  # Проверка на ошибки HTTP
        users = response.json()
        return {"users": users}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.delete("/users/{email}")
def delete_user(email: str):
    """
    Эндпоинт для удаления пользователя.
    Отправляет запрос на удаление пользователя в REST API docker-mailserver.
    """
    try:
        response = requests.delete(f"{MAILSERVER_API_URL}/users/{email}")
        response.raise_for_status()  # Проверка на ошибки HTTP
        return {"message": f"User {email} deleted successfully"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.put("/users/{email}/password")
def update_user_password(email: str, new_password: str = Body(..., embed=True)):
    """
    Эндпоинт для обновления пароля пользователя.
    Отправляет запрос на обновление пароля пользователя в REST API docker-mailserver.
    """
    try:
        response = requests.post(f"{MAILSERVER_API_URL}/users/{email}/password", json={
            "password": new_password
        })
        response.raise_for_status()  # Проверка на ошибки HTTP
        return {"message": f"Password for user {email} updated successfully"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.get("/domains")
def get_domains():
    """
    Эндпоинт для получения списка доменов.
    Получает список доменов из REST API docker-mailserver.
    """
    try:
        response = requests.get(f"{MAILSERVER_API_URL}/domains")
        response.raise_for_status()  # Проверка на ошибки HTTP
        domains = response.json()
        return {"domains": domains}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.post("/domains")
def create_domain(domain_name: str = Body(..., embed=True)):
    """
    Эндпоинт для создания нового домена.
    Отправляет запрос на создание домена в REST API docker-mailserver.
    """
    try:
        response = requests.post(f"{MAILSERVER_API_URL}/domains", json={
            "name": domain_name
        })
        response.raise_for_status()  # Проверка на ошибки HTTP
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.delete("/domains/{domain_name}")
def delete_domain(domain_name: str):
    """
    Эндпоинт для удаления домена.
    Отправляет запрос на удаление домена в REST API docker-mailserver.
    """
    try:
        response = requests.delete(f"{MAILSERVER_API_URL}/domains/{domain_name}")
        response.raise_for_status()  # Проверка на ошибки HTTP
        return {"message": f"Domain {domain_name} deleted successfully"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Для запуска: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
