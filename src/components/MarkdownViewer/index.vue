<!-- src/components/MarkdownViewer/index.vue -->
<template>
  <div class="markdown-viewer" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {}
    }
    return ''
  }
})

const renderedContent = computed(() => {
  return md.render(props.content)
})
</script>

<style scoped lang="scss">
.markdown-viewer {
  line-height: 1.6;
  color: #333;

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
}
</style>
