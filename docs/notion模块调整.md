# Notion 模块调整方案

## 一、用户体系

### 设计原则

继续使用现有的账号体系，不要把 Notion 当登录方式。

原因：
- 用户不一定有 Notion
- 用户可能绑定多个第三方服务
- AI Canvas 的账号体系应该独立

### 账号结构

```
User
 ├── Email / GitHub（登录方式）
 └── NotionConnection（第三方绑定）
```

---

## 二、现状分析

### 当前代码结构

```
api/src/
├── config/env.ts                 # 环境变量（NOTION_TOKEN, CLIENT_ID, CLIENT_SECRET）
├── lib/notion.ts                 # 全局 Notion SDK 单例（遗留代码）
├── routes/notion.ts              # 8 个路由端点
├── controllers/
│   ├── notion.controller.ts      # 页面列表 + 保存
│   └── oauth.controller.ts       # OAuth 授权流程
├── services/
│   ├── notionSave.ts             # Notion API 调用
│   └── userService.ts            # 用户 Token 管理（内存 Map）
├── utils/toNotionBlocks.ts       # ContentBlock -> Notion Block 转换
└── types/notion.ts               # 类型定义

extension/src/
├── hooks/useNotion.ts            # Notion 业务 Hook
├── stores/modules/useNotionStore.ts  # 状态管理（chrome.storage 持久化）
└── pages/popup/
    ├── components/SaveNotion.tsx  # 保存到 Notion 组件
    └── NotionPageSelector.tsx     # 页面选择器
```

### 当前路由

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/notion/auth` | 发起 OAuth 授权 |
| GET | `/api/notion/callback` | OAuth 回调 |
| GET | `/api/notion/auth-success` | 授权成功页面 |
| GET | `/api/notion/user/:userId` | 查询 Token 状态 |
| DELETE | `/api/notion/user/:userId` | 登出 |
| POST | `/api/notion/refresh-token` | 刷新 Token |
| GET | `/api/notion/list` | 获取页面列表 |
| POST | `/api/notion/save` | 保存内容到 Notion |

### 当前问题

1. **Token 存储在内存中**：`UserService` 使用 `Map<string, User>`，服务器重启后丢失
2. **没有用户账号系统**：直接用 Notion userId 作为标识，没有独立的用户体系
3. **OAuth 返回的是 Integration Token**：可能创建的是 Internal Integration 而非 Public Integration
4. **ContentBlock 转换不完整**：`table` 和 `inlineCode` 类型未实现
5. **全局 `lib/notion.ts` 单例是遗留代码**：未被使用

---

## 三、数据库调整

### 新增 NotionConnection 模型

```prisma
model NotionConnection {
  id              String   @id @default(cuid())

  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  // Notion 工作区信息
  workspaceId     String
  workspaceName   String

  // Notion 用户信息
  notionUserId    String
  notionUserName  String?
  notionEmail     String?

  // OAuth Token
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  expiresAt       DateTime?

  // 导出目标页面
  targetPageId    String?
  targetPageTitle String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### User 模型增加关联

```prisma
model User {
  id               String             @id @default(cuid())
  email            String?            @unique
  githubId         String?            @unique
  // ... 其他字段

  notionConnection NotionConnection?
}
```

### 迁移方案

当前 `UserService` 使用内存 Map，需要迁移为数据库持久化：

```
当前: Map<string, User>  ->  目标: Prisma + NotionConnection 表
```

---

## 四、OAuth 流程调整

### 当前流程（存在问题）

```
点击登录 -> /api/notion/auth -> Notion OAuth -> /api/notion/callback
  -> 用 Basic Auth 换 Token -> 存入内存 Map -> 重定向 auth-success
  -> postMessage 通知父窗口
```

### 优化后的流程

```
GET /api/integrations/notion/connect
```

后端生成带签名的 state 参数（防 CSRF）：

```typescript
const state = jwt.sign(
  { userId: currentUser.id },
  process.env.JWT_SECRET,
  { expiresIn: '10m' }
);

const authUrl = `https://api.notion.com/v1/oauth/authorize?` +
  `client_id=${env.notionClientId}` +
  `&redirect_uri=${encodeURIComponent(env.notionRedirectUri)}` +
  `&response_type=code` +
  `&owner=user` +
  `&scope=pages:read%20pages:write` +
  `&state=${state}`;

res.redirect(authUrl);
```

### 回调处理

```
GET /api/integrations/notion/callback
```

流程：

```
获取 code + state
  ↓
验证 state（JWT 解密，确认 userId）
  ↓
用 code 换 access_token（Basic Auth 方式）
  ↓
获取 workspace 信息
  ↓
获取用户信息（Notion /v1/users/me）
  ↓
保存到 NotionConnection 表
  ↓
跳回前端
```

### Token 刷新

Notion OAuth 的 access_token 有效期为 1 小时，需要实现自动刷新：

```typescript
// 检查是否过期
if (connection.expiresAt && new Date() > connection.expiresAt) {
  // 使用 refresh_token 获取新的 access_token
  const response = await axios.post('https://api.notion.com/v1/oauth/token', {
    grant_type: 'refresh_token',
    refresh_token: connection.refreshToken,
  }, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  // 更新数据库中的 Token
  await prisma.notionConnection.update({
    where: { userId },
    data: {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
    },
  });
}
```

---

## 五、页面选择功能

### 接口设计

```
GET /api/notion/pages
Authorization: Bearer <user_token>
```

返回：

```json
{
  "success": true,
  "pages": [
    {
      "id": "xxx",
      "title": "AI Canvas Inbox",
      "lastEditedTime": "2026-07-15T10:00:00Z"
    },
    {
      "id": "yyy",
      "title": "工作笔记",
      "lastEditedTime": "2026-07-14T08:00:00Z"
    }
  ]
}
```

### 前端 UI

```
请选择导出位置

○ AI Canvas Inbox      (最近编辑: 2小时前)
○ 工作笔记             (最近编辑: 1天前)
○ 学习笔记             (最近编辑: 3天前)

[刷新列表]  [确认]
```

### 保存选择结果

用户选择后，保存到 `NotionConnection.targetPageId` 和 `targetPageTitle`。

---

## 六、导出架构调整

### 当前架构

```
插件前端 -> 直接调用 Notion API（通过后端代理）
```

### 优化后的架构

```
插件前端只负责：
  获取网页内容
    ↓
  发送给后端

后端负责：
  查询用户绑定
    ↓
  获取 accessToken（自动刷新）
    ↓
  获取 targetPageId
    ↓
  转换 ContentBlock -> Notion Block
    ↓
  写入 Notion
```

### 接口设计

```
POST /api/notion/export
Authorization: Bearer <user_token>

{
  "conversationId": "xxx",
  "title": "对话标题",
  "blocks": [
    { "type": "text", "content": "..." },
    { "type": "code", "content": "...", "language": "javascript" }
  ]
}
```

后端处理流程：

```typescript
// 1. 查询用户绑定
const connection = await prisma.notionConnection.findUnique({
  where: { userId }
});

// 2. 检查并刷新 Token
await refreshTokenIfNeeded(connection);

// 3. 转换为 Notion Block
const notionBlocks = toNotionBlocks(blocks);

// 4. 写入目标页面
await notion.blocks.children.append({
  block_id: connection.targetPageId,
  children: notionBlocks,
});
```

---

## 七、推荐页面结构

授权后自动创建 `AI Canvas Inbox` 页面：

```
AI Canvas Inbox
│
├── 2026-07-15
│   ├── React源码分析
│   ├── Next.js缓存机制
│   └── AI Agent设计
│
├── 2026-07-16
│   ├── LangGraph教程
│   └── Claude Code实践
│
└── 2026-07-17
    └── ...
```

### 实现逻辑

1. 授权成功后，检查是否存在 `AI Canvas Inbox` 页面
2. 不存在则创建
3. 每次导出时，检查是否有当天的日期子页面
4. 不存在则创建
5. 将对话内容追加到当天的子页面中

```typescript
// 查找或创建 Inbox 页面
async function getOrCreateInboxPage(notion: Client): Promise<string> {
  const search = await notion.search({
    query: 'AI Canvas Inbox',
    filter: { property: 'object', value: 'page' },
  });

  if (search.results.length > 0) {
    return search.results[0].id;
  }

  // 创建新的 Inbox 页面
  const page = await notion.pages.create({
    parent: { type: 'page_id', page_id: '...' }, // 需要一个父页面
    properties: {
      title: { title: [{ text: { content: 'AI Canvas Inbox' } }] },
    },
  });

  return page.id;
}

// 查找或创建当天的子页面
async function getOrCreateDailyPage(notion: Client, inboxId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]; // 2026-07-15

  const children = await notion.blocks.children.list({
    block_id: inboxId,
  });

  const existingPage = children.results.find(
    (block: any) => block.type === 'child_page' && block.child_page.title === today
  );

  if (existingPage) {
    return existingPage.id;
  }

  const page = await notion.pages.create({
    parent: { type: 'page_id', page_id: inboxId },
    properties: {
      title: { title: [{ text: { content: today } }] },
    },
  });

  return page.id;
}
```

---

## 八、插件 UI 调整

### 当前 UI

```
┌─────────────────────┐
│  AI Canvas          │
│                     │
│  当前导出: 5 条消息  │
│                     │
│  [导出到画布]        │
│                     │
│  PDF | MD | TXT | HTML│
│                     │
│  保存到 Notion      │
│  未登录              │
│  [登录 Notion]       │
└─────────────────────┘
```

### 优化后的 UI

```
┌─────────────────────┐
│  AI Canvas          │
│                     │
│  当前导出: 5 条消息  │
│                     │
│  [导出到画布]        │
│                     │
│  PDF | MD | TXT | HTML│
│                     │
│  ─── 导出到 Notion ───│
│                     │
│  未连接              │
│  [连接 Notion]       │
└─────────────────────┘
```

连接后：

```
┌─────────────────────┐
│  AI Canvas          │
│                     │
│  当前导出: 5 条消息  │
│                     │
│  [导出到画布]        │
│                     │
│  PDF | MD | TXT | HTML│
│                     │
│  ─── 导出到 Notion ───│
│  ✓ 已连接            │
│                     │
│  目标: AI Canvas Inbox│
│  [更换页面]          │
│                     │
│  [导出到 Notion]     │
│  [解除绑定]          │
└─────────────────────┘
```

---

## 九、ContentBlock 转换补全

当前 `toNotionBlocks.ts` 只支持 `text`、`code`、`list` 三种类型，需要补全：

### 需要补全的类型

```typescript
// table -> Notion table block
case 'table':
  // 需要将二维数组转换为 Notion table 结构
  // notion.blocks.children.append 需要先创建 table block
  // 然后逐行添加 table_row
  break;

// inlineCode -> Notion paragraph with inline code
case 'inlineCode':
  // Notion 不直接支持 inline code block
  // 需要将其作为 paragraph 中的富文本处理
  // rich_text: [{ type: 'text', text: { content: code }, annotations: { code: true } }]
  break;

// image -> Notion image block
case 'image':
  // notion.blocks.children.append({
  //   block_id: pageId,
  //   children: [{
  //     type: 'image',
  //     image: { type: 'external', external: { url: imageUrl } }
  //   }]
  // })
  break;
```

---

## 十、优先级排序

### P0 - 最小可用版本（当前阶段）

- [x] Notion OAuth 授权流程
- [x] 保存 Access Token
- [x] 选择目标页面
- [x] 导出文本/代码/列表到 Notion

### P1 - 核心功能完善

- [ ] Token 持久化存储（数据库替代内存 Map）
- [ ] Token 自动刷新
- [ ] 自动创建 AI Canvas Inbox 页面
- [ ] 按日期组织导出内容
- [ ] 导出图片到 Notion
- [ ] 表格和行内代码的转换

### P2 - 用户体验优化

- [ ] 独立的用户账号系统（邮箱/GitHub 登录）
- [ ] Notion 绑定管理页面（设置 > 第三方集成）
- [ ] 导出历史记录
- [ ] 批量导出

### P3 - 高级功能

- [ ] 双向同步（Notion -> AI Canvas）
- [ ] 自定义导出模板
- [ ] 多工作区支持

---

## 十一、Notion 开发者配置

### 创建 Public Integration

1. 访问 https://www.notion.so/my-integrations
2. 点击 **New integration**
3. 选择 **Public integration**（不是 Internal）
4. 填写信息：
   - Name: `AI Canvas`
   - Associated workspace: 选择你的工作区
5. 在 **Capabilities** 中启用：
   - Read content
   - Update content
   - Insert content
6. 在 **OAuth Domain & URIs** 中添加：
   - `http://localhost:8080/api/notion/callback`（开发环境）
   - `https://your-domain.com/api/notion/callback`（生产环境）
7. 复制 **OAuth Client ID** 和 **OAuth Client Secret**

### 环境变量配置

```env
# .env
NOTION_CLIENT_ID=your-oauth-client-id
NOTION_CLIENT_SECRET=your-oauth-client-secret
NOTION_REDIRECT_URI=http://localhost:8080/api/notion/callback
NOTION_TOKEN=  # 留空（使用 OAuth Token）
```

---

## 十二、清理遗留代码

需要清理的文件：

- `api/src/lib/notion.ts` - 全局 Notion SDK 单例，未被使用
- `api/.env` 中的 `NOTION_TOKEN` - 如果使用 OAuth，不需要全局 Token
