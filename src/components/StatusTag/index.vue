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

// 字符串状态映射（来自接口，向后兼容）
const statusConfigMap: Record<string, { text: string; type: string }> = {
  'Pending': { text: '等待中', type: 'info' },
  'Judging': { text: '判题中', type: 'info' },
  'AC': { text: '答案正确', type: 'success' },
  'CE': { text: '编译错误', type: 'warning' },
  'SE': { text: '系统错误', type: 'danger' },
  'WA': { text: '答案错误', type: 'danger' },
  'TLE': { text: '超时', type: 'danger' },
  'MLE': { text: '内存超限', type: 'danger' },
  'RE': { text: '运行错误', type: 'danger' },
  'OLE': { text: '输出超限', type: 'danger' },
  'PA': { text: '部分通过', type: 'warning' }
}

/**
 * 数字状态配置（按新状态码索引）:
 * 0-Pending, 1-Judging, 2-AC, 3-CE, 4-SE,
 * 5-WA, 6-TLE, 7-MLE, 8-RE, 9-OLE, 10-PA
 */
const statusConfigArray = [
  { text: '等待中', type: 'info' },       // 0 - Pending
  { text: '判题中', type: 'info' },       // 1 - Judging
  { text: '答案正确', type: 'success' },  // 2 - AC
  { text: '编译错误', type: 'warning' },  // 3 - CE
  { text: '系统错误', type: 'danger' },   // 4 - SE
  { text: '答案错误', type: 'danger' },   // 5 - WA
  { text: '超时', type: 'danger' },       // 6 - TLE
  { text: '内存超限', type: 'danger' },   // 7 - MLE
  { text: '运行错误', type: 'danger' },   // 8 - RE
  { text: '输出超限', type: 'danger' },   // 9 - OLE
  { text: '部分通过', type: 'warning' }   // 10 - PA
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
