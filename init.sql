CREATE DATABASE sogo;
CREATE USER sogo WITH ENCRYPTED PASSWORD 'dev_sogo_pass'; -- <<< ПРОСТОЙ ПАРОЛЬ ДЛЯ РАЗРАБОТКИ (ЗАМЕНИТЕ НА НАДЕЖНЫЙ В ПРОДАКШЕНЕ)
GRANT ALL PRIVILEGES ON DATABASE sogo TO sogo;
