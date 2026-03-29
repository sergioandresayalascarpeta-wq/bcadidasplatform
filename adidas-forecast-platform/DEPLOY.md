# Deploy to Vercel — Quick Guide

## Prerequisites
- Node.js 18+ installed
- A Vercel account (free tier works)
- Git installed

## Option 1: Deploy via Vercel CLI (fastest)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to project
cd adidas-forecast-platform

# 3. Install dependencies
npm install

# 4. Preview locally first
npm run dev
# → Open http://localhost:3000

# 5. Deploy to Vercel
vercel
# Follow prompts — select "yes" for defaults
# Your URL will be: adidas-forecast-platform-xxx.vercel.app
```

## Option 2: Deploy via GitHub (recommended for sharing)

```bash
# 1. Create a GitHub repo (adidas-forecast-platform)
# 2. Push this folder
git init
git add .
git commit -m "adidas LAM Demand Forecasting Platform"
git remote add origin https://github.com/YOUR_USER/adidas-forecast-platform.git
git push -u origin main

# 3. Go to vercel.com → New Project → Import from GitHub
# 4. Select the repo → Deploy (auto-detected as Next.js)
# Done. You get a live URL in ~60 seconds.
```

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    page.tsx          ← Main page (imports all sections)
    layout.tsx        ← HTML shell + metadata
    globals.css       ← Tailwind + adidas styles
    components/
      Nav.tsx          ← Fixed black navigation bar
      Hero.tsx         ← Full-height black hero + stats
      Challenge.tsx    ← 5 pain points
      PlatformModules.tsx ← Interactive 3-module tabs ← CLIENT COMPONENT
      Architecture.tsx ← Visual flow diagram
      DataSources.tsx  ← 11 sources table
      ModelStrategy.tsx ← Three-tier + ensemble
      Governance.tsx   ← RBAC + compliance
      Roadmap.tsx      ← 5-phase timeline
      KPIs.tsx         ← Business + Technical KPIs
      Footer.tsx       ← Tech stack + summary
```
