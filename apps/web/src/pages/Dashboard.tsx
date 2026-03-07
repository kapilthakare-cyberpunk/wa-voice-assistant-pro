import { useEffect, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import { dashboardApi } from '../lib/api'
import { HealthCard } from '../components/HealthCard'
import { StatCard } from '../components/StatCard'
import { MetricsChart } from '../components/MetricsChart'
import { WhatsAppStatusCard } from '../components/WhatsAppStatusCard'
import { Activity, Zap, MessageSquare, Clock } from 'lucide-react'

export default function Dashboard() {
  const { 
    health, 
    metrics, 
    whatsappStatus,
    setHealth, 
    setMetrics, 
    setWhatsAppStatus 
  } = useDashboardStore()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [healthData, metricsData, whatsappData] = await Promise.all([
        dashboardApi.getHealth(),
        dashboardApi.getMetrics(),
        dashboardApi.getWhatsAppStatus().catch(() => null),
      ])
      
      setHealth(healthData)
      setMetrics(metricsData.metrics)
      if (whatsappData) setWhatsAppStatus(whatsappData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleConnectMCP = async () => {
    setIsConnecting(true)
    try {
      await dashboardApi.connectMCP()
      await fetchData()
    } catch (error) {
      console.error('Failed to connect MCP:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const totalTokens = metrics.reduce((sum, m) => sum + m.tokensUsed, 0)
  const avgResponseTime = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / metrics.length)
    : 0
  const successRate = metrics.length > 0
    ? Math.round((metrics.filter(m => m.success).length / metrics.length) * 100)
    : 100

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
        <p className="text-text-muted">
          Real-time monitoring and analytics
          <span className="ml-2 text-xs">
            • Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          change="-12%"
          trend="up"
          icon="time"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          change="+2.4%"
          trend="up"
          icon="trend"
        />
        <StatCard
          title="Total Tokens"
          value={totalTokens.toLocaleString()}
          change="+18%"
          trend="up"
          icon="messages"
        />
        <StatCard
          title="API Calls"
          value={metrics.length}
          change="+5%"
          trend="up"
          icon="users"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Card */}
        <div className="lg:col-span-1">
          {health ? (
            <HealthCard health={health} />
          ) : (
            <div className="glass rounded-2xl p-6 border border-border/50 animate-pulse">
              <div className="h-32 bg-surface rounded-lg" />
            </div>
          )}
        </div>

        {/* WhatsApp Status */}
        <div className="lg:col-span-1">
          <WhatsAppStatusCard
            status={whatsappStatus}
            isLoading={isConnecting}
            onConnect={handleConnectMCP}
          />
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 border border-border/50 h-full">
            <h3 className="text-lg font-semibold text-text mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-text-muted">LLM Provider</span>
                </div>
                <span className="text-text font-medium capitalize">
                  {health?.provider || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  <span className="text-text-muted">Model</span>
                </div>
                <span className="text-text font-medium">
                  {health?.details.model || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-success" />
                  <span className="text-text-muted">Uptime</span>
                </div>
                <span className="text-text font-medium">
                  {health ? formatUptime(health.uptime) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-text-muted">Last Check</span>
                </div>
                <span className="text-text font-medium text-sm">
                  {health ? new Date(health.lastCheck).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Chart */}
      <div className="mb-8">
        {metrics.length > 0 ? (
          <MetricsChart metrics={metrics} title="Response Time (Last 50 Requests)" />
        ) : (
          <div className="glass rounded-2xl p-6 border border-border/50">
            <div className="h-64 flex items-center justify-center">
              <p className="text-text-muted">No metrics data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  return `${hours}h ${minutes % 60}m`
}
