<!-- src/components/MarkdownViewer/index.vue -->
<template>
  <div ref="viewerRef" class="markdown-viewer vditor-reset"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import VditorPreview from 'vditor/dist/method'
import 'vditor/dist/index.css'
import 'katex/dist/katex.min.css'
import { applyProblemImageSizes } from '@/utils/problem-markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()
const viewerRef = ref<HTMLDivElement>()
let requestedRenderVersion = 0
let completedRenderVersion = 0
let renderQueue: Promise<void> | null = null

const bindImagePreview = () => {
  if (!viewerRef.value) return

  viewerRef.value.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    img.onclick = () => VditorPreview.previewImage(img, 'zh_CN', 'classic')
  })
}

const runRenderQueue = async () => {
  while (completedRenderVersion < requestedRenderVersion) {
    const currentVersion = requestedRenderVersion
    const content = props.content || ''
    await nextTick()

    if (!viewerRef.value) {
      completedRenderVersion = currentVersion
      continue
    }

    const stagingElement = document.createElement('div')
    try {
      await VditorPreview.preview(stagingElement, content, {
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
        },
        markdown: {
          toc: false,
          mark: true,
          footnotes: true,
          autoSpace: true
        }
      })
    } catch (error) {
      console.error('Failed to render markdown:', error)
      completedRenderVersion = currentVersion
      continue
    }

    completedRenderVersion = currentVersion
    if (!viewerRef.value || currentVersion !== requestedRenderVersion) continue

    viewerRef.value.replaceChildren(...stagingElement.childNodes)
    applyProblemImageSizes(viewerRef.value)
    bindImagePreview()
  }
}

const startRenderQueue = () => {
  if (renderQueue) return

  renderQueue = runRenderQueue().finally(() => {
    renderQueue = null
    if (completedRenderVersion < requestedRenderVersion) {
      startRenderQueue()
    }
  })
}

const renderMarkdown = () => {
  requestedRenderVersion += 1
  startRenderQueue()
}

onMounted(() => {
  renderMarkdown()
})

watch(
  () => props.content,
  () => {
    renderMarkdown()
  }
)
</script>

<style scoped lang="scss">
.markdown-viewer {
  min-width: 0;
  line-height: 1.6;
  color: #333;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
    cursor: zoom-in;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(code) {
    padding: 2px 6px;
    background-color: #f5f7fa;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }

  :deep(pre) {
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    overflow-x: auto;

    code {
      padding: 0;
      background-color: transparent;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 2em;
    margin-bottom: 16px;
  }

  :deep(li) {
    margin-bottom: 8px;
  }

  :deep(table) {
    display: block;
    width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
}
</style>
