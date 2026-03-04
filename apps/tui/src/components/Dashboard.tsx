import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface MetricsData {
  provider: string;
  responseTimeMs: number;
  tokensUsed: number;
  success: boolean;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('http://localhost:3000/api/metrics');
      const data = await res.json();
      setMetrics(data.metrics.slice(0, 10));
      
      const healthRes = await fetch('http://localhost:3000/api/health');
      const healthData = await healthRes.json();
      setHealth(healthData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Text bold color="cyan">
        ⚡ Voice Assistant Dashboard
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text color="green">Provider: {health?.provider || 'N/A'}</Text>
        <Text color={health?.status === 'healthy' ? 'green' : 'red'}>
          Status: {health?.status || 'Unknown'}
        </Text>
        <Text color="yellow">Latency: {health?.latencyMs || 0}ms</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color="blue">
          Recent Requests:
        </Text>
        {metrics.slice(0, 5).map((m, i) => (
          <Text key={i} color={m.success ? 'green' : 'red'}>
            {m.success ? '✓' : '✗'} {m.provider} - {m.responseTimeMs}ms -{' '}
            {m.tokensUsed} tokens
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press 'q' to quit • 'h' for health • 'm' for metrics</Text>
      </Box>
    </Box>
  );
};