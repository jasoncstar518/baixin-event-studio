FROM node:18-slim

WORKDIR /app

# 安装 OpenSSL 3 和构建依赖（Prisma 5.x 支持 OpenSSL 3）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 \
    openssl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 生成 Prisma 客户端（会自动检测系统 OpenSSL 版本）
RUN npx prisma generate

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "start"]
