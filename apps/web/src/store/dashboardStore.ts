import { create } from 'zustand'
import type { HealthStatus, Metric, Conversation, WhatsAppStatus } from '../types'

interface DashboardState {
  health: HealthStatus | null
  metrics: Metric[]
  conversations: Conversation[]
  whatsappStatus: WhatsAppStatus | null
  isLoading: boolean
  error: string | null
  
  setHealth: (health: HealthStatus) => void
  setMetrics: (metrics: Metric[]) => void
  setConversations: (conversations: Conversation[]) => void
  setWhatsAppStatus: (status: WhatsAppStatus) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchHealth: () => Promise<void>
  fetchMetrics: () => Promise<void>
  fetchWhatsAppStatus: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  health: null,
  metrics: [],
  conversations: [],
  whatsappStatus: null,
  isLoading: false,
  error: null,

  setHealth: (health) => set({ health }),
  setMetrics: (metrics) => set({ metrics }),
  setConversations: (conversations) => set({ conversations }),
  setWhatsAppStatus: (status) => set({ whatsappStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchHealth: async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      set({ health: data })
    } catch (error) {
      set({ error: 'Failed to fetch health status' })
    }
  },

  fetchMetrics: async () => {
    try {
      const response = await fetch('/api/metrics')
      const data = await response.json()
      set({ metrics: data.metrics || [] })
    } catch (error) {
      set({ error: 'Failed to fetch metrics' })
    }
  },

  fetchWhatsAppStatus: async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      const data = await response.json()
      set({ whatsappStatus: data })
    } catch (error) {
      set({ error: 'Failed to fetch WhatsApp status' })
    }
  },
}))
