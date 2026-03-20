# Використовуємо офіційний Node.js
FROM node:20-slim

# Встановлюємо необхідні системні бібліотеки для роботи Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Вказуємо Puppeteer НЕ завантажувати свій Chromium (використаємо системний)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Копіюємо package.json та встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо решту файлів проекту
COPY . .

# Створюємо папку для звітів (якщо вона не створена)
RUN mkdir -p reports

# Запускаємо скрипт
CMD ["node", "src/task.js"]