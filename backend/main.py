# backend/main.py
# Основной файл FastAPI приложения.

from fastapi import FastAPI
import subprocess
import json

# Создание экземпляра FastAPI
app = FastAPI()

def run_command(command):
    """
    Выполняет команду в shell и возвращает ее вывод.
    """
    result = subprocess.run(command, capture_output=True, text=True, shell=True)
    if result.returncode != 0:
        # В реальном приложении здесь должна быть обработка ошибок
        return {"error": result.stderr.strip()}
    return result.stdout.strip()

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
    Выполняет команду в контейнере mail_server для получения списка email-адресов.
    """
    # Обратите внимание: 'mail_server' - это имя контейнера из docker-compose.yml
    command = "docker exec mail_server setup.sh email list"
    output = run_command(command)
    if "error" in output:
        return output
    
    # Парсим вывод команды
    lines = output.split('\n')
    # Первая строка - заголовок, пропускаем ее
    users = []
    if len(lines) > 1:
        for line in lines[1:]:
            # Ожидаемый формат: user@example.com
            if line:
                users.append({"email": line.strip()})
    return {"users": users}

@app.get("/domains")
def get_domains():
    """
    Эндпоинт для получения списка доменов (заглушка).
    Возвращает пример списка доменов.
    """
    # Эту часть мы реализуем в следующих шагах
    return [{"id": 1, "domain_name": "example.com"}, {"id": 2, "domain_name": "mail.org"}]

# Для запуска: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
