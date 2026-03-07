import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import type { WhatsAppStatus } from '../types'

interface WhatsAppStatusCardProps {
  status: WhatsAppStatus | null
  isLoading?: boolean
  onConnect?: () => void
}

export function WhatsAppStatusCard({ status, isLoading, onConnect }: WhatsAppStatusCardProps) {
  const isConnected = status?.connected

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border transition-all duration-300',
      isConnected 
        ? 'border-success/30 hover:shadow-glow' 
        : 'border-border/50',
      'cursor-pointer'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            isConnected ? 'bg-success/10' : 'bg-surface'
          )}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
            ) : isConnected ? (
              <Wifi className="w-6 h-6 text-success" />
            ) : (
              <WifiOff className="w-6 h-6 text-text-muted" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">WhatsApp MCP</h3>
            <p className={cn(
              'text-sm font-medium',
              isConnected ? 'text-success' : 'text-text-muted'
            )}>
              {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Status</span>
            <span className="text-text">{status.status}</span>
          </div>
          
          {status.phoneNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Phone</span>
              <span className="text-text font-mono">{status.phoneNumber}</span>
            </div>
          )}
          
          {status.battery !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Battery</span>
              <span className="text-text">{status.battery}%</span>
            </div>
          )}
        </div>
      )}

      {!isConnected && onConnect && (
        <button
          onClick={onConnect}
          disabled={isLoading}
          className={cn(
            'mt-4 w-full py-2 px-4 rounded-lg font-medium',
            'bg-primary hover:bg-primary-dark',
            'text-white transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'cursor-pointer'
          )}
        >
          {isLoading ? 'Connecting...' : 'Connect MCP Server'}
        </button>
      )}
    </div>
  )
}
