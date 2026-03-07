import express from 'express';
import { createServer } from 'http';
import routes from './api/routes';
import mcpRoutes from './api/mcp-routes';
import { setupWebSocket } from './api/websocket';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { db } from './database/db';


const app = express();
const server = createServer(app);

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
      },
      'HTTP Request'
    );
  });

  next();
});

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ============================================
// ROUTES
// ============================================

// Health check (before other routes)
app.get('/health', async (req, res) => {
  try {
    res.json({ status: 'ok', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

// API routes
app.use('/api', routes);

// MCP/WhatsApp routes
app.use('/api', mcpRoutes);


// Static files
app.use(express.static('public'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ============================================
// WEBSOCKET SETUP
// ============================================

setupWebSocket(server);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');

  server.close(() => {
    logger.info('HTTP server closed');
    db.close();
    logger.info('Database closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 30000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ============================================
// ERROR HANDLERS
// ============================================

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// ============================================
// START SERVER
// ============================================

async function start() {
  // Initialize database
  await db.init();

  const PORT = config.PORT;
  const ENV = config.NODE_ENV;

  server.listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        env: ENV,
        provider: config.LLM_PROVIDER,
        database: config.DATABASE_URL,
      },
      `🚀 Server started`
    );

    logger.info(`📊 Dashboard: http://localhost:${PORT}`);
    logger.info(`🔗 API: http://localhost:${PORT}/api`);
    logger.info(`❤️ Health: http://localhost:${PORT}/api/health`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});

export default app;
