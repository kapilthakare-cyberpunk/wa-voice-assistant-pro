// 1. LLM Provider Abstraction Layer
type LLMProvider = 'groq' | 'mistral' | 'ollama' | 'deepseek';

interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string; // Not needed for Ollama
  model: string;
  baseUrl?: string; // For Ollama: http://localhost:11434
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 2. Unified LLM Interface
class UnifiedLLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async chat(messages: Message[], options?: { temperature?: number }): Promise<string> {
    switch (this.config.provider) {
      case 'groq':
        return this.queryGroq(messages, options);
      case 'mistral':
        return this.queryMistral(messages, options);
      case 'ollama':
        return this.queryOllama(messages, options);
      case 'deepseek':
        return this.queryDeepSeek(messages, options);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  private async queryGroq(messages: Message[], options?: any): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model, // e.g., "mixtral-8x7b-32768"
        messages,
        temperature: options?.temperature || 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async queryMistral(messages: Message[], options?: any): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model, // e.g., "mistral-small"
        messages,
        temperature: options?.temperature || 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async queryOllama(messages: Message[], options?: any): Promise<string> {
    // Ollama uses streaming API
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model, // e.g., "llama2", "mistral", "neural-chat"
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  }

  private async queryDeepSeek(messages: Message[], options?: any): Promise<string> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: options?.temperature || 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export { UnifiedLLMClient, LLMConfig, Message, LLMProvider };