import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

interface Client {
  ws: WebSocket;
  userId?: string;
  joinedAt: Date;
}

class VoiceAssistantWebSocket {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      
      this.clients.set(clientId, {
        ws,
        joinedAt: new Date(),
      });

      logger.info({ clientId }, 'WebSocket client connected');

      ws.on('message', (data: Buffer) => {
        this.handleMessage(clientId, data);
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info({ clientId }, 'WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        logger.error({ clientId, error }, 'WebSocket error');
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        message: 'Connected to Voice Assistant Pro',
      }));
    });

    logger.info('WebSocket server initialized');
  }

  private handleMessage(clientId: string, data: Buffer) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          client.userId = message.userId;
          client.ws.send(JSON.stringify({
            type: 'authenticated',
            userId: message.userId,
          }));
          break;

        case 'chat':
          // Handle chat messages - would integrate with LLM
          client.ws.send(JSON.stringify({
            type: 'chat_response',
            content: 'Echo: ' + message.content,
          }));
          break;

        case 'voice_start':
          client.ws.send(JSON.stringify({
            type: 'voice_ready',
          }));
          break;

        case 'voice_end':
          client.ws.send(JSON.stringify({
            type: 'voice_processing',
          }));
          break;

        default:
          logger.warn({ clientId, type: message.type }, 'Unknown message type');
      }
    } catch (error) {
      logger.error({ clientId, error }, 'Error parsing WebSocket message');
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  broadcast(message: object) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  sendToUser(userId: string, message: object) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }
}

export const voiceWs = new VoiceAssistantWebSocket();

export function setupWebSocket(server: Server) {
  voiceWs.initialize(server);
}
