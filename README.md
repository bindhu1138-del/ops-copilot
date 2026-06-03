# OpsCopilot — AI Operations & Observability Platform

An AI-powered operations copilot that acts as an intelligent assistant for developers and SREs. Replaces manual context-switching between CloudWatch, Grafana, Kibana, and documentation portals with a single conversational interface powered by Claude.

---

## Features

| Tab | Feature | Description |
|-----|---------|-------------|
| ⬡ | **Dashboard** | Unified service health, alerts, deployments, and copilot chat |
| ⚡ | **Setup Assistant** | Natural language → step-by-step local environment setup guide |
| ⟳ | **Doc Drift Detector** | Compares README vs actual code and flags every mismatch |
| ◉ | **Log Analyzer** | Natural language → CloudWatch Insights query → AI analysis |
| ⚠ | **Incident Investigator** | Correlates logs + metrics + deployments → root cause report |

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **Anthropic API key** — [Get one](https://console.anthropic.com/)

---

## Quick Start

### 1. Clone / copy the project

```bash
# If cloning from a repo:
git clone <repo-url>
cd ops-copilot

# Or if you received the folder directly:
cd ops-copilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key from: https://console.anthropic.com/

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
ops-copilot/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Dark sidebar navigation
│   │   └── UI.jsx             # Shared UI components (Badge, Card, Button, etc.)
│   ├── lib/
│   │   ├── claude.js          # Anthropic API client (regular + streaming)
│   │   └── mockData.js        # Realistic mock AWS/CloudWatch data
│   ├── pages/
│   │   ├── DashboardPage.jsx  # Unified dashboard + copilot chat
│   │   ├── SetupPage.jsx      # Local env setup assistant
│   │   ├── DriftPage.jsx      # Documentation drift detection
│   │   ├── LogsPage.jsx       # Log analyzer with CW query generation
│   │   └── IncidentPage.jsx   # Incident root cause investigator
│   ├── App.jsx                # Main app shell + routing
│   ├── index.css              # Global styles + CSS variables
│   └── main.jsx               # React entry point
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── README.md
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key |
| `VITE_AWS_REGION` | ❌ Optional | AWS region for real CloudWatch |
| `VITE_AWS_ACCESS_KEY_ID` | ❌ Optional | AWS access key |
| `VITE_AWS_SECRET_ACCESS_KEY` | ❌ Optional | AWS secret key |
| `VITE_AWS_LOG_GROUP` | ❌ Optional | CloudWatch log group name |

> **Note:** All `VITE_` prefixed variables are exposed to the browser. For production, use a backend proxy to keep credentials server-side.

---

## Production Build

```bash
npm run build
# Serves the dist/ folder — deploy to Vercel, Netlify, S3, etc.
```

For a production backend that proxies Anthropic API calls (keeping your key server-side), see the `backend/` directory or add a Node.js/FastAPI proxy.

---

## Tech Stack

- **React 18** + **Vite 5** — Frontend framework
- **Anthropic Claude API** (claude-sonnet-4-20250514) — AI engine with streaming
- **JetBrains Mono** + **Syne** + **DM Sans** — Typography
- **Mock data** — Realistic CloudWatch logs, deployments, metrics
- No external UI library — fully custom components

---

## Hackathon Demo Script

1. Open **Dashboard** — show live alerts, service health, deployment timeline
2. Chat: *"What caused the payment spike?"* → AI gives a specific root cause
3. Open **Incident Investigator** → click "Payment failures post-deploy" → show structured P1 report
4. Open **Log Analyzer** → click "Payment failures (2h)" → show CloudWatch query + log results + analysis
5. Open **Doc Drift** → click "Detect Drift" → show 4 mismatches with fixes
6. Open **Setup Assistant** → type any service name → show generated setup guide
