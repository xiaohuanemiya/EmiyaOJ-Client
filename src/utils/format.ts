/**
 * Format a date string to locale string
 */
export const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN')
}

/**
 * Format pass rate as percentage
 */
export const formatPassRate = (rate: number): string => {
  return (rate * 100).toFixed(1) + '%'
}
