// src/api/chat.ts
import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  problemId?: number
  message: string
  history?: ChatMessage[]
}

/**
 * 发送聊天消息
 */
export const sendChatMessage = (
  data: ChatRequest
): Promise<ApiResponse<string>> => {
  return request({
    url: '/client/chat/message',
    method: 'POST',
    data
  })
}

