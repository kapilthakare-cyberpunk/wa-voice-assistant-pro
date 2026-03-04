import { v4 as uuidv4 } from 'uuid';
import { llmClient } from '../llm/unified-llm';
import { db } from '../database/db';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import type { Message } from '../llm/unified-llm';

export class ConversationService {
  async processMessage(userId: string, userMessage: string, context?: any) {
    const conversationId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info({ userId, messageLength: userMessage.length }, 'Processing user message');

      // Get conversation history
      const history = db.getConversations(userId, 10).reverse();

      // Build messages array
      const messages: Message[] = [
        {
          role: 'system',
          content:
            'You are a helpful voice assistant. Be concise and conversational. Respond in the same language as the user.',
        },
        ...history.flatMap((conv) => conv.messages).slice(-20), // Last 10 turns
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

      // Save conversation
      db.saveConversation({
        id: conversationId,
        userId,
        provider: response.provider,
        model: response.model,
        messages: [
          { role: 'user', content: userMessage, timestamp: new Date() },
          { role: 'assistant', content: response.content, timestamp: new Date() },
        ],
        tokensUsed: response.tokensUsed,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { duration, context },
      });

      // Save metrics
      db.saveMetrics({
        id: uuidv4(),
        timestamp: new Date(),
        provider: response.provider,
        responseTimeMs: duration,
        tokensUsed: response.tokensUsed?.total || 0,
        success: true,
      });

      logger.info({ duration, provider: response.provider }, 'Response generated successfully');

      return {
        conversationId,
        response: response.content,
        duration,
        tokensUsed: response.tokensUsed,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(
        { error: errorMessage, duration, userId },
        'Error processing message'
      );

      // Save error metrics
      db.saveMetrics({
        id: uuidv4(),
        timestamp: new Date(),
        provider: config.LLM_PROVIDER,
        responseTimeMs: duration,
        tokensUsed: 0,
        success: false,
        errorMessage,
      });

      throw error;
    }
  }
}

export const conversationService = new ConversationService();