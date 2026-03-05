import { v4 as uuidv4 } from 'uuid';
import { llmClient } from '../llm/unified-llm';
import { logger } from '../utils/logger';
import type { Message } from '../llm/unified-llm';

export class ConversationService {
  async processMessage(userId: string, userMessage: string, context?: any) {
    const startTime = Date.now();

    try {
      logger.info({ userId, messageLength: userMessage.length }, 'Processing user message');

      // Build messages (skip history for now - db issue)
      const messages: Message[] = [
        {
          role: 'system',
          content: 'You are a helpful voice assistant. Be concise and conversational.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // Call LLM
      const response = await llmClient.chat(messages, {
        temperature: 0.7,
        maxTokens: 512,
      });

      const duration = Date.now() - startTime;

      logger.info({ duration, provider: response.provider }, 'Response generated successfully');

      return {
        conversationId: uuidv4(),
        response: response.content,
        duration,
        tokensUsed: response.tokensUsed,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ error: errorMessage, userId }, 'Error processing message');
      throw error;
    }
  }
}

export const conversationService = new ConversationService();
