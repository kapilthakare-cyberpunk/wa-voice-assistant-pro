import { Router, Request, Response } from 'express';
import { whatsappTools } from '../mcp/whatsapp-tools';
import { mcpClient } from '../mcp/simple-client';
import { logger } from '../utils/logger';

const router = Router();

// MCP Status
router.get('/mcp/status', async (req, res) => {
  try {
    const connected = mcpClient.isConnected();
    const tools = connected ? mcpClient.getAvailableTools() : [];
    
    res.json({
      connected,
      toolCount: tools.length,
      tools: tools.slice(0, 20), // Limit response
      transportType: 'stdio',
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'MCP status error');
    res.status(500).json({ error: error.message });
  }
});

// Connect MCP
router.post('/mcp/connect', async (req, res) => {
  try {
    await mcpClient.connect();
    res.json({ success: true, message: 'Connected to MCP server' });
  } catch (error: any) {
    logger.error({ error: error.message }, 'MCP connect error');
    res.status(500).json({ error: error.message });
  }
});

// Disconnect MCP
router.post('/mcp/disconnect', async (req, res) => {
  try {
    await mcpClient.disconnect();
    res.json({ success: true, message: 'Disconnected from MCP server' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WHATSAPP TOOLS ====================

// Get connection status
router.get('/whatsapp/status', async (req, res) => {
  try {
    const status = await whatsappTools.getConnectionStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
router.get('/whatsapp/profile/:number?', async (req, res) => {
  try {
    const result = await whatsappTools.getProfile(req.params.number);
    res.json({ profile: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chats
router.get('/whatsapp/chats', async (req, res) => {
  try {
    const result = await whatsappTools.getChats();
    res.json({ chats: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get contacts
router.get('/whatsapp/contacts', async (req, res) => {
  try {
    const result = await whatsappTools.getContacts();
    res.json({ contacts: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get groups
router.get('/whatsapp/groups', async (req, res) => {
  try {
    const result = await whatsappTools.getGroups();
    res.json({ groups: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/whatsapp/send', async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({ error: 'number and message required' });
    }
    
    const result = await whatsappTools.sendMessage(number, message);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send media
router.post('/whatsapp/send-media', async (req, res) => {
  try {
    const { number, source, caption } = req.body;
    if (!number || !source) {
      return res.status(400).json({ error: 'number and source required' });
    }
    
    const result = await whatsappTools.sendMedia(number, source, caption);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send location
router.post('/whatsapp/send-location', async (req, res) => {
  try {
    const { number, latitude, longitude, title } = req.body;
    if (!number || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'number, latitude, longitude required' });
    }
    
    const result = await whatsappTools.sendLocation(number, latitude, longitude, title);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/whatsapp/group', async (req, res) => {
  try {
    const { name, participants } = req.body;
    if (!name || !participants?.length) {
      return res.status(400).json({ error: 'name and participants required' });
    }
    
    const result = await whatsappTools.createGroup(name, participants);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to group
router.post('/whatsapp/group/:groupId/add', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { participants } = req.body;
    if (!participants?.length) {
      return res.status(400).json({ error: 'participants required' });
    }
    
    const result = await whatsappTools.addToGroup(groupId, participants);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages
router.get('/whatsapp/messages/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const { limit } = req.query;
    const result = await whatsappTools.readMessages(number, limit ? parseInt(limit as string) : 50);
    res.json({ messages: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search messages
router.get('/whatsapp/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'query (q) required' });
    }
    
    const result = await whatsappTools.searchMessages(q as string);
    res.json({ results: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI FEATURES ====================

// AI Reply
router.post('/whatsapp/ai-reply', async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({ error: 'number and message required' });
    }
    
    const result = await whatsappTools.aiReply(number, message);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Summarize conversation
router.get('/whatsapp/summarize/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const result = await whatsappTools.summarizeConversation(number);
    res.json({ summary: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Translate message
router.post('/whatsapp/translate', async (req, res) => {
  try {
    const { number, message, targetLang } = req.body;
    if (!number || !message || !targetLang) {
      return res.status(400).json({ error: 'number, message, and targetLang required' });
    }
    
    const result = await whatsappTools.translateMessage(number, message, targetLang);
    res.json({ translation: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADVANCED ====================

// Get statistics
router.get('/whatsapp/stats', async (req, res) => {
  try {
    const result = await whatsappTools.getStatistics();
    res.json({ statistics: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get available tools list
router.get('/whatsapp/tools', async (req, res) => {
  try {
    const tools = whatsappTools.getAvailableTools();
    res.json({ tools });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
