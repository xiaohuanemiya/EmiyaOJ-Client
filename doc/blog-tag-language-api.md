# 博客标签与编程语言接口文档

## 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

- 成功：`code = 200`
- 参数错误：`code = 400`
- 资源不存在：`code = 404`
- 服务器错误：`code = 500`

## 博客标签接口

### 查询所有标签

- Method: `GET`
- URL: `/blog/tags`
- Response `data`: `BlogTagVO[]`

```json
[
  {
    "id": "1",
    "name": "Java",
    "desc": "Java 相关博客"
  }
]
```

### 查询标签详情

- Method: `GET`
- URL: `/blog/tags/{tagId}`
- Path:
  - `tagId`: 标签 ID
- Response `data`: `BlogTagVO`
- Not Found: `{"code":404,"message":"未找到该标签","data":null}`

### 新增标签

- Method: `POST`
- URL: `/blog/tags`
- Request Body:

```json
{
  "name": "Java",
  "desc": "Java 相关博客"
}
```

- 字段限制：
  - `name`: 必填，最长 255 个字符
  - `desc`: 必填，最长 255 个字符
- Response `data`: 新增后的 `BlogTagVO`

### 修改标签

- Method: `PUT`
- URL: `/blog/tags/{tagId}`
- Path:
  - `tagId`: 标签 ID
- Request Body:

```json
{
  "name": "Java",
  "desc": "Java 相关博客"
}
```

- Response `data`: 修改后的 `BlogTagVO`
- Not Found: `{"code":404,"message":"标签不存在","data":null}`

### 删除标签

- Method: `DELETE`
- URL: `/blog/tags/{tagId}`
- Path:
  - `tagId`: 标签 ID
- 删除策略：先删除 `blog_tag_association` 中该标签的所有关联，再删除 `blog_tag` 标签记录。
- Success: `{"code":200,"message":"操作成功","data":null}`
- Not Found: `{"code":404,"message":"标签不存在","data":null}`

## 编程语言接口

### 查询启用语言列表

- Method: `GET`
- URL: `/language/list`
- Response `data`: `LanguageVO[]`

### 管理端查询全部语言

- Method: `GET`
- URL: `/language/admin/list`
- Response `data`: `LanguageVO[]`

### 查询启用语言详情

- Method: `GET`
- URL: `/language/{id}`
- Path:
  - `id`: 语言 ID
- Response `data`: `LanguageVO`
- Not Found: `{"code":404,"message":"语言不存在或已禁用","data":null}`

### 管理端查询语言详情

- Method: `GET`
- URL: `/language/admin/{id}`
- Path:
  - `id`: 语言 ID
- Response `data`: `LanguageVO`
- Not Found: `{"code":404,"message":"语言不存在","data":null}`

### 新增语言

- Method: `POST`
- URL: `/language`
- Request Body:

```json
{
  "name": "Java",
  "version": "17",
  "compileCommand": "javac {src}",
  "executeCommand": "java {exe}",
  "sourceFileExt": "java",
  "executableExt": "class",
  "isCompiled": 1,
  "timeLimitMultiplier": 1.0,
  "memoryLimitMultiplier": 1.0,
  "status": 1
}
```

- 必填字段：`name`、`version`、`executeCommand`、`sourceFileExt`
- 默认值：
  - `status`: 未传时默认为 `1`
  - `isCompiled`: 未传时默认为 `1`
  - `timeLimitMultiplier`: 未传时默认为 `1`
  - `memoryLimitMultiplier`: 未传时默认为 `1`
- 约束：同名同版本语言不允许重复。
- Response `data`: 新增后的 `LanguageVO`

### 更新语言

- Method: `PUT`
- URL: `/language`
- Request Body:

```json
{
  "id": 1,
  "name": "Java",
  "version": "21",
  "compileCommand": "javac {src}",
  "executeCommand": "java {exe}",
  "sourceFileExt": "java",
  "executableExt": "class",
  "isCompiled": 1,
  "timeLimitMultiplier": 1.0,
  "memoryLimitMultiplier": 1.0,
  "status": 1
}
```

- 必填字段：`id`、`name`、`version`、`executeCommand`、`sourceFileExt`
- 约束：同名同版本语言不允许重复，校验重复时会排除当前 `id`。
- Success: `{"code":200,"message":"操作成功","data":true}`
- Not Found: `{"code":404,"message":"语言不存在","data":null}`

### 启用语言

- Method: `PUT`
- URL: `/language/{id}/enable`
- Success: `{"code":200,"message":"操作成功","data":true}`
- Not Found: `{"code":404,"message":"语言不存在","data":null}`

### 禁用语言

- Method: `PUT`
- URL: `/language/{id}/disable`
- Success: `{"code":200,"message":"操作成功","data":true}`
- Not Found: `{"code":404,"message":"语言不存在","data":null}`

### 删除语言

- Method: `DELETE`
- URL: `/language/{id}`
- 删除策略：物理删除语言记录。
- Success: `{"code":200,"message":"操作成功","data":true}`
- Not Found: `{"code":404,"message":"语言不存在","data":null}`

## VO 字段

### BlogTagVO

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 标签 ID，后端以字符串形式返回，避免前端精度丢失 |
| name | string | 标签名称 |
| desc | string | 标签描述 |

### LanguageVO

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 语言 ID |
| name | string | 语言名称 |
| version | string | 版本号 |
| compileCommand | string | 编译命令，可为空 |
| executeCommand | string | 执行命令 |
| sourceFileExt | string | 源文件扩展名 |
| executableExt | string | 编译产物扩展名，可为空 |
| isCompiled | number | 是否需要编译：0-否，1-是 |
| timeLimitMultiplier | number | 时间限制乘数 |
| memoryLimitMultiplier | number | 内存限制乘数 |
| status | number | 状态：0-禁用，1-启用 |
