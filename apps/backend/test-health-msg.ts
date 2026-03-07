import { llmClient } from './src/llm/unified-llm.js';

const result = await llmClient.chat([
  { role: 'user', content: 'Say "OK" in one word only.' }
]);

console.log(JSON.stringify(result, null, 2));
process.exit(0);
