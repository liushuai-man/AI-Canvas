# 🧠 AI Canvas（AI画布）

一个基于浏览器插件的 AI 对话整理工具，支持 **导入 → 编辑 → 布局 → 导出** 的完整流程，让 AI 对话内容真正“可用、可复用、可留存”。

---

## 🚀 项目简介

AI Canvas 是一款使用 **React + TypeScript + WXT** 构建的浏览器扩展，专注解决以下问题：

- ❌ AI 对话内容难以整理
- ❌ 复制粘贴格式混乱
- ❌ 无法灵活调整结构
- ❌ 导出格式单一

👉 本项目提供一个“画布式编辑器”，帮助用户高效管理 AI 对话结果。

---

## ✨ 核心功能

### 🧩 1. 对话导入

- 支持从 AI 页面抓取对话内容（Content Script）
- 支持手动粘贴导入
- 自动识别用户 / AI 对话结构

---

### ✍️ 2. 画布编辑

- 双击编辑文本（contenteditable）
- 支持增删改查
- Ctrl/Cmd + Enter : 强制完成编辑并保存。
- Esc : 取消编辑并恢复原始内容。

---

### 🧠 3. 布局调整

- 拖拽排序
- 分栏布局
- 模块分组

---

### 📤 4. 多格式导出

- PDF（html2pdf.js）
- Markdown（marked）
- TXT（基础支持）
- HTML（基础支持）

---

### ⚡ 5. 快捷工具栏（Popup）

- 一键导出
- 快速复制
- 打开画布编辑页面

---

## 🧱 技术栈

| 分类     | 技术                             |
| -------- | -------------------------------- |
| 前端     | React + TypeScript + tailwindcss |
| 插件框架 | WXT                              |
| 状态管理 | Zustand                          |
| 拖拽     | React DnD                        |
| 导出     | html2pdf.js / marked             |
| 构建工具 | Vite                             |
| 图标库   | lucide-react                     |
| 格式化库 | turnmarkdown + markdown-it        |





### 文字图标

使用 [lucide-react](https://lucide-react.vercel.app/) 提供的图标组件库。

---

## 📁 项目结构

```bash
ai-canvas-extension/
├── entrypoints/                # 插件入口
│   ├── popup/                 # 工具栏（轻操作）
│   ├── canvas/                # 画布页面（核心）
│   ├── background.ts          # 后台脚本
│   └── content.ts             # 内容脚本
│
├── src/
│   ├── components/            # 通用组件
│   │   ├── Block/             # 对话卡片
│   │   ├── Canvas/            # 画布容器
│   │   └── Toolbar/           # 工具栏
│   │
├── content/                 # 内容脚本
│   │   ├── actions/             # 动作模块
│   │   ├── import.ts             # 导入模块
│   │   ├── extractors/          # 提取器
│   │   └── ui/             # UI 组件
│   │
│   │
│   ├── pages/
│   │   ├── Popup/             # Popup页面
│   │   └── Canvas/            # 主编辑页面
│   │
│   ├── store/                 # 状态管理
│   ├── hooks/                 # 自定义 hooks
│   ├── utils/                 # 工具函数
│   ├── types/                 # 类型定义
│   └── styles/                # 全局样式
│
├── public/                    # 静态资源
├── wxt.config.ts
├── package.json
└── tsconfig.json
```

---

## 🧠 架构设计

本项目采用“双层结构”：

### 浏览器页面

- 导入 AI 对话内容

### 🟢 Popup（轻量操作）

- 快速导出
- 快捷操作
- 打开编辑页面

### 🔵 Canvas（核心页面）

- 编辑 AI 对话内容
- 拖拽布局
- 多格式导出
- 增量导入

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
```

---

## 🛠️ 本地开发

### 1️⃣ 安装依赖

```bash
pnpm install
```

---

### 2️⃣ 启动开发环境

```bash
pnpm dev
```

---

### 3️⃣ 构建插件

```bash
pnpm build
```

---

### 4️⃣ 预览构建结果

```bash
pnpm preview
```

---

## 🗺️ 开发计划

### ✅ V1.0（当前目标）

- [x] Popup UI
- [ ] Popup 功能(一键导出、快速复制、打开编辑页面)
- [x] 对话导入
- [ ] Sync Notion
- [ ] Canvas 基础结构
- [ ] Canvas 基础功能
- [x] Block 编辑
- [x] 多格式导出（TXT / Markdown/PDF/HTML）
- [x] 持久化存储
- [ ] 拖拽排序
- [ ] 分栏布局
- [ ] 撤销 / 重做




## 🙌 致谢

感谢开源生态：

- WXT
- React
- Vite

---

> ✨ AI Canvas 的目标不是“复制 AI 内容”，而是“让 AI 内容真正成为你的知识资产”
