#!/bin/bash
set -e

echo "🚀 Initializing Voice Assistant Pro Repository"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create repo structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"

mkdir -p apps/backend/src/{llm,whatsapp,livekit,database,services,api,utils}
mkdir -p apps/web/app/{dashboard,conversations,analytics,settings}
mkdir -p apps/web/components/{Dashboard,ConversationList,Analytics}
mkdir -p apps/web/hooks
mkdir -p apps/tui/src/{components,hooks}
mkdir -p docs/{api,cloud-deployment}
mkdir -p logs data

echo -e "${GREEN}✓ Directories created${NC}"

# Initialize git
echo -e "${BLUE}📊 Initializing git repository...${NC}"
git init
git add .
git commit -m "feat: initial commit - voice assistant pro"

echo -e "${GREEN}✓ Git initialized${NC}"

# Add remote
echo -e "${BLUE}🔗 Adding GitHub remote...${NC}"
read -p "Enter your GitHub username: " username
git remote add origin https://github.com/${username}/voice-assistant-pro.git
git branch -M main
git push -u origin main

echo -e "${GREEN}✓ Pushed to GitHub${NC}"

echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Copy .env.example to .env"
echo "2. Add your API keys to .env"
echo "3. Run: npm install && npm run bootstrap"
echo "4. Start development: npm run dev"
echo ""
echo -e "${GREEN}All done! Happy coding! 🎉${NC}"