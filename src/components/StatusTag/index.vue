<!-- src/components/StatusTag/index.vue -->
<template>
  <el-tag :type="statusType" :size="size">
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status?: string | number
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  status: '',
  size: 'default'
})

// 字符串状态映射（来自接口）
const statusConfigMap: Record<string, { text: string; type: string }> = {
  'Pending': { text: '等待中', type: 'info' },
  'Judging': { text: '判题中', type: 'info' },
  'Accepted': { text: '通过', type: 'success' },
  'Wrong Answer': { text: '答案错误', type: 'danger' },
  'Time Limit Exceeded': { text: '超时', type: 'danger' },
  'Memory Limit Exceeded': { text: '内存超限', type: 'danger' },
  'Runtime Error': { text: '运行错误', type: 'danger' },
  'Compile Error': { text: '编译错误', type: 'warning' },
  'System Error': { text: '系统错误', type: 'danger' }
}

// 数字状态配置（向后兼容）
const statusConfigArray = [
  { text: '判题中', type: 'info' },
  { text: '编译错误', type: 'warning' },
  { text: '答案正确', type: 'success' },
  { text: '答案错误', type: 'danger' },
  { text: '超时', type: 'danger' },
  { text: '内存超限', type: 'danger' },
  { text: '运行错误', type: 'danger' },
  { text: '系统错误', type: 'danger' }
]

const statusText = computed(() => {
  if (typeof props.status === 'string') {
    return statusConfigMap[props.status]?.text || props.status
  } else if (typeof props.status === 'number') {
    return statusConfigArray[props.status]?.text || '未知'
  }
  return '未知'
})

const statusType = computed(() => {
  if (typeof props.status === 'string') {
    return statusConfigMap[props.status]?.type as any || 'info'
  } else if (typeof props.status === 'number') {
    return statusConfigArray[props.status]?.type as any || 'info'
  }
  return 'info'
})
</script>
