# WhatsApp Voice Assistant - LiveKit Agent

This is the voice agent that connects to your WhatsApp Voice Assistant Pro backend.

## Prerequisites

1. **LiveKit Cloud Account** - Get credentials from https://livekit.io
2. **Groq API Key** - For LLM responses
3. **Backend running** - Your Express backend on port 3000

## Setup

### 1. Install dependencies

```bash
cd apps/voice-agent
pip install -r requirements.txt
```

### 2. Configure environment

Create a `.env` file:

```env
# LiveKit Cloud credentials
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# Groq (get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key

# Your backend URL
BACKEND_URL=http://localhost:3000
```

### 3. Deploy to LiveKit Cloud

```bash
# Build and deploy
lk agent deploy

# Or run locally for testing
lk agent start
```

## Usage

Once deployed:

1. Users connect to your LiveKit room
2. Their voice is transcribed via Deepgram
3. Groq LLM generates responses
4. Responses are converted to speech via LiveKit TTS

## API Integration

The voice agent can also integrate with your WhatsApp MCP:

- `POST /api/whatsapp/send` - Send message to WhatsApp
- `POST /api/whatsapp/ai-reply` - Get AI reply for WhatsApp

## Local Development

To test locally:

```bash
# Start your backend
cd apps/backend
npm run dev

# In another terminal, start the agent locally
cd apps/voice-agent
python voice_agent.py

# Connect using LiveKit client or test URL
```
