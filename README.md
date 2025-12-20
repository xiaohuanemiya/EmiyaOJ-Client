# EmiyaOJ Blog System Client

EmiyaOJ 博客系统的客户端实现，提供完整的博客、评论和标签管理 API。

## 功能特性

- **博客文章管理**: 支持创建、查询、更新、删除博客文章
- **评论系统**: 支持两级评论结构（顶级评论和回复）
- **标签系统**: 支持标签的 CRUD 操作和关联查询
- **点赞功能**: 支持对博客和评论的点赞/取消点赞
- **分页查询**: 所有列表接口都支持分页

## 安装

```bash
# 如果作为 npm 包使用
npm install emiyaoj-blog-client
```

## 使用方法

### 基础用法

```typescript
import BlogSystem from './src';

// 或者分别导入
import { blogApi, commentApi, tagApi } from './src';

// 查询博客列表
const response = await blogApi.page({
  current: 1,
  size: 10,
  keyword: '算法'
});

// 获取博客详情
const blog = await blogApi.getById(1);

// 创建博客
const newBlogId = await blogApi.create({
  title: '我的第一篇博客',
  content: '# Hello World',
  tagIds: [1, 2]
});
```

### 博客 API

```typescript
import { blogApi } from './src';

// 分页查询博客
await blogApi.page({
  current: 1,
  size: 10,
  keyword: '算法',  // 可选
  tagId: 1,         // 可选
  userId: 1         // 可选
});

// 获取博客详情
await blogApi.getById(1);

// 创建博客
await blogApi.create({
  title: '标题',
  content: '内容',
  tagIds: [1, 2]  // 可选
});

// 更新博客
await blogApi.update({
  id: 1,
  title: '新标题',  // 可选
  content: '新内容', // 可选
  tagIds: [1, 3]   // 可选
});

// 删除博客
await blogApi.delete(1);

// 点赞/取消点赞
await blogApi.like(1);
```

### 评论 API

```typescript
import { commentApi } from './src';

// 分页查询评论
await commentApi.page({
  blogId: 1,
  current: 1,
  size: 10,
  parentId: 0  // 0 表示获取顶级评论，可选
});

// 获取评论详情
await commentApi.getById(1);

// 创建评论（顶级评论）
await commentApi.create({
  blogId: 1,
  content: '评论内容',
  parentId: 0  // 可选，0 表示顶级评论
});

// 创建回复评论
await commentApi.create({
  blogId: 1,
  content: '回复内容',
  parentId: 1,        // 父评论ID
  replyToUserId: 2    // 回复的用户ID，可选
});

// 删除评论
await commentApi.delete(1);

// 点赞/取消点赞评论
await commentApi.like(1);
```

### 标签 API

```typescript
import { tagApi } from './src';

// 获取所有标签
await tagApi.list();

// 分页查询标签
await tagApi.page({
  current: 1,
  size: 10,
  keyword: '算法'  // 可选
});

// 获取标签详情
await tagApi.getById(1);

// 创建标签
await tagApi.create({
  name: '数据结构',
  description: '数据结构相关'  // 可选
});

// 更新标签
await tagApi.update({
  id: 1,
  name: '新名称',        // 可选
  description: '新描述'  // 可选
});

// 删除标签
await tagApi.delete(1);
```

### 类型定义

```typescript
import type {
  BlogPost,
  BlogDetail,
  BlogComment,
  BlogTag,
  CreateBlogRequest,
  UpdateBlogRequest,
  CreateCommentRequest,
  CreateTagRequest,
  UpdateTagRequest,
  ApiResponse,
  PageData
} from './src';

// 使用类型
const blog: BlogPost = {
  id: 1,
  title: '标题',
  summary: '摘要',
  userId: 1,
  username: 'admin',
  viewCount: 100,
  likeCount: 20,
  commentCount: 5,
  tags: [],
  createTime: '2025-12-02T10:00:00',
  updateTime: '2025-12-02T10:00:00'
};
```

### 自定义 HTTP 客户端

```typescript
import { HttpClient } from './src';

// 创建自定义配置的 HTTP 客户端
const customClient = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  }
});

// 使用自定义客户端发送请求
const response = await customClient.get('/api/blogs');
```

## API 响应格式

所有 API 都返回统一的响应格式：

```typescript
interface ApiResponse<T> {
  code: number;      // HTTP 状态码
  message: string;   // 响应消息
  data: T;          // 响应数据
}
```

分页接口返回：

```typescript
interface PageData<T> {
  records: T[];     // 记录列表
  total: number;    // 总记录数
  size: number;     // 每页大小
  current: number;  // 当前页码
  pages: number;    // 总页数
}
```

## 错误处理

```typescript
try {
  const response = await blogApi.getById(1);
  console.log(response.data);
} catch (error) {
  console.error('请求失败:', error);
  // error 包含 code, message, data 字段
}
```

## 注意事项

1. 所有创建、更新、删除操作需要用户登录认证
2. 博客内容支持 Markdown 格式
3. 评论支持两级结构：顶级评论和回复评论
4. 标签可以被多个博客关联使用
5. 点赞操作是幂等的，重复点赞会自动切换状态
6. 删除博客会级联删除相关评论
7. 所有时间字段使用 ISO 8601 格式

## 完整 API 文档

详细的 API 文档请参考：
- [博客系统 API 文档](./doc/blog-api-documentation.md)
- [前端 API 文档](./oj-frontend-api-documentation.md)

## 项目结构

```
EmiyaOJ-Client/
├── doc/
│   └── blog-api-documentation.md    # 博客系统 API 文档
├── src/
│   ├── api/
│   │   ├── blog.ts                  # 博客 API
│   │   ├── comment.ts               # 评论 API
│   │   ├── tag.ts                   # 标签 API
│   │   ├── http.ts                  # HTTP 客户端
│   │   └── index.ts                 # API 入口
│   ├── types/
│   │   ├── blog.ts                  # 类型定义
│   │   └── index.ts                 # 类型入口
│   └── index.ts                     # 主入口
├── oj-frontend-api-documentation.md # OJ 前端 API 文档
└── README.md                        # 本文件
```

## License

MIT
