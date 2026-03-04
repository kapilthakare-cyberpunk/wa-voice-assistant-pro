export class VoiceAssistantError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'VoiceAssistantError';
  }
}

export class LLMError extends VoiceAssistantError {
  constructor(message: string, context?: Record<string, any>) {
    super('LLM_ERROR', message, 500, context);
    this.name = 'LLMError';
  }
}

export class WhatsAppError extends VoiceAssistantError {
  constructor(message: string, context?: Record<string, any>) {
    super('WHATSAPP_ERROR', message, 500, context);
    this.name = 'WhatsAppError';
  }
}

export class RateLimitError extends VoiceAssistantError {
  constructor(retryAfter: number) {
    super('RATE_LIMIT', `Rate limit exceeded. Retry after ${retryAfter}s`, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends VoiceAssistantError {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, context);
    this.name = 'ValidationError';
  }
}