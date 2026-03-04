import { LLMConfig } from './unified-llm';

// Free API keys - Get these from:
// Groq: https://console.groq.com
// Mistral: https://platform.mistral.ai
// DeepSeek: https://platform.deepseek.com

export const LLM_CONFIGS: Record<string, LLMConfig> = {
  // Fast inference (best for real-time voice)
  groq: {
    provider: 'groq',
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'mixtral-8x7b-32768', // Fast, free tier: 30 req/min, 14.4k/day
  },

  // Privacy-first (European)
  mistral: {
    provider: 'mistral',
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: 'mistral-small', // Free tier: 2 req/min, 1B tokens/month
  },

  // Fully local (no API key needed)
  ollama_mistral: {
    provider: 'ollama',
    model: 'mistral',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },

  // Ultra-lightweight local
  ollama_phi: {
    provider: 'ollama',
    model: 'phi', // ~2.6GB, runs on any machine
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },

  // Cost-effective
  deepseek: {
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
  },
};

export const SELECTED_LLM = process.env.LLM_PROVIDER || 'groq';