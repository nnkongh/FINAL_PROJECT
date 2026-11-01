# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Frontend gọi API qua đường dẫn tương đối /api, nginx sẽ proxy sang backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN yarn vite build --base=/

# ---- Runtime stage ----
FROM nginx:alpine

# Image nginx tự thay biến môi trường (${BackendApi}) trong /etc/nginx/templates khi khởi động
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000