// src/utils/format.ts

/**
 * 格式化时间
 */
export const formatTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * 格式化内存
 */
export const formatMemory = (kb: number): string => {
  if (kb < 1024) {
    return `${kb}KB`
  }
  return `${(kb / 1024).toFixed(2)}MB`
}

/**
 * 格式化百分比
 */
export const formatPercentage = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
