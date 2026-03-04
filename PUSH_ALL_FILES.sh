#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Voice Assistant Pro - Automated Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
  exit 1
fi

# Clone or update the repository
REPO_URL="https://github.com/kapilthakare-cyberpunk/wa-voice-assistant-pro.git"
REPO_DIR="wa-voice-assistant-pro"

if [ -d "$REPO_DIR" ]; then
  echo -e "${YELLOW}⚠️  Directory exists. Updating...${NC}"
  cd "$REPO_DIR"
  git pull origin main
else
  echo -e "${BLUE}📥 Cloning repository...${NC}"
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

echo ""
echo -e "${BLUE}📁 Creating directory structure...${NC}"

# Create all necessary directories
mkdir -p apps/backend/src/{llm/providers,whatsapp,livekit,database,services,api,utils}
mkdir -p apps/web/app/{dashboard,conversations,analytics,settings}
mkdir -p apps/web/components/{Dashboard,ConversationList,Analytics}
mkdir -p apps/web/hooks
mkdir -p apps/web/styles
mkdir -p apps/tui/src/{components,hooks}
mkdir -p .github/workflows
mkdir -p docs/{api,cloud-deployment,guides}
mkdir -p logs
mkdir -p data

echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${BLUE}📝 Creating configuration files...${NC}"

# Create tsconfig files
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo -e "${GREEN}✓ Root tsconfig.json created${NC}"

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "wa-voice-assistant-pro",
  "version": "1.0.0",
  "description": "Production-grade voice assistant with WhatsApp, LiveKit, and multi-LLM support",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "start": "npm start --workspace=apps/backend",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "bootstrap": "npm ci && npm install --workspaces",
    "clean": "npm run clean --workspaces && rm -rf node_modules dist",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  },
  "keywords": [
    "voice-assistant",
    "whatsapp",
    "livekit",
    "groq",
    "mistral",
    "ollama",
    "ai",
    "llm",
    "production",
    "typescript"
  ],
  "author": "Kapil Thakare",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/kapilthakare-cyberpunk/wa-voice-assistant-pro.git"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF

echo -e "${GREEN}✓ Root package.json created${NC}"

# Create .env.example
cat > .env.example << 'EOF'
# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# ============================================
# LLM PROVIDER CONFIGURATION
# ============================================
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OLLAMA_BASE_URL=http://localhost:11434

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=file:./data.db
REDIS_URL=redis://localhost:6379

# ============================================
# SECURITY
# ============================================
API_KEY=your_32_char_api_key_minimum_length_required
JWT_SECRET=your_32_char_jwt_secret_minimum_length_required

# ============================================
# WHATSAPP CONFIGURATION
# ============================================
WHATSAPP_SESSION_PATH=./whatsapp-session

# ============================================
# LIVEKIT CONFIGURATION
# ============================================
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# ============================================
# MONITORING & OBSERVABILITY
# ============================================
ENABLE_METRICS=true
SENTRY_DSN=https://your-sentry-project-url

# ============================================
# WEB DASHBOARD
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo -e "${GREEN}✓ .env.example created${NC}"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Environment
.env
.env.local
.env.*.local
.env.production

# Build outputs
dist/
build/
out/
.next/
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Database
*.db
*.sqlite
*.sqlite3
data/

# Sessions
whatsapp-session/
sessions/

# Temporary
tmp/
temp/
*.tmp

# OS
.DS_Store
Thumbs.db

# Documentation builds
docs/_build/
site/
EOF

echo -e "${GREEN}✓ .gitignore created${NC}"

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 Kapil Thakare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo -e "${GREEN}✓ LICENSE created${NC}"

echo ""
echo -e "${BLUE}📚 Creating documentation...${NC}"

# Create README.md
cat > README.md << 'EOF'
# 🎤 WA Voice Assistant Pro

[![GitHub stars](https://img.shields.io/github/stars/kapilthakare-cyberpunk/wa-voice-assistant-pro?style=social)](https://github.com/kapilthakare-cyberpunk/wa-voice-assistant-pro)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)

A **production-grade, bulletproof** voice assistant platform with WhatsApp integration, LiveKit real-time voice, and multi-LLM support.

## ✨ Features

- 🎙️ **WhatsApp Integration** - Natural conversation via WhatsApp
- 🔴 **LiveKit Real-time Voice** - Crystal-clear audio streaming
- 🧠 **Multi-LLM Support** - Groq, Mistral, Ollama, DeepSeek (with fallback)
- 📊 **Professional Dashboard** - Real-time metrics, conversation history, analytics
- �� **TUI Interface** - Terminal dashboard for server monitoring
- 🐳 **Docker-Ready** - Complete containerization with docker-compose
- 📝 **Production Logging** - Structured logs with Pino
- ⚡ **Smart Retry Logic** - Exponential backoff, rate limiting, circuit breaker patterns
- 🔒 **Enterprise Security** - Input validation, error sanitization, API key management
- 📈 **Real-time Monitoring** - WebSocket-based live metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Free API keys from Groq, Mistral, or DeepSeek

### Installation

```bash
# Clone repository
git clone https://github.com/kapilthakare-cyberpunk/wa-voice-assistant-pro.git
cd wa-voice-assistant-pro

# Setup environment
cp .env.example .env
nano .env  # Add your API keys

# Start with Docker
docker-compose up -d

# Or local development
npm install
npm run bootstrap
npm run dev