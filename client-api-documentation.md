# EmiyaOJ 用户端前端接口文档

## 概述

本文档描述了 EmiyaOJ 在线评测系统用户端前端所需的所有 API 接口，包括认证、题目、提交记录和编程语言管理等功能。

### 基础信息

- **Base URL**: `/api`（根据实际部署环境配置）
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token (JWT)

### 通用响应格式

所有接口均返回统一的响应格式：

```json
{
  "code": 200,
  "msg": "Success",
  "data": {}
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，200 表示成功，其他表示失败 |
| msg | string | 响应消息 |
| data | object | 响应数据，根据具体接口返回不同的数据结构 |

**常见状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 409 | 冲突（如用户已登录） |
| 500 | 服务器内部错误 |

---

## 1. 认证管理 (Authentication)

### 1.1 用户登录

**接口地址**: `POST /auth/login`

**接口描述**: 用户登录接口，登录成功后返回 JWT Token，用于后续接口认证。

**请求头**: 无需认证

**请求参数**:

```json
{
  "username": "string",
  "password": "string"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名，长度 5-20 位，仅支持字母、数字、下划线 |
| password | string | 是 | 密码，长度 5-16 位，仅支持字母、数字、下划线 |

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": "1234567890",
    "username": "testuser",
    "name": "测试用户",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**响应数据说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID（长整型序列化为字符串） |
| username | string | 用户名 |
| name | string | 用户姓名 |
| token | string | JWT 认证令牌，后续请求需在 Header 中携带 |

**失败响应示例**:

```json
{
  "code": 409,
  "msg": "用户已登录",
  "data": null
}
```

**使用说明**:
- 登录成功后，将 token 保存到本地存储
- 后续请求在 Header 中添加: `Authorization: Bearer {token}`
- 如果用户已有有效的登录会话，会返回 409 状态码

---

### 1.2 用户登出

**接口地址**: `POST /auth/logout`

**接口描述**: 用户登出接口，清除服务器端的登录状态。

**请求头**: 需要认证

```
Authorization: Bearer {token}
```

**请求参数**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**使用说明**:
- 登出成功后，清除本地存储的 token
- Token 可以通过 Header 或 URL 参数传递
- 服务器会清除 Redis 中的 token 记录

---

## 2. 题目管理 (Problem)

### 2.1 分页查询题目列表

**接口地址**: `GET /client/problem/page`

**接口描述**: 分页查询题目列表，支持按难度、状态、关键字筛选。

**请求头**: 需要认证

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 是 | 页码，从 1 开始 |
| pageSize | integer | 是 | 每页数量 |
| sortBy | string | 否 | 排序字段 |
| isAsc | boolean | 否 | 是否升序，true-升序，false-降序 |
| difficulty | integer | 否 | 难度筛选：1-简单，2-中等，3-困难 |
| status | integer | 否 | 状态筛选 |
| keyword | string | 否 | 关键字搜索（标题） |

**请求示例**:

```
GET /client/problem/page?pageNo=1&pageSize=10&difficulty=1&keyword=排序
```

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 100,
    "pages": 10,
    "list": [
      {
        "id": 1,
        "title": "两数之和",
        "description": "给定一个整数数组 nums 和一个整数目标值 target...",
        "inputDescription": "第一行包含一个整数 n...",
        "outputDescription": "输出一个整数...",
        "sampleInput": "5 7\n2 7 11 15",
        "sampleOutput": "0 1",
        "hint": "可以使用哈希表优化",
        "difficulty": 1,
        "timeLimit": 1000,
        "memoryLimit": 256,
        "acceptCount": 1234,
        "submitCount": 5678,
        "createTime": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

**响应数据说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| total | long | 总记录数 |
| pages | long | 总页数 |
| list | array | 题目列表 |
| list[].id | long | 题目 ID |
| list[].title | string | 题目标题 |
| list[].description | string | 题目描述 |
| list[].inputDescription | string | 输入描述 |
| list[].outputDescription | string | 输出描述 |
| list[].sampleInput | string | 样例输入 |
| list[].sampleOutput | string | 样例输出 |
| list[].hint | string | 提示信息 |
| list[].difficulty | integer | 难度：1-简单，2-中等，3-困难 |
| list[].timeLimit | integer | CPU 时间限制（毫秒） |
| list[].memoryLimit | integer | 内存限制（MB） |
| list[].acceptCount | integer | 通过次数 |
| list[].submitCount | integer | 提交次数 |
| list[].createTime | string | 创建时间（ISO 8601 格式） |

---

### 2.2 获取题目详情

**接口地址**: `GET /client/problem/{id}`

**接口描述**: 根据题目 ID 获取题目详细信息。

**请求头**: 需要认证

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | long | 是 | 题目 ID |

**请求示例**:

```
GET /client/problem/1
```

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": 1,
    "title": "两数之和",
    "description": "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。",
    "inputDescription": "第一行包含两个整数 n 和 target\n第二行包含 n 个整数，表示数组 nums",
    "outputDescription": "输出两个整数，表示两个数的下标",
    "sampleInput": "4 9\n2 7 11 15",
    "sampleOutput": "0 1",
    "hint": "你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。",
    "difficulty": 1,
    "timeLimit": 1000,
    "memoryLimit": 256,
    "acceptCount": 1234,
    "submitCount": 5678,
    "createTime": "2024-01-01T12:00:00"
  }
}
```

**失败响应示例**:

```json
{
  "code": 500,
  "msg": "题目不存在",
  "data": null
}
```

---

## 3. 提交管理 (Submission)

### 3.1 提交代码

**接口地址**: `POST /client/submission/client/submit`

**接口描述**: 提交代码到评测系统进行判题。

**请求头**: 需要认证

**请求参数**:

```json
{
  "problemId": 1,
  "languageId": 1,
  "code": "#include <stdio.h>\nint main() {\n    printf(\"Hello World\");\n    return 0;\n}"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| problemId | long | 是 | 题目 ID |
| languageId | long | 是 | 编程语言 ID |
| code | string | 是 | 源代码内容 |

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": 123456
}
```

**响应数据说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data | long | 提交记录 ID，可用于查询判题结果 |

**使用说明**:
- 提交成功后返回提交记录 ID
- 可以通过提交记录 ID 轮询查询判题结果
- 代码需要进行适当的转义处理

---

### 3.2 分页查询提交记录

**接口地址**: `GET /client/submission/page`

**接口描述**: 分页查询提交记录，支持按题目 ID、用户 ID 筛选。

**请求头**: 需要认证

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 是 | 页码，从 1 开始 |
| pageSize | integer | 是 | 每页数量 |
| sortBy | string | 否 | 排序字段 |
| isAsc | boolean | 否 | 是否升序 |
| problemId | long | 否 | 题目 ID 筛选 |
| userId | long | 否 | 用户 ID 筛选 |

**请求示例**:

```
GET /client/submission/page?pageNo=1&pageSize=20&problemId=1
```

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 50,
    "pages": 3,
    "list": [
      {
        "id": 123456,
        "problemId": 1,
        "problemTitle": "两数之和",
        "userId": 1001,
        "username": "testuser",
        "languageId": 1,
        "languageName": "C",
        "status": "Accepted",
        "score": 100,
        "timeUsed": 15,
        "memoryUsed": 1024,
        "passRate": "10/10",
        "createTime": "2024-01-01T12:00:00"
      }
    ]
  }
}
```

**响应数据说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| total | long | 总记录数 |
| pages | long | 总页数 |
| list | array | 提交记录列表 |
| list[].id | long | 提交记录 ID |
| list[].problemId | long | 题目 ID |
| list[].problemTitle | string | 题目标题 |
| list[].userId | long | 用户 ID |
| list[].username | string | 用户名 |
| list[].languageId | long | 语言 ID |
| list[].languageName | string | 语言名称 |
| list[].status | string | 判题状态：Pending（等待中）、Running（运行中）、Accepted（通过）、Wrong Answer（答案错误）、Time Limit Exceeded（超时）、Memory Limit Exceeded（内存超限）、Runtime Error（运行错误）、Compile Error（编译错误）、System Error（系统错误） |
| list[].score | integer | 得分（0-100） |
| list[].timeUsed | integer | 实际使用时间（毫秒） |
| list[].memoryUsed | integer | 实际使用内存（KB） |
| list[].passRate | string | 通过率，格式："通过测试点数/总测试点数" |
| list[].createTime | string | 提交时间（ISO 8601 格式） |

---

### 3.3 获取提交详情

**接口地址**: `GET /client/submission/{id}`

**接口描述**: 根据提交记录 ID 获取提交详细信息，包括判题结果。

**请求头**: 需要认证

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | long | 是 | 提交记录 ID |

**请求示例**:

```
GET /client/submission/123456
```

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": 123456,
    "problemId": 1,
    "problemTitle": "两数之和",
    "userId": 1001,
    "username": "testuser",
    "languageId": 1,
    "languageName": "C",
    "status": "Accepted",
    "score": 100,
    "timeUsed": 15,
    "memoryUsed": 1024,
    "passRate": "10/10",
    "createTime": "2024-01-01T12:00:00"
  }
}
```

**使用说明**:
- 可以通过轮询此接口获取最新的判题结果
- 建议轮询间隔：1-2 秒
- 当 status 为 Accepted、Wrong Answer 等终态时停止轮询

---

## 4. 编程语言管理 (Language)

### 4.1 获取所有可用语言

**接口地址**: `GET /client/language/list`

**接口描述**: 获取系统支持的所有可用编程语言列表。

**请求头**: 需要认证

**请求参数**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": 1,
      "name": "C",
      "version": "gcc-11",
      "compileCommand": "gcc -o {exe} {src} -O2 -std=c11",
      "executeCommand": "./{exe}",
      "sourceFileExt": ".c",
      "executableExt": "",
      "isCompiled": 1,
      "timeLimitMultiplier": 1.0,
      "memoryLimitMultiplier": 1.0,
      "status": 1,
      "createTime": "2024-01-01T12:00:00",
      "updateTime": "2024-01-01T12:00:00"
    },
    {
      "id": 2,
      "name": "C++",
      "version": "g++-11",
      "compileCommand": "g++ -o {exe} {src} -O2 -std=c++17",
      "executeCommand": "./{exe}",
      "sourceFileExt": ".cpp",
      "executableExt": "",
      "isCompiled": 1,
      "timeLimitMultiplier": 1.0,
      "memoryLimitMultiplier": 1.0,
      "status": 1,
      "createTime": "2024-01-01T12:00:00",
      "updateTime": "2024-01-01T12:00:00"
    },
    {
      "id": 3,
      "name": "Java",
      "version": "jdk-21",
      "compileCommand": "javac {src}",
      "executeCommand": "java Main",
      "sourceFileExt": ".java",
      "executableExt": ".class",
      "isCompiled": 1,
      "timeLimitMultiplier": 2.0,
      "memoryLimitMultiplier": 2.0,
      "status": 1,
      "createTime": "2024-01-01T12:00:00",
      "updateTime": "2024-01-01T12:00:00"
    },
    {
      "id": 4,
      "name": "Python",
      "version": "python-3.11",
      "compileCommand": "",
      "executeCommand": "python3 {src}",
      "sourceFileExt": ".py",
      "executableExt": "",
      "isCompiled": 0,
      "timeLimitMultiplier": 3.0,
      "memoryLimitMultiplier": 2.0,
      "status": 1,
      "createTime": "2024-01-01T12:00:00",
      "updateTime": "2024-01-01T12:00:00"
    }
  ]
}
```

**响应数据说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 语言 ID |
| name | string | 语言名称 |
| version | string | 版本信息 |
| compileCommand | string | 编译命令模板 |
| executeCommand | string | 执行命令模板 |
| sourceFileExt | string | 源文件扩展名 |
| executableExt | string | 可执行文件扩展名 |
| isCompiled | integer | 是否需要编译：0-否，1-是 |
| timeLimitMultiplier | decimal | 时间限制倍数 |
| memoryLimitMultiplier | decimal | 内存限制倍数 |
| status | integer | 状态：0-禁用，1-启用 |
| createTime | string | 创建时间（ISO 8601 格式） |
| updateTime | string | 更新时间（ISO 8601 格式） |

**使用说明**:
- 只返回 status = 1 的启用状态语言
- 结果按 ID 升序排列
- 前端可以根据此列表生成语言选择下拉框

---

### 4.2 获取语言详情

**接口地址**: `GET /client/language/{id}`

**接口描述**: 根据语言 ID 获取语言详细信息。

**请求头**: 需要认证

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | long | 是 | 语言 ID |

**请求示例**:

```
GET /client/language/1
```

**成功响应示例**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": 1,
    "name": "C",
    "version": "gcc-11",
    "compileCommand": "gcc -o {exe} {src} -O2 -std=c11",
    "executeCommand": "./{exe}",
    "sourceFileExt": ".c",
    "executableExt": "",
    "isCompiled": 1,
    "timeLimitMultiplier": 1.0,
    "memoryLimitMultiplier": 1.0,
    "status": 1,
    "createTime": "2024-01-01T12:00:00",
    "updateTime": "2024-01-01T12:00:00"
  }
}
```

**失败响应示例**:

```json
{
  "code": 500,
  "msg": "语言不存在",
  "data": null
}
```

---

## 附录

### A. 判题状态说明

| 状态 | 英文 | 说明 |
|------|------|------|
| 等待中 | Pending | 提交已接收，等待判题 |
| 运行中 | Running | 正在判题 |
| 通过 | Accepted (AC) | 所有测试点通过 |
| 答案错误 | Wrong Answer (WA) | 输出结果不正确 |
| 超时 | Time Limit Exceeded (TLE) | 运行时间超过限制 |
| 内存超限 | Memory Limit Exceeded (MLE) | 使用内存超过限制 |
| 运行错误 | Runtime Error (RE) | 程序运行时崩溃 |
| 编译错误 | Compile Error (CE) | 编译失败 |
| 系统错误 | System Error (SE) | 判题系统错误 |

### B. 难度等级说明

| 值 | 说明 | 建议颜色 |
|----|------|----------|
| 1 | 简单 | 绿色 (#52c41a) |
| 2 | 中等 | 橙色 (#faad14) |
| 3 | 困难 | 红色 (#f5222d) |

### C. 前端开发建议 (Vue3 + TypeScript)

#### C.1 TypeScript 类型定义

```typescript
// types/api.ts - 定义所有接口相关的类型

/** 通用响应结构 */
export interface ResponseResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 分页请求参数 */
export interface PageDTO {
  pageNo: number;
  pageSize: number;
  sortBy?: string;
  isAsc?: boolean;
}

/** 分页响应数据 */
export interface PageVO<T> {
  total: number;
  pages: number;
  list: T[];
}

/** 用户登录请求 */
export interface UserLoginDTO {
  username: string;
  password: string;
}

/** 用户登录响应 */
export interface UserLoginVO {
  id: string;
  username: string;
  name: string;
  token: string;
}

/** 题目信息 */
export interface ProblemVO {
  id: number;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  difficulty: 1 | 2 | 3;
  timeLimit: number;
  memoryLimit: number;
  acceptCount: number;
  submitCount: number;
  createTime: string;
}

/** 提交代码请求 */
export interface SubmitCodeDTO {
  problemId: number;
  languageId: number;
  code: string;
}

/** 提交记录 */
export interface SubmissionVO {
  id: number;
  problemId: number;
  problemTitle: string;
  userId: number;
  username: string;
  languageId: number;
  languageName: string;
  status: SubmissionStatus;
  score: number;
  timeUsed: number;
  memoryUsed: number;
  passRate: string;
  createTime: string;
}

/** 判题状态 */
export type SubmissionStatus = 
  | 'Pending'
  | 'Running'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compile Error'
  | 'System Error';

/** 编程语言 */
export interface Language {
  id: number;
  name: string;
  version: string;
  compileCommand: string;
  executeCommand: string;
  sourceFileExt: string;
  executableExt: string;
  isCompiled: 0 | 1;
  timeLimitMultiplier: number;
  memoryLimitMultiplier: number;
  status: 0 | 1;
  createTime: string;
  updateTime: string;
}
```

#### C.2 Axios 配置与拦截器

```typescript
// utils/request.ts - 统一的请求配置

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import type { ResponseResult } from '@/types/api';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseResult>) => {
    const res = response.data;
    
    // 如果响应码不是 200，则判定为错误
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败');
      
      // 401: 未授权
      if (res.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        router.push('/login');
      }
      
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    
    return res;
  },
  (error) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请先登录');
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          router.push('/login');
          break;
        case 409:
          ElMessage.warning(data.msg || '请求冲突');
          break;
        case 500:
          ElMessage.error(data.msg || '服务器错误');
          break;
        default:
          ElMessage.error(data.msg || '未知错误');
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default service;
```

#### C.3 API 封装

```typescript
// api/auth.ts - 认证相关接口
import request from '@/utils/request';
import type { ResponseResult, UserLoginDTO, UserLoginVO } from '@/types/api';

export const authAPI = {
  /** 用户登录 */
  login(data: UserLoginDTO) {
    return request<ResponseResult<UserLoginVO>>({
      url: '/auth/login',
      method: 'POST',
      data
    });
  },
  
  /** 用户登出 */
  logout() {
    return request<ResponseResult<null>>({
      url: '/auth/logout',
      method: 'POST'
    });
  }
};

// api/problem.ts - 题目相��接口
import request from '@/utils/request';
import type { ResponseResult, PageDTO, PageVO, ProblemVO } from '@/types/api';

export const problemAPI = {
  /** 分页查询题目列表 */
  getPage(params: PageDTO & {
    difficulty?: number;
    status?: number;
    keyword?: string;
  }) {
    return request<ResponseResult<PageVO<ProblemVO>>>({
      url: '/client/problem/page',
      method: 'GET',
      params
    });
  },
  
  /** 获取题目详情 */
  getDetail(id: number) {
    return request<ResponseResult<ProblemVO>>({
      url: `/client/problem/${id}`,
      method: 'GET'
    });
  }
};

// api/submission.ts - 提交相关接口
import request from '@/utils/request';
import type { ResponseResult, PageDTO, PageVO, SubmitCodeDTO, SubmissionVO } from '@/types/api';

export const submissionAPI = {
  /** 提交代码 */
  submit(data: SubmitCodeDTO) {
    return request<ResponseResult<number>>({
      url: '/client/submission/client/submit',
      method: 'POST',
      data
    });
  },
  
  /** 分页查询提交记录 */
  getPage(params: PageDTO & {
    problemId?: number;
    userId?: number;
  }) {
    return request<ResponseResult<PageVO<SubmissionVO>>>({
      url: '/client/submission/page',
      method: 'GET',
      params
    });
  },
  
  /** 获取提交详情 */
  getDetail(id: number) {
    return request<ResponseResult<SubmissionVO>>({
      url: `/client/submission/${id}`,
      method: 'GET'
    });
  }
};

// api/language.ts - 语言相关接口
import request from '@/utils/request';
import type { ResponseResult, Language } from '@/types/api';

export const languageAPI = {
  /** 获取所有可用语言 */
  getList() {
    return request<ResponseResult<Language[]>>({
      url: '/client/language/list',
      method: 'GET'
    });
  },
  
  /** 获取语言详情 */
  getDetail(id: number) {
    return request<ResponseResult<Language>>({
      url: `/client/language/${id}`,
      method: 'GET'
    });
  }
};
```

#### C.4 Pinia Store 状态管理

```typescript
// stores/user.ts - 用户状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authAPI } from '@/api/auth';
import router from '@/router';
import type { UserLoginDTO, UserLoginVO } from '@/types/api';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const userInfo = ref<UserLoginVO | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  );

  /** 登录 */
  const login = async (loginForm: UserLoginDTO) => {
    try {
      const res = await authAPI.login(loginForm);
      token.value = res.data.token;
      userInfo.value = res.data;
      
      // 保存到 localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      
      return res.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  /** 登出 */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      // 无论接口是否成功，都清除本地数据
      token.value = '';
      userInfo.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  };

  /** 检查是否已登录 */
  const isLoggedIn = () => {
    return !!token.value;
  };

  return {
    token,
    userInfo,
    login,
    logout,
    isLoggedIn
  };
});
```

#### C.5 轮询判题结果的 Composable

```typescript
// composables/useSubmissionPolling.ts - 轮询判题结果
import { ref, onUnmounted } from 'vue';
import { submissionAPI } from '@/api/submission';
import { ElMessage } from 'element-plus';
import type { SubmissionVO, SubmissionStatus } from '@/types/api';

/** 终态状态列表 */
const FINAL_STATES: SubmissionStatus[] = [
  'Accepted',
  'Wrong Answer',
  'Time Limit Exceeded',
  'Memory Limit Exceeded',
  'Runtime Error',
  'Compile Error',
  'System Error'
];

export function useSubmissionPolling() {
  const submission = ref<SubmissionVO | null>(null);
  const isPolling = ref(false);
  let pollingTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 开始轮询提交结果
   * @param submissionId 提交记录 ID
   * @param interval 轮询间隔（毫秒），默认 2000
   * @param maxAttempts 最大轮询次数，默认 60
   */
  const startPolling = async (
    submissionId: number,
    interval = 2000,
    maxAttempts = 60
  ): Promise<SubmissionVO> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      isPolling.value = true;

      const poll = async () => {
        try {
          attempts++;
          const res = await submissionAPI.getDetail(submissionId);
          submission.value = res.data;

          // 检查是否为终态
          if (FINAL_STATES.includes(res.data.status)) {
            stopPolling();
            resolve(res.data);
            return;
          }

          // 检查是否超过最大轮询次数
          if (attempts >= maxAttempts) {
            stopPolling();
            ElMessage.error('判题超时，请稍后查看结果');
            reject(new Error('判题超时'));
            return;
          }

          // 继续轮询
          pollingTimer = setTimeout(poll, interval);
        } catch (error) {
          stopPolling();
          reject(error);
        }
      };

      poll();
    });
  };

  /** 停止轮询 */
  const stopPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      pollingTimer = null;
    }
    isPolling.value = false;
  };

  // 组件卸载时清除定时器
  onUnmounted(() => {
    stopPolling();
  });

  return {
    submission,
    isPolling,
    startPolling,
    stopPolling
  };
}
```

#### C.6 完整示例 - 题目列表页面

```vue
<!-- views/ProblemList.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { problemAPI } from '@/api/problem';
import type { ProblemVO } from '@/types/api';

const loading = ref(false);
const problemList = ref<ProblemVO[]>([]);

const pagination = reactive({
  pageNo: 1,
  pageSize: 20,
  total: 0
});

const filterForm = reactive({
  difficulty: undefined as number | undefined,
  keyword: ''
});

/** 获取题目列表 */
const getProblemList = async () => {
  loading.value = true;
  try {
    const res = await problemAPI.getPage({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      difficulty: filterForm.difficulty,
      keyword: filterForm.keyword
    });
    
    problemList.value = res.data.list;
    pagination.total = res.data.total;
  } catch (error) {
    console.error('获取题目列表失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 搜索 */
const handleSearch = () => {
  pagination.pageNo = 1;
  getProblemList();
};

/** 重置 */
const handleReset = () => {
  filterForm.difficulty = undefined;
  filterForm.keyword = '';
  handleSearch();
};

/** 获取难度类型 */
const getDifficultyType = (difficulty: number) => {
  const typeMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  };
  return typeMap[difficulty] || 'success';
};

/** 获取难度文本 */
const getDifficultyText = (difficulty: number) => {
  const textMap: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  };
  return textMap[difficulty] || '';
};

/** 计算通过率 */
const getAcceptRate = (problem: ProblemVO) => {
  if (problem.submitCount === 0) return '0%';
  const rate = (problem.acceptCount / problem.submitCount * 100).toFixed(1);
  return `${rate}%`;
};

onMounted(() => {
  getProblemList();
});
</script>

<template>
  <div class="problem-list">
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="filterForm" class="filter-form">
      <el-form-item label="难度">
        <el-select v-model="filterForm.difficulty" placeholder="全部难度" clearable>
          <el-option label="简单" :value="1" />
          <el-option label="中等" :value="2" />
          <el-option label="困难" :value="3" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="搜索">
        <el-input 
          v-model="filterForm.keyword" 
          placeholder="题目标题" 
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 题目列表 -->
    <el-table 
      v-loading="loading" 
      :data="problemList" 
      stripe 
      style="width: 100%"
    >
      <el-table-column prop="id" label="题号" width="80" />
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <router-link :to="`/problem/${row.id}`" class="problem-title">
            {{ row.title }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="getDifficultyType(row.difficulty)">
            {{ getDifficultyText(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通过率" width="120">
        <template #default="{ row }">
          {{ getAcceptRate(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="submitCount" label="提交数" width="100" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNo"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSearch"
      @current-change="handleSearch"
    />
  </div>
</template>

<style scoped>
.problem-list {
  padding: 20px;
}

.filter-form {
  margin-bottom: 20px;
}

.problem-title {
  color: #409eff;
  text-decoration: none;
}

.problem-title:hover {
  text-decoration: underline;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
```

#### C.7 完整示例 - 代码提交页面

```vue
<!-- views/ProblemDetail.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { problemAPI } from '@/api/problem';
import { submissionAPI } from '@/api/submission';
import { languageAPI } from '@/api/language';
import { useSubmissionPolling } from '@/composables/useSubmissionPolling';
import type { ProblemVO, Language, SubmissionStatus } from '@/types/api';

const route = useRoute();
const router = useRouter();
const { submission, startPolling } = useSubmissionPolling();

const loading = ref(false);
const submitting = ref(false);
const resultDialogVisible = ref(false);

const problem = ref<ProblemVO | null>(null);
const languages = ref<Language[]>([]);

const submitForm = reactive({
  problemId: 0,
  languageId: undefined as number | undefined,
  code: ''
});

/** 获取题目详情 */
const getProblemDetail = async () => {
  const problemId = Number(route.params.id);
  if (!problemId) return;
  
  loading.value = true;
  try {
    const res = await problemAPI.getDetail(problemId);
    problem.value = res.data;
    submitForm.problemId = problemId;
  } catch (error) {
    console.error('获取题目详情失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 获取语言列表 */
const getLanguages = async () => {
  try {
    const res = await languageAPI.getList();
    languages.value = res.data;
    // 默认选择第一个语言
    if (languages.value.length > 0) {
      submitForm.languageId = languages.value[0].id;
    }
  } catch (error) {
    console.error('获取语言列表失败:', error);
  }
};

/** 提交代码 */
const handleSubmit = async () => {
  if (!submitForm.languageId) {
    ElMessage.warning('请选择编程语言');
    return;
  }
  
  if (!submitForm.code.trim()) {
    ElMessage.warning('请输入代码');
    return;
  }
  
  submitting.value = true;
  
  try {
    // 提交代码
    const res = await submissionAPI.submit(submitForm);
    const submissionId = res.data;
    
    ElMessage.success('提交成功，正在判题...');
    
    // 开始轮询判题结果
    await startPolling(submissionId);
    
    // 显示结果对话框
    resultDialogVisible.value = true;
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    submitting.value = false;
  }
};

/** 跳转到提交记录页面 */
const goToSubmissions = () => {
  router.push('/submissions');
};

/** 获取难度类型 */
const getDifficultyType = (difficulty?: number) => {
  const typeMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  };
  return difficulty ? typeMap[difficulty] : 'success';
};

/** 获取难度文本 */
const getDifficultyText = (difficulty?: number) => {
  const textMap: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  };
  return difficulty ? textMap[difficulty] : '';
};

/** 获取状态类型 */
const getStatusType = (status: SubmissionStatus) => {
  if (status === 'Accepted') return 'success';
  if (status === 'Pending' || status === 'Running') return 'info';
  return 'danger';
};

onMounted(() => {
  getProblemDetail();
  getLanguages();
});
</script>

<template>
  <div class="problem-detail">
    <!-- 题目信息 -->
    <el-card v-loading="loading">
      <template #header>
        <h2>{{ problem?.title }}</h2>
        <div class="problem-meta">
          <el-tag :type="getDifficultyType(problem?.difficulty)">
            {{ getDifficultyText(problem?.difficulty) }}
          </el-tag>
          <span>时间限制: {{ problem?.timeLimit }}ms</span>
          <span>内存限制: {{ problem?.memoryLimit }}MB</span>
        </div>
      </template>
      
      <div v-if="problem" class="problem-content">
        <section>
          <h3>题目描述</h3>
          <p>{{ problem.description }}</p>
        </section>
        
        <section>
          <h3>输入描述</h3>
          <p>{{ problem.inputDescription }}</p>
        </section>
        
        <section>
          <h3>输出描述</h3>
          <p>{{ problem.outputDescription }}</p>
        </section>
        
        <section>
          <h3>样例输入</h3>
          <pre>{{ problem.sampleInput }}</pre>
        </section>
        
        <section>
          <h3>样例输出</h3>
          <pre>{{ problem.sampleOutput }}</pre>
        </section>
        
        <section v-if="problem.hint">
          <h3>提示</h3>
          <p>{{ problem.hint }}</p>
        </section>
      </div>
    </el-card>

    <!-- 代码编辑器 -->
    <el-card class="code-editor">
      <template #header>
        <div class="editor-header">
          <el-select v-model="submitForm.languageId" placeholder="选择语言">
            <el-option
              v-for="lang in languages"
              :key="lang.id"
              :label="`${lang.name} (${lang.version})`"
              :value="lang.id"
            />
          </el-select>
          
          <el-button 
            type="primary" 
            :loading="submitting"
            @click="handleSubmit"
          >
            提交代码
          </el-button>
        </div>
      </template>
      
      <el-input
        v-model="submitForm.code"
        type="textarea"
        :rows="20"
        placeholder="请输入代码..."
      />
    </el-card>

    <!-- 判题结果对话框 -->
    <el-dialog 
      v-model="resultDialogVisible" 
      title="判题结果"
      width="600px"
    >
      <div v-if="submission" class="result-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(submission.status)">
              {{ submission.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="得分">
            {{ submission.score }}
          </el-descriptions-item>
          <el-descriptions-item label="运行时间">
            {{ submission.timeUsed }}ms
          </el-descriptions-item>
          <el-descriptions-item label="内存消耗">
            {{ submission.memoryUsed }}KB
          </el-descriptions-item>
          <el-descriptions-item label="通过率">
            {{ submission.passRate }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ submission.createTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="resultDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToSubmissions">
          查看所有提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.problem-detail {
  padding: 20px;
}

.problem-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 10px;
  color: #666;
}

.problem-content section {
  margin-bottom: 20px;
}

.problem-content h3 {
  margin-bottom: 10px;
  color: #333;
}

.problem-content pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.code-editor {
  margin-top: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-content {
  padding: 20px 0;
}
</style>
```

### D. 项目结构建议

```
src/
├── api/                    # API 接口封装
│   ├── auth.ts            # 认证接口
│   ├── problem.ts         # 题目接口
│   ├── submission.ts      # 提交接口
│   └── language.ts        # 语言接口
├── assets/                # 静态资源
├── components/            # 公共组件
├── composables/           # 组合式函数
│   └── useSubmissionPolling.ts
├── router/                # 路由配置
│   └── index.ts
├── stores/                # Pinia 状态管理
│   └── user.ts
├── types/                 # TypeScript 类型定义
│   └── api.ts
├── utils/                 # 工具函数
│   └── request.ts         # Axios 配置
├── views/                 # 页面组件
│   ├── Login.vue
│   ├── ProblemList.vue
│   ├── ProblemDetail.vue
│   └── SubmissionList.vue
├── App.vue
└── main.ts
```

### E. 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production
VITE_API_BASE_URL=/api
```

### F. 依赖安装

```bash
# 安装核心依赖
npm install vue@^3.3.0 vue-router@^4.2.0 pinia@^2.1.0

# 安装 UI 框架（Element Plus）
npm install element-plus @element-plus/icons-vue

# 安装 HTTP 客户端
npm install axios

# 安装 TypeScript 相关
npm install -D typescript @types/node

# 安装代码编辑器（可选，用于代码提交）
npm install codemirror @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-java @codemirror/lang-cpp
```

### G. 路由守卫示例

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/problems'
    },
    {
      path: '/problems',
      name: 'ProblemList',
      component: () => import('@/views/ProblemList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/problem/:id',
      name: 'ProblemDetail',
      component: () => import('@/views/ProblemDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/submissions',
      name: 'SubmissionList',
      component: () => import('@/views/SubmissionList.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
    // 需要登录但未登录，跳转到登录页
    next('/login');
  } else if (to.path === '/login' && userStore.isLoggedIn()) {
    // 已登录访问登录页，跳转到首页
    next('/problems');
  } else {
    next();
  }
});

export default router;
```

### H. 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.1.0 | 2024-12-02 | 添加 Vue3 + TypeScript 完整示例代码 |
| 1.0.0 | 2024-12-02 | 初始版本，包含认证、题目、提交、语言管理接口 |

---

## 联系方式

如有问题或建议，请联系开发团队。

