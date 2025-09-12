# syntax=docker/dockerfile:1

# مرحلة البناء (تبني Vite)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# مرحلة التشغيل (تشغل server.js وتخدم dist)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# تثبيت تبع التشغيل فقط (express/pg) بدون devDeps
RUN npm ci --omit=dev
# انسخ الملفات المبنية والسيرفر
COPY --from=build /app/dist ./dist
COPY server.js ./server.js
EXPOSE 8080
CMD ["node", "server.js"]
