<template>
  <div class="markdown-editor" @paste="handlePaste" @drop.prevent="handleDrop" @dragover.prevent>
    <div class="editor-toolbar">
      <el-button-group>
        <el-button :type="isActive('bold') ? 'primary' : 'default'" @click="runCommand('bold')">
          B
        </el-button>
        <el-button :type="isActive('italic') ? 'primary' : 'default'" @click="runCommand('italic')">
          I
        </el-button>
        <el-button :type="isActive('underline') ? 'primary' : 'default'" @click="runCommand('underline')">
          U
        </el-button>
        <el-button :type="isActive('strike') ? 'primary' : 'default'" @click="runCommand('strike')">
          S
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="setHeading(2)">H2</el-button>
        <el-button @click="setHeading(3)">H3</el-button>
        <el-button :type="isActive('bulletList') ? 'primary' : 'default'" @click="runCommand('bulletList')">
          列表
        </el-button>
        <el-button :type="isActive('orderedList') ? 'primary' : 'default'" @click="runCommand('orderedList')">
          编号
        </el-button>
        <el-button :type="isActive('taskList') ? 'primary' : 'default'" @click="runCommand('taskList')">
          待办
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button :type="isActive('blockquote') ? 'primary' : 'default'" @click="runCommand('blockquote')">
          引用
        </el-button>
        <el-button :type="isActive('codeBlock') ? 'primary' : 'default'" @click="runCommand('codeBlock')">
          代码块
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button :icon="Picture" :loading="uploading" @click="openFilePicker">
          图片
        </el-button>
        <el-button :icon="Grid" @click="insertTable">表格</el-button>
        <el-button @click="openMathDialog('inline')">行内公式</el-button>
        <el-button @click="openMathDialog('block')">公式块</el-button>
      </el-button-group>

      <el-button-group>
        <el-button :icon="RefreshLeft" @click="editor?.chain().focus().undo().run()" />
        <el-button :icon="RefreshRight" @click="editor?.chain().focus().redo().run()" />
      </el-button-group>
    </div>

    <div
      ref="editorShellRef"
      class="editor-shell"
      @mousemove="handleEditorMouseMove"
      @mouseleave="hideTableTools"
    >
      <EditorContent v-if="editor" :editor="editor" class="editor-content" />
      <div
        v-if="showTableTools"
        class="table-hover-tools"
        :style="tableToolsStyle"
        @mousemove.stop
        @mouseenter="showTableTools = true"
      >
        <el-button-group>
          <el-tooltip content="下方插入行" placement="top">
            <el-button :icon="Bottom" @mousedown.prevent="runTableCommand('addRowAfter')" />
          </el-tooltip>
          <el-tooltip content="右侧插入列" placement="top">
            <el-button :icon="Right" @mousedown.prevent="runTableCommand('addColumnAfter')" />
          </el-tooltip>
          <el-tooltip content="删除当前行" placement="top">
            <el-button :icon="Minus" @mousedown.prevent="runTableCommand('deleteRow')" />
          </el-tooltip>
          <el-tooltip content="删除当前列" placement="top">
            <el-button :icon="Close" @mousedown.prevent="runTableCommand('deleteColumn')" />
          </el-tooltip>
          <el-tooltip content="删除表格" placement="top">
            <el-button type="danger" :icon="Delete" @mousedown.prevent="runTableCommand('deleteTable')" />
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <input
      ref="fileInputRef"
      class="file-input"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      @change="handleFileInput"
    />
    <div class="editor-footer">
      <span>{{ markdownLength }} / {{ maxLength }}</span>
    </div>

    <el-dialog
      v-model="mathDialogVisible"
      :title="mathDialogTitle"
      width="640px"
      class="math-dialog-wrapper"
      @closed="resetMathDialog"
    >
      <div class="math-dialog">
        <el-input
          ref="mathInputRef"
          v-model="mathLatex"
          type="textarea"
          :rows="4"
          placeholder="输入 LaTeX，例如：\frac{a}{b} 或 E = mc^2"
        />

        <div class="math-template-list">
          <el-button
            v-for="template in mathTemplates"
            :key="template.label"
            size="small"
            @click="insertMathTemplate(template.value)"
          >
            {{ template.label }}
          </el-button>
        </div>

        <div class="math-preview">
          <div class="math-preview-title">实时预览</div>
          <div class="math-preview-content" v-html="mathPreviewHtml"></div>
        </div>
      </div>

      <template #footer>
        <el-button v-if="editingMath" type="danger" plain @click="deleteMath">删除公式</el-button>
        <el-button @click="mathDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMath">插入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bottom,
  Close,
  Delete,
  Grid,
  Minus,
  Picture,
  RefreshLeft,
  RefreshRight,
  Right
} from '@element-plus/icons-vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Mathematics from '@tiptap/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TableKit } from '@tiptap/extension-table'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import type { JSONContent } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { BlogPicture } from '@/types/blog'
import { useBlogStore } from '@/stores/blog'

interface Props {
  modelValue: string
  placeholder?: string
  maxLength?: number
  uploadedPictures?: BlogPicture[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  maxLength: 10000,
  uploadedPictures: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'image-uploaded': [picture: BlogPicture]
  'image-removed': [pictureId: string]
}>()

const blogStore = useBlogStore()
const editorShellRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()
const mathInputRef = ref<{ textarea?: HTMLTextAreaElement; focus?: () => void }>()
const uploading = ref(false)
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const showTableTools = ref(false)
const hoveredCell = ref<HTMLTableCellElement | null>(null)
const isSettingContent = ref(false)
const mathDialogVisible = ref(false)
const mathMode = ref<'inline' | 'block'>('inline')
const mathLatex = ref('')
const editingMath = ref<{ type: 'inline' | 'block'; pos: number } | null>(null)
const tableToolsStyle = ref({
  top: '10px',
  right: '10px'
})

const katexOptions = {
  throwOnError: false,
  macros: {
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}'
  }
}

const mathTemplates = [
  { label: '分式', value: '\\frac{a}{b}' },
  { label: '根号', value: '\\sqrt{x}' },
  { label: '上标', value: 'x^{2}' },
  { label: '下标', value: 'a_{i}' },
  { label: '求和', value: '\\sum_{i=1}^{n} i' },
  { label: '积分', value: '\\int_{a}^{b} f(x)\\,dx' },
  { label: '极限', value: '\\lim_{x \\to 0} \\frac{\\sin x}{x}' },
  { label: '矩阵', value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
  { label: '实数集', value: '\\mathbb{R}' }
]

const MarkdownImage = Image.extend({
  renderMarkdown: (node: JSONContent) => {
    const attrs = node.attrs || {}
    const src = attrs.src || ''
    const alt = attrs.alt || ''
    const title = attrs.title || ''
    const width = attrs.width
    const height = attrs.height

    if (width || height) {
      const attrText = [
        `src="${escapeHtml(src)}"`,
        alt ? `alt="${escapeHtml(alt)}"` : '',
        title ? `title="${escapeHtml(title)}"` : '',
        width ? `width="${width}"` : '',
        height ? `height="${height}"` : ''
      ].filter(Boolean).join(' ')

      return `<img ${attrText} />`
    }

    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
  }
})

const editor = useEditor({
  content: props.modelValue || '',
  contentType: 'markdown',
  extensions: [
    StarterKit.configure({
      link: false
    }),
    Markdown.configure({
      markedOptions: {
        gfm: true,
        breaks: true
      }
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true
    }),
    Underline,
    TaskList,
    TaskItem.configure({
      nested: true
    }),
    TableKit.configure({
      table: {
        resizable: true,
        cellMinWidth: 90,
        HTMLAttributes: {
          class: 'rich-table'
        }
      },
      tableCell: {},
      tableHeader: {},
      tableRow: {}
    }),
    Mathematics.configure({
      inlineOptions: {
        onClick: (node: ProseMirrorNode, pos: number) => {
          openMathDialog('inline', node.attrs.latex, pos)
        }
      },
      blockOptions: {
        onClick: (node: ProseMirrorNode, pos: number) => {
          openMathDialog('block', node.attrs.latex, pos)
        }
      },
      katexOptions
    }),
    MarkdownImage.configure({
      allowBase64: false,
      HTMLAttributes: {
        class: 'rich-image'
      },
      resize: {
        enabled: true,
        directions: ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'right', 'left'],
        minWidth: 80,
        minHeight: 60,
        alwaysPreserveAspectRatio: true
      }
    }),
    Placeholder.configure({
      placeholder: props.placeholder
    })
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor'
    }
  },
  onUpdate({ editor: activeEditor }) {
    if (isSettingContent.value) return

    const markdown = activeEditor.getMarkdown()
    emit('update:modelValue', markdown)
  }
})

const markdownLength = computed(() => editor.value?.getMarkdown().length || props.modelValue.length)
const mathDialogTitle = computed(() => {
  const prefix = editingMath.value ? '编辑' : '插入'
  return `${prefix}${mathMode.value === 'inline' ? '行内公式' : '公式块'}`
})
const mathPreviewHtml = computed(() => {
  const latex = mathLatex.value.trim()
  if (!latex) return '<span class="math-preview-placeholder">公式预览会显示在这里</span>'

  return katex.renderToString(latex, {
    ...katexOptions,
    displayMode: mathMode.value === 'block'
  })
})

const escapeHtml = (value: string) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const isActive = (name: string, attrs?: Record<string, unknown>) => {
  return editor.value?.isActive(name, attrs) || false
}

const runCommand = (command: 'bold' | 'italic' | 'underline' | 'strike' | 'bulletList' | 'orderedList' | 'taskList' | 'blockquote' | 'codeBlock') => {
  const chain = editor.value?.chain().focus()
  if (!chain) return

  const commands = {
    bold: () => chain.toggleBold().run(),
    italic: () => chain.toggleItalic().run(),
    underline: () => chain.toggleUnderline().run(),
    strike: () => chain.toggleStrike().run(),
    bulletList: () => chain.toggleBulletList().run(),
    orderedList: () => chain.toggleOrderedList().run(),
    taskList: () => chain.toggleTaskList().run(),
    blockquote: () => chain.toggleBlockquote().run(),
    codeBlock: () => chain.toggleCodeBlock().run()
  }

  commands[command]()
}

const setHeading = (level: 2 | 3) => {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}

const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const getSelectionText = () => {
  if (!editor.value) return ''

  const { from, to, empty } = editor.value.state.selection
  return empty ? '' : editor.value.state.doc.textBetween(from, to)
}

const openMathDialog = (mode: 'inline' | 'block', latex = '', pos?: number) => {
  mathMode.value = mode
  mathLatex.value = latex || getSelectionText()
  editingMath.value = typeof pos === 'number' ? { type: mode, pos } : null
  mathDialogVisible.value = true

  requestAnimationFrame(() => {
    mathInputRef.value?.focus?.()
  })
}

const insertMathTemplate = (template: string) => {
  const textarea = mathInputRef.value?.textarea

  if (!textarea) {
    mathLatex.value = `${mathLatex.value}${template}`
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = mathLatex.value.slice(0, start)
  const after = mathLatex.value.slice(end)
  mathLatex.value = `${before}${template}${after}`

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(start + template.length, start + template.length)
  })
}

const confirmMath = () => {
  if (!editor.value) return

  const latex = mathLatex.value.trim()
  if (!latex) {
    ElMessage.warning('请输入公式内容')
    return
  }

  const chain = editor.value.chain().focus()
  if (editingMath.value?.type === 'inline') {
    chain.updateInlineMath({ latex, pos: editingMath.value.pos }).run()
  } else if (editingMath.value?.type === 'block') {
    chain.updateBlockMath({ latex, pos: editingMath.value.pos }).run()
  } else if (mathMode.value === 'inline') {
    chain.insertInlineMath({ latex }).run()
  } else {
    chain.insertBlockMath({ latex }).run()
  }

  mathDialogVisible.value = false
}

const deleteMath = () => {
  if (!editor.value || !editingMath.value) return

  const chain = editor.value.chain().focus()
  if (editingMath.value.type === 'inline') {
    chain.deleteInlineMath({ pos: editingMath.value.pos }).run()
  } else {
    chain.deleteBlockMath({ pos: editingMath.value.pos }).run()
  }

  mathDialogVisible.value = false
}

const resetMathDialog = () => {
  mathLatex.value = ''
  editingMath.value = null
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileInput = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await uploadAndInsertImage(file)
  }
  input.value = ''
}

const handlePaste = async (event: ClipboardEvent) => {
  const file = Array.from(event.clipboardData?.files || []).find((item) => item.type.startsWith('image/'))
  if (!file) return

  event.preventDefault()
  await uploadAndInsertImage(file)
}

const handleDrop = async (event: DragEvent) => {
  const file = Array.from(event.dataTransfer?.files || []).find((item) => item.type.startsWith('image/'))
  if (!file) return

  await uploadAndInsertImage(file)
}

const uploadAndInsertImage = async (file: File) => {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    ElMessage.warning('仅支持 jpg、png、webp、gif 图片')
    return
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    ElMessage.warning('图片大小不能超过 10M')
    return
  }

  uploading.value = true
  try {
    const picture = await blogStore.addImage(file)
    if (!picture) return

    editor.value?.chain().focus().setImage({
      src: picture.url,
      alt: picture.originalFilename,
      title: picture.originalFilename
    }).run()
    emit('image-uploaded', picture)
    ElMessage.success('图片上传成功')
  } finally {
    uploading.value = false
  }
}

const handleEditorMouseMove = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (target?.closest('.table-hover-tools')) return

  const cell = target?.closest('td, th') as HTMLTableCellElement | null
  const table = target?.closest('table')

  if (!table || !editorShellRef.value) {
    showTableTools.value = false
    hoveredCell.value = null
    return
  }

  const tableRect = table.getBoundingClientRect()
  const shellRect = editorShellRef.value.getBoundingClientRect()

  hoveredCell.value = cell
  tableToolsStyle.value = {
    top: `${Math.max(8, tableRect.top - shellRect.top + 8)}px`,
    right: `${Math.max(8, shellRect.right - tableRect.right + 8)}px`
  }
  showTableTools.value = true
}

const hideTableTools = () => {
  showTableTools.value = false
  hoveredCell.value = null
}

const focusHoveredCell = () => {
  if (!editor.value || !hoveredCell.value) return

  try {
    const pos = editor.value.view.posAtDOM(hoveredCell.value, 0)
    if (pos >= 0) {
      editor.value.chain().focus().setTextSelection(pos + 1).run()
    }
  } catch {
    editor.value.chain().focus().run()
  }
}

const runTableCommand = (
  command: 'addRowAfter' | 'addColumnAfter' | 'deleteRow' | 'deleteColumn' | 'deleteTable'
) => {
  if (!editor.value) return

  focusHoveredCell()
  const chain = editor.value.chain().focus()

  const commands = {
    addRowAfter: () => chain.addRowAfter().run(),
    addColumnAfter: () => chain.addColumnAfter().run(),
    deleteRow: () => chain.deleteRow().run(),
    deleteColumn: () => chain.deleteColumn().run(),
    deleteTable: () => chain.deleteTable().run()
  }

  commands[command]()
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === editor.value.getMarkdown()) return

    isSettingContent.value = true
    editor.value.commands.setContent(value || '', { contentType: 'markdown' })
    isSettingContent.value = false
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.markdown-editor {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8fafc;
}

.editor-toolbar :deep(.el-button) {
  min-width: 34px;
}

.editor-shell {
  position: relative;
}

.editor-content {
  min-height: 460px;
}

.editor-content :deep(.tiptap-editor) {
  min-height: 460px;
  padding: 16px;
  line-height: 1.7;
  color: #303133;
  outline: none;
}

.editor-content :deep(.tiptap-editor p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: #a8abb2;
  pointer-events: none;
}

.editor-content :deep(.tiptap-editor img) {
  max-width: 100%;
  height: auto;
}

.editor-content :deep([data-resize-container]) {
  display: inline-flex;
  max-width: 100%;
}

.editor-content :deep([data-resize-wrapper]) {
  outline: 1px solid transparent;
}

.editor-content :deep([data-resize-wrapper]:hover),
.editor-content :deep([data-resize-state='true'] [data-resize-wrapper]) {
  outline-color: #409eff;
}

.editor-content :deep([data-resize-handle]) {
  width: 10px;
  height: 10px;
  border: 1px solid #409eff;
  border-radius: 50%;
  background: #fff;
}

.editor-content :deep(table) {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.editor-content :deep(th),
.editor-content :deep(td) {
  min-width: 90px;
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  vertical-align: top;
}

.editor-content :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.editor-content :deep(td:hover),
.editor-content :deep(th:hover) {
  background: #ecf5ff;
}

.editor-content :deep(.tiptap-mathematics-render) {
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.editor-content :deep(.tiptap-mathematics-render--editable:hover) {
  background: #ecf5ff;
  box-shadow: 0 0 0 1px #409eff inset;
}

.editor-content :deep(.tiptap-mathematics-render[data-type='block-math']) {
  display: block;
  margin: 12px 0;
  padding: 10px;
  overflow-x: auto;
  text-align: center;
}

.editor-content :deep(.inline-math-error),
.editor-content :deep(.block-math-error) {
  color: #f56c6c;
  font-family: 'Courier New', monospace;
}

.table-hover-tools {
  position: absolute;
  z-index: 5;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.file-input {
  display: none;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 6px 10px;
  border-top: 1px solid #e4e7ed;
  color: #909399;
  font-size: 12px;
}

.math-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.math-template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.math-template-list .el-button + .el-button {
  margin-left: 0;
}

.math-preview {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.math-preview-title {
  padding: 8px 10px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8fafc;
  color: #606266;
  font-size: 13px;
}

.math-preview-content {
  min-height: 72px;
  padding: 16px;
  overflow-x: auto;
  color: #303133;
}

.math-preview-placeholder {
  color: #a8abb2;
}
</style>
