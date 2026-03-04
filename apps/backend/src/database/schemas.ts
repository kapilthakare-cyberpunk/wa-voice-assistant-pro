import { z } from 'zod';

export const ConversationSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  provider: z.string(),
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.date(),
    })
  ),
  tokensUsed: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

export const MetricsSchema = z.object({
  id: z.string().cuid(),
  timestamp: z.date(),
  provider: z.string(),
  responseTimeMs: z.number(),
  tokensUsed: z.number(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;