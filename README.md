# Ek Manch (AMD V5)

AI-powered platform for building event websites, mobile apps, generating posters, videos, and more.

## Project Structure

```
├── frontend/          → Next.js UI (Vercel)
├── backend/           → Express.js API (Render.com)
├── video-backend/     → Python FastAPI (Video generation)
├── expo-template/     → React Native app template
└── supabase/          → Database schemas
```

## Quick Start

### 1. Backend (Express.js API)
```bash
cd backend
npm install
# Create .env file with your API keys (see .env.example)
npm run dev
# → Running on http://localhost:4000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:3000
# → Proxies /api/* to backend:4000
```

### 3. Video Backend (Optional — needs GPU)
```bash
cd video-backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

## Deployment (Free Tier)

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | `your-app.vercel.app` |
| Backend | [Render.com](https://render.com) | `your-api.onrender.com` |
| Database | [Supabase](https://supabase.com) | Managed |

### Deploy Frontend to Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add env var: `NEXT_PUBLIC_BACKEND_URL=https://your-api.onrender.com`

### Deploy Backend to Render
1. Create new Web Service on Render
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env vars from `backend/.env`

## Features

- 🌐 **Website Builder** — AI-powered multi-agent website generation
- 📱 **App Builder** — Generate mobile apps with GitHub Actions CI/CD
- 🖼️ **Image Generator** — AI poster generation (Google Imagen)
- 🎬 **Video Generator** — Text-to-video (AnimateDiff)
- ✨ **Phrase Generator** — AI-enhanced event descriptions
- 🏪 **Marketplace** — Share and discover community creations
- 📰 **What's New** — AI-curated news feed
