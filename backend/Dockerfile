# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY . .
RUN npx prisma generate
RUN npm run build

# アプリを起動
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && (npm run prisma:seed || true) && npm run start:dev"]