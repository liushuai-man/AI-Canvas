# 🧠 AI Canvas（AI画布）

一个基于浏览器插件的 AI 对话整理工具，支持 **导入 → 编辑 → 布局 → 导出** 的完整流程，让 AI 对话内容真正"可用、可复用、可留存"。

---

## 🚀 项目简介

AI Canvas 是一款使用 **React + TypeScript + WXT** 构建的浏览器扩展，专注解决以下问题：

- ❌ AI 对话内容难以整理
- ❌ 复制粘贴格式混乱
- ❌ 无法灵活调整结构
- ❌ 导出格式单一

👉 本项目提供一个"画布式编辑器"，帮助用户高效管理 AI 对话结果。

---

## ✨ 核心功能

### 🧩 1. 对话导入

- ✅ 支持从 AI 页面抓取对话内容（Content Script）
- ✅ 自动识别用户 / AI 对话结构

---

### ✍️ 2. 画布编辑

- ✅ 双击编辑文本（contenteditable）

---

### 🧠 3. 布局调整

- ✅ 拖拽排序

---

### 📤 4. 多格式导出

- ✅ PDF（html2pdf.js）
- ✅ Markdown（marked）
- ✅ TXT（基础支持）
- ✅ HTML（基础支持）

---

### ⚡ 5. 快捷工具栏（Popup）

- ✅ 一键导出
- ✅ 快速复制
- ✅ 打开画布编辑页面

---

### 📝 6. Notion 集成

- ✅ 保存到 Notion 页面
- ✅ 页面选择器
- ✅ 默认页面设置

---

## 🧱 技术栈

| 分类       | 技术                             |
| ---------- | -------------------------------- |
| 前端       | React + TypeScript + tailwindcss |
| 插件框架   | WXT                              |
| 状态管理   | Zustand                          |
| 拖拽       | React DnD                        |
| 导出       | html2pdf.js / marked             |
| 构建工具   | Vite                             |
| 图标库     | lucide-react                     |
| 后端       | Node.js + Express + TypeScript   |
| Notion API | @notionhq/client                 |

---

## 📁 项目结构

```bash
AI Canvas/
├── api/                           # 后端 API 服务
│   ├── src/
│   │   ├── controllers/           # 控制器
│   │   │   └── notion.controller.ts
│   │   ├── services/              # 服务层
│   │   │   └── notionSave.ts
│   │   ├── routes/                # 路由
│   │   │   └── notion.ts
│   │   ├── lib/                   # 工具库
│   │   │   └── notion.ts
│   │   ├── config/                # 配置
│   │   │   └── env.ts
│   │   ├── utils/                 # 工具函数
│   │   │   └── toNotionBlocks.ts
│   │   └── app.ts                 # 应用入口
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
│   │   │   ├── SmartIcon.tsx      # 导出图标
│   │   │   └── Loading.tsx        # 加载组件
│   │   ├── pages/
│   │   │   ├── Canvas/            # 画布页面
│   │   │   │   ├── components/
│   │   │   │   │   ├── BlockItem/ # 对话卡片
│   │   │   │   │   ├── Row/       # 行布局
│   │   │   │   │   ├── CanvasArea.tsx
│   │   │   │   │   └── FloatingToolbar.tsx
│   │   │   │   └── CanvasPage.tsx
│   │   │   └── Popup/             # Popup 页面
│   │   │       ├── components/
│   │   │       │   └── SaveNotion.tsx
│   │   │       ├── NotionPageSelector.tsx
│   │   │       └── PopupPage.tsx
│   │   ├── content/               # 内容脚本
│   │   │   ├── extractors/        # 提取器
│   │   │   │   └── chatgpt.ts
│   │   │   └── actions/           # 动作模块
│   │   ├── stores/                # 状态管理
│   │   │   └── modules/
│   │   │       ├── useBlockStore.ts
│   │   │       ├── useNotionStore.ts
│   │   │       └── useCanvasStore.ts
│   │   ├── hooks/                 # 自定义 hooks
│   │   │   ├── useExport.ts
│   │   │   ├── useNotion.ts
│   │   │   └── useDragSort.ts
│   │   └── utils/                 # 工具函数
│   ├── wxt.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                        # 共享类型定义
│   └── types/
│       ├── block.ts
│       └── notion.ts
├── .gitignore
└── README.md
```

---

## 🧠 架构设计

### 双层结构

#### 🟢 Popup（轻量操作）

- 快速导出
- 快捷操作
- 打开编辑页面
- Notion 保存

#### 🔵 Canvas（核心页面）

- 编辑 AI 对话内容
- 拖拽布局
- 多格式导出
- 增量导入

### 三层架构

```text
前端扩展（Extension）
        ↓
后端 API（Node.js + Express）
        ↓
Notion API
```

---

## 🔄 数据流

```text
Content Script（抓取对话）
        ↓
Background（存储）
        ↓
Popup（快速操作）
        ↓
Canvas 页面（编辑）
        ↓
API Server（保存到 Notion）
```

---

## 🛠️ 本地开发

### 前置要求

- Node.js >= 20.x
- pnpm >= 8.x

### 1️⃣ 安装依赖

```bash
# 安装扩展依赖
cd extension
pnpm install

# 安装 API 依赖
cd ../api
pnpm install
```

---

### 2️⃣ 配置环境变量

在 `api` 目录下创建 `.env` 文件：

```env
NOTION_TOKEN=your-notion-api-token
PORT=8080
```

---

### 3️⃣ 启动开发环境

```bash
# 启动扩展开发服务器
cd extension
pnpm dev

# 在新终端启动 API 服务器
cd api
pnpm dev
```

---

### 4️⃣ 构建插件

```bash
cd extension
pnpm build
```

---

### 5️⃣ 加载扩展到浏览器

1. 打开 Chrome/Edge 浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension/.output/chrome-mv3` 目录

---

## 🗺️ 开发计划

### ✅ V1.0（已完成）

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


---

## 📝 API 接口

### Notion 接口

| 方法 | 路径               | 描述                 |
| ---- | ------------------ | -------------------- |
| GET  | `/api/notion/list` | 获取 Notion 页面列表 |
| POST | `/api/notion/save` | 保存内容到 Notion    |

#### 请求示例

**保存到 Notion**

```bash
POST /api/notion/save
Content-Type: application/json

{
  "pageId": "your-page-id",
  "blocks": [...]
}
```

---

## 🔒 安全说明

- Notion Token 存储在服务器环境变量中，不在前端暴露
- 所有 API 请求都经过服务器代理
- 支持本地开发和生产环境配置分离

---

## 🙌 致谢

感谢开源生态：

- [WXT](https://wxt.dev/) - 浏览器扩展框架
- [React](https://react.dev/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [Lucide React](https://lucide-react.vercel.app/) - 图标库

---

> ✨ AI Canvas 的目标不是"复制 AI 内容"，而是"让 AI 内容真正成为你的知识资产"

---

**License**: MIT
