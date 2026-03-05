import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // LLM Config
  LLM_PROVIDER: z.enum(['groq', 'mistral', 'ollama', 'deepseek']).default('groq'),
  GROQ_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  DEEPSEEK_API_KEY: z.string().optional(),

  // WhatsApp
  WHATSAPP_SESSION_PATH: z.string().default('./whatsapp-session'),

  // LiveKit
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  // Database
  DATABASE_URL: z.string().default('file:./data.db'),

  // Redis (for caching & pub/sub)
  REDIS_URL: z.string().optional(),

  // Security
  API_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  ENABLE_METRICS: z.string().default('true'),

  // MCP Configuration
  MCP_TRANSPORT_TYPE: z.enum(['stdio', 'sse']).default('stdio'),
  MCP_COMMAND: z.string().default('npx'),
  MCP_ARGS: z.string().default('wweb-mcp'),
  MCP_SERVER_URL: z.string().default('http://localhost:3002'),
});

export const config = configSchema.parse(process.env);

export type Config = typeof config;
