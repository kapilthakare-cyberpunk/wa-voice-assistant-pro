import { Client } from 'whatsapp-web.js';
import { UnifiedLLMClient, type LLMConfig } from './unified-llm';

class WhatsAppVoiceAssistant {
  private client: Client;
  private llm: UnifiedLLMClient;
  private conversationHistory: Map<string, Array<{ role: string; content: string }>> = new Map();

  constructor(llmConfig: LLMConfig) {
    this.client = new Client({
      puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
      },
    });

    this.llm = new UnifiedLLMClient(llmConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', (qr) => {
      // Display QR code for scanning
      console.log('QR Code:', qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
    });

    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: any) {
    const userId = message.from;
    const userText = message.body.trim();

    // Initialize conversation history if new user
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }

    const history = this.conversationHistory.get(userId)!;

    // Add user message to history
    history.push({ role: 'user', content: userText });

    try {
      // Get AI response
      const aiResponse = await this.llm.chat(history as any);

      // Add AI response to history
      history.push({ role: 'assistant', content: aiResponse });

      // Keep only last 10 messages for context
      if (history.length > 20) {
        history.splice(0, 2);
      }

      // Send response back to WhatsApp
      await message.reply(aiResponse);
    } catch (error) {
      console.error('Error processing message:', error);
      await message.reply('Sorry, I encountered an error. Please try again.');
    }
  }

  async start() {
    await this.client.initialize();
  }

  async stop() {
    await this.client.destroy();
  }
}

export { WhatsAppVoiceAssistant };