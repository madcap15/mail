# frontend/Dockerfile
# Dockerfile для сборки frontend-приложения.

# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Открываем порт 3000 для доступа к приложению
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]
