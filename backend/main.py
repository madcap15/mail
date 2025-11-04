# backend/main.py
# Основной файл FastAPI приложения.

from fastapi import FastAPI

# Создание экземпляра FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    """
    Корневой эндпоинт, возвращает приветственное сообщение.
    """
    return {"message": "Welcome to the Mail Service API"}

@app.get("/users")
def get_users():
    """
    Эндпоинт для получения списка пользователей (заглушка).
    Возвращает пример списка пользователей.
    """
    return [{"id": 1, "username": "user1@example.com"}, {"id": 2, "username": "user2@example.com"}]

@app.get("/domains")
def get_domains():
    """
    Эндпоинт для получения списка доменов (заглушка).
    Возвращает пример списка доменов.
    """
    return [{"id": 1, "domain_name": "example.com"}, {"id": 2, "domain_name": "mail.org"}]

# Для запуска: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
