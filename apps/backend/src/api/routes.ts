import express, { Router, Request, Response } from 'express';
import { conversationService } from '../services/conversation';
import { healthService } from '../services/health';
import { logger } from '../utils/logger';
import { VoiceAssistantError } from '../utils/errors';
import { db } from '../database/db';

const router = Router();

// Middleware
router.use(express.json());

router.use((req, res, next) => {
  logger.debug({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Error handler
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

// Routes
router.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const result = await conversationService.processMessage(userId, message);
    res.json(result);
  })
);

router.get('/health', async (req, res) => {
  const status = await healthService.checkHealth();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});

router.get('/metrics', (req, res) => {
  const metrics = healthService.getMetrics();
  res.json(metrics);
});

router.get('/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const conversations = db.getConversations(userId, limit);
  res.json(conversations);
});

// Global error handler
router.use(
  (
    err: Error | VoiceAssistantError,
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    logger.error({ error: err, path: req.path }, 'API error');

    if (err instanceof VoiceAssistantError) {
      return res.status(err.statusCode).json({
        code: err.code,
        message: err.message,
        context: err.context,
      });
    }

    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    });
  }
);

export default router;
