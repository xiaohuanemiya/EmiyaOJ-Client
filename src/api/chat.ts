// src/api/chat.ts
import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  problemId?: string
  message: string
  history?: ChatMessage[]
}

/**
 * 发送消息给 AI 助手
 * POST /client/chat/send
 */
export const sendChatMessage = (
  data: ChatRequest
): Promise<ApiResponse<string>> => {
  return request({
    url: '/client/chat/send',
    method: 'POST',
    data
  })
}
