import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // LLM Config
  LLM_PROVIDER: z.enum(['groq', 'mistral', 'ollama', 'deepseek']).default('groq'),
  GROQ_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  DEEPSEEK_API_KEY: z.string().optional(),

  // WhatsApp
  WHATSAPP_SESSION_PATH: z.string().default('./whatsapp-session'),

  // LiveKit
  LIVEKIT_URL: z.string().url().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  // Database
  DATABASE_URL: z.string().default('file:./data.db'),

  // Redis (for caching & pub/sub)
  REDIS_URL: z.string().url().optional(),

  // Security
  API_KEY: z.string().min(32),
  JWT_SECRET: z.string().min(32),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  ENABLE_METRICS: z.enum(['true', 'false']).default('true'),
});

export const config = configSchema.parse(process.env);

export type Config = typeof config;