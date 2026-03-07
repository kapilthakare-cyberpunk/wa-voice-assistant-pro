# 🚀 Voice Assistant Pro - Complete Setup Guide

Production-grade AI voice assistant with WhatsApp integration, real-time monitoring, and multi-LLM support.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Voice Assistant Pro                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web        │  │   Backend    │  │   Voice      │      │
│  │   Dashboard  │◄─┤   API        │◄─┤   Agent      │      │
│  │   :5173      │  │   :3000      │  │   (LiveKit)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           WhatsApp MCP Server                        │   │
│  │           (Baileys + MCP SDK)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                         │
│                    │  LLM Provider │                         │
│                    │  (Groq API)   │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Current Status

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| **Web Dashboard** | 🟢 Running | 5173 | http://localhost:5173 |
| **Backend API** | 🟢 Healthy | 3000 | http://localhost:3000 |
| **LLM Provider** | 🟢 Groq | - | llama-3.3-70b-versatile |
| **WhatsApp MCP** | 🟡 Ready | - | Needs QR scan |
| **Voice Agent** | ⏸️ Stopped | - | LiveKit integrated |

## 🎨 Features

### Web Dashboard
- ✨ **Real-time Monitoring** - System health, latency, uptime
- 📊 **Analytics** - Response time charts, token usage, success rates
- 💬 **WhatsApp Integration** - MCP connection status, tools access
- 🎯 **Production UI** - Dark OLED theme, fully responsive, WCAG AAA accessible
- ⚡ **Auto-refresh** - Updates every 30 seconds

### Backend API
- 🔌 **Multi-LLM Support** - Groq, Mistral, Ollama, DeepSeek
- 📡 **MCP Protocol** - Model Context Protocol for WhatsApp
- 🗄️ **SQLite Database** - Persistent conversation history & metrics
- 🔌 **WebSocket** - Real-time bidirectional communication
- 📈 **Health Checks** - Comprehensive system monitoring

### Voice Agent (LiveKit)
- 🎤 **Voice Processing** - Real-time audio streaming
- 🤖 **AI Responses** - LLM-powered conversations
- ☁️ **Cloud Ready** - LiveKit Cloud or self-hosted
- 📱 **Multi-platform** - Web, mobile, desktop clients

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+
node --version

# Python 3.10+ (for voice agent)
python3 --version

# Git
git --version
```

### 1. Clone & Install

```bash
cd /Users/kapilthakare/Downloads/files\ \(1\)

# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend && npm install && cd ../..

# Install web dependencies
cd apps/web && npm install && cd ../..
```

### 2. Configure Environment

Edit `.env` file:

```env
# LLM Provider (currently using Groq)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key

# LiveKit (for voice agent)
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret

# WhatsApp MCP
MCP_TRANSPORT_TYPE=stdio
MCP_COMMAND=node
MCP_ARGS=/path/to/mcp-server.js
```

### 3. Start Services

```bash
# Terminal 1: Backend API
cd apps/backend
npm run dev

# Terminal 2: Web Dashboard
cd apps/web
npm run dev

# Terminal 3: WhatsApp MCP (if separate)
node /path/to/whatsapp-mcp-server.js
```

### 4. Access Applications

- **Web Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Metrics**: http://localhost:3000/api/metrics

## 📁 Project Structure

```
voice-assistant-pro/
├── apps/
│   ├── backend/              # Express.js API server
│   │   ├── src/
│   │   │   ├── api/         # Route handlers
│   │   │   ├── database/    # SQLite schema & queries
│   │   │   ├── llm/         # Unified LLM client
│   │   │   ├── mcp/         # MCP integration
│   │   │   ├── services/    # Business logic
│   │   │   └── utils/       # Helpers & config
│   │   └── package.json
│   │
│   ├── web/                 # React dashboard
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── store/       # Zustand state
│   │   │   ├── lib/         # API & utilities
│   │   │   └── types/       # TypeScript types
│   │   └── package.json
│   │
│   └── voice-agent/         # LiveKit voice agent
│       ├── voice_agent.py
│       └── requirements.txt
│
├── .env                     # Environment variables
├── package.json             # Root package config
└── README.md
```

## 🔧 Available Scripts

### Backend

```bash
cd apps/backend
npm run dev      # Development with hot reload
npm run build    # TypeScript build
npm run start    # Start production server
npm run test     # Run tests
npm run lint     # ESLint check
```

### Web Dashboard

```bash
cd apps/web
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Voice Agent

```bash
cd apps/voice-agent
pip install -r requirements.txt
python voice_agent.py
```

## 🌐 API Endpoints

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health status |
| `GET` | `/api/metrics` | Performance metrics |
| `GET` | `/api/conversations/:userId` | User conversation history |

### WhatsApp MCP

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/mcp/connect` | Connect to MCP server |
| `GET` | `/api/whatsapp/status` | WhatsApp connection status |
| `GET` | `/api/whatsapp/tools` | Available WhatsApp tools |
| `POST` | `/api/whatsapp/send` | Send WhatsApp message |
| `GET` | `/api/whatsapp/chats` | Get chat list |

## 🎨 Design System

Based on **UI/UX Pro Max** guidelines:

### Colors

```css
Background:    #0B0F19  (Dark OLED)
Primary:       #3B82F6  (Blue)
Secondary:     #60A5FA  (Light Blue)
Accent:        #F59E0B  (Amber)
Success:       #10B981  (Green)
Error:         #EF4444  (Red)
```

### Typography

- **Headings**: Fira Sans (Google Fonts)
- **Body**: Fira Sans
- **Code/Mono**: Fira Code

### Effects

- **Glow**: `box-shadow: 0 0 20px rgba(59, 130, 246, 0.3)`
- **Glass**: `background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(10px)`
- **Transitions**: 150-300ms ease-out

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "provider": "groq",
  "latencyMs": 139,
  "details": {
    "model": "llama-3.3-70b-versatile",
    "tokensUsed": { "total": 46 }
  }
}
```

### Test WhatsApp MCP

```bash
curl -X POST http://localhost:3000/api/mcp/connect
curl http://localhost:3000/api/whatsapp/status
```

### Test Web Dashboard

Open browser to http://localhost:5173

## 📊 Monitoring & Observability

### Metrics Tracked

- Response time (ms)
- Tokens used per request
- Success/failure rate
- Uptime duration
- LLM provider latency

### Database Schema

```sql
-- Conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  messages TEXT NOT NULL,
  tokensUsed TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Metrics
CREATE TABLE metrics (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  provider TEXT NOT NULL,
  responseTimeMs INTEGER NOT NULL,
  tokensUsed INTEGER NOT NULL,
  success INTEGER NOT NULL
);
```

## 🔐 Security Best Practices

- ✅ Environment variables for secrets
- ✅ API key authentication
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Rate limiting on LLM calls
- ✅ SQL injection prevention (parameterized queries)

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Restart
cd apps/backend && npm run dev
```

### Web dashboard not loading

```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall
npm install

# Restart dev server
npm run dev
```

### Groq API errors

1. Check API key in `.env`
2. Verify internet connection
3. Check Groq status page
4. Review rate limits

### WhatsApp not connecting

1. Ensure MCP server is running
2. Check QR code scan status
3. Verify session path exists
4. Restart MCP connection

## 📈 Performance Optimization

### Frontend

- ✅ Code splitting with Vite
- ✅ Lazy loading components
- ✅ Optimized re-renders with Zustand
- ✅ Debounced API calls
- ✅ Efficient chart rendering

### Backend

- ✅ Connection pooling
- ✅ Response caching
- ✅ Rate limiting
- ✅ Async/await patterns
- ✅ Database indexing

## 🎯 Next Steps

### Phase 1 (Completed) ✅

- [x] Backend API with Groq integration
- [x] Web dashboard with real-time monitoring
- [x] WhatsApp MCP connection
- [x] Health check & metrics

### Phase 2 (In Progress)

- [ ] WhatsApp QR code scanning UI
- [ ] Conversation history page
- [ ] Advanced analytics dashboard
- [ ] User management

### Phase 3 (Planned)

- [ ] Voice agent deployment
- [ ] Multi-user support
- [ ] Advanced AI features
- [ ] Production deployment

## 📚 Documentation

- [Backend API Docs](./apps/backend/README.md)
- [Web Dashboard](./apps/web/README.md)
- [Voice Agent](./apps/voice-agent/README.md)
- [MCP Integration](./apps/backend/src/mcp/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Team

- **Kapil Thakare** - Initial work & Architecture
- **Primes & Zooms** - Organization

## 🙏 Acknowledgments

- Groq for fast LLM inference
- LiveKit for voice infrastructure
- Baileys for WhatsApp Web API
- Model Context Protocol team
- UI/UX Pro Max design system

---

**Built with ❤️ in Pune & Mumbai, India**

Last Updated: March 7, 2026
