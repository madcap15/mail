# backend/main.py
# Основной файл FastAPI приложения.

import requests
from fastapi import FastAPI

# Создание экземпляра FastAPI
app = FastAPI()

MAILSERVER_API_URL = "http://mail_server:9090/api/v1"

@app.get("/")
def read_root():
    """
    Корневой эндпоинт, возвращает приветственное сообщение.
    """
    return {"message": "Welcome to the Mail Service API"}

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

@app.get("/domains")
def get_domains():
    """
    Эндпоинт для получения списка доменов (заглушка).
    Возвращает пример списка доменов.
    """
    # Эту часть мы реализуем в следующих шагах
    return [{"id": 1, "domain_name": "example.com"}, {"id": 2, "domain_name": "mail.org"}]

# Для запуска: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
