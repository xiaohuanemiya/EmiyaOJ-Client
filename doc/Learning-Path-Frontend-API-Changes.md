# 个性化学习推荐前端接口变更文档

本文档说明 `Learning-Path-Agent` 个性化学习推荐功能对前端可见的接口与字段变更。

## 1. 变更概览

| 变更类型 | 接口 | 说明 |
| --- | --- | --- |
| 接口新增 | `GET /problem/recommend` | 查询当前登录用户的个性化题目推荐和学习路径 |

推荐由 Problem Service 汇总题库数据与 Judge Service 的用户提交统计后调用 Agent 生成。前端只需要调用 Problem Service 的接口，不要直接调用 `agent-service:9070`。

## 2. 推荐前端流程

1. 用户进入首页、题库页或“为你推荐”模块时，调用 `GET /problem/recommend`。
2. 优先展示 `data.recommendations`，按 `priority` 升序排列。
3. 同时展示 `summary` 和 `learningPath`，作为本轮学习建议。
4. 若 `recommendations` 为空，展示空状态，例如“暂时没有可推荐题目，请先浏览题库或稍后再试”。
5. `source` 为 `LLM` 时表示 Agent 正常生成；`STATIC_FALLBACK` 表示 Agent 不可用或无输出时后端已降级，前端仍可正常展示。

## 3. 个性化推荐接口

### GET `/problem/recommend`

查询当前登录用户的个性化学习推荐。

认证要求：

- 通过网关访问时，前端照常携带 `Authorization`。
- `X-User-Id` 由网关注入，前端不要手动传。

Query 参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `limit` | Integer | 否 | `8` | 推荐题目数量；后端最大限制为 `20` |

请求示例：

```http
GET /problem/recommend?limit=8
Authorization: Bearer <token>
```

响应示例：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 1001,
    "traceId": "4b0c7ac2-5b62-46ad-8c1b-f7c07658d086",
    "source": "LLM",
    "model": "deepseek-v4-pro",
    "generatedAt": "2026-06-17T14:30:00",
    "summary": "根据最近提交记录，建议优先巩固动态规划和图论。",
    "learningPath": [
      "先完成推荐列表前 3 题，记录首个出错原因。",
      "针对同一标签连续练习，直到非 AC 明显减少。",
      "通过率稳定后，再进入更高难度的同标签题目。"
    ],
    "weakTags": ["动态规划", "图论"],
    "targetDifficulty": 2,
    "recommendations": [
      {
        "problemId": 101,
        "title": "最长上升子序列",
        "difficulty": 2,
        "difficultyDesc": "中等",
        "tags": ["动态规划"],
        "acceptRate": 42.50,
        "priority": 1,
        "reason": "这道题适合巩固状态转移设计，难度与当前训练阶段匹配。"
      },
      {
        "problemId": 205,
        "title": "最短路径入门",
        "difficulty": 2,
        "difficultyDesc": "中等",
        "tags": ["图论", "最短路"],
        "acceptRate": 38.20,
        "priority": 2,
        "reason": "近期图论题非 AC 较多，建议通过这题练习基础建模。"
      }
    ]
  }
}
```

注意：统一响应模型通过响应体中的 `code` 表示业务结果。前端应判断 `response.data.code`，不能只依赖 HTTP 状态码。

## 4. 字段说明

### `LearningPathRecommendationVO`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | Long | 当前用户 ID |
| `traceId` | String | 本次推荐链路追踪 ID，用于排查问题 |
| `source` | String | 推荐来源：`LLM` 或 `STATIC_FALLBACK` |
| `model` | String | 使用的模型，当前为 `deepseek-v4-pro` |
| `generatedAt` | String | 生成时间，格式为 `yyyy-MM-ddTHH:mm:ss` |
| `summary` | String | 本轮推荐总结，可展示在推荐模块顶部 |
| `learningPath` | String[] | 学习路径建议，建议按步骤列表展示 |
| `weakTags` | String[] | 后端识别出的薄弱标签，可能为空 |
| `targetDifficulty` | Integer | 推荐难度：`1` 简单，`2` 中等，`3` 困难 |
| `recommendations` | RecommendedProblem[] | 推荐题目列表 |

### `RecommendedProblem`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `problemId` | Long | 题目 ID，跳转题目详情使用 |
| `title` | String | 题目标题 |
| `difficulty` | Integer | 难度：`1` 简单，`2` 中等，`3` 困难 |
| `difficultyDesc` | String | 难度文案 |
| `tags` | String[] | 题目标签 |
| `acceptRate` | Decimal | 通过率百分比，范围通常为 `0` 到 `100` |
| `priority` | Integer | 推荐优先级，数字越小越靠前 |
| `reason` | String | 推荐理由，面向用户展示 |

## 5. 状态与降级处理

| 场景 | 后端表现 | 前端建议 |
| --- | --- | --- |
| Agent 正常生成 | `source = "LLM"` | 正常展示，可标记“AI 推荐” |
| Agent 不可用、超时或无输出 | `source = "STATIC_FALLBACK"` | 正常展示，不需要弹错误 |
| 候选题为空 | `recommendations = []` | 展示空状态 |
| 用户没有提交记录 | `weakTags` 可能为空，优先推荐入门题 | 文案可偏“新手入门” |
| 用户已解决大量题目 | 后端会排除已 AC 题目 | 前端无需二次过滤 |

`traceId` 和 `model` 默认不需要展示给普通用户，可放入开发环境调试信息。

## 6. 展示建议

- 推荐模块标题可用“为你推荐”或“下一步练习”。
- `summary` 建议展示为一段简短说明。
- `learningPath` 建议展示为 2 到 4 条步骤。
- `recommendations` 建议展示题目标题、难度、标签、推荐理由和跳转按钮。
- 点击推荐题目时跳转到现有题目详情页：`/problem/{problemId}`。
- `reason` 是普通文本，不要按可信 HTML 渲染。
- `acceptRate` 建议格式化为百分比，例如 `42.50%`。

## 7. TypeScript 类型参考

```ts
export interface ResponseResult<T> {
  code: number
  message: string
  data: T
}

export interface LearningPathRecommendation {
  userId: number | string
  traceId: string
  source: 'LLM' | 'STATIC_FALLBACK' | string
  model: 'deepseek-v4-pro' | string
  generatedAt: string
  summary: string
  learningPath: string[]
  weakTags: string[]
  targetDifficulty: 1 | 2 | 3 | number
  recommendations: RecommendedProblem[]
}

export interface RecommendedProblem {
  problemId: number | string
  title: string
  difficulty: 1 | 2 | 3 | number
  difficultyDesc: string
  tags: string[]
  acceptRate: number
  priority: number
  reason: string
}
```

JavaScript 的 `number` 无法安全表示所有 64 位 Long。若网关或后端将 ID 序列化为字符串，前端应始终用 `string` 保存 ID，不要对 ID 做数值运算。

## 8. 联调检查清单

- 登录后通过网关调用 `GET /problem/recommend`，确认请求头包含 `Authorization`。
- 确认响应体 `code === 200` 后再读取 `data`。
- `source = STATIC_FALLBACK` 时仍展示推荐，不作为错误处理。
- `recommendations` 为空时展示空状态。
- 点击推荐题目能正确跳转到题目详情。
- 不展示 `traceId`、`model` 等调试信息给普通用户。

