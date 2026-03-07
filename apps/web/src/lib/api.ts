import { api } from '../lib/api'
import type { HealthStatus, Metric, Conversation, WhatsAppStatus } from '../types'

export const dashboardApi = {
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch('/api/health')
    if (!response.ok) throw new Error('Failed to fetch health')
    return response.json()
  },

  async getMetrics(hours: number = 24): Promise<{ provider: string; uptime: number; metrics: Metric[] }> {
    const response = await fetch(`/api/metrics?hours=${hours}`)
    if (!response.ok) throw new Error('Failed to fetch metrics')
    return response.json()
  },

  async getConversations(userId: string, limit: number = 50): Promise<Conversation[]> {
    const response = await fetch(`/api/conversations/${userId}?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch conversations')
    return response.json()
  },

  async getWhatsAppStatus(): Promise<WhatsAppStatus> {
    const response = await fetch('/api/whatsapp/status')
    if (!response.ok) throw new Error('Failed to fetch WhatsApp status')
    return response.json()
  },

  async connectMCP(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/mcp/connect', { method: 'POST' })
    if (!response.ok) throw new Error('Failed to connect MCP')
    return response.json()
  },

  async getWhatsAppTools(): Promise<{ tools: any[] }> {
    const response = await fetch('/api/whatsapp/tools')
    if (!response.ok) throw new Error('Failed to fetch WhatsApp tools')
    return response.json()
  },
}
