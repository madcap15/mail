# backend/admin/settings.py
# Файл с настройками для административной панели.

# Пример конфигурации базы данных
DATABASE_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "admin",
    "password": "secure_password",
    "dbname": "mail_service_db"
}

# Настройки для SMTP-сервера
SMTP_CONFIG = {
    "server": "smtp.example.com",
    "port": 587,
    "username": "admin@example.com",
    "password": "smtp_password"
}

# Секретный ключ для JWT-токенов
SECRET_KEY = "a_very_secret_key_for_jwt"
