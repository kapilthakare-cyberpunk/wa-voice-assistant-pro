// Quick test to reproduce the Groq API error
import { config } from './src/utils/config.js';

const messages = [
  { role: 'user', content: 'Say "OK" in one word only.' }
];

const options = {
  temperature: 0.7,
  maxTokens: 1024,
  topP: 1
};

console.log('Config:', {
  GROQ_API_KEY: config.GROQ_API_KEY?.substring(0, 10),
  LLM_PROVIDER: config.LLM_PROVIDER
});

console.log('Request:', {
  model: 'llama-3.3-70b-versatile',
  messages,
  ...options
});

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    top_p: options.topP ?? 1,
  }),
});

console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers.entries()));
const text = await response.text();
console.log('Response:', text);
