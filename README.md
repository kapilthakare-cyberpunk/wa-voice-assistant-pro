# 🎤 Voice Assistant Pro

[![GitHub stars](https://img.shields.io/github/stars/kapilthakare-cyberpunk/voice-assistant-pro?style=social)](https://github.com/kapilthakare-cyberpunk/voice-assistant-pro)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)

A **production-grade, bulletproof** voice assistant platform with:

- 🎙️ **WhatsApp Integration** - Natural conversation via WhatsApp
- 🔴 **LiveKit Real-time Voice** - Crystal-clear audio streaming
- 🧠 **Multi-LLM Support** - Groq, Mistral, Ollama, DeepSeek (with fallback)
- 📊 **Professional Dashboard** - Real-time metrics, conversation history, analytics
- 💻 **TUI Interface** - Terminal dashboard for server monitoring
- 🐳 **Docker-Ready** - Complete containerization with docker-compose
- 📝 **Production Logging** - Structured logs with Pino
- ⚡ **Smart Retry Logic** - Exponential backoff, rate limiting, circuit breaker patterns
- 🔒 **Enterprise Security** - Input validation, error sanitization, API key management
- 📈 **Real-time Monitoring** - WebSocket-based live metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional)
- Free API keys from:
  - [Groq](https://console.groq.com) (14.4K requests/day free)
  - [Mistral](https://platform.mistral.ai) (2 req/min, 1B tokens/month free)
  - [DeepSeek](https://platform.deepseek.com) (5M tokens/month free)

### Installation

#### Option 1: Docker Compose (Recommended)
```bash
# Clone repo
git clone https://github.com/kapilthakare-cyberpunk/voice-assistant-pro.git
cd voice-assistant-pro

# Setup environment
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access services
# Dashboard: http://localhost:3001
# API: http://localhost:3000
# WebSocket: ws://localhost:3000