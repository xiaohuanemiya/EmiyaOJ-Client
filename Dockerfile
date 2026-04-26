# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制项目所有文件进行构建
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# 替换默认的 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建好的文件到 Nginx 的默认静态资源目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
