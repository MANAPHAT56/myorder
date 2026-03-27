# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# ก๊อปปี้ source code และ build
COPY . .
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine

# ก๊อปปี้ไฟล์ที่ build แล้ว
COPY --from=builder /app/dist /usr/share/nginx/html

# สร้าง nginx config เพื่อรองรับ React Router
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]