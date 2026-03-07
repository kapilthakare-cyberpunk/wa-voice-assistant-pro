export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  provider: string
  latencyMs: number
  lastCheck: string
  uptime: number
  details: {
    model?: string
    tokensUsed?: {
      prompt: number
      completion: number
      total: number
    }
    responseTime?: number
    error?: string
  }
}

export interface Metric {
  id: string
  timestamp: string
  provider: string
  responseTimeMs: number
  tokensUsed: number
  success: number
  errorMessage: string | null
}

export interface Conversation {
  id: string
  userId: string
  provider: string
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  tokensUsed: {
    prompt: number
    completion: number
    total: number
  }
  createdAt: string
  updatedAt: string
  metadata: any
}

export interface WhatsAppStatus {
  connected: boolean
  status: string
  phoneNumber?: string
  battery?: number
}
