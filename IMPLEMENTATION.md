# EmiyaOJ Client 前端实现文档

## 项目概述

EmiyaOJ Client 是一个基于 Vue 3 + TypeScript + Element Plus 的在线评测系统（Online Judge）客户端前端应用。

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **语言**: TypeScript 5.9
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite 7
- **JWT 解析**: jwt-decode

## 项目结构

```
src/
├── api/                    # API 接口封装
│   ├── auth.ts            # 认证接口
│   ├── problem.ts         # 题目接口
│   ├── submission.ts      # 提交接口
│   └── language.ts        # 语言接口
├── composables/           # 组合式函数
│   └── useSubmissionPolling.ts  # 提交轮询
├── router/                # 路由配置
│   └── index.ts
├── stores/                # Pinia 状态管理
│   └── user.ts           # 用户状态
├── types/                 # TypeScript 类型定义
│   └── api.ts
├── utils/                 # 工具函数
│   ├── jwt.ts            # JWT 解析工具
│   └── request.ts        # Axios 配置
├── views/                 # 页面组件
│   ├── LoginView.vue             # 登录页面
│   ├── ProblemListView.vue       # 题目列表
│   ├── ProblemDetailView.vue     # 题目详情和代码提交
│   └── SubmissionListView.vue    # 提交记录
├── App.vue
└── main.ts
```

## 核心功能

### 1. 认证系统

- **登录功能** (`/login`)
  - 用户名和密码登录
  - JWT Token 管理
  - 自动 Token 过期检测
  - 权限信息解析和存储

- **登出功能**
  - 清除本地存储
  - 跳转到登录页

- **路由守卫**
  - 自动登录状态检查
  - 未登录用户重定向到登录页
  - 已登录用户访问登录页自动跳转首页

### 2. 题目管理

- **题目列表** (`/problems`)
  - 分页查询
  - 难度筛选（简单/中等/困难）
  - 关键字搜索
  - 显示题目基本信息、通过率、提交数

- **题目详情** (`/problem/:id`)
  - 题目描述
  - 输入输出说明
  - 样例数据
  - 提示信息

### 3. 代码提交

- **代码编辑器**
  - 多语言支持选择
  - 代码编辑区域
  - 一键提交

- **实时判题**
  - 提交后轮询判题结果
  - 显示判题状态（Pending, Running, Accepted, Wrong Answer 等）
  - 显示得分、运行时间、内存消耗
  - 显示通过率

### 4. 提交记录

- **提交列表** (`/submissions`)
  - 分页查询
  - 按题目 ID 筛选
  - 按用户 ID 筛选
  - 显示提交详情（状态、语言、得分、时间、内存）

## API 接口

所有接口使用统一的响应格式：

```typescript
interface ResponseResult<T> {
  code: number    // 200 表示成功
  msg: string     // 响应消息
  data: T         // 响应数据
}
```

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 题目接口

- `GET /api/client/problem/page` - 分页查询题目列表
- `GET /api/client/problem/{id}` - 获取题目详情

### 提交接口

- `POST /api/client/submission/client/submit` - 提交代码
- `GET /api/client/submission/page` - 分页查询提交记录
- `GET /api/client/submission/{id}` - 获取提交详情

### 语言接口

- `GET /api/client/language/list` - 获取所有可用语言
- `GET /api/client/language/{id}` - 获取语言详情

## 环境配置

### 开发环境

创建 `.env.development` 文件：

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

### 生产环境

创建 `.env.production` 文件：

```bash
VITE_API_BASE_URL=/api
```

## 使用说明

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（如果端口被占用会自动选择其他端口）

### 类型检查

```bash
npm run type-check
```

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 预览生产版本

```bash
npm run preview
```

## 核心特性说明

### JWT Token 管理

- Token 存储在 localStorage
- 每次请求自动添加 Bearer Token
- Token 过期自动检测和清除
- 从 JWT 中解析权限信息

### 请求拦截器

- 自动添加 Authorization 头
- Token 过期检测
- 统一错误处理

### 响应拦截器

- 统一响应格式处理
- 业务错误码处理
- HTTP 错误码处理
- 自动消息提示

### 提交轮询机制

使用 `useSubmissionPolling` composable 实现：

- 自动轮询判题结果
- 支持自定义轮询间隔和最大次数
- 检测到终态自动停止
- 组件卸载时自动清理

### 路由权限控制

- 全局路由守卫
- 自动登录状态检查
- 动态页面标题
- 未授权自动跳转

## 页面展示

### 登录页面

- 简洁优雅的登录界面
- 表单验证
- 加载状态提示

### 题目列表

- 卡片式布局
- 筛选和搜索
- 分页导航
- 难度标签（绿色/橙色/红色）

### 题目详情

- 详细的题目信息展示
- 代码编辑器
- 语言选择下拉框
- 提交按钮
- 判题结果对话框

### 提交记录

- 表格展示
- 状态标签（成功/失败/运行中）
- 详细的运行信息

## 开发建议

### 添加新页面

1. 在 `src/views/` 创建新的 Vue 组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `App.vue` 的导航菜单中添加链接（如需要）

### 添加新 API

1. 在 `src/types/api.ts` 定义类型
2. 在 `src/api/` 创建对应的 API 文件
3. 使用 `request` 函数发起请求

### 添加新的状态

1. 在 `src/stores/` 创建新的 store
2. 使用 Pinia 的 Composition API 风格

## 注意事项

1. **API Base URL**: 确保在环境变量中正确配置后端 API 地址
2. **Token 安全**: Token 存储在 localStorage，注意 XSS 攻击风险
3. **权限控制**: 前端权限控制仅用于 UI 展示，真正的权限校验在后端
4. **CORS**: 确保后端正确配置 CORS 允许跨域请求

## 待优化项

1. 添加代码编辑器语法高亮（集成 CodeMirror 或 Monaco Editor）
2. 添加暗黑模式支持
3. 优化移动端响应式布局
4. 添加更多的错误边界处理
5. 实现代码模板功能
6. 添加题目收藏功能
7. 实现用户排行榜

## 参考文档

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)

## 问题反馈

如有问题或建议，请在 GitHub Issues 中提出。
