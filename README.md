# OpsCopilot — AI Operations & Observability Platform

An AI-powered operations copilot that acts as an intelligent assistant for developers and Site Reliability Engineers (SREs). OpsCopilot reduces manual context-switching between CloudWatch, Grafana, Kibana, deployment dashboards, and documentation portals by providing a single conversational interface powered by **Microsoft Azure AI Foundry (GPT-4.1-mini)**.

---

# Features

| Module                            | Description                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 📊 **Dashboard**                  | Unified dashboard displaying service health, deployments, alerts, and AI-powered operational insights.        |
| ⚙️ **Setup Assistant**            | Generates step-by-step local environment setup instructions from natural language prompts.                    |
| 📄 **Documentation Intelligence** | Detects documentation drift by comparing project documentation with the actual implementation.                |
| 🔍 **Log Analyzer**               | Converts natural language into CloudWatch Insights queries and provides AI-driven log analysis.               |
| 🚨 **Incident Investigator**      | Correlates logs, deployments, and metrics to generate Root Cause Analysis (RCA) and recovery recommendations. |

---

# Prerequisites

Before running the application, ensure you have:

* Node.js 18 or later
* npm
* Microsoft Azure AI Foundry Project
* Azure AI Foundry API Key
* Azure AI Foundry model deployment (e.g. **GPT-4.1-mini**)

---

# Quick Start

## 1. Clone the repository

```bash
git clone <repository-url>
cd ops-copilot
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a local environment file.

```bash
cp .env.example .env
```

Update the `.env` file with your Azure AI Foundry credentials.

```env
VITE_AZURE_OPENAI_ENDPOINT=https://<your-resource>.services.ai.azure.com
VITE_AZURE_OPENAI_KEY=YOUR_API_KEY
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini

USE_MOCK_DATA=false

# Optional AWS Configuration
VITE_AWS_REGION=your_region
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_LOG_GROUP=your_log_group
```

---

## 4. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

---

# Project Structure

```
ops-copilot/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   │   ├── claude.js            # Azure AI Foundry client
│   │   └── mockData.js
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── DocumentationIntelligence/
│   │   ├── IncidentCopilot/
│   │   ├── LogExplorer/
│   │   └── PlatformAssistant/
│   │
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── package-lock.json
├── vite.config.js
├── .env.example
└── README.md
```

---

# Available Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Starts the development server     |
| `npm run build`   | Creates a production build        |
| `npm run preview` | Runs the production build locally |

---

# Environment Variables

| Variable                       | Required | Description                                            |
| ------------------------------ | -------- | ------------------------------------------------------ |
| `VITE_AZURE_OPENAI_ENDPOINT`   | ✅        | Azure AI Foundry resource endpoint                     |
| `VITE_AZURE_OPENAI_KEY`        | ✅        | Azure AI Foundry API key                               |
| `VITE_AZURE_OPENAI_DEPLOYMENT` | ✅        | Azure AI Foundry deployment name (e.g. `gpt-4.1-mini`) |
| `USE_MOCK_DATA`                | Optional | Enable or disable mock data                            |
| `VITE_AWS_REGION`              | Optional | AWS Region                                             |
| `VITE_AWS_ACCESS_KEY_ID`       | Optional | AWS Access Key                                         |
| `VITE_AWS_SECRET_ACCESS_KEY`   | Optional | AWS Secret Access Key                                  |
| `VITE_AWS_LOG_GROUP`           | Optional | AWS CloudWatch Log Group                               |

> **Important:** Never commit your `.env` file or API keys to GitHub. Only commit the `.env.example` file with placeholder values.

---

# Technology Stack

* React 18
* Vite 5
* JavaScript (ES6)
* Microsoft Azure AI Foundry
* Azure OpenAI (GPT-4.1-mini)
* AWS CloudWatch (Optional)
* Custom React Components
* Mock Data Support

---

# Production Build

Generate a production build:

```bash
npm run build
```

The build artifacts are created inside the `dist/` directory and can be deployed to:

* Azure Static Web Apps
* Azure App Service
* Azure Storage Static Website
* Vercel
* Netlify
* AWS S3 + CloudFront

---

# Demo Flow

1. Open the **Dashboard** to review service health, deployments, alerts, and AI-generated operational insights.

2. Ask the AI Copilot:

   > **"What caused the payment service failures today?"**

3. Navigate to **Incident Investigator** to generate an AI-powered Root Cause Analysis (RCA) and recovery recommendations.

4. Open **Log Analyzer** to generate CloudWatch Insights queries from natural language and analyze application logs.

5. Open **Documentation Intelligence** and click **Detect Drift** to identify documentation mismatches and view suggested fixes.

6. Open **Setup Assistant**, enter a service name, and generate a complete step-by-step environment setup guide.

---
