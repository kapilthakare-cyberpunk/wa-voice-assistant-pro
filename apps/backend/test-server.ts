// Test config loading from server working directory
import express from 'express';
import { createServer } from 'http';
import { config } from './src/utils/config.js';

console.log('=== Config from server context ===');
console.log('GROQ_API_KEY:', config.GROQ_API_KEY ? config.GROQ_API_KEY.substring(0, 10) + '...' : 'undefined');
console.log('LLM_PROVIDER:', config.LLM_PROVIDER);
console.log('PORT:', config.PORT);

// Quick test of LLM
const { llmClient } = await import('./src/llm/unified-llm.js');
console.log('Testing LLM client...');
try {
  const response = await llmClient.chat([{ role: 'user', content: 'Hi' }]);
  console.log('LLM Success:', response.content);
} catch (e) {
  console.log('LLM Error:', e.message);
}

// Start server
const app = express();
const server = createServer(app);

app.get('/health', async (req, res) => {
  try {
    const response = await llmClient.chat([{ role: 'user', content: 'Hi' }]);
    res.json({ status: 'healthy', response: response.content });
  } catch (e) {
    res.json({ status: 'error', error: e.message });
  }
});

server.listen(3001, () => {
  console.log('Test server running on port 3001');
});
