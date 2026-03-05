import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import path from 'path';
import fs from 'fs';

class DatabaseManager {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = config.DATABASE_URL.replace('file:', '');
  }

  async init(): Promise<void> {
    const SQL = await initSqlJs();
    
    // Load existing database if it exists
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
      logger.info('Loaded existing database');
    } else {
      this.db = new SQL.Database();
      logger.info('Created new database');
    }

    this.createTables();
    this.save();
    logger.info('Database initialized');
  }

  private createTables() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        messages TEXT NOT NULL,
        tokensUsed TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        metadata TEXT
      )
    `);

    this.db.run(`CREATE INDEX IF NOT EXISTS idx_userId ON conversations(userId)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_createdAt ON conversations(createdAt)`);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        responseTimeMs INTEGER NOT NULL,
        tokensUsed INTEGER NOT NULL,
        success INTEGER NOT NULL,
        errorMessage TEXT
      )
    `);

    this.db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON metrics(timestamp)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_provider ON metrics(provider)`);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        latencyMs INTEGER,
        errorMessage TEXT
      )
    `);

    this.db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON health_checks(timestamp)`);
  }

  private save() {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.dbPath, buffer);
  }

  saveConversation(conversation: any) {
    if (!this.db) return;

    this.db.run(
      `INSERT INTO conversations (id, userId, provider, model, messages, tokensUsed, createdAt, updatedAt, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conversation.id,
        conversation.userId,
        conversation.provider,
        conversation.model,
        JSON.stringify(conversation.messages),
        JSON.stringify(conversation.tokensUsed),
        conversation.createdAt.toISOString(),
        conversation.updatedAt.toISOString(),
        JSON.stringify(conversation.metadata)
      ]
    );
    this.save();
  }

  saveMetrics(metrics: any) {
    if (!this.db) return;

    this.db.run(
      `INSERT INTO metrics (id, timestamp, provider, responseTimeMs, tokensUsed, success, errorMessage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        metrics.id,
        metrics.timestamp.toISOString(),
        metrics.provider,
        metrics.responseTimeMs,
        metrics.tokensUsed,
        metrics.success ? 1 : 0,
        metrics.errorMessage
      ]
    );
    this.save();
  }

  getConversations(userId: string, limit: number = 50) {
    if (!this.db) return [];

    const stmt = this.db.prepare(
      `SELECT * FROM conversations WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`
    );
    stmt.bind([userId, limit]);

    const results: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        messages: JSON.parse(row.messages as string),
        tokensUsed: JSON.parse(row.tokensUsed as string),
      });
    }
    stmt.free();
    return results;
  }

  getMetrics(provider?: string, hours: number = 24) {
    if (!this.db) return [];

    let sql = `SELECT * FROM metrics WHERE timestamp > datetime('now', '-${hours} hours')`;
    const params: any[] = [];

    if (provider) {
      sql += ' AND provider = ?';
      params.push(provider);
    }

    sql += ' ORDER BY timestamp DESC';

    const stmt = this.db.prepare(sql);
    if (params.length) stmt.bind(params);

    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  close() {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }
}

export const db = new DatabaseManager();
