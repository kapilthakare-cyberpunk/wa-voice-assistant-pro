import { llmClient } from '../llm/unified-llm';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { db } from '../database/db';
import { v4 as uuidv4 } from 'uuid';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: string;
  latencyMs: number;
  lastCheck: Date;
  uptime: number;
  details: Record<string, any>;
}

class HealthService {
  private lastCheck: Map<string, Date> = new Map();
  private startTime = Date.now();

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Test LLM connection
      const response = await llmClient.chat([
        {
          role: 'user',
          content: 'Say "OK" in one word only.',
        },
      ]);

      const latency = Date.now() - startTime;

      const status: HealthStatus = {
        status: latency < 5000 ? 'healthy' : 'degraded',
        provider: config.LLM_PROVIDER,
        latencyMs: latency,
        lastCheck: new Date(),
        uptime: Date.now() - this.startTime,
        details: {
          model: response.model,
          tokensUsed: response.tokensUsed,
          responseTime: latency,
        },
      };

      // Save health check
      db.saveMetrics({
        id: uuidv4(),
        timestamp: new Date(),
        provider: response.provider,
        responseTimeMs: latency,
        tokensUsed: response.tokensUsed?.total ?? 0,
        success: true,
        errorMessage: null,
      });

      logger.info(status, 'Health check passed');
      return status;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error({ error, latency }, 'Health check failed');

      return {
        status: 'unhealthy',
        provider: config.LLM_PROVIDER,
        latencyMs: latency,
        lastCheck: new Date(),
        uptime: Date.now() - this.startTime,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  getMetrics() {
    return {
      provider: config.LLM_PROVIDER,
      uptime: Date.now() - this.startTime,
      metrics: db.getMetrics(),
    };
  }
}

export const healthService = new HealthService();