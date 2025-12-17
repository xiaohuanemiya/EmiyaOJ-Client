# ClientBlogController API 接口文档

> 博客管理模块前端接口文档
> 
> 控制器：`com.emiyaoj.service.controller.client.ClientBlogController`
> 
> 文档版本：v1.0
> 
> 最后更新：2025-12-17

## 目录

- [1. 基础说明](#1-基础说明)
- [2. 博客管理接口](#2-博客管理接口)
- [3. 评论管理接口](#3-评论管理接口)
- [4. 博客收藏接口](#4-博客收藏接口)
- [5. 用户博客信息接口](#5-用户博客信息接口)
- [6. 标签管理接口](#6-标签管理接口)
- [7. 数据结构说明](#7-数据结构说明)

---

## 1. 基础说明

### 1.1 接口基础地址

```
开发环境: http://localhost:8080/client/blog
生产环境: https://api.emiyaoj.com/client/blog
```

### 1.2 统一响应格式

所有接口均返回统一的 JSON 格式：

```typescript
interface ResponseResult<T> {
  code: number;      // 状态码：200-成功，其他-失败
  msg: string;       // 响应消息
  data: T;           // 响应数据
}
```

**成功响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { ... }
}
```

**失败响应示例：**
```json
{
  "code": 500,
  "msg": "添加失败",
  "data": null
}
```

### 1.3 认证说明

所有接口均需要在请求头中携带 JWT Token：

```
Authorization: Bearer {token}
```

### 1.4 权限说明

本模块使用的权限标识：

| 权限标识 | 说明 |
|---------|------|
| `BLOG.LIST` | 查看博客列表 |
| `BLOG.ADD` | 发布博客 |
| `BLOG.EDIT` | 编辑博客 |
| `BLOG.DELETE` | 删除博客 |
| `BLOG.STAR` | 收藏/取消收藏博客 |
| `COMMENT.LIST` | 查看评论 |
| `COMMENT.ADD` | 发表评论 |
| `COMMENT.DELETE` | 删除评论 |
| `USER.LIST` | 查看用户信息 |

---

## 2. 博客管理接口

### 2.1 查询所有博客

**接口描述：** 查询所有博客（不分页，建议在管理端使用）

**请求方式：** `GET`

**请求路径：** `/client/blog`

**权限要求：** `BLOG.LIST`

**请求参数：** 无

**响应数据：**

```typescript
ResponseResult<BlogVO[]>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "userId": 100,
      "username": "张三",
      "nickname": "小张",
      "title": "我的第一篇博客",
      "content": "这是博客内容...",
      "tags": ["Java", "Spring"],
      "commentCount": 10,
      "starCount": 5,
      "isStarred": false,
      "createTime": "2025-12-01 10:30:00",
      "updateTime": "2025-12-01 10:30:00"
    }
  ]
}
```

---

### 2.2 发布博客

**接口描述：** 发布新博客

**请求方式：** `POST`

**请求路径：** `/client/blog`

**权限要求：** `BLOG.ADD`

**请求体：**

```typescript
interface BlogSaveDTO {
  userId?: number;      // 用户ID（可选，默认使用当前登录用户）
  title: string;        // 博客标题
  content: string;      // 博客内容
  tagIds?: number[];    // 标签ID数组（可选）
}
```

**请求示例：**

```json
{
  "title": "Spring Boot 学习笔记",
  "content": "这是一篇关于 Spring Boot 的学习笔记...",
  "tagIds": [1, 2, 3]
}
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

### 2.3 分页条件查询博客

**接口描述：** 按条件分页查询博客（推荐使用）

**请求方式：** `POST`

**请求路径：** `/client/blog/query`

**权限要求：** `BLOG.LIST`

**请求体：**

```typescript
interface BlogQueryDTO {
  userId?: number;      // 用户ID（可选，默认使用当前登录用户）
  title?: string;       // 博客标题关键词（可选，模糊查询）
  tagIds?: number[];    // 标签ID数组（可选）
  startTime?: string;   // 开始时间（可选，格式：yyyy-MM-dd HH:mm:ss）
  endTime?: string;     // 结束时间（可选，格式：yyyy-MM-dd HH:mm:ss）
  pageNum: number;      // 页码（从1开始）
  pageSize: number;     // 每页数量
}
```

**请求示例：**

```json
{
  "title": "Spring",
  "tagIds": [1, 2],
  "pageNum": 1,
  "pageSize": 10
}
```

**响应数据：**

```typescript
ResponseResult<PageVO<BlogVO>>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 50,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 5,
    "list": [
      {
        "id": 1,
        "userId": 100,
        "username": "张三",
        "nickname": "小张",
        "title": "Spring Boot 学习笔记",
        "content": "这是博客内容...",
        "tags": ["Java", "Spring"],
        "commentCount": 10,
        "starCount": 5,
        "isStarred": false,
        "createTime": "2025-12-01 10:30:00",
        "updateTime": "2025-12-01 10:30:00"
      }
    ]
  }
}
```

---

### 2.4 获取指定博客信息

**接口描述：** 获取指定ID的博客详情（点击进入博客时调用）

**请求方式：** `GET`

**请求路径：** `/client/blog/{bid}`

**权限要求：** `BLOG.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求示例：**

```
GET /client/blog/1
```

**响应数据：**

```typescript
ResponseResult<BlogVO>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "userId": 100,
    "username": "张三",
    "nickname": "小张",
    "title": "Spring Boot 学习笔记",
    "content": "这是博客的完整内容...",
    "tags": ["Java", "Spring"],
    "commentCount": 10,
    "starCount": 5,
    "isStarred": false,
    "createTime": "2025-12-01 10:30:00",
    "updateTime": "2025-12-01 10:30:00"
  }
}
```

**失败响应示例：**

```json
{
  "code": 404,
  "msg": "未找到该博客",
  "data": null
}
```

---

### 2.5 删除博客

**接口描述：** 逻辑删除指定博客（仅对管理员和博客创建者开放）

**请求方式：** `DELETE`

**请求路径：** `/client/blog/{bid}`

**权限要求：** `BLOG.DELETE`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求示例：**

```
DELETE /client/blog/1
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

**失败响应示例：**

```json
{
  "code": 500,
  "msg": "删除失败",
  "data": null
}
```

---

### 2.6 编辑博客

**接口描述：** 编辑指定博客的信息（仅对管理员和博客创建者开放）

**请求方式：** `PUT`

**请求路径：** `/client/blog/{bid}`

**权限要求：** `BLOG.EDIT`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求体：**

```typescript
interface BlogEditDTO {
  userId?: number;      // 用户ID（可选，默认使用当前登录用户）
  title?: string;       // 博客标题（可选，为空时不修改）
  content?: string;     // 博客内容（可选，为空时不修改）
  tagIds?: number[];    // 标签ID数组（可选）
}
```

**请求示例：**

```json
{
  "title": "Spring Boot 学习笔记（修订版）",
  "content": "这是修改后的博客内容...",
  "tagIds": [1, 2, 4]
}
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

## 3. 评论管理接口

### 3.1 分页查询博客评论

**接口描述：** 分页查询指定博客的评论列表

**请求方式：** `POST`

**请求路径：** `/client/blog/{bid}/comments/query`

**权限要求：** `COMMENT.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求体：**

```typescript
interface PageDTO {
  pageNum: number;      // 页码（从1开始）
  pageSize: number;     // 每页数量
}
```

**请求示例：**

```json
{
  "pageNum": 1,
  "pageSize": 20
}
```

**响应数据：**

```typescript
ResponseResult<PageVO<CommentVO>>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 100,
    "pageNum": 1,
    "pageSize": 20,
    "pages": 5,
    "list": [
      {
        "id": 1,
        "blogId": 1,
        "userId": 200,
        "username": "李四",
        "nickname": "小李",
        "content": "写得不错！",
        "createTime": "2025-12-01 11:00:00"
      }
    ]
  }
}
```

**失败响应示例：**

```json
{
  "code": 404,
  "msg": "未找到该博客",
  "data": null
}
```

---

### 3.2 发表评论

**接口描述：** 对指定博客发表评论

**请求方式：** `POST`

**请求路径：** `/client/blog/{bid}/comments`

**权限要求：** `COMMENT.ADD`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求体：**

```typescript
interface BlogCommentSaveDTO {
  content: string;      // 评论内容
  parentId?: number;    // 父评论ID（可选，用于回复评论）
}
```

**请求示例：**

```json
{
  "content": "这篇博客写得很好！",
  "parentId": null
}
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

### 3.3 条件查询评论

**接口描述：** 按条件查询评论（管理员使用）

**请求方式：** `POST`

**请求路径：** `/client/blog/comments/query`

**权限要求：** `COMMENT.LIST`

**请求体：**

```typescript
interface CommentQueryDTO {
  blogId?: number;      // 博客ID（可选）
  userId?: number;      // 用户ID（可选）
  content?: string;     // 评论内容关键词（可选，模糊查询）
  startTime?: string;   // 开始时间（可选）
  endTime?: string;     // 结束时间（可选）
}
```

**请求示例：**

```json
{
  "blogId": 1,
  "content": "不错"
}
```

**响应数据：**

```typescript
ResponseResult<CommentVO[]>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "blogId": 1,
      "userId": 200,
      "username": "李四",
      "nickname": "小李",
      "content": "写得不错！",
      "createTime": "2025-12-01 11:00:00"
    }
  ]
}
```

---

### 3.4 获取指定评论

**接口描述：** 获取指定ID的评论详情

**请求方式：** `GET`

**请求路径：** `/client/blog/comments/{cid}`

**权限要求：** `COMMENT.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| cid | Long | 是 | 评论ID |

**请求示例：**

```
GET /client/blog/comments/1
```

**响应数据：**

```typescript
ResponseResult<CommentVO>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "blogId": 1,
    "userId": 200,
    "username": "李四",
    "nickname": "小李",
    "content": "写得不错！",
    "createTime": "2025-12-01 11:00:00"
  }
}
```

**失败响应示例：**

```json
{
  "code": 404,
  "msg": "未找到该评论",
  "data": null
}
```

---

### 3.5 删除评论

**接口描述：** 删除指定评论（仅对管理员和评论创建者开放）

**请求方式：** `DELETE`

**请求路径：** `/client/blog/comments/{cid}`

**权限要求：** `COMMENT.DELETE`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| cid | Long | 是 | 评论ID |

**请求示例：**

```
DELETE /client/blog/comments/1
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

**失败响应示例：**

```json
{
  "code": 404,
  "msg": "未找到该评论",
  "data": null
}
```

或

```json
{
  "code": 401,
  "msg": "权限不足",
  "data": null
}
```

---

## 4. 博客收藏接口

### 4.1 收藏博客

**接口描述：** 当前用户收藏指定博客

**请求方式：** `POST`

**请求路径：** `/client/blog/{bid}/star`

**权限要求：** `BLOG.STAR`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求示例：**

```
POST /client/blog/1/star
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

### 4.2 取消收藏博客

**接口描述：** 当前用户取消收藏指定博客

**请求方式：** `DELETE`

**请求路径：** `/client/blog/{bid}/star`

**权限要求：** `BLOG.STAR`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bid | Long | 是 | 博客ID |

**请求示例：**

```
DELETE /client/blog/1/star
```

**响应数据：**

```typescript
ResponseResult<void>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

## 5. 用户博客信息接口

### 5.1 查询用户博客信息

**接口描述：** 查询指定用户在博客模块的信息（发帖数、收藏数等）

**请求方式：** `GET`

**请求路径：** `/client/blog/user/{uid}`

**权限要求：** `USER.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | Long | 是 | 用户ID |

**请求示例：**

```
GET /client/blog/user/100
```

**响应数据：**

```typescript
ResponseResult<UserBlogVO>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "userId": 100,
    "username": "张三",
    "nickname": "小张",
    "blogCount": 25,
    "starCount": 15,
    "createTime": "2025-01-01 10:00:00"
  }
}
```

**失败响应示例：**

```json
{
  "code": 404,
  "msg": "未找到该用户",
  "data": null
}
```

---

### 5.2 分页查询用户发表的博客

**接口描述：** 分页查询指定用户发表的博客

**请求方式：** `POST`

**请求路径：** `/client/blog/user/{uid}/blogs/query`

**权限要求：** `BLOG.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | Long | 是 | 用户ID |

**请求体：**

```typescript
interface UserBlogBlogsQueryDTO {
  title?: string;       // 博客标题关键词（可选）
  tagIds?: number[];    // 标签ID数组（可选）
  startTime?: string;   // 开始时间（可选）
  endTime?: string;     // 结束时间（可选）
  pageNum: number;      // 页码（从1开始）
  pageSize: number;     // 每页数量
}
```

**请求示例：**

```json
{
  "title": "Spring",
  "pageNum": 1,
  "pageSize": 10
}
```

**响应数据：**

```typescript
ResponseResult<PageVO<BlogVO>>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 25,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 3,
    "list": [
      {
        "id": 1,
        "userId": 100,
        "username": "张三",
        "nickname": "小张",
        "title": "Spring Boot 学习笔记",
        "content": "这是博客内容...",
        "tags": ["Java", "Spring"],
        "commentCount": 10,
        "starCount": 5,
        "isStarred": false,
        "createTime": "2025-12-01 10:30:00",
        "updateTime": "2025-12-01 10:30:00"
      }
    ]
  }
}
```

---

### 5.3 分页查询用户收藏的博客

**接口描述：** 分页查询指定用户收藏的博客

**请求方式：** `POST`

**请求路径：** `/client/blog/user/{uid}/stars/query`

**权限要求：** `BLOG.LIST`

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | Long | 是 | 用户ID |

**请求体：**

```typescript
interface UserBlogStarsQueryDTO {
  title?: string;       // 博客标题关键词（可选）
  tagIds?: number[];    // 标签ID数组（可选）
  startTime?: string;   // 开始时间（可选）
  endTime?: string;     // 结束时间（可选）
  pageNum: number;      // 页码（从1开始）
  pageSize: number;     // 每页数量
}
```

**请求示例：**

```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

**响应数据：**

```typescript
ResponseResult<PageVO<BlogVO>>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 15,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 2,
    "list": [
      {
        "id": 2,
        "userId": 200,
        "username": "李四",
        "nickname": "小李",
        "title": "Java 并发编程详解",
        "content": "这是博客内容...",
        "tags": ["Java", "并发"],
        "commentCount": 20,
        "starCount": 30,
        "isStarred": true,
        "createTime": "2025-11-15 14:20:00",
        "updateTime": "2025-11-15 14:20:00"
      }
    ]
  }
}
```

---

## 6. 标签管理接口

### 6.1 查询所有标签

**接口描述：** 查询所有博客标签（由管理员维护，不分页）

**请求方式：** `GET`

**请求路径：** `/client/blog/tags`

**权限要求：** `BLOG.LIST`

**请求参数：** 无

**响应数据：**

```typescript
ResponseResult<BlogTagVO[]>
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "Java",
      "color": "#FF5722",
      "blogCount": 150
    },
    {
      "id": 2,
      "name": "Spring",
      "color": "#4CAF50",
      "blogCount": 120
    },
    {
      "id": 3,
      "name": "数据库",
      "color": "#2196F3",
      "blogCount": 80
    }
  ]
}
```

---

## 7. 数据结构说明

### 7.1 BlogVO（博客视图对象）

```typescript
interface BlogVO {
  id: number;              // 博客ID
  userId: number;          // 作者用户ID
  username: string;        // 作者用户名
  nickname: string;        // 作者昵称
  title: string;           // 博客标题
  content: string;         // 博客内容
  tags: string[];          // 标签名称数组
  commentCount: number;    // 评论数
  starCount: number;       // 收藏数
  isStarred: boolean;      // 当前用户是否已收藏
  createTime: string;      // 创建时间
  updateTime: string;      // 更新时间
}
```

### 7.2 CommentVO（评论视图对象）

```typescript
interface CommentVO {
  id: number;              // 评论ID
  blogId: number;          // 博客ID
  userId: number;          // 评论用户ID
  username: string;        // 评论用户名
  nickname: string;        // 评论用户昵称
  content: string;         // 评论内容
  parentId?: number;       // 父评论ID（可选）
  createTime: string;      // 创建时间
}
```

### 7.3 UserBlogVO（用户博客信息视图对象）

```typescript
interface UserBlogVO {
  userId: number;          // 用户ID
  username: string;        // 用户名
  nickname: string;        // 昵称
  blogCount: number;       // 发布博客数
  starCount: number;       // 收藏博客数
  createTime: string;      // 创建时间
}
```

### 7.4 BlogTagVO（博客标签视图对象）

```typescript
interface BlogTagVO {
  id: number;              // 标签ID
  name: string;            // 标签名称
  color: string;           // 标签颜色（十六进制）
  blogCount: number;       // 使用该标签的博客数
}
```

### 7.5 PageVO（分页视图对象）

```typescript
interface PageVO<T> {
  total: number;           // 总记录数
  pageNum: number;         // 当前页码
  pageSize: number;        // 每页数量
  pages: number;           // 总页数
  list: T[];               // 当前页数据列表
}
```

---

## 附录

### A. 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/权限不足 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

### B. 常见错误场景

#### B.1 权限不足

**场景：** 用户没有对应的操作权限

**返回示例：**
```json
{
  "code": 401,
  "msg": "权限不足",
  "data": null
}
```

#### B.2 资源未找到

**场景：** 请求的博客、评论或用户不存在

**返回示例：**
```json
{
  "code": 404,
  "msg": "未找到该博客",
  "data": null
}
```

#### B.3 操作失败

**场景：** 数据库操作失败或业务逻辑校验失败

**返回示例：**
```json
{
  "code": 500,
  "msg": "添加失败",
  "data": null
}
```

### C. 前端调用示例（Vue 3 + Axios）

#### C.1 发布博客

```typescript
import axios from 'axios';

const publishBlog = async (blogData: {
  title: string;
  content: string;
  tagIds?: number[];
}) => {
  try {
    const response = await axios.post('/client/blog', blogData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.code === 200) {
      console.log('博客发布成功');
    } else {
      console.error('博客发布失败：', response.data.msg);
    }
  } catch (error) {
    console.error('请求失败：', error);
  }
};
```

#### C.2 分页查询博客

```typescript
const queryBlogs = async (queryParams: {
  title?: string;
  tagIds?: number[];
  pageNum: number;
  pageSize: number;
}) => {
  try {
    const response = await axios.post('/client/blog/query', queryParams, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.code === 200) {
      const pageData = response.data.data;
      console.log('查询结果：', pageData.list);
      console.log('总数：', pageData.total);
    }
  } catch (error) {
    console.error('请求失败：', error);
  }
};
```

#### C.3 收藏博客

```typescript
const starBlog = async (blogId: number) => {
  try {
    const response = await axios.post(`/client/blog/${blogId}/star`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.code === 200) {
      console.log('收藏成功');
    } else {
      console.error('收藏失败：', response.data.msg);
    }
  } catch (error) {
    console.error('请求失败：', error);
  }
};
```

---

## 更新日志

### v1.0 (2025-12-17)

- 初始版本发布
- 包含所有博客管理相关接口
- 包含评论、收藏、用户、标签管理接口
- 添加详细的数据结构说明和前端调用示例

