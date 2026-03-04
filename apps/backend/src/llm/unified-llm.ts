import { logger } from '../utils/logger';
import { LLMError, RateLimitError, ValidationError } from '../utils/errors';
import { retryWithBackoff } from '../utils/retry';
import { config } from '../utils/config';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface LLMResponse {
  content: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  provider: string;
}

interface RateLimitState {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per second
}

export class UnifiedLLMClient {
  private rateLimitState: Map<string, RateLimitState> = new Map();
  private providerClients: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    switch (config.LLM_PROVIDER) {
      case 'groq':
        this.initGroq();
        break;
      case 'mistral':
        this.initMistral();
        break;
      case 'ollama':
        this.initOllama();
        break;
      case 'deepseek':
        this.initDeepSeek();
        break;
    }
  }

  private initGroq() {
    if (!config.GROQ_API_KEY) {
      throw new ValidationError('GROQ_API_KEY is required for Groq provider');
    }

    // Rate limit: 30 req/min = 0.5 req/sec
    this.rateLimitState.set('groq', {
      tokens: 30,
      lastRefill: Date.now(),
      maxTokens: 30,
      refillRate: 0.5,
    });

    logger.info('Groq client initialized');
  }

  private initMistral() {
    if (!config.MISTRAL_API_KEY) {
      throw new ValidationError('MISTRAL_API_KEY is required for Mistral provider');
    }

    // Rate limit: 2 req/min = 0.033 req/sec
    this.rateLimitState.set('mistral', {
      tokens: 2,
      lastRefill: Date.now(),
      maxTokens: 2,
      refillRate: 0.033,
    });

    logger.info('Mistral client initialized');
  }

  private initOllama() {
    // Ollama has no rate limits (local)
    this.rateLimitState.set('ollama', {
      tokens: Number.MAX_SAFE_INTEGER,
      lastRefill: Date.now(),
      maxTokens: Number.MAX_SAFE_INTEGER,
      refillRate: Number.MAX_SAFE_INTEGER,
    });

    logger.info('Ollama client initialized');
  }

  private initDeepSeek() {
    if (!config.DEEPSEEK_API_KEY) {
      throw new ValidationError('DEEPSEEK_API_KEY is required for DeepSeek provider');
    }

    // Rate limit: typically generous
    this.rateLimitState.set('deepseek', {
      tokens: 100,
      lastRefill: Date.now(),
      maxTokens: 100,
      refillRate: 1,
    });

    logger.info('DeepSeek client initialized');
  }

  private checkRateLimit(provider: string): void {
    const state = this.rateLimitState.get(provider);
    if (!state) return;

    const now = Date.now();
    const timePassed = (now - state.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * state.refillRate;

    state.tokens = Math.min(state.maxTokens, state.tokens + tokensToAdd);
    state.lastRefill = now;

    if (state.tokens < 1) {
      const retryAfter = Math.ceil((1 - state.tokens) / state.refillRate);
      throw new RateLimitError(retryAfter);
    }

    state.tokens -= 1;
  }

  async chat(messages: Message[], options: LLMOptions = {}): Promise<LLMResponse> {
    if (!messages.length) {
      throw new ValidationError('Messages array cannot be empty');
    }

    const provider = config.LLM_PROVIDER;

    return retryWithBackoff(
      async () => {
        this.checkRateLimit(provider);

        logger.debug(
          { provider, messageCount: messages.length },
          'Sending request to LLM provider'
        );

        const startTime = Date.now();
        let response: LLMResponse;

        switch (provider) {
          case 'groq':
            response = await this.callGroq(messages, options);
            break;
          case 'mistral':
            response = await this.callMistral(messages, options);
            break;
          case 'ollama':
            response = await this.callOllama(messages, options);
            break;
          case 'deepseek':
            response = await this.callDeepSeek(messages, options);
            break;
          default:
            throw new LLMError(`Unknown provider: ${provider}`);
        }

        const duration = Date.now() - startTime;
        logger.debug(
          {
            provider,
            duration,
            tokensUsed: response.tokensUsed,
          },
          'LLM request completed'
        );

        return response;
      },
      { maxAttempts: 3, timeout: 30000 }
    );
  }

  private async callGroq(messages: Message[], options: LLMOptions): Promise<LLMResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        top_p: options.topP ?? 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        throw new RateLimitError(60);
      }
      throw new LLMError(`Groq API error: ${error.error?.message || 'Unknown error'}`, error);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      model: data.model,
      provider: 'groq',
    };
  }

  private async callMistral(messages: Message[], options: LLMOptions): Promise<LLMResponse> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        top_p: options.topP ?? 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        throw new RateLimitError(60);
      }
      throw new LLMError(`Mistral API error: ${error.message || 'Unknown error'}`, error);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      model: data.model,
      provider: 'mistral',
    };
  }

  private async callOllama(messages: Message[], options: LLMOptions): Promise<LLMResponse> {
    const prompt = this.formatPromptsForOllama(messages);

    const response = await fetch(`${config.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false,
        temperature: options.temperature ?? 0.7,
        top_k: options.topK ?? 40,
        top_p: options.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      throw new LLMError(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.response,
      tokensUsed: {
        prompt: data.prompt_eval_count ?? 0,
        completion: data.eval_count ?? 0,
        total: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      },
      model: data.model,
      provider: 'ollama',
    };
  }

  private async callDeepSeek(messages: Message[], options: LLMOptions): Promise<LLMResponse> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        top_p: options.topP ?? 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        throw new RateLimitError(60);
      }
      throw new LLMError(`DeepSeek API error: ${error.error?.message || 'Unknown error'}`, error);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      model: data.model,
      provider: 'deepseek',
    };
  }

  private formatPromptsForOllama(messages: Message[]): string {
    return messages
      .map((msg) => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        }
        return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      })
      .join('\n\n');
  }
}

export const llmClient = new UnifiedLLMClient();