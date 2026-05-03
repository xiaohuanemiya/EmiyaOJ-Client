<!-- src/components/MarkdownViewer/index.vue -->
<template>
  <div ref="viewerRef" class="markdown-viewer vditor-reset"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import VditorPreview from 'vditor/dist/method'
import 'vditor/dist/index.css'
import 'katex/dist/katex.min.css'

interface Props {
  content: string
}

const props = defineProps<Props>()
const viewerRef = ref<HTMLDivElement>()
let renderVersion = 0

const bindImagePreview = () => {
  if (!viewerRef.value) return

  viewerRef.value.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    img.onclick = () => VditorPreview.previewImage(img, 'zh_CN', 'classic')
  })
}

const renderMarkdown = async () => {
  if (!viewerRef.value) return

  const currentVersion = ++renderVersion
  await nextTick()
  if (!viewerRef.value || currentVersion !== renderVersion) return

  await VditorPreview.preview(viewerRef.value, props.content || '', {
    mode: 'light',
    lang: 'zh_CN',
    hljs: {
      enable: true,
      style: 'github'
    },
    markdown: {
      toc: false,
      mark: true,
      footnotes: true,
      autoSpace: true
    },
    after() {
      bindImagePreview()
    }
  })
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
  line-height: 1.6;
  color: #333;

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
