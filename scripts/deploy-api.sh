#!/bin/bash

# AI Canvas API 部署脚本
# 服务器: 120.55.2.225
# 使用方法: ssh root@120.55.2.225 'bash -s' < deploy-api.sh

set -e

echo "=========================================="
echo "AI Canvas API 部署脚本"
echo "=========================================="

# 1. 更新系统
echo "[1/6] 更新系统..."
apt update && apt upgrade -y

# 2. 安装 Node.js 20.x
echo "[2/6] 安装 Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 3. 安装 pnpm
echo "[3/6] 安装 pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
echo "pnpm 版本: $(pnpm -v)"

# 4. 安装 PM2
echo "[4/6] 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    pnpm install -g pm2
fi

# 5. 安装 Nginx
echo "[5/6] 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi

# 6. 部署项目
echo "[6/6] 部署项目..."
PROJECT_DIR="/var/www/ai-canvas-api"

if [ -d "$PROJECT_DIR" ]; then
    echo "项目目录已存在，更新代码..."
    cd $PROJECT_DIR
    git pull
else
    echo "克隆项目..."
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    git clone https://github.com/liushuai-man/AI-Canvas.git .
fi

# 进入 API 目录
cd api

# 安装依赖
echo "安装依赖..."
pnpm install

# 编译 TypeScript
echo "编译 TypeScript..."
pnpm build

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "创建环境变量文件..."
    cat > .env << 'EOF'
NOTION_TOKEN=
PORT=8080
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=http://120.55.2.225/api/notion/callback
SESSION_SECRET=ai-canvas-secret-key-2024
EOF
    echo "请编辑 $PROJECT_DIR/api/.env 文件，填入正确的配置"
fi

# 配置 Nginx
echo "配置 Nginx..."
cat > /etc/nginx/sites-available/ai-canvas-api << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/ai-canvas-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

# 启动 API 服务
echo "启动 API 服务..."
cd $PROJECT_DIR/api

# 停止旧进程
pm2 delete ai-canvas-api 2>/dev/null || true

# 启动新进程
pm2 start dist/app.js --name ai-canvas-api

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "API 地址: http://120.55.2.225"
echo ""
echo "后续操作："
echo "1. 编辑环境变量: nano $PROJECT_DIR/api/.env"
echo "2. 重启服务: pm2 restart ai-canvas-api"
echo "3. 查看日志: pm2 logs ai-canvas-api"
echo "4. 查看状态: pm2 status"
echo ""
echo "Notion OAuth 回调地址: http://120.55.2.225/api/notion/callback"
echo "请在 Notion Developers 中添加此回调地址"
echo "=========================================="
