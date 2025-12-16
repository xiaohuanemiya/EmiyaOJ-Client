# EmiyaOJ 用户端前端实现说明

本文档说明了基于设计文档实现的EmiyaOJ在线判题系统用户端前端。

## 实现概述

本实现基于两份设计文档：
- `oj-frontend-design.md` - 完整的前端架构设计
- `oj-frontend-quickstart.md` - 快速开始指南

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **构建工具**: Vite 5.x
- **编程语言**: TypeScript 5.x
- **UI组件库**: Element Plus 2.8.0
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.x
- **HTTP客户端**: Axios 1.7.0
- **代码编辑器**: Monaco Editor 0.50.0
- **Markdown渲染**: Markdown-it 14.1.0
- **代码高亮**: Highlight.js 11.10.0
- **样式**: SCSS

## 项目结构

```
src/
├── api/                    # API接口封装
│   ├── auth.ts            # 认证相关API
│   ├── problem.ts         # 题目相关API
│   ├── submission.ts      # 提交相关API
│   ├── language.ts        # 语言相关API
│   └── request.ts         # Axios封装
├── assets/                # 资源文件
├── components/            # 通用组件
│   ├── CodeEditor/        # 代码编辑器组件
│   ├── MarkdownViewer/    # Markdown渲染组件
│   └── StatusTag/         # 判题状态标签组件
├── layouts/               # 布局组件
│   └── DefaultLayout.vue  # 默认布局
├── router/                # 路由配置
│   └── index.ts          # 路由主文件
├── stores/                # Pinia状态管理
│   ├── auth.ts           # 认证状态
│   ├── problem.ts        # 题目状态
│   ├── submission.ts     # 提交状态
│   └── language.ts       # 语言状态
├── types/                 # TypeScript类型定义
│   ├── api.ts            # API响应类型
│   ├── problem.ts        # 题目类型
│   ├── submission.ts     # 提交类型
│   ├── language.ts       # 语言类型
│   └── user.ts           # 用户类型
├── utils/                 # 工具函数
│   ├── constants.ts      # 常量定义
│   ├── format.ts         # 格式化函数
│   └── storage.ts        # 本地存储封装
├── views/                 # 页面组件
│   ├── Home/             # 首页
│   ├── Login/            # 登录页
│   ├── ProblemList/      # 题目列表
│   ├── ProblemDetail/    # 题目详情
│   ├── SubmissionList/   # 提交列表
│   ├── SubmissionDetail/ # 提交详情
│   └── Profile/          # 个人中心
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

## 核心功能实现

### 1. 用户认证系统

**实现文件**:
- `stores/auth.ts` - 认证状态管理
- `api/auth.ts` - 认证API
- `views/Login/index.vue` - 登录页面
- `utils/storage.ts` - Token存储

**功能特性**:
- ✅ 用户登录
- ✅ 用户登出
- ✅ Token管理
- ✅ 路由守卫（自动跳转到登录页）
- ✅ 登录状态持久化

### 2. 题目管理模块

**实现文件**:
- `stores/problem.ts` - 题目状态管理
- `api/problem.ts` - 题目API
- `views/ProblemList/index.vue` - 题目列表
- `views/ProblemDetail/index.vue` - 题目详情

**功能特性**:
- ✅ 题目列表展示
- ✅ 分页功能
- ✅ 按难度筛选
- ✅ 关键词搜索
- ✅ 题目详情查看
- ✅ Markdown格式题目描述
- ✅ 示例输入输出展示

### 3. 代码编辑与提交

**实现文件**:
- `components/CodeEditor/index.vue` - 代码编辑器
- `stores/submission.ts` - 提交状态管理
- `api/submission.ts` - 提交API
- `stores/language.ts` - 编程语言管理

**功能特性**:
- ✅ Monaco Editor集成
- ✅ 语法高亮
- ✅ 多语言支持（Java, C++, Python等）
- ✅ 代码提交
- ✅ 实时代码编辑

### 4. 提交记录管理

**实现文件**:
- `views/SubmissionList/index.vue` - 提交列表
- `views/SubmissionDetail/index.vue` - 提交详情
- `components/StatusTag/index.vue` - 状态标签

**功能特性**:
- ✅ 提交记录列表
- ✅ 提交状态展示
- ✅ 提交详情查看
- ✅ 判题结果展示
- ✅ 代码查看（只读模式）

### 5. Markdown渲染

**实现文件**:
- `components/MarkdownViewer/index.vue` - Markdown查看器

**功能特性**:
- ✅ Markdown-it渲染
- ✅ 代码块语法高亮
- ✅ 样式美化

### 6. 响应式布局

**实现文件**:
- `layouts/DefaultLayout.vue` - 主布局

**功能特性**:
- ✅ 顶部导航栏
- ✅ 用户信息展示
- ✅ 下拉菜单（个人中心、退出登录）
- ✅ 页脚
- ✅ 响应式设计

## API接口配置

### 开发环境

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=EmiyaOJ
```

### 生产环境

```bash
# .env.production
VITE_API_BASE_URL=https://api.emiyaoj.com
VITE_APP_TITLE=EmiyaOJ
```

### 代理配置

开发环境下，Vite配置了API代理：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 路由配置

### 路由结构

- `/` - 首页（公开）
- `/login` - 登录页（公开）
- `/problems` - 题目列表（公开）
- `/problem/:id` - 题目详情（需要登录）
- `/submissions` - 提交记录（需要登录）
- `/submission/:id` - 提交详情（需要登录）
- `/profile` - 个人中心（需要登录）

### 路由守卫

实现了全局前置守卫，自动检查用户登录状态：
- 未登录访问需要认证的页面 → 跳转到登录页
- 已登录访问登录页 → 跳转到首页

## 状态管理

使用Pinia实现了4个Store：

1. **AuthStore** - 用户认证
   - 管理登录状态
   - 存储用户信息和Token
   - 提供登录、登出方法

2. **ProblemStore** - 题目管理
   - 存储题目列表和当前题目
   - 提供获取题目列表和详情的方法

3. **SubmissionStore** - 提交管理
   - 存储提交记录
   - 提供代码提交和查询方法

4. **LanguageStore** - 语言管理
   - 存储可用的编程语言列表

## 开发和构建

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 类型检查

```bash
npm run type-check
```

### 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录

### 预览构建

```bash
npm run preview
```

## 构建优化

实现了代码分割策略：

```typescript
manualChunks: {
  'vue-vendor': ['vue', 'vue-router', 'pinia'],
  'element-plus': ['element-plus'],
  'monaco-editor': ['monaco-editor']
}
```

这样可以将大型依赖分离，提高加载性能。

## 样式设计

- 使用SCSS进行样式编写
- 采用Element Plus的主题色系
- 响应式设计，支持不同屏幕尺寸
- 渐变背景（登录页）
- 卡片式布局

## 未来改进方向

1. **性能优化**
   - 实现虚拟滚动（题目列表）
   - 懒加载Monaco Editor
   - 图片压缩和CDN

2. **功能增强**
   - WebSocket实时判题状态更新
   - 代码模板功能
   - 题目收藏功能
   - 用户统计图表

3. **用户体验**
   - 暗色主题
   - 快捷键支持
   - 离线缓存

4. **安全性**
   - CSRF保护
   - XSS防护增强
   - 输入验证

## 测试结果

✅ TypeScript类型检查通过
✅ 生产构建成功（无错误）
✅ 所有核心功能已实现

## 相关文档

- [完整设计文档](./oj-frontend-design.md)
- [快速开始指南](./oj-frontend-quickstart.md)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 版本信息

- **版本**: 1.0.0
- **创建日期**: 2024-12-16
- **实现状态**: 完成 ✅

---

如有问题或建议，请查阅设计文档或联系开发团队。
