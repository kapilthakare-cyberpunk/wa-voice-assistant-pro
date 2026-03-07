import { Activity, Wifi, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import type { HealthStatus } from '../types'

interface HealthCardProps {
  health: HealthStatus
}

export function HealthCard({ health }: HealthCardProps) {
  const statusConfig = {
    healthy: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      icon: CheckCircle,
      label: 'Healthy',
    },
    degraded: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      icon: AlertCircle,
      label: 'Degraded',
    },
    unhealthy: {
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
      icon: AlertCircle,
      label: 'Unhealthy',
    },
  }

  const config = statusConfig[health.status]
  const Icon = config.icon

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border transition-all duration-300',
      config.borderColor,
      'hover:shadow-glow cursor-pointer'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <Icon className={cn('w-6 h-6', config.color)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">System Health</h3>
            <p className={cn('text-sm font-medium', config.color)}>{config.label}</p>
          </div>
        </div>
        <Activity className={cn('w-8 h-8', config.color, 'opacity-50')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-text-muted">Provider</p>
          <p className="text-base font-semibold text-text">{health.provider}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-text-muted">Latency</p>
          <p className={cn(
            'text-base font-semibold',
            health.latencyMs < 500 ? 'text-success' : 'text-warning'
          )}>{health.latencyMs}ms</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-text-muted">Model</p>
          <p className="text-sm text-text truncate">{health.details.model || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-text-muted">Uptime</p>
          <p className="text-sm text-text">{formatUptime(health.uptime)}</p>
        </div>
      </div>

      {health.details.tokensUsed && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Tokens Used</span>
            <span className="text-text font-mono">{health.details.tokensUsed.total.toLocaleString()}</span>
          </div>
        </div>
      )}
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
