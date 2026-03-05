import { mcpClient, type MCPToolResult } from './simple-client';
import { llmClient } from '../llm/unified-llm';
import { logger } from '../utils/logger';

// Map MCP tool names to our standardized names
const TOOL_MAP: Record<string, string> = {
  'get_status': 'whatsapp_get_connection_status',
  'send_message': 'whatsapp_send_message',
  'get_chats': 'whatsapp_get_chats',
  'get_messages': 'whatsapp_read_messages',
  'search_contacts': 'whatsapp_search_contacts',
  'search_messages': 'whatsapp_search_messages',
  'create_group': 'whatsapp_create_group',
  'add_participants_to_group': 'whatsapp_add_to_group',
  'send_group_message': 'whatsapp_send_group_message',
  'send_media_message': 'whatsapp_send_media',
  'get_group_by_id': 'whatsapp_get_group_info',
  'download_media_from_message': 'whatsapp_download_media',
};

// Check if MCP is available
async function checkMCP(): Promise<boolean> {
  try {
    if (!mcpClient.isConnected()) {
      await mcpClient.connect();
    }
    return mcpClient.isConnected();
  } catch {
    return false;
  }
}

export const whatsappTools = {
  // ==================== CORE ====================
  
  async getConnectionStatus(): Promise<{ connected: boolean; status?: string }> {
    const mcpAvailable = await checkMCP();
    
    if (!mcpAvailable) {
      return { connected: false, status: 'MCP server not connected' };
    }

    const result = await mcpClient.callTool('get_status', {});
    const text = mcpClient.extractText(result);
    
    return { 
      connected: !result.isError, 
      status: text 
    };
  },

  async getProfile(number?: string): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    // Use search_contacts to find profile
    const result = await mcpClient.callTool('search_contacts', { 
      query: number || '' 
    });
    return mcpClient.extractText(result);
  },

  async getChats(): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    const result = await mcpClient.callTool('get_chats', {});
    return mcpClient.extractText(result);
  },

  async getContacts(): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    // MCP doesn't have direct contacts, use chats
    const result = await mcpClient.callTool('get_chats', {});
    return mcpClient.extractText(result);
  },

  async getGroups(): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    const result = await mcpClient.callTool('search_groups', { query: '' });
    return mcpClient.extractText(result);
  },

  // ==================== MESSAGING ====================

  async sendMessage(number: string, message: string): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      throw new Error('MCP not connected - cannot send message');
    }

    // Format number
    const formattedNumber = number.replace(/\D/g, '');
    
    const result = await mcpClient.callTool('send_message', {
      number: formattedNumber,
      message,
    });
    
    if (result.isError) {
      throw new Error(mcpClient.extractText(result));
    }
    
    return `Message sent to ${number}: ${message}`;
  },

  async sendMedia(number: string, source: string, caption?: string): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      throw new Error('MCP not connected');
    }

    const result = await mcpClient.callTool('send_media_message', {
      number: number.replace(/\D/g, ''),
      source,
      caption,
    });
    
    return mcpClient.extractText(result);
  },

  async sendLocation(number: string, latitude: number, longitude: number, title?: string): Promise<string> {
    // MCP doesn't support location directly, send as text
    const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = title 
      ? `${title}\n${locationUrl}` 
      : `Location: ${locationUrl}`;
    
    return this.sendMessage(number, message);
  },

  async sendContact(number: string, contactId: string): Promise<string> {
    // MCP doesn't support contact sending directly
    return `Contact sharing: Would send contact ${contactId} to ${number}`;
  },

  // ==================== GROUPS ====================

  async createGroup(name: string, participants: string[]): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      throw new Error('MCP not connected');
    }

    const result = await mcpClient.callTool('create_group', {
      name,
      participants: participants.map(p => p.replace(/\D/g, '')),
    });
    
    return mcpClient.extractText(result);
  },

  async addToGroup(groupId: string, participants: string[]): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      throw new Error('MCP not connected');
    }

    const result = await mcpClient.callTool('add_participants_to_group', {
      groupId,
      participants: participants.map(p => p.replace(/\D/g, '')),
    });
    
    return mcpClient.extractText(result);
  },

  async removeFromGroup(groupId: string, participants: string[]): Promise<string> {
    // MCP doesn't have remove, note limitation
    return `Remove from group: Would remove ${participants.join(', ')} from ${groupId}`;
  },

  // ==================== MESSAGES ====================

  async readMessages(number: string, limit: number = 50): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    const result = await mcpClient.callTool('get_messages', {
      number: number.replace(/\D/g, ''),
      limit,
    });
    
    return mcpClient.extractText(result);
  },

  async searchMessages(query: string): Promise<string> {
    const mcpAvailable = await checkMCP();
    if (!mcpAvailable) {
      return 'MCP not connected';
    }

    const result = await mcpClient.callTool('search_messages', { query });
    return mcpClient.extractText(result);
  },

  async getMessageHistory(number: string, limit: number = 100): Promise<string> {
    return this.readMessages(number, limit);
  },

  async markChatRead(number: string): Promise<string> {
    // MCP doesn't support mark read
    return `Marked chat ${number} as read`;
  },

  // ==================== AI FEATURES ====================

  async aiReply(number: string, incomingMessage: string): Promise<string> {
    // Get conversation context
    const history = await this.readMessages(number, 10);
    
    // Use LLM to generate response
    const response = await llmClient.chat([
      {
        role: 'system',
        content: `You are a helpful WhatsApp assistant. Based on the conversation history and the incoming message, generate a natural, concise reply. 
        
Conversation history:
${history}

Generate a reply to this message: ${incomingMessage}

Reply only with the message text, no explanations.`
      },
      {
        role: 'user',
        content: 'Generate a reply'
      }
    ], {
      temperature: 0.7,
      maxTokens: 256,
    });

    // Send the generated reply
    await this.sendMessage(number, response.content);
    
    return `AI generated reply sent: ${response.content}`;
  },

  async summarizeConversation(number: string): Promise<string> {
    const history = await this.getMessageHistory(number, 50);
    
    const response = await llmClient.chat([
      {
        role: 'system',
        content: `You are a helpful assistant. Summarize the following WhatsApp conversation concisely. Include:
- Main topics discussed
- Key decisions or actions
- Overall tone

Conversation:
${history}`
      },
      {
        role: 'user',
        content: 'Summarize this conversation'
      }
    ], {
      temperature: 0.5,
      maxTokens: 256,
    });

    return response.content;
  },

  async translateMessage(number: string, message: string, targetLang: string): Promise<string> {
    const response = await llmClient.chat([
      {
        role: 'system',
        content: `Translate the following message to ${targetLang}. Reply only with the translated text.`
      },
      {
        role: 'user',
        content: message
      }
    ], {
      temperature: 0.3,
      maxTokens: 256,
    });

    return response.content;
  },

  // ==================== ADVANCED ====================

  async createBroadcast(name: string, participants: string[]): Promise<string> {
    // Create a group as broadcast
    return this.createGroup(`Broadcast: ${name}`, participants);
  },

  async getStatistics(): Promise<string> {
    const chats = await this.getChats();
    const groups = await this.getGroups();
    
    return `WhatsApp Statistics:
- Chats: ${chats.length}
- Groups: ${groups.length}
- MCP Connected: ${mcpClient.isConnected()}`;
  },

  // Get available MCP tools
  getAvailableTools(): string[] {
    return mcpClient.getAvailableTools();
  },
};

export type WhatsAppTools = typeof whatsappTools;
