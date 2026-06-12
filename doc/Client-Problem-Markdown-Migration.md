# 客户端题目 Markdown 展示迁移说明

## 1. 文档目的

题目服务已经支持 Markdown 题面、题目图片和管理端图片缩放。客户端前端需要升级题目展示逻辑，确保普通题目页、竞赛题目页和题单题目页可以一致地渲染：

- 图片
- 表格
- 标题、列表、引用、链接
- 行内代码和代码块
- 行内数学公式 `$...$`
- 块级数学公式 `$$...$$`
- 管理端保存的图片宽度和高度

客户端通常只负责展示，不需要实现管理端的图片上传、删除、下载、编辑工具栏和拖拽控制点。

服务端接口的完整变更见 [Problem-Markdown-Image-API.md](./Problem-Markdown-Image-API.md)。

## 2. 客户端必须完成的改造

### 2.1 使用题目详情接口

打开题目时，应调用题目详情接口获取完整题面：

```http
GET /problem/{id}
```

如果客户端使用了面向用户的同类详情接口，则以客户端现有接口路径为准，但响应中的 Markdown 字段需要按本文方式渲染。

以下字段已经是 Markdown 文本：

| 字段 | 用途 |
| --- | --- |
| `description` | 题目描述 |
| `inputDescription` | 输入描述 |
| `outputDescription` | 输出描述 |
| `hint` | 提示 |

不要将这些字段作为纯文本直接输出，也不要使用字符串拼接生成 HTML。

题目列表接口可能不返回完整图片详情。打开题目页或预览弹窗时，应重新请求详情接口，不要直接复用列表行数据。

### 2.2 统一 Markdown 预览组件

建议新增一个全局可复用的 `MarkdownPreview` 组件，并在所有题面展示位置复用它：

| 页面 | 必须替换的区域 |
| --- | --- |
| 普通题目详情页 | 描述、输入描述、输出描述、提示 |
| 竞赛题目详情页 | 描述、输入描述、输出描述、提示 |
| 题单题目详情页 | 描述、输入描述、输出描述、提示 |
| 搜索结果预览弹窗 | 如客户端存在预览功能，同样替换 |

样例输入和样例输出仍然使用 `<pre>` 展示，不需要按 Markdown 渲染。

## 3. 推荐依赖与静态资源

管理端已经验证以下依赖组合：

```json
{
  "dependencies": {
    "vditor": "^3.11.2"
  },
  "devDependencies": {
    "vite-plugin-static-copy": "^3.1.2"
  }
}
```

在入口文件中引入样式：

```ts
import 'vditor/dist/index.css'
```

不要依赖 `unpkg`、`jsDelivr` 等公网 CDN。建议将 Vditor 资源复制到客户端构建产物中。

Vite 配置示例：

```ts
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/vditor/dist',
          dest: 'vendor/vditor'
        }
      ]
    })
  ]
})
```

预览组件统一使用：

```ts
const VDITOR_CDN = '/vendor/vditor'
```

部署后应确认以下资源可以访问：

```text
/vendor/vditor/dist/js/lute/lute.min.js
/vendor/vditor/dist/js/i18n/zh_CN.js
```

## 4. Markdown 预览组件参考实现

Vue 3 参考实现：

```vue
<template>
  <div ref="previewRef" class="markdown-preview"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import VditorPreview from 'vditor/dist/method'
import { applyProblemImageSizes } from '@/utils/problem-markdown'

const props = withDefaults(defineProps<{
  content?: string
}>(), {
  content: ''
})

const previewRef = ref<HTMLDivElement>()
let renderId = 0

async function renderMarkdown() {
  const target = previewRef.value
  if (!target) return

  const currentRenderId = ++renderId
  await nextTick()
  if (currentRenderId !== renderId || !previewRef.value) return

  await VditorPreview.preview(previewRef.value, props.content || '', {
    mode: 'light',
    cdn: '/vendor/vditor',
    lang: 'zh_CN',
    hljs: {
      enable: true,
      lineNumber: false,
      style: 'github'
    },
    math: {
      engine: 'KaTeX',
      inlineDigit: true
    }
  })

  if (currentRenderId === renderId && previewRef.value) {
    applyProblemImageSizes(previewRef.value)
  }
}

watch(() => props.content, () => {
  void renderMarkdown()
})

onMounted(() => {
  void renderMarkdown()
})
</script>

<style scoped>
.markdown-preview {
  min-width: 0;
  line-height: 1.7;
  word-break: break-word;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-preview :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
</style>
```

注意：

- 保留 Vditor 默认的 XSS 过滤，不要直接使用 `v-html` 渲染原始 Markdown。
- `inlineDigit: true` 必须设置，否则 `$1$` 这类仅包含数字或以数字开头的行内公式可能无法识别。
- 组件应处理异步渲染竞争，避免快速切换题目时旧请求覆盖新内容。
- 表格需要允许横向滚动，避免窄屏溢出。

## 5. 图片尺寸兼容规则

### 5.1 为什么需要额外处理

管理端支持拖动图片边界进行缩放。尺寸信息保存在图片 URL 的 fragment 中，不会改变图片对象存储地址，也不会作为 HTTP 请求参数发送给图片服务器。

示例：

```md
![示意图](https://example.com/problem.png#emiyaoj-width=63&emiyaoj-height=240)
```

约定：

| fragment 字段 | 类型 | 范围 | 含义 |
| --- | --- | --- | --- |
| `emiyaoj-width` | 整数 | `10` 到 `100` | 图片宽度，占容器宽度的百分比 |
| `emiyaoj-height` | 整数 | `10` 到 `10000` | 图片高度，单位为像素 |

字段可以独立存在：

```text
#emiyaoj-width=50
#emiyaoj-height=240
#emiyaoj-width=63&emiyaoj-height=240
```

渲染规则：

| 宽度 | 高度 | 图片样式 |
| --- | --- | --- |
| 不存在 | 不存在 | 使用图片默认尺寸 |
| 存在 | 不存在 | `width: N%; height: auto` |
| 不存在 | 存在 | `width: auto; height: Npx` |
| 存在 | 存在 | `width: N%; height: Npx` |

### 5.2 客户端工具函数参考实现

```ts
const MIN_WIDTH = 10
const MAX_WIDTH = 100
const MIN_HEIGHT = 10
const MAX_HEIGHT = 10000

function getHashNumber(url: string, key: string, min: number, max: number) {
  const hash = url.includes('#') ? url.slice(url.indexOf('#') + 1) : ''
  const part = hash.split('&').find(item => item.startsWith(`${key}=`))
  if (!part) return null

  const value = Number(part.slice(key.length + 1))
  return Number.isInteger(value) && value >= min && value <= max ? value : null
}

export function applyProblemImageSizes(container: ParentNode) {
  container.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src') || ''
    const width = getHashNumber(src, 'emiyaoj-width', MIN_WIDTH, MAX_WIDTH)
    const height = getHashNumber(src, 'emiyaoj-height', MIN_HEIGHT, MAX_HEIGHT)

    if (width !== null) image.style.width = `${width}%`
    if (height !== null) image.style.height = `${height}px`
  })
}
```

图片尺寸函数必须在 Markdown 渲染完成后执行。

CSS 中不要使用 `height: auto !important`，否则会覆盖管理端保存的纵向缩放结果。

### 5.3 向后兼容

- 旧题面没有尺寸 fragment 时，按默认图片尺寸展示。
- fragment 中存在其他字段时，不要删除或覆盖它们。
- 尺寸值非法或超出范围时，忽略该字段。
- 图片 fragment 不影响公开 URL 的请求路径，浏览器请求图片时不会将 `#...` 发送给服务器。

## 6. 图片 URL 与附件数据

题目详情响应中可能包含：

```ts
interface ProblemPictureVO {
  id: string
  problemId: string | null
  url: string
  contentType: string
  size: number
  originalFilename: string
  createTime: string
}

interface ProblemVO {
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  pictures?: ProblemPictureVO[]
}
```

客户端展示题面时，以 Markdown 字段中已经存在的图片 URL 为准。

注意：

- 不要自行拼接 MinIO 或对象存储地址。
- 不要将图片下载接口地址替换到 Markdown 中。
- 后端会在题目详情响应中兼容重写旧 MinIO 地址。
- `pictures` 主要用于管理端附件管理。客户端只渲染题面时不需要依赖它。
- 图片 ID 使用字符串处理，避免 JavaScript 大整数精度问题。

## 7. 数学公式兼容规则

必须支持：

```md
行内公式：$a^2 + b^2 = c^2$

纯数字行内公式：$1$

块级公式：

$$
\frac{a}{b}
$$
```

Vditor 配置：

```ts
math: {
  engine: 'KaTeX',
  inlineDigit: true
}
```

如果客户端使用其他 Markdown 渲染器，也必须验证 `$1$`、`$123 + 456$`、`$$...$$` 可以正常渲染。

## 8. 接口与权限边界

客户端只读题面展示的最小依赖是题目详情接口。以下接口主要供管理端使用：

| 接口 | 用途 | 客户端题面展示是否需要 |
| --- | --- | --- |
| `POST /problem/images` | 上传题目图片 | 否 |
| `GET /problem/images/{id}/download` | 显式下载附件 | 通常不需要 |
| `DELETE /problem/images/{id}` | 删除题目图片 | 否 |
| `POST /problem` | 新增题目 | 否 |
| `PUT /problem` | 更新题目与图片绑定 | 否 |

图片公开 URL 可以直接用于题面展示。如果对象存储与客户端域名不同，需要确认部署环境允许加载该图片域名。

## 9. 推荐改造顺序

1. 安装 `vditor@3.11.2` 和 `vite-plugin-static-copy@3.1.2`。
2. 配置 `/vendor/vditor/dist/**` 自托管静态资源。
3. 新增统一的 `MarkdownPreview` 组件。
4. 增加图片 fragment 尺寸解析函数，并在每次 Markdown 渲染后执行。
5. 替换普通题目、竞赛题目和题单题目的纯文本展示逻辑。
6. 确保打开题目时请求详情接口，不直接复用列表行。
7. 在开发环境和生产构建产物中执行验收。

## 10. 验收清单

### Markdown 元素

- [ ] 标题、加粗、斜体、删除线正常显示。
- [ ] 无序列表、有序列表、引用、链接正常显示。
- [ ] 行内代码与代码块正常显示。
- [ ] 表格在桌面端正常显示，在窄屏可以横向滚动。

### 数学公式

- [ ] `$a + b$` 正常渲染。
- [ ] `$1$` 正常渲染。
- [ ] `$123 + 456$` 正常渲染。
- [ ] `$$\frac{a}{b}$$` 正常渲染。

### 图片

- [ ] 普通 Markdown 图片正常显示。
- [ ] 带 `#emiyaoj-width=50` 的图片显示为容器宽度的 `50%`。
- [ ] 带 `#emiyaoj-height=240` 的图片显示为 `240px` 高。
- [ ] 带宽高双参数的图片同时应用宽度和高度。
- [ ] 非法 fragment 不导致页面报错。
- [ ] 图片最大宽度不超过题面容器。
- [ ] 浏览器请求图片时没有将 `#emiyaoj-*` fragment 发送到对象存储服务。

### 页面与部署

- [ ] 普通题目详情页渲染正确。
- [ ] 竞赛题目详情页渲染正确。
- [ ] 题单题目详情页渲染正确。
- [ ] 快速切换题目时不会出现旧题面覆盖新题面。
- [ ] 生产构建产物包含 `/vendor/vditor/dist/**`。
- [ ] 浏览器没有请求 `unpkg` 或 `jsDelivr`。

## 11. 管理端参考实现位置

客户端前端如果需要直接移植代码，可以参考管理端：

| 文件 | 内容 |
| --- | --- |
| `src/components/MarkdownPreview.vue` | Markdown 统一预览组件 |
| `src/utils/markdown.ts` | 数学公式配置、图片尺寸解析与应用 |
| `src/components/ProblemMarkdownEditor.vue` | 管理端编辑器、浮动快捷栏和图片拖拽缩放 |
| `vite.config.ts` | Vditor 静态资源复制配置 |
| `scripts/check-markdown-image-resize.cjs` | 图片尺寸回归用例 |
| `scripts/check-markdown-math.cjs` | 公式回归用例 |

