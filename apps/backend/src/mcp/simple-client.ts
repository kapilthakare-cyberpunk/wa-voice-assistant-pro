import { spawn, ChildProcess } from 'child_process';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

class SimpleMCPClient {
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private requestId: number = 0;
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();
  private tools: string[] = [];

  constructor() {}

  async connect(): Promise<void> {
    if (this.connected && this.process) {
      logger.info('MCP client already connected');
      return;
    }

    try {
      const command = config.MCP_COMMAND || 'node';
      const args = (config.MCP_ARGS || '/Users/kapilthakare/Projects/whatsapp-mcp-npx/mcp-server-advanced-stdio.js').split(' ');
      
      logger.info({ command, args }, 'Starting MCP server...');

      this.process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      this.process.stdout?.on('data', (data) => {
        this.handleMessage(data.toString());
      });

      this.process.stderr?.on('data', (data) => {
        logger.debug({ stderr: data.toString() }, 'MCP stderr');
      });

      this.process.on('error', (err) => {
        logger.error({ error: err }, 'MCP process error');
        this.connected = false;
      });

      this.process.on('exit', (code) => {
        logger.info({ code }, 'MCP process exited');
        this.connected = false;
      });

      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 3000));

      // List tools
      await this.listTools();
      
      this.connected = true;
      logger.info({ toolCount: this.tools.length }, 'MCP client connected');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to MCP');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.tools = [];
      logger.info('MCP client disconnected');
    }
  }

  private handleMessage(data: string) {
    try {
      const lines = data.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (!line.startsWith('{')) continue;
        
        const response = JSON.parse(line);
        
        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject } = this.pendingRequests.get(response.id)!;
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            reject(new Error(response.error.message || 'MCP error'));
          } else if (response.result) {
            resolve(response.result);
          }
        }
      }
    } catch (e) {
      // Ignore parse errors for non-JSON lines
    }
  }

  private sendRequest(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.connected) {
        reject(new Error('MCP not connected'));
        return;
      }

      const id = `req_${++this.requestId}`;
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.process.stdin?.write(JSON.stringify(request) + '\n');

      // Timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000);
    });
  }

  async listTools(): Promise<void> {
    try {
      const response: any = await this.sendRequest('tools/list', {});
      this.tools = response.tools?.map((t: any) => t.name) || [];
      logger.info({ tools: this.tools }, 'Available MCP tools');
    } catch (e) {
      logger.warn({ error: e }, 'Failed to list tools');
      this.tools = [];
    }
  }

  async callTool(toolName: string, args: Record<string, any> = {}): Promise<MCPToolResult> {
    try {
      const response: any = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args
      });

      return {
        content: response.content || [{ type: 'text', text: JSON.stringify(response) }]
      };
    } catch (error: any) {
      logger.error({ toolName, args, error: error.message }, 'MCP tool call failed');
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getAvailableTools(): string[] {
    return this.tools;
  }

  extractText(result: MCPToolResult): string {
    if (result.isError) {
      return result.content[0]?.text || 'Unknown error';
    }
    return result.content.map(c => c.text).join('\n');
  }
}

export const mcpClient = new SimpleMCPClient();
export type { MCPToolResult };
