import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: 'messages' | 'users' | 'time' | 'trend'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, change, icon, trend = 'neutral' }: StatCardProps) {
  const iconConfig = {
    messages: { icon: MessageSquare, color: 'text-primary', bgColor: 'bg-primary/10' },
    users: { icon: Users, color: 'text-secondary', bgColor: 'bg-secondary/10' },
    time: { icon: Clock, color: 'text-accent', bgColor: 'bg-accent/10' },
    trend: { icon: TrendingUp, color: 'text-success', bgColor: 'bg-success/10' },
  }

  const config = iconConfig[icon]
  const Icon = config.icon

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border border-border/50',
      'hover:shadow-glow transition-all duration-300 cursor-pointer'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>
        {change && (
          <span className={cn(
            'text-sm font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'text-success bg-success/10' :
            trend === 'down' ? 'text-error bg-error/10' :
            'text-text-muted bg-surface'
          )}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-text-muted mb-1">{title}</p>
        <p className="text-3xl font-bold text-text">{value}</p>
      </div>
    </div>
  )
}
