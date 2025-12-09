# EmiyaOJ 管理后台 - 登录流程文档

> 本文档详细描述了 EmiyaOJ 管理后台的完整登录流程，包括登录请求、Token 解析、权限校验、路由守卫等核心功能。

## 目录

- [1. 流程概览](#1-流程概览)
- [2. 登录流程详解](#2-登录流程详解)
- [3. API 接口文档](#3-api-接口文档)
- [4. Token 机制](#4-token-机制)
- [5. 权限校验](#5-权限校验)
- [6. 路由守卫](#6-路由守卫)
- [7. 数据存储](#7-数据存储)
- [8. 错误处理](#8-错误处理)
- [9. 完整示例代码](#9-完整示例代码)

---

## 1. 流程概览

### 1.1 登录流程图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EmiyaOJ 登录流程                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  用户    │     │ 前端校验  │     │ 后端API  │     │ Token解析│     │ 路由跳转 │
    │  输入    │ ──▶ │ 表单验证  │ ──▶ │ 登录接口 │ ──▶ │ 权限存储 │ ──▶ │ 进入系统 │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                │                │                │                │
         │ 输入用户名密码  │ 格式校验       │ 身份验证       │ 解析JWT        │ 根据权限展示
         │                │ 长度校验       │ 返回Token     │ 提取权限列表    │ 对应菜单
         ▼                ▼                ▼                ▼                ▼
```

### 1.2 核心步骤

| 步骤 | 说明 | 涉及模块 |
|------|------|----------|
| 1 | 用户输入用户名和密码 | `views/login/index.vue` |
| 2 | 前端表单校验 | Element Plus Form |
| 3 | 调用登录 API | `api/auth.ts` |
| 4 | 后端验证返回 Token | 后端服务 |
| 5 | 解析 JWT Token | `utils/jwt.ts` |
| 6 | 存储用户信息和权限 | `stores/user.ts` |
| 7 | 路由跳转 | `router/index.ts` |
| 8 | 路由守卫权限校验 | Router Guard |

---

## 2. 登录流程详解

### 2.1 第一步：用户输入

用户在登录页面输入用户名和密码。

```typescript
// 登录表单数据结构
interface UserLoginDTO {
  username: string;  // 用户名
  password: string;  // 密码
}
```

### 2.2 第二步：前端表单校验

```typescript
// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 16, message: '密码长度为5-16位', trigger: 'blur' }
  ]
}
```

### 2.3 第三步：调用登录 API

```typescript
// 发起登录请求
const res = await loginApi(loginForm)
```

### 2.4 第四步：处理登录响应

```typescript
// 登录响应数据结构
interface UserLoginVO {
  id: string;       // 用户ID
  username: string; // 用户名
  name: string;     // 昵称
  token: string;    // JWT Token
}
```

### 2.5 第五步：解析 JWT Token

```typescript
// JWT 载荷结构
interface JwtPayload {
  userLogin: string;  // JSON字符串，包含用户详细信息
  exp: number;        // Token 过期时间戳
}

// userLogin 解析后的结构
interface UserLoginInfo {
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  password: string;
  permissions: string[];  // 权限列表
  user: {
    createTime: string;
    deleted: number;
    id: number;
    nickname: string;
    password: string;
    status: number;
    updateTime: string;
    username: string;
  };
  username: string;
}
```

### 2.6 第六步：存储用户信息

```typescript
// 存储到 Pinia Store 和 localStorage
this.token = token
this.userInfo = loginData
this.permissions = jwtData.permissions || []

localStorage.setItem('token', token)
localStorage.setItem('userInfo', JSON.stringify(loginData))
localStorage.setItem('permissions', JSON.stringify(this.permissions))
```

### 2.7 第七步：路由跳转

```typescript
// 登录成功后跳转到首页
router.push('/')
```

---

## 3. API 接口文档

### 3.1 登录接口

#### 请求

| 属性 | 值 |
|------|-----|
| **URL** | `POST /api/auth/login` |
| **Content-Type** | `application/json` |
| **需要认证** | 否 |

#### 请求参数

```json
{
  "username": "admin",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 | 校验规则 |
|------|------|------|------|----------|
| username | string | 是 | 用户名 | 3-20位字符 |
| password | string | 是 | 密码 | 5-16位字符 |

#### 响应参数

**成功响应 (200)**

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "id": "1",
    "username": "admin",
    "name": "管理员",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200表示成功 |
| msg | string | 响应消息 |
| data.id | string | 用户ID |
| data.username | string | 用户名 |
| data.name | string | 用户昵称 |
| data.token | string | JWT Token |

**错误响应**

```json
{
  "code": 401,
  "msg": "用户名或密码错误",
  "data": null
}
```

| 错误码 | 说明 |
|--------|------|
| 401 | 用户名或密码错误 |
| 403 | 账户已禁用 |
| 500 | 服务器内部错误 |

---

### 3.2 退出登录接口

#### 请求

| 属性 | 值 |
|------|-----|
| **URL** | `POST /api/auth/logout` |
| **Content-Type** | `application/json` |
| **需要认证** | 是 |

#### 请求头

```
Authorization: <JWT Token>
```

#### 响应参数

**成功响应 (200)**

```json
{
  "code": 200,
  "msg": "退出成功",
  "data": null
}
```

---

## 4. Token 机制

### 4.1 JWT Token 结构

JWT Token 由三部分组成：`Header.Payload.Signature`

#### Header（头部）
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 签名密钥（Signature Key）

> ⚠️ **重要**：JWT 签名密钥由后端配置和保管，前端不应存储或暴露该密钥。

| 配置项 | 说明 |
|--------|------|
| **算法** | HS256 (HMAC-SHA256) |
| **密钥** | 由后端配置，建议长度不少于 256 位（32 字节） |
| **后端配置位置** | 通常在 `application.yml` 或环境变量中配置 |

**后端配置示例（Spring Boot）**：
```yaml
jwt:
  secret: your-256-bit-secret-key-here-must-be-at-least-32-characters
  expiration: 86400000  # Token 过期时间（毫秒），此处为 24 小时
```

**前端说明**：
- 前端使用 `jwt-decode` 库解析 Token 的 Header 和 Payload 部分
- 前端**不验证签名**，签名验证由后端完成
- 前端解析仅用于获取用户信息和权限列表，不涉及安全性验证

#### Payload（载荷）
```json
{
  "userLogin": "{\"accountNonExpired\":true,\"accountNonLocked\":true,\"credentialsNonExpired\":true,\"enabled\":true,\"password\":\"...\",\"permissions\":[\"USER.LIST\",\"USER.ADD\",\"USER.EDIT\",\"USER.DELETE\",\"ROLE.LIST\"],\"user\":{\"createTime\":\"2024-01-01 00:00:00\",\"deleted\":0,\"id\":1,\"nickname\":\"管理员\",\"password\":\"...\",\"status\":1,\"updateTime\":\"2024-01-01 00:00:00\",\"username\":\"admin\"},\"username\":\"admin\"}",
  "exp": 1735171200
}
```

### 4.2 Token 解析函数

```typescript
import { jwtDecode } from 'jwt-decode'

/**
 * 解析JWT token
 * @param token JWT token
 * @returns 解析后的用户信息
 */
export function parseJwtToken(token: string): UserLoginInfo | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const userLogin: UserLoginInfo = JSON.parse(decoded.userLogin)
    return userLogin
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}
```

### 4.3 Token 过期检查

```typescript
/**
 * 检查token是否过期
 * @param token JWT token
 * @returns 是否过期
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch {
    return true
  }
}
```

### 4.4 Token 存储位置

| 存储位置 | Key | 内容 |
|----------|-----|------|
| localStorage | `token` | JWT Token 字符串 |
| localStorage | `userInfo` | 用户基本信息 JSON |
| localStorage | `permissions` | 权限列表 JSON |

---

## 5. 权限校验

### 5.1 权限列表格式

权限以字符串数组形式存储，格式为 `模块.操作`：

```typescript
const permissions = [
  "USER.LIST",      // 用户列表
  "USER.ADD",       // 添加用户
  "USER.EDIT",      // 编辑用户
  "USER.DELETE",    // 删除用户
  "ROLE.LIST",      // 角色列表
  "ROLE.ADD",       // 添加角色
  "PERMISSION.LIST",// 权限列表
  "PROBLEM.LIST",   // 题目列表
  "LANGUAGE.LIST"   // 语言列表
]
```

### 5.2 权限校验方法

```typescript
// 在 userStore 中
hasPermission(permission: string): boolean {
  return this.permissions.includes(permission)
}
```

### 5.3 权限指令

#### v-permission（单权限校验）

```vue
<el-button v-permission="'USER.ADD'">添加用户</el-button>
```

#### v-permission-any（满足任一权限）

```vue
<el-button v-permission-any="['USER.ADD', 'USER.EDIT']">操作</el-button>
```

#### v-permission-all（满足所有权限）

```vue
<el-button v-permission-all="['USER.ADD', 'USER.EDIT']">高级操作</el-button>
```

### 5.4 权限指令实现

```typescript
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && !userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

---

## 6. 路由守卫

### 6.1 路由配置

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'HomeFilled' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { 
          title: '用户管理', 
          icon: 'User', 
          permission: 'USER.LIST'  // 需要的权限
        }
      }
      // ... 其他路由
    ]
  }
]
```

### 6.2 路由 Meta 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 页面标题 |
| icon | string | 菜单图标 |
| requiresAuth | boolean | 是否需要认证，默认 true |
| permission | string | 访问该路由所需的权限 |

### 6.3 路由守卫逻辑

```typescript
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 1. 设置页面标题
  document.title = `${to.meta.title || 'EmiyaOJ'} - 管理后台`
  
  // 2. 登录页处理
  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      next('/')  // 已登录，跳转首页
    } else {
      next()     // 未登录，放行
    }
    return
  }
  
  // 3. 认证检查
  if (to.meta.requiresAuth !== false) {
    if (!userStore.isLoggedIn) {
      next('/login')  // 未登录，跳转登录页
      return
    }
    
    // 4. 权限检查
    if (to.meta.permission) {
      if (!userStore.hasPermission(to.meta.permission as string)) {
        next('/403')  // 无权限，跳转403页面
        return
      }
    }
  }
  
  next()  // 放行
})
```

### 6.4 路由守卫流程图

```
                              ┌─────────────────┐
                              │    路由跳转      │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  设置页面标题    │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                          ┌───│  是否为登录页?   │───┐
                          │   └─────────────────┘   │
                         是                         否
                          │                         │
                ┌─────────▼─────────┐     ┌────────▼────────┐
                │   用户已登录?      │     │  需要认证?       │
                └─────────┬─────────┘     └────────┬────────┘
                    ┌─────┴─────┐               ┌──┴──┐
                   是           否              否    是
                    │           │               │     │
            ┌───────▼───┐ ┌────▼────┐  ┌───────▼───┐ │
            │ 跳转首页   │ │  放行    │  │   放行    │ │
            └───────────┘ └─────────┘  └───────────┘ │
                                                     │
                                            ┌────────▼────────┐
                                            │   用户已登录?    │
                                            └────────┬────────┘
                                                 ┌───┴───┐
                                                否       是
                                                 │       │
                                        ┌────────▼──┐ ┌──▼─────────┐
                                        │ 跳转登录页 │ │ 有权限要求? │
                                        └───────────┘ └──┬─────────┘
                                                      ┌──┴──┐
                                                     否     是
                                                      │     │
                                               ┌──────▼──┐  │
                                               │  放行   │  │
                                               └─────────┘  │
                                                           │
                                                  ┌────────▼────────┐
                                                  │   权限校验通过?  │
                                                  └────────┬────────┘
                                                       ┌───┴───┐
                                                      是       否
                                                       │       │
                                                ┌──────▼──┐ ┌──▼──────┐
                                                │  放行   │ │ 跳转403 │
                                                └─────────┘ └─────────┘
```

---

## 7. 数据存储

### 7.1 Pinia Store 状态

```typescript
interface UserState {
  userInfo: UserLoginVO | null;  // 用户基本信息
  token: string;                  // JWT Token
  permissions: string[];          // 权限列表
  menuTree: PermissionVO[];       // 菜单树（如有）
}
```

### 7.2 localStorage 数据

| Key | 类型 | 说明 |
|-----|------|------|
| `token` | string | JWT Token |
| `userInfo` | JSON string | 用户信息对象 |
| `permissions` | JSON string | 权限数组 |
| `menuTree` | JSON string | 菜单树结构 |

### 7.3 恢复用户信息

```typescript
// 从 localStorage 恢复用户信息（页面刷新时调用）
restoreUserInfo() {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  const permissions = localStorage.getItem('permissions')

  if (token) {
    // 检查token是否过期
    if (isTokenExpired(token)) {
      console.warn('Token已过期，清除用户信息')
      this.clearUserInfo()
      return
    }
    
    this.token = token
    
    // 如果没有缓存的权限信息，尝试从JWT解析
    if (!permissions) {
      const jwtData = parseJwtToken(token)
      if (jwtData) {
        this.permissions = jwtData.permissions || []
        localStorage.setItem('permissions', JSON.stringify(this.permissions))
      }
    }
  }
  
  if (userInfo) this.userInfo = JSON.parse(userInfo)
  if (permissions) this.permissions = JSON.parse(permissions)
}
```

---

## 8. 错误处理

### 8.1 请求拦截器

```typescript
// 请求发送前检查 Token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      // 检查token是否过期
      if (isTokenExpired(token)) {
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
        localStorage.removeItem('menuTree')
        
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return Promise.reject(new Error('Token已过期'))
      }
      
      // 添加 Token 到请求头
      if (config.headers) {
        config.headers.Authorization = token
      }
    }
    return config
  }
)
```

### 8.2 响应拦截器

```typescript
// 响应错误处理
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 401: 未授权，跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    
    return res
  },
  (error: any) => {
    // HTTP 错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.msg || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)
```

### 8.3 错误码对照表

| HTTP 状态码 | 业务码 | 说明 | 处理方式 |
|-------------|--------|------|----------|
| 200 | 200 | 成功 | 正常处理 |
| 200 | 401 | 未授权/登录失效 | 跳转登录页 |
| 200 | 403 | 权限不足 | 显示错误提示 |
| 401 | - | 未授权 | 清除Token，跳转登录页 |
| 403 | - | 禁止访问 | 显示权限不足提示 |
| 404 | - | 资源不存在 | 显示资源不存在提示 |
| 500 | - | 服务器错误 | 显示服务器错误提示 |

---

## 9. 完整示例代码

### 9.1 登录流程完整代码

```typescript
// 1. 登录表单提交
const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 2. Store 中的登录方法
async login(loginForm: UserLoginDTO) {
  try {
    // 调用登录API
    const res = await loginApi(loginForm)
    const loginData = res.data as unknown as UserLoginVO
    const { token } = loginData
    
    // 保存到状态
    this.token = token
    this.userInfo = loginData
    
    // 保存到 localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(loginData))
    
    // 从 JWT 解析权限信息
    const jwtData = parseJwtToken(token)
    if (jwtData) {
      this.permissions = jwtData.permissions || []
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
    }
    
    return res
  } catch (error) {
    return Promise.reject(error)
  }
}
```

### 9.2 退出登录完整代码

```typescript
async logout() {
  try {
    // 调用退出API（通知后端）
    await logoutApi()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 无论成功失败，都清除本地状态
    this.clearUserInfo()
    router.push('/login')
  }
}

clearUserInfo() {
  this.token = ''
  this.userInfo = null
  this.permissions = []
  this.menuTree = []
  
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('permissions')
  localStorage.removeItem('menuTree')
}
```

### 9.3 权限校验使用示例

```vue
<template>
  <div>
    <!-- 按钮级权限控制 -->
    <el-button v-permission="'USER.ADD'" type="primary">添加用户</el-button>
    <el-button v-permission="'USER.DELETE'" type="danger">删除用户</el-button>
    
    <!-- 程序化权限判断 -->
    <el-button v-if="hasPermission('USER.EDIT')">编辑用户</el-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const hasPermission = (permission: string) => {
  return userStore.hasPermission(permission)
}
</script>
```

---

## 10. 安全建议

### 10.1 Token 安全

1. **Token 存储**：Token 存储在 localStorage 中，注意 XSS 攻击风险
2. **Token 过期**：前端会检查 Token 过期时间，过期后自动清除并跳转登录
3. **Token 传输**：Token 通过 `Authorization` 请求头传递

### 10.2 权限安全

1. **前端权限仅用于UI控制**：真正的权限校验必须在后端实现
2. **API 调用时后端需再次校验权限**
3. **敏感操作需要二次确认**

### 10.3 最佳实践

1. 定期刷新 Token（如实现 Refresh Token 机制）
2. 敏感操作使用 HTTPS
3. 密码传输前进行加密
4. 实现登录失败次数限制

---

## 附录 A：类型定义

```typescript
// 通用响应结构
interface ResponseResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 登录请求
interface UserLoginDTO {
  username: string;
  password: string;
}

// 登录响应
interface UserLoginVO {
  id: string;
  username: string;
  name: string;
  token: string;
}

// JWT 载荷
interface JwtPayload {
  userLogin: string;  // JSON字符串
  exp: number;
}

// 用户详细信息（从JWT解析）
interface UserLoginInfo {
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  password: string;
  permissions: string[];
  user: {
    createTime: string;
    deleted: number;
    id: number;
    nickname: string;
    password: string;
    status: number;
    updateTime: string;
    username: string;
  };
  username: string;
}
```

---

## 附录 B：权限码列表

| 模块 | 权限码 | 说明 |
|------|--------|------|
| 用户管理 | USER.LIST | 查看用户列表 |
| 用户管理 | USER.ADD | 添加用户 |
| 用户管理 | USER.EDIT | 编辑用户 |
| 用户管理 | USER.DELETE | 删除用户 |
| 角色管理 | ROLE.LIST | 查看角色列表 |
| 角色管理 | ROLE.ADD | 添加角色 |
| 角色管理 | ROLE.EDIT | 编辑角色 |
| 角色管理 | ROLE.DELETE | 删除角色 |
| 权限管理 | PERMISSION.LIST | 查看权限列表 |
| 题目管理 | PROBLEM.LIST | 查看题目列表 |
| 语言管理 | LANGUAGE.LIST | 查看语言列表 |

---

*文档版本：v1.0*  
*最后更新：2025年12月9日*
