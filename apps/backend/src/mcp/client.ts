import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface WhatsAppToolHandlers {
  // Core
  whatsapp_get_connection_status: () => Promise<MCPToolResult>;
  whatsapp_get_profile: (args: { number?: string }) => Promise<MCPToolResult>;
  whatsapp_get_chats: () => Promise<MCPToolResult>;
  whatsapp_get_contacts: () => Promise<MCPToolResult>;
  whatsapp_get_groups: () => Promise<MCPToolResult>;
  
  // Messaging
  whatsapp_send_message: (args: { number: string; message: string }) => Promise<MCPToolResult>;
  whatsapp_send_media: (args: { number: string; source: string; caption?: string }) => Promise<MCPToolResult>;
  whatsapp_send_location: (args: { number: string; latitude: number; longitude: number; title?: string }) => Promise<MCPToolResult>;
  whatsapp_send_contact: (args: { number: string; contactId: string }) => Promise<MCPToolResult>;
  
  // Groups
  whatsapp_create_group: (args: { name: string; participants: string[] }) => Promise<MCPToolResult>;
  whatsapp_add_to_group: (args: { groupId: string; participants: string[] }) => Promise<MCPToolResult>;
  whatsapp_remove_from_group: (args: { groupId: string; participants: string[] }) => Promise<MCPToolResult>;
  
  // Messages
  whatsapp_read_messages: (args: { number: string; limit?: number }) => Promise<MCPToolResult>;
  whatsapp_search_messages: (args: { query: string }) => Promise<MCPToolResult>;
  whatsapp_get_message_history: (args: { number: string; limit?: number }) => Promise<MCPToolResult>;
  whatsapp_mark_chat_read: (args: { number: string }) => Promise<MCPToolResult>;
  
  // AI Features
  whatsapp_ai_reply: (args: { number: string; message: string }) => Promise<MCPToolResult>;
  whatsapp_summarize_conversation: (args: { number: string }) => Promise<MCPToolResult>;
  whatsapp_translate_message: (args: { number: string; message: string; targetLang: string }) => Promise<MCPToolResult>;
  
  // Advanced
  whatsapp_create_broadcast: (args: { name: string; participants: string[] }) => Promise<MCPToolResult>;
  whatsapp_get_statistics: () => Promise<MCPToolResult>;
}

class MCPClientManager {
  private client: Client | null = null;
  private tools: Map<string, MCPTool> = new Map();
  private connected: boolean = false;
  private transportType: 'sse' | 'stdio' = 'sse';
  private serverUrl: string = 'http://localhost:3002';
  private command: string = '';
  private args: string[] = [];

  constructor() {
    // Load config
    this.transportType = (config.MCP_TRANSPORT_TYPE as 'sse' | 'stdio') || 'stdio';
    this.serverUrl = config.MCP_SERVER_URL || 'http://localhost:3002';
    this.command = config.MCP_COMMAND || 'node';
    // Handle args - split by space into array
    const argsStr = config.MCP_ARGS || '/Users/kapilthakare/Projects/whatsapp-mcp-npx/mcp-server-advanced-stdio.js';
    this.args = argsStr.split(' ').filter(a => a.trim());
    
    logger.info({ transport: this.transportType, command: this.command, args: this.args }, 'MCP client config');
  }

  async connect(): Promise<void> {
    if (this.connected && this.client) {
      logger.info('MCP client already connected');
      return;
    }

    try {
      logger.info({ transport: this.transportType, url: this.serverUrl }, 'Connecting to MCP server...');

      this.client = new Client(
        {
          name: 'wa-voice-assistant-pro',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
            resources: {},
          },
        }
      );

      if (this.transportType === 'sse') {
        const transport = new SSEClientTransport(new URL(this.serverUrl));
        await this.client.connect(transport);
      } else {
        const transport = new StdioClientTransport({
          command: this.command,
          args: this.args,
        });
        await this.client.connect(transport);
      }

      // List available tools
      await this.listTools();
      
      this.connected = true;
      logger.info({ toolCount: this.tools.size }, 'MCP client connected successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to MCP server');
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.connected = false;
      this.tools.clear();
      logger.info('MCP client disconnected');
    }
  }

  async listTools(): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    const response = await this.client.request(
      { method: 'tools/list' },
      {}
    );

    this.tools.clear();
    for (const tool of response.tools) {
      this.tools.set(tool.name, {
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema,
      });
    }

    logger.info({ tools: Array.from(this.tools.keys()) }, 'Available MCP tools');
  }

  async callTool(toolName: string, args: Record<string, any> = {}): Promise<MCPToolResult> {
    if (!this.client || !this.connected) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.request(
        { method: 'tools/call' },
        {
          name: toolName,
          arguments: args,
        }
      );

      return {
        content: response.content || [],
      };
    } catch (error: any) {
      logger.error({ toolName, args, error: error.message }, 'MCP tool call failed');
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  // Helper to extract text from MCP result
  extractText(result: MCPToolResult): string {
    if (result.isError) {
      return result.content[0]?.text || 'Unknown error';
    }
    return result.content.map(c => c.text).join('\n');
  }
}

export const mcpClient = new MCPClientManager();
