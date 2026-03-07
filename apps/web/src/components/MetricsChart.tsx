import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '../lib/utils'
import type { Metric } from '../types'

interface MetricsChartProps {
  metrics: Metric[]
  title?: string
}

export function MetricsChart({ metrics, title }: MetricsChartProps) {
  const chartData = metrics
    .slice(0, 50)
    .map((metric) => ({
      time: new Date(metric.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      responseTime: metric.responseTimeMs,
      tokens: metric.tokensUsed,
    }))
    .reverse()

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border border-border/50',
      'hover:shadow-glow transition-all duration-300'
    )}>
      {title && (
        <h3 className="text-lg font-semibold text-text mb-6">{title}</h3>
      )}
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'ms', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#9CA3AF',
                fontSize: 12
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorResponse)"
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-text-muted">Response Time Trend</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-text-muted">Latency</span>
          </div>
        </div>
      </div>
    </div>
  )
}
