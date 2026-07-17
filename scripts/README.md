# AI Canvas 部署脚本

本目录包含 AI Canvas 项目的部署脚本。

## 脚本说明

### 1. `deploy-api.sh` - API 后端部署脚本

将 API 后端部署到阿里云服务器。

**使用方法：**

```bash
# 方式一：本地执行（需要 SSH 访问）
ssh root@120.55.2.225 'bash -s' < scripts/deploy-api.sh

# 方式二：上传到服务器执行
scp scripts/deploy-api.sh root@120.55.2.225:/tmp/
ssh root@120.55.2.225 'bash /tmp/deploy-api.sh'
```

**部署后配置：**

1. 编辑环境变量文件：
```bash
ssh root@120.55.2.225
nano /var/www/ai-canvas-api/api/.env
```

2. 填入以下配置：
```
NOTION_TOKEN=你的notion_token
PORT=8080
NOTION_CLIENT_ID=你的client_id
NOTION_CLIENT_SECRET=你的client_secret
NOTION_REDIRECT_URI=http://120.55.2.225/api/notion/callback
SESSION_SECRET=你的session密钥
```

3. 重启服务：
```bash
pm2 restart ai-canvas-api
```

4. 在 Notion Developers 中添加回调地址：
   - 访问 https://www.notion.so/my-integrations
   - 添加 Redirect URI: `http://120.55.2.225/api/notion/callback`

---

### 2. `build-extension.sh` - 扩展构建脚本

构建 Chrome 扩展的生产版本。

**使用方法：**

```bash
# 使用当前版本号
./scripts/build-extension.sh

# 指定版本号
./scripts/build-extension.sh 0.0.3
```

**输出：**
- 构建文件：`extension/.output/ai-canvas-{version}-chrome.zip`
- 该文件用于上传到 GitHub Release

---

### 3. `create-release.sh` - GitHub Release 创建脚本

创建 GitHub Release 并上传扩展文件。

**前置条件：**
1. 安装 GitHub CLI (`gh`)
2. 已登录 GitHub 账户
3. 已运行 `build-extension.sh` 生成 zip 文件

**使用方法：**

```bash
# 使用当前版本号
./scripts/create-release.sh

# 指定版本号
./scripts/create-release.sh 0.0.3
```

**功能：**
- 创建 Git Tag
- 推送 Tag 到远程仓库
- 创建 GitHub Release
- 上传扩展 zip 文件
- 自动生成 Release 说明

---

## 部署流程

### 完整部署步骤

1. **部署 API 后端**
```bash
# 连接到服务器
ssh root@120.55.2.225

# 下载并执行部署脚本
curl -sSL https://raw.githubusercontent.com/liushuai-man/AI-Canvas/main/scripts/deploy-api.sh | bash

# 编辑环境变量
nano /var/www/ai-canvas-api/api/.env

# 重启服务
pm2 restart ai-canvas-api
```

2. **构建扩展**
```bash
# 本地执行
./scripts/build-extension.sh
```

3. **创建 GitHub Release**
```bash
# 本地执行
./scripts/create-release.sh
```

4. **验证部署**
- 访问 http://120.55.2.225 检查 API 是否正常
- 下载扩展并测试功能

---

## 常见问题

### Q1: 部署脚本执行失败

**原因：** 可能是网络问题或权限不足

**解决：**
```bash
# 检查网络连接
ping 120.55.2.225

# 检查 SSH 连接
ssh root@120.55.2.225

# 检查服务器磁盘空间
df -h
```

### Q2: API 服务无法启动

**原因：** 环境变量未配置或端口被占用

**解决：**
```bash
# 检查环境变量
cat /var/www/ai-canvas-api/api/.env

# 检查端口占用
lsof -i :8080

# 查看 PM2 日志
pm2 logs ai-canvas-api
```

### Q3: 扩展构建失败

**原因：** 依赖未安装或版本不兼容

**解决：**
```bash
# 清除缓存
cd extension
rm -rf node_modules .output
pnpm install

# 重新构建
pnpm build
pnpm zip
```

### Q4: GitHub Release 创建失败

**原因：** GitHub CLI 未安装或未登录

**解决：**
```bash
# 安装 GitHub CLI
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: sudo apt install gh

# 登录 GitHub
gh auth login

# 检查认证状态
gh auth status
```

---

## 服务器管理命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs ai-canvas-api

# 重启服务
pm2 restart ai-canvas-api

# 停止服务
pm2 stop ai-canvas-api

# 查看 Nginx 状态
systemctl status nginx

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 配置
nginx -t

# 查看磁盘空间
df -h

# 查看内存使用
free -h
```

---

## 更新流程

当需要更新 API 后端时：

```bash
# 连接到服务器
ssh root@120.55.2.225

# 进入项目目录
cd /var/www/ai-canvas-api

# 拉取最新代码
git pull

# 重新编译
cd api
pnpm build

# 重启服务
pm2 restart ai-canvas-api
```

当需要更新扩展时：

```bash
# 本地执行
./scripts/build-extension.sh
./scripts/create-release.sh
```
