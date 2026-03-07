// Test exactly what the health service does
import { llmClient } from './src/llm/unified-llm.js';

console.log('Testing llmClient.chat()...');
try {
  const response = await llmClient.chat([
    {
      role: 'user',
      content: 'Say "OK" in one word only.',
    },
  ]);
  console.log('Success:', response);
} catch (error) {
  console.error('Error:', error);
}
