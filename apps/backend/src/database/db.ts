import Database from 'better-sqlite3';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import path from 'path';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = config.DATABASE_URL.replace('file:', '');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        messages TEXT NOT NULL,
        tokensUsed TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        metadata TEXT,
        INDEX idx_userId (userId),
        INDEX idx_createdAt (createdAt)
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        responseTimeMs INTEGER NOT NULL,
        tokensUsed INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        errorMessage TEXT,
        INDEX idx_timestamp (timestamp),
        INDEX idx_provider (provider)
      );

      CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        latencyMs INTEGER,
        errorMessage TEXT,
        INDEX idx_timestamp (timestamp)
      );
    `);

    logger.info('Database initialized');
  }

  saveConversation(conversation: any) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (
        id, userId, provider, model, messages, tokensUsed, createdAt, updatedAt, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      conversation.id,
      conversation.userId,
      conversation.provider,
      conversation.model,
      JSON.stringify(conversation.messages),
      JSON.stringify(conversation.tokensUsed),
      conversation.createdAt.toISOString(),
      conversation.updatedAt.toISOString(),
      JSON.stringify(conversation.metadata)
    );
  }

  saveMetrics(metrics: any) {
    const stmt = this.db.prepare(`
      INSERT INTO metrics (
        id, timestamp, provider, responseTimeMs, tokensUsed, success, errorMessage
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      metrics.id,
      metrics.timestamp.toISOString(),
      metrics.provider,
      metrics.responseTimeMs,
      metrics.tokensUsed,
      metrics.success ? 1 : 0,
      metrics.errorMessage
    );
  }

  getConversations(userId: string, limit: number = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit).map((row: any) => ({
      ...row,
      messages: JSON.parse(row.messages),
      tokensUsed: JSON.parse(row.tokensUsed),
    }));
  }

  getMetrics(provider?: string, hours: number = 24) {
    const where = provider ? 'WHERE provider = ?' : '';
    const params = provider ? [provider] : [];

    const stmt = this.db.prepare(`
      SELECT * FROM metrics
      ${where}
      AND timestamp > datetime('now', '-${hours} hours')
      ORDER BY timestamp DESC
    `);

    return stmt.all(...params);
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseManager();