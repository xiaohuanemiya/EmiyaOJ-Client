# 博客系统 API 文档

本文档提供 EmiyaOJ 博客系统的前端 API 接口详细说明。博客系统包含博客文章管理、评论系统和标签系统。

## 基础 URL

所有 API 的基础 URL 都是相对于服务器的根路径。

## 通用响应格式

所有 API 请求成功后都会返回一个统一格式的 JSON 对象：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // ... specific data for each endpoint
  }
}
```

- `code`: HTTP 状态码, `200` 表示成功。
- `message`: 响应的消息。
- `data`: 请求返回的具体数据。

---

## 博客文章管理 (Blog)

基础路径: `/client/blog`

### 1. 分页查询博客文章

- **功能**: 根据条件分页获取博客文章列表。
- **URL**: `/client/blog/page`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。
- `keyword` (String, 可选): 搜索关键词，用于匹配博客标题或内容。
- `tagId` (Long, 可选): 标签ID，用于筛选特定标签的博客。
- `userId` (Long, 可选): 用户ID，用于筛选特定用户的博客。

**示例 URL**: `/client/blog/page?current=1&size=10&keyword=算法`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "title": "如何学习算法",
        "summary": "算法学习是编程的基础...",
        "userId": 1,
        "username": "admin",
        "viewCount": 100,
        "likeCount": 20,
        "commentCount": 5,
        "tags": [
          { "id": 1, "name": "算法" },
          { "id": 2, "name": "学习" }
        ],
        "createTime": "2025-12-02T10:00:00",
        "updateTime": "2025-12-02T10:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

- `records`: 博客文章对象数组。
  - `summary`: 博客摘要。
  - `viewCount`: 浏览次数。
  - `likeCount`: 点赞数。
  - `commentCount`: 评论数。
  - `tags`: 关联的标签列表。
- `total`: 总记录数。
- `size`: 每页大小。
- `current`: 当前页码。
- `pages`: 总页数。

### 2. 获取博客详情

- **功能**: 获取单篇博客文章的详细信息，包含完整内容。
- **URL**: `/client/blog/{id}`
- **方法**: `GET`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 博客文章的唯一标识符。

**示例 URL**: `/client/blog/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "title": "如何学习算法",
    "content": "# 算法学习指南\n\n算法学习是编程的基础...",
    "userId": 1,
    "username": "admin",
    "viewCount": 100,
    "likeCount": 20,
    "commentCount": 5,
    "tags": [
      { "id": 1, "name": "算法" },
      { "id": 2, "name": "学习" }
    ],
    "createTime": "2025-12-02T10:00:00",
    "updateTime": "2025-12-02T10:00:00"
  }
}
```

- `content`: 博客的完整内容，支持 Markdown 格式。

### 3. 创建博客文章

- **功能**: 创建一篇新的博客文章。
- **URL**: `/client/blog/create`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求体 (Request Body)

```json
{
  "title": "如何学习算法",
  "content": "# 算法学习指南\n\n算法学习是编程的基础...",
  "tagIds": [1, 2]
}
```

- `title` (String, **必选**): 博客标题。
- `content` (String, **必选**): 博客内容，支持 Markdown。
- `tagIds` (Array<Long>, 可选): 关联的标签ID列表。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 1
}
```

- `data`: 新创建博客的ID。

### 4. 更新博客文章

- **功能**: 更新已有的博客文章。
- **URL**: `/client/blog/update`
- **方法**: `PUT`
- **Content-Type**: `application/json`

#### 请求体 (Request Body)

```json
{
  "id": 1,
  "title": "如何学习算法（更新版）",
  "content": "# 算法学习指南（更新）\n\n算法学习是编程的基础...",
  "tagIds": [1, 2, 3]
}
```

- `id` (Long, **必选**): 博客文章的唯一标识符。
- `title` (String, 可选): 更新的标题。
- `content` (String, 可选): 更新的内容。
- `tagIds` (Array<Long>, 可选): 更新的标签ID列表。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 5. 删除博客文章

- **功能**: 删除指定的博客文章。
- **URL**: `/client/blog/{id}`
- **方法**: `DELETE`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 博客文章的唯一标识符。

**示例 URL**: `/client/blog/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 6. 点赞/取消点赞博客

- **功能**: 对博客文章进行点赞或取消点赞。
- **URL**: `/client/blog/{id}/like`
- **方法**: `POST`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 博客文章的唯一标识符。

**示例 URL**: `/client/blog/1/like`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "liked": true,
    "likeCount": 21
  }
}
```

- `liked`: 当前点赞状态，`true` 表示已点赞，`false` 表示已取消点赞。
- `likeCount`: 更新后的点赞总数。

---

## 博客评论管理 (Blog Comment)

基础路径: `/client/blog/comment`

### 1. 分页查询博客评论

- **功能**: 获取指定博客文章的评论列表，支持分页和层级结构。
- **URL**: `/client/blog/comment/page`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `blogId` (Long, **必选**): 博客文章ID。
- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。
- `parentId` (Long, 可选): 父评论ID，用于获取回复评论。不传或传 0 表示获取顶级评论。

**示例 URL**: `/client/blog/comment/page?blogId=1&current=1&size=10&parentId=0`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "blogId": 1,
        "userId": 2,
        "username": "user123",
        "content": "写得真好！",
        "parentId": 0,
        "replyToUserId": null,
        "replyToUsername": null,
        "likeCount": 5,
        "replyCount": 2,
        "createTime": "2025-12-02T11:00:00"
      },
      {
        "id": 2,
        "blogId": 1,
        "userId": 3,
        "username": "user456",
        "content": "学到了很多，感谢分享！",
        "parentId": 0,
        "replyToUserId": null,
        "replyToUsername": null,
        "likeCount": 3,
        "replyCount": 0,
        "createTime": "2025-12-02T12:00:00"
      }
    ],
    "total": 2,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

- `parentId`: 父评论ID，0 表示顶级评论。
- `replyToUserId`: 回复的目标用户ID，用于 @ 功能。
- `replyToUsername`: 回复的目标用户名。
- `replyCount`: 该评论的回复数量。

### 2. 获取评论详情

- **功能**: 获取单条评论的详细信息。
- **URL**: `/client/blog/comment/{id}`
- **方法**: `GET`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 评论的唯一标识符。

**示例 URL**: `/client/blog/comment/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "blogId": 1,
    "userId": 2,
    "username": "user123",
    "content": "写得真好！",
    "parentId": 0,
    "replyToUserId": null,
    "replyToUsername": null,
    "likeCount": 5,
    "replyCount": 2,
    "createTime": "2025-12-02T11:00:00"
  }
}
```

### 3. 创建评论

- **功能**: 为博客文章创建评论或回复其他评论。
- **URL**: `/client/blog/comment/create`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求体 (Request Body)

```json
{
  "blogId": 1,
  "content": "写得真好！",
  "parentId": 0,
  "replyToUserId": null
}
```

- `blogId` (Long, **必选**): 博客文章ID。
- `content` (String, **必选**): 评论内容。
- `parentId` (Long, 可选): 父评论ID，0 或不传表示顶级评论。
- `replyToUserId` (Long, 可选): 回复的目标用户ID。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 1
}
```

- `data`: 新创建评论的ID。

### 4. 删除评论

- **功能**: 删除指定的评论。
- **URL**: `/client/blog/comment/{id}`
- **方法**: `DELETE`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 评论的唯一标识符。

**示例 URL**: `/client/blog/comment/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 5. 点赞/取消点赞评论

- **功能**: 对评论进行点赞或取消点赞。
- **URL**: `/client/blog/comment/{id}/like`
- **方法**: `POST`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 评论的唯一标识符。

**示例 URL**: `/client/blog/comment/1/like`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "liked": true,
    "likeCount": 6
  }
}
```

- `liked`: 当前点赞状态。
- `likeCount`: 更新后的点赞总数。

---

## 博客标签管理 (Blog Tag)

基础路径: `/client/blog/tag`

### 1. 获取所有标签

- **功能**: 获取系统中所有可用的博客标签列表。
- **URL**: `/client/blog/tag/list`
- **方法**: `GET`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "算法",
      "description": "算法相关的博客",
      "blogCount": 10,
      "createTime": "2025-12-01T00:00:00"
    },
    {
      "id": 2,
      "name": "学习",
      "description": "学习经验分享",
      "blogCount": 15,
      "createTime": "2025-12-01T00:00:00"
    }
  ]
}
```

- `blogCount`: 使用该标签的博客数量。

### 2. 获取标签详情

- **功能**: 获取特定标签的详细信息。
- **URL**: `/client/blog/tag/{id}`
- **方法**: `GET`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 标签的唯一标识符。

**示例 URL**: `/client/blog/tag/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "算法",
    "description": "算法相关的博客",
    "blogCount": 10,
    "createTime": "2025-12-01T00:00:00"
  }
}
```

### 3. 创建标签

- **功能**: 创建一个新的博客标签。
- **URL**: `/client/blog/tag/create`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求体 (Request Body)

```json
{
  "name": "数据结构",
  "description": "数据结构相关的博客"
}
```

- `name` (String, **必选**): 标签名称。
- `description` (String, 可选): 标签描述。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 3
}
```

- `data`: 新创建标签的ID。

### 4. 更新标签

- **功能**: 更新已有的标签信息。
- **URL**: `/client/blog/tag/update`
- **方法**: `PUT`
- **Content-Type**: `application/json`

#### 请求体 (Request Body)

```json
{
  "id": 1,
  "name": "算法与数据结构",
  "description": "算法和数据结构相关的博客"
}
```

- `id` (Long, **必选**): 标签的唯一标识符。
- `name` (String, 可选): 更新的标签名称。
- `description` (String, 可选): 更新的标签描述。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 5. 删除标签

- **功能**: 删除指定的标签。
- **URL**: `/client/blog/tag/{id}`
- **方法**: `DELETE`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 标签的唯一标识符。

**示例 URL**: `/client/blog/tag/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 6. 分页查询标签

- **功能**: 根据条件分页获取标签列表。
- **URL**: `/client/blog/tag/page`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。
- `keyword` (String, 可选): 搜索关键词，用于匹配标签名称或描述。

**示例 URL**: `/client/blog/tag/page?current=1&size=10&keyword=算法`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "name": "算法",
        "description": "算法相关的博客",
        "blogCount": 10,
        "createTime": "2025-12-01T00:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

---

## 错误响应格式

当请求失败时，API 会返回错误信息：

```json
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权，需要登录
- `403`: 禁止访问，权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 注意事项

1. 所有创建、更新、删除操作都需要用户登录认证。
2. 博客文章的内容支持 Markdown 格式。
3. 评论支持两级结构：顶级评论和回复评论。
4. 标签可以被多个博客文章关联使用。
5. 点赞操作是幂等的，重复点赞会自动切换为取消点赞。
6. 删除博客文章会级联删除相关的评论。
7. 所有时间字段都使用 ISO 8601 格式（例如：`2025-12-02T10:00:00`）。
