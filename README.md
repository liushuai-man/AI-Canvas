# AI Canvas（AI画布）

一个基于浏览器插件的 AI 对话整理工具，支持 **导入 → 编辑 → 布局 → 导出** 的完整流程，让 AI 对话内容真正"可用、可复用、可留存"。

---

## 项目简介

AI Canvas 是一款使用 **React + TypeScript + WXT** 构建的浏览器扩展，专注解决以下问题：

- AI 对话内容难以整理
- 复制粘贴格式混乱
- 无法灵活调整结构
- 导出格式单一

本项目提供一个"画布式编辑器"，帮助用户高效管理 AI 对话结果。

---

## 核心功能

### 1. 对话导入

- 支持从 AI 页面抓取对话内容（Content Script）
- 自动识别用户 / AI 对话结构

### 2. 画布编辑

- 双击编辑文本（contenteditable）

### 3. 布局调整

- 拖拽排序

### 4. 多格式导出

- PDF（html2pdf.js）
- Markdown（marked）
- TXT（基础支持）
- HTML（基础支持）

### 5. 快捷工具栏（Popup）

- 一键导出
- 快速复制
- 打开画布编辑页面

### 6. Notion 集成

- 保存到 Notion 页面
- 页面选择器
- 默认页面设置

---

## 技术栈

| 分类       | 技术                             |
| ---------- | -------------------------------- |
| 前端       | React + TypeScript + TailwindCSS |
| 插件框架   | WXT                              |
| 状态管理   | Zustand                          |
| 拖拽       | React DnD                        |
| 导出       | html2pdf.js / marked             |
| 构建工具   | Vite                             |
| 图标库     | lucide-react                     |
| 后端       | Node.js + Express + TypeScript   |
| Notion API | @notionhq/client                 |

---

## 项目结构

```
AI Canvas/
├── api/                           # 后端 API 服务
│   ├── src/
│   │   ├── controllers/           # 控制器
│   │   ├── services/              # 服务层
│   │   ├── routes/                # 路由
│   │   ├── config/                # 配置
│   │   ├── utils/                 # 工具函数
│   │   └── app.ts                 # 应用入口
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── extension/                     # 浏览器扩展
│   ├── entrypoints/               # 插件入口
│   │   ├── popup/                 # 工具栏页面
│   │   ├── canvas/                # 画布页面
│   │   ├── background.ts          # 后台脚本
│   │   └── content.ts             # 内容脚本
│   ├── src/
│   │   ├── components/            # 通用组件
│   │   ├── pages/                 # 页面组件
│   │   ├── stores/                # 状态管理
│   │   ├── hooks/                 # 自定义 hooks
│   │   └── utils/                 # 工具函数
│   ├── package.json
│   └── tsconfig.json
│
├── nginx/                         # Nginx 配置
│   └── nginx.conf
│
├── docker-compose.yml             # Docker 编排配置
├── .env.example                   # 环境变量示例
├── .gitignore
└── README.md
```

---

## 安装使用

### 下载浏览器扩展

#### 方式一：从 GitHub 下载（推荐）

1. 访问 [AI Canvas Releases](https://github.com/liushuai-man/AI-Canvas/releases)
2. 下载最新版本的 `extension.zip` 文件
3. 解压下载的文件

#### 方式二：从源码构建

```bash
# 克隆代码
git clone https://github.com/liushuai-man/AI-Canvas.git
cd AI-Canvas/extension

# 安装依赖
pnpm install

# 构建扩展
pnpm build
```

构建完成后，扩展文件位于 `extension/.output/chrome-mv3` 目录。

### 安装到浏览器

1. 打开 Chrome/Edge 浏览器
2. 地址栏输入 `chrome://extensions/` 并回车
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"按钮
5. 选择解压后的扩展文件夹（或构建后的 `extension/.output/chrome-mv3` 目录）
6. 扩展安装完成，可以在浏览器工具栏看到 AI Canvas 图标

### 配置 API 服务

扩展需要连接后端 API 服务才能使用完整功能。API 服务已部署在阿里云服务器上，无需额外配置。

---

## 快速开始

### 本地开发

#### 前置要求

- Node.js >= 20.x
- pnpm >= 8.x

#### 1. 安装依赖

```bash
# 安装扩展依赖
cd extension
pnpm install

# 安装 API 依赖
cd ../api
pnpm install
```

#### 2. 配置环境变量

在 `api` 目录下创建 `.env` 文件：

```env
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_session_secret
PORT=8080
```

#### 3. 启动开发环境

```bash
# 启动扩展开发服务器
cd extension
pnpm dev

# 在新终端启动 API 服务器
cd api
pnpm dev
```

#### 4. 构建插件

```bash
cd extension
pnpm build
```

#### 5. 加载扩展到浏览器

1. 打开 Chrome/Edge 浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension/.output/chrome-mv3` 目录

---

## Docker 部署

### 前置要求

- Docker
- Docker Compose

### 部署步骤

#### 1. 克隆代码

```bash
git clone https://github.com/liushuai-man/AI-Canvas.git
cd AI-Canvas
```

#### 2. 配置环境变量

创建 `.env` 文件：

```bash
cat > .env << 'EOF'
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_session_secret
EOF
```

#### 3. 启动服务

```bash
docker compose up -d
```

#### 4. 访问服务

- API 服务：`http://your-server-ip:8080`
- 前端页面：`http://your-server-ip`

### 常用命令

```bash
# 查看日志
docker compose logs -f

# 重新构建
docker compose up -d --build

# 停止服务
docker compose down

# 重启服务
docker compose restart
```

---

## API 接口

### Notion 接口

| 方法 | 路径                        | 描述                 |
| ---- | --------------------------- | -------------------- |
| GET  | `/api/notion/pages`         | 获取 Notion 页面列表 |
| POST | `/api/notion/save`          | 保存内容到 Notion    |
| GET  | `/api/notion/oauth/callback`| OAuth 回调           |

---

## 架构设计

### 双层结构

#### Popup（轻量操作）

- 快速导出
- 快捷操作
- 打开编辑页面
- Notion 保存

#### Canvas（核心页面）

- 编辑 AI 对话内容
- 拖拽布局
- 多格式导出
- 增量导入

### 三层架构

```
前端扩展（Extension）
        ↓
后端 API（Node.js + Express）
        ↓
Notion API
```

---

## 开发计划

### V1.0（已完成）

- [x] Popup UI
- [x] Popup 功能（一键导出、快速复制、打开编辑页面）
- [x] 对话导入
- [x] Notion 集成
- [x] Canvas 基础结构
- [x] Canvas 基础功能
- [x] Block 编辑
- [x] 多格式导出（TXT / Markdown / PDF / HTML）
- [x] 持久化存储
- [x] 拖拽排序
- [x] Docker 部署支持

---

## 安全说明

- Notion Token 存储在服务器环境变量中，不在前端暴露
- 所有 API 请求都经过服务器代理
- 支持本地开发和生产环境配置分离
- `.env` 文件已添加到 `.gitignore`

---

## 致谢

感谢开源生态：

- [WXT](https://wxt.dev/) - 浏览器扩展框架
- [React](https://react.dev/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [Lucide React](https://lucide-react.vercel.app/) - 图标库

---

> AI Canvas 的目标不是"复制 AI 内容"，而是"让 AI 内容真正成为你的知识资产"

---

**License**: MIT
