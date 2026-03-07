import { config } from './src/utils/config.js';
console.log('GROQ_API_KEY exists:', !!config.GROQ_API_KEY);
console.log('GROQ_API_KEY length:', config.GROQ_API_KEY?.length);
console.log('GROQ_API_KEY first 10 chars:', config.GROQ_API_KEY?.substring(0,10));
console.log('LLM_PROVIDER:', config.LLM_PROVIDER);
