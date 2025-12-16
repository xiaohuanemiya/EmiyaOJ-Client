<!-- src/components/StatusTag/index.vue -->
<template>
  <el-tag :type="statusType" :size="size">
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status?: number
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  status: 0,
  size: 'default'
})

const statusConfig = [
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
  return statusConfig[props.status]?.text || '未知'
})

const statusType = computed(() => {
  return statusConfig[props.status]?.type as any || 'info'
})
</script>
