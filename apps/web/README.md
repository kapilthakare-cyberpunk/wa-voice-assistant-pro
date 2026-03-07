# Voice Assistant Pro - Web Dashboard

Production-grade React dashboard for monitoring and managing the Voice Assistant backend.

## Features

- 🟢 Real-time health monitoring
- 📊 Response time analytics
- 💬 WhatsApp MCP integration
- 🎨 Dark mode optimized UI
- 📱 Fully responsive design
- ⚡ Auto-refresh every 30s

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Zustand** for state management
- **React Router** for navigation
- **Lucide Icons** for consistent iconography

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend running on port 3000

### Installation

```bash
cd apps/web
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── HealthCard.tsx
│   ├── StatCard.tsx
│   ├── MetricsChart.tsx
│   ├── WhatsAppStatusCard.tsx
│   └── Layout.tsx
├── pages/              # Page components
│   └── Dashboard.tsx
├── lib/                # Utilities and API
│   ├── api.ts
│   └── utils.ts
├── store/              # State management
│   └── dashboardStore.ts
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx
```

## API Integration

The dashboard connects to the backend API at `http://localhost:3000/api`:

- `GET /api/health` - System health status
- `GET /api/metrics` - Performance metrics
- `GET /api/whatsapp/status` - WhatsApp connection status
- `POST /api/mcp/connect` - Connect MCP server

## Design System

Based on UI/UX Pro Max guidelines:

- **Colors**: Dark OLED theme with blue primary (#3B82F6) and amber accent (#F59E0B)
- **Typography**: Fira Sans (body) + Fira Code (mono)
- **Effects**: Minimal glow, smooth transitions (150-300ms)
- **Accessibility**: WCAG AAA compliant, keyboard navigation, focus states

## Production Deployment

Build for production:

```bash
npm run build
```

Serve the `dist` folder with any static file server or integrate with your backend's static file serving.

## Environment Variables

Create `.env` file if needed:

```env
VITE_API_URL=http://localhost:3000
```

## License

MIT
