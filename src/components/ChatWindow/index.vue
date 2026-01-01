<!-- src/components/ChatWindow/index.vue -->
<template>
  <el-drawer
    v-model="visible"
    title="OJ编程助手"
    :size="drawerSize"
    direction="rtl"
    :before-close="handleClose"
  >
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-item', message.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-header">
            <el-icon v-if="message.role === 'user'">
              <User />
            </el-icon>
            <el-icon v-else>
              <ChatDotRound />
            </el-icon>
            <span class="message-role">{{ message.role === 'user' ? '我' : '助手' }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">
            <MarkdownViewer v-if="message.role === 'assistant'" :content="message.content" />
            <span v-else>{{ message.content }}</span>
          </div>
        </div>
        <div v-if="loading" class="message-item assistant-message">
          <div class="message-header">
            <el-icon><ChatDotRound /></el-icon>
            <span class="message-role">助手</span>
          </div>
          <div class="message-content">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在思考...</span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入你的问题..."
          @keydown.ctrl.enter="handleSend"
          :disabled="loading"
        />
        <div class="input-actions">
          <el-button
            type="primary"
            @click="handleSend"
            :loading="loading"
            :disabled="!inputMessage.trim()"
          >
            发送 (Ctrl+Enter)
          </el-button>
          <el-button @click="handleClear">清空对话</el-button>
          <el-button @click="handleExport">导出对话</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { sendChatMessage } from '@/api/chat'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Props {
  modelValue: boolean
  problemId?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  problemId: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const drawerSize = ref<string | number>('40%')

// 监听 visible 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    scrollToBottom()
  }
})

// 发送消息
const handleSend = async () => {
  if (!inputMessage.value.trim() || loading.value) {
    return
  }

  const userMessage: Message = {
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: Date.now()
  }

  messages.value.push(userMessage)
  const currentInput = inputMessage.value.trim()
  inputMessage.value = ''
  loading.value = true

  scrollToBottom()

  try {
    const response = await sendChatMessage({
      problemId: props.problemId,
      message: currentInput,
      history: messages.value.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    })

    if (response.data) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data,
        timestamp: Date.now()
      }
      messages.value.push(assistantMessage)
    } else {
      ElMessage.error('未收到回复')
    }
  } catch (error) {
    console.error('Send message error:', error)
    ElMessage.error('发送消息失败')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 清空对话
const handleClear = () => {
  messages.value = []
  ElMessage.info('对话已清空')
}

// 导出对话
const handleExport = () => {
  if (messages.value.length === 0) {
    ElMessage.warning('没有对话记录可导出')
    return
  }

  const content = messages.value.map(msg => {
    const role = msg.role === 'user' ? '我' : '助手'
    const time = formatTime(msg.timestamp)
    return `[${time}] ${role}:\n${msg.content}\n`
  }).join('\n---\n\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `对话记录_${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('对话记录已导出')
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 400px;
  max-height: calc(100vh - 300px);

  .message-item {
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease-in;

    &.user-message {
      text-align: right;

      .message-content {
        background-color: #409eff;
        color: white;
        margin-left: 60px;
      }
    }

    &.assistant-message {
      text-align: left;

      .message-content {
        background-color: #f5f7fa;
        color: #303133;
        margin-right: 60px;
      }
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #909399;

      .message-role {
        font-weight: 600;
      }

      .message-time {
        margin-left: auto;
      }
    }

    .message-content {
      display: inline-block;
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 80%;
      word-wrap: break-word;
      white-space: pre-wrap;
      text-align: left;

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: inherit;
      }
    }
  }
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;

  .input-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: flex-end;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

