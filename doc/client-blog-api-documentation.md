# 博客 API 文档

本文档旨在为前端开发人员提供与 EmiyaOJ 博客系统后端服务集成的详细 API 指南。

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

## 博客文章管理 (Blog Post)

基础路径: `/client/blog`

### 1. 分页查询博客文章

- **功能**: 根据条件分页获取博客文章列表。
- **URL**: `/client/blog/page`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。
- `categoryId` (Long, 可选): 分类ID，用于筛选特定分类的博客。
- `tagId` (Long, 可选): 标签ID，用于筛选特定标签的博客。
- `userId` (Long, 可选): 用户ID，用于筛选特定用户发布的博客。
- `keyword` (String, 可选): 搜索关键词，用于匹配博客标题或内容。
- `status` (Integer, 可选): 博客状态 (例如: 0-草稿, 1-已发布, 2-已隐藏)。

**示例 URL**: `/client/blog/page?current=1&size=10&categoryId=1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "title": "算法学习心得",
        "summary": "分享我的算法学习经验...",
        "coverImage": "https://example.com/images/cover.jpg",
        "authorId": 1,
        "authorName": "admin",
        "authorAvatar": "https://example.com/avatar/admin.jpg",
        "categoryId": 1,
        "categoryName": "算法",
        "tags": [
          { "id": 1, "name": "动态规划" },
          { "id": 2, "name": "贪心算法" }
        ],
        "viewCount": 1520,
        "likeCount": 88,
        "commentCount": 12,
        "status": 1,
        "isTop": false,
        "createTime": "2025-12-01T10:00:00",
        "updateTime": "2025-12-02T15:30:00"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

- `records`: 博客文章对象数组。
- `status`: 博客状态 (0-草稿, 1-已发布, 2-已隐藏)。
- `isTop`: 是否置顶。
- `total`: 总记录数。
- `size`: 每页大小。
- `current`: 当前页码。
- `pages`: 总页数。

### 2. 获取博客文章详情

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
    "title": "算法学习心得",
    "content": "# 算法学习心得\n\n## 引言\n这是完整的博客内容...",
    "contentType": "markdown",
    "summary": "分享我的算法学习经验...",
    "coverImage": "https://example.com/images/cover.jpg",
    "authorId": 1,
    "authorName": "admin",
    "authorAvatar": "https://example.com/avatar/admin.jpg",
    "categoryId": 1,
    "categoryName": "算法",
    "tags": [
      { "id": 1, "name": "动态规划" },
      { "id": 2, "name": "贪心算法" }
    ],
    "viewCount": 1520,
    "likeCount": 88,
    "commentCount": 12,
    "status": 1,
    "isTop": false,
    "allowComment": true,
    "createTime": "2025-12-01T10:00:00",
    "updateTime": "2025-12-02T15:30:00"
  }
}
```

- `contentType`: 内容格式 (markdown, html, text)。
- `allowComment`: 是否允许评论。

### 3. 创建博客文章

- **功能**: 用户创建新的博客文章。
- **URL**: `/client/blog/create`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是

#### 请求体 (Request Body)

```json
{
  "title": "算法学习心得",
  "content": "# 算法学习心得\n\n这是完整的博客内容...",
  "contentType": "markdown",
  "summary": "分享我的算法学习经验...",
  "coverImage": "https://example.com/images/cover.jpg",
  "categoryId": 1,
  "tagIds": [1, 2],
  "status": 1,
  "allowComment": true
}
```

- `title` (String, **必选**): 博客标题。
- `content` (String, **必选**): 博客内容。
- `contentType` (String, 可选): 内容格式，默认为 "markdown"。
- `summary` (String, 可选): 博客摘要。
- `coverImage` (String, 可选): 封面图片 URL。
- `categoryId` (Long, **必选**): 分类ID。
- `tagIds` (Array<Long>, 可选): 标签ID数组。
- `status` (Integer, 可选): 发布状态，默认为 0 (草稿)。
- `allowComment` (Boolean, 可选): 是否允许评论，默认为 true。

#### 成功响应 (Success Response)

响应 `data` 中包含新创建博客文章的ID。

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 1
}
```

### 4. 更新博客文章

- **功能**: 用户更新已有的博客文章。
- **URL**: `/client/blog/update`
- **方法**: `PUT`
- **Content-Type**: `application/json`
- **需要认证**: 是

#### 请求体 (Request Body)

```json
{
  "id": 1,
  "title": "算法学习心得（更新版）",
  "content": "# 算法学习心得\n\n这是更新后的内容...",
  "contentType": "markdown",
  "summary": "分享我的算法学习经验...",
  "coverImage": "https://example.com/images/cover.jpg",
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "status": 1,
  "allowComment": true
}
```

- `id` (Long, **必选**): 博客文章的唯一标识符。
- 其他字段同创建博客文章。

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

### 5. 删除博客文章

- **功能**: 用户删除自己的博客文章。
- **URL**: `/client/blog/{id}`
- **方法**: `DELETE`
- **需要认证**: 是

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

- **功能**: 用户对博客文章进行点赞或取消点赞。
- **URL**: `/client/blog/{id}/like`
- **方法**: `POST`
- **需要认证**: 是

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
    "likeCount": 89
  }
}
```

- `liked`: 当前点赞状态 (true-已点赞, false-未点赞)。
- `likeCount`: 最新的点赞数量。

---

## 博客分类管理 (Blog Category)

基础路径: `/client/blog/category`

### 1. 获取所有分类

- **功能**: 获取系统中所有博客分类列表。
- **URL**: `/client/blog/category/list`
- **方法**: `GET`

#### 成功响应 (Success Response)

响应 `data` 是一个分类对象数组。

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "算法",
      "description": "算法相关的博客文章",
      "icon": "algorithm-icon",
      "postCount": 25,
      "sortOrder": 1,
      "createTime": "2025-12-01T00:00:00"
    },
    {
      "id": 2,
      "name": "数据结构",
      "description": "数据结构相关的博客文章",
      "icon": "datastructure-icon",
      "postCount": 18,
      "sortOrder": 2,
      "createTime": "2025-12-01T00:00:00"
    }
  ]
}
```

- `postCount`: 该分类下的博客文章数量。
- `sortOrder`: 排序顺序。

### 2. 获取分类详情

- **功能**: 获取特定博客分类的详细信息。
- **URL**: `/client/blog/category/{id}`
- **方法**: `GET`

#### 路径参数 (Path Parameters)

- `id` (Long, **必选**): 分类的唯一标识符。

**示例 URL**: `/client/blog/category/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "算法",
    "description": "算法相关的博客文章",
    "icon": "algorithm-icon",
    "postCount": 25,
    "sortOrder": 1,
    "createTime": "2025-12-01T00:00:00"
  }
}
```

---

## 博客标签管理 (Blog Tag)

基础路径: `/client/blog/tag`

### 1. 获取所有标签

- **功能**: 获取系统中所有博客标签列表。
- **URL**: `/client/blog/tag/list`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `limit` (Integer, 可选): 限制返回的标签数量，用于获取热门标签。

**示例 URL**: `/client/blog/tag/list?limit=20`

#### 成功响应 (Success Response)

响应 `data` 是一个标签对象数组。

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "动态规划",
      "color": "#1890ff",
      "postCount": 15,
      "createTime": "2025-12-01T00:00:00"
    },
    {
      "id": 2,
      "name": "贪心算法",
      "color": "#52c41a",
      "postCount": 12,
      "createTime": "2025-12-01T00:00:00"
    }
  ]
}
```

- `color`: 标签显示颜色。
- `postCount`: 使用该标签的博客文章数量。

### 2. 搜索标签

- **功能**: 根据关键词搜索标签。
- **URL**: `/client/blog/tag/search`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `keyword` (String, **必选**): 搜索关键词。
- `limit` (Integer, 可选): 限制返回的标签数量，默认为 10。

**示例 URL**: `/client/blog/tag/search?keyword=算法&limit=5`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "动态规划",
      "color": "#1890ff",
      "postCount": 15
    },
    {
      "id": 2,
      "name": "贪心算法",
      "color": "#52c41a",
      "postCount": 12
    }
  ]
}
```

---

## 博客评论管理 (Blog Comment)

基础路径: `/client/blog/comment`

### 1. 分页查询评论

- **功能**: 获取特定博客文章的评论列表。
- **URL**: `/client/blog/comment/page`
- **方法**: `GET`

#### 请求参数 (Query Parameters)

- `blogId` (Long, **必选**): 博客文章ID。
- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。
- `sortBy` (String, 可选): 排序方式 (例如: "time"-按时间排序, "like"-按点赞数排序)，默认为 "time"。

**示例 URL**: `/client/blog/comment/page?blogId=1&current=1&size=20`

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
        "userAvatar": "https://example.com/avatar/user123.jpg",
        "content": "写得非常好，学到了很多！",
        "parentId": null,
        "rootId": null,
        "replyToUserId": null,
        "replyToUsername": null,
        "likeCount": 5,
        "createTime": "2025-12-02T14:30:00",
        "replies": [
          {
            "id": 2,
            "blogId": 1,
            "userId": 1,
            "username": "admin",
            "userAvatar": "https://example.com/avatar/admin.jpg",
            "content": "谢谢你的支持！",
            "parentId": 1,
            "rootId": 1,
            "replyToUserId": 2,
            "replyToUsername": "user123",
            "likeCount": 2,
            "createTime": "2025-12-02T15:00:00",
            "replies": []
          }
        ]
      }
    ],
    "total": 50,
    "size": 20,
    "current": 1,
    "pages": 3
  }
}
```

- `parentId`: 父评论ID，为 null 表示顶层评论。
- `rootId`: 根评论ID，用于评论树结构。
- `replyToUserId`: 回复的用户ID。
- `replyToUsername`: 回复的用户名。
- `replies`: 子评论数组。

### 2. 发表评论

- **功能**: 用户对博客文章发表评论或回复。
- **URL**: `/client/blog/comment/create`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是

#### 请求体 (Request Body)

```json
{
  "blogId": 1,
  "content": "写得非常好，学到了很多！",
  "parentId": null,
  "rootId": null,
  "replyToUserId": null
}
```

- `blogId` (Long, **必选**): 博客文章ID。
- `content` (String, **必选**): 评论内容。
- `parentId` (Long, 可选): 父评论ID，回复评论时需要。
- `rootId` (Long, 可选): 根评论ID，用于建立评论树。
- `replyToUserId` (Long, 可选): 回复的用户ID。

#### 成功响应 (Success Response)

响应 `data` 中包含新创建评论的ID。

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 1
}
```

### 3. 删除评论

- **功能**: 用户删除自己的评论。
- **URL**: `/client/blog/comment/{id}`
- **方法**: `DELETE`
- **需要认证**: 是

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

### 4. 点赞/取消点赞评论

- **功能**: 用户对评论进行点赞或取消点赞。
- **URL**: `/client/blog/comment/{id}/like`
- **方法**: `POST`
- **需要认证**: 是

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

- `liked`: 当前点赞状态 (true-已点赞, false-未点赞)。
- `likeCount`: 最新的点赞数量。

---

## 博客统计 (Blog Statistics)

基础路径: `/client/blog/stats`

### 1. 获取博客统计信息

- **功能**: 获取博客系统的统计信息。
- **URL**: `/client/blog/stats/overview`
- **方法**: `GET`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalPosts": 150,
    "totalViews": 50000,
    "totalLikes": 3500,
    "totalComments": 1200,
    "totalUsers": 500,
    "recentPosts": 20
  }
}
```

- `totalPosts`: 博客文章总数。
- `totalViews`: 总浏览量。
- `totalLikes`: 总点赞数。
- `totalComments`: 总评论数。
- `totalUsers`: 总用户数。
- `recentPosts`: 最近30天发布的文章数。

### 2. 获取用户博客统计

- **功能**: 获取特定用户的博客统计信息。
- **URL**: `/client/blog/stats/user/{userId}`
- **方法**: `GET`

#### 路径参数 (Path Parameters)

- `userId` (Long, **必选**): 用户的唯一标识符。

**示例 URL**: `/client/blog/stats/user/1`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 1,
    "username": "admin",
    "postCount": 25,
    "totalViews": 10000,
    "totalLikes": 850,
    "totalComments": 300,
    "followerCount": 120
  }
}
```

- `postCount`: 用户发布的博客文章数量。
- `totalViews`: 用户所有博客的总浏览量。
- `totalLikes`: 用户所有博客的总点赞数。
- `totalComments`: 用户所有博客的总评论数。
- `followerCount`: 用户的粉丝数量。

---

## 用户关注管理 (User Follow)

基础路径: `/client/blog/follow`

### 1. 关注/取消关注用户

- **功能**: 用户关注或取消关注其他用户。
- **URL**: `/client/blog/follow/{userId}`
- **方法**: `POST`
- **需要认证**: 是

#### 路径参数 (Path Parameters)

- `userId` (Long, **必选**): 要关注/取消关注的用户ID。

**示例 URL**: `/client/blog/follow/2`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "followed": true,
    "followerCount": 121
  }
}
```

- `followed`: 当前关注状态 (true-已关注, false-未关注)。
- `followerCount`: 被关注用户的最新粉丝数量。

### 2. 获取关注列表

- **功能**: 获取用户的关注列表。
- **URL**: `/client/blog/follow/following`
- **方法**: `GET`
- **需要认证**: 是

#### 请求参数 (Query Parameters)

- `userId` (Long, 可选): 用户ID，不提供则查询当前登录用户。
- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。

**示例 URL**: `/client/blog/follow/following?current=1&size=20`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "userId": 2,
        "username": "user123",
        "avatar": "https://example.com/avatar/user123.jpg",
        "bio": "热爱算法的程序员",
        "postCount": 15,
        "followerCount": 50,
        "followTime": "2025-12-01T10:00:00"
      }
    ],
    "total": 30,
    "size": 20,
    "current": 1,
    "pages": 2
  }
}
```

### 3. 获取粉丝列表

- **功能**: 获取用户的粉丝列表。
- **URL**: `/client/blog/follow/followers`
- **方法**: `GET`
- **需要认证**: 是

#### 请求参数 (Query Parameters)

- `userId` (Long, 可选): 用户ID，不提供则查询当前登录用户。
- `current` (Integer, **必选**): 当前页码，从 1 开始。
- `size` (Integer, **必选**): 每页记录数。

**示例 URL**: `/client/blog/follow/followers?current=1&size=20`

#### 成功响应 (Success Response)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "userId": 3,
        "username": "user456",
        "avatar": "https://example.com/avatar/user456.jpg",
        "bio": "编程爱好者",
        "postCount": 8,
        "followerCount": 25,
        "followTime": "2025-12-02T14:00:00"
      }
    ],
    "total": 120,
    "size": 20,
    "current": 1,
    "pages": 6
  }
}
```

---

## 错误处理

当请求失败时，API 会返回相应的错误信息：

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
```

常见错误码：

- `400`: 请求参数错误
- `401`: 未授权，需要登录
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 认证说明

需要认证的接口需要在请求头中携带认证信息：

```
Authorization: Bearer <token>
```

或通过 Cookie 方式携带 session 信息。具体认证方式取决于系统配置。

---

## 注意事项

1. 所有时间格式均为 ISO 8601 格式 (例如: `2025-12-01T10:00:00`)。
2. 分页查询的页码从 1 开始。
3. 所有涉及用户操作的接口都需要进行身份认证。
4. 博客内容支持 Markdown 格式，前端需要进行相应的渲染处理。
5. 图片 URL 应为完整的可访问路径。
6. 删除操作可能是软删除，具体实现取决于后端设计。
