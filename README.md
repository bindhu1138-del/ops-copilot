# 🛡️ OpsCopilot — AI Operations & Observability Platform

## 🚀 Overview

OpsCopilot is an AI-powered operations copilot that acts as an intelligent assistant for developers and Site Reliability Engineers (SREs). It eliminates manual context-switching between CloudWatch, Grafana, Kibana, deployment dashboards, and documentation portals by providing a **single conversational interface** powered by **Microsoft Azure AI Foundry (GPT-4.1-mini)**.

The platform demonstrates intelligent incident investigation, log analysis, documentation drift detection, and adaptive setup guidance — all in one unified enterprise SRE platform.

---

## 🎯 Problem Statement

Modern SRE and DevOps teams face significant operational friction.

### Developer & SRE Challenges

- Constant context-switching between multiple monitoring tools (CloudWatch, Grafana, Kibana)
- No unified interface for querying logs in natural language
- Difficulty correlating incidents across logs, metrics, and deployments
- Outdated or drifted documentation causing setup failures
- Manual, time-consuming Root Cause Analysis (RCA) during P1 incidents

### Organizational Challenges

- Lack of centralized observability across distributed services
- High mean-time-to-resolution (MTTR) due to fragmented tooling
- Documentation quality gaps across microservices
- Heavy planning overhead for onboarding and environment setup

These challenges lead to longer incident resolution times, degraded system reliability, and engineering burnout.

---

## 💡 Solution

OpsCopilot addresses these challenges through an **AI-powered operations platform** that unifies observability, incident intelligence, and developer assistance under a single interface.

The platform integrates Microsoft Azure AI Foundry to power natural language log querying, AI-driven root cause analysis, documentation drift detection, and intelligent setup guidance.

---

## ✨ Key Features

| Module | Description |
|---|---|
| 📊 **Dashboard** | Unified dashboard displaying service health, deployments, alerts, and AI-powered operational insights. |
| ⚙️ **Platform Assistant** | Generates step-by-step local environment setup instructions from natural language prompts. |
| 📄 **Documentation Intelligence** | Detects documentation drift by comparing project documentation with the actual implementation. |
| 🔍 **Log Explorer** | Converts natural language into CloudWatch Insights queries and provides AI-driven log analysis. |
| 🚨 **Incident Copilot** | Correlates logs, deployments, and metrics to generate Root Cause Analysis (RCA) and recovery recommendations. |

---

## 📸 Screenshots

### Dashboard — Health Overview

![Dashboard](screenshots/dashboard.png)

Real-time system health monitoring for `ap-south-1 · production` with active incident tracking, P99 latency, error rates, and per-service health status.

---

### Platform Assistant — Service Setup

![Platform Assistant](screenshots/platform-assistant.png)

AI-powered setup guidance for services. Enter a natural language prompt and get step-by-step environment configuration instructions.

---

### Documentation Intelligence — Doc Drift

![Documentation Intelligence](screenshots/documentation-intelligence.png)

Side-by-side comparison of README documentation vs. actual `package.json` / `.env` configuration to detect and surface mismatches.

---

### Log Explorer — Log Analyzer

![Log Explorer](screenshots/log-explorer.png)

Natural language → AI-generated CloudWatch query → real log fetch → AI root cause analysis pipeline, powered by Gemini AI + CloudWatch.

---

### Incident Copilot — Evidence Correlation

![Incident Copilot](screenshots/incident-copilot.png)

Multi-step incident investigation workflow: Evidence Correlation → Log Analysis → RCA → Runbook Generation → Recovery Actions → Commander → Postmortem.

---

## 🧠 Module Architecture

### 📊 Dashboard

**Responsibilities:**
- Displays real-time system health score
- Tracks active incidents (P1/P2) and SLA status
- Shows P99 latency and error rate trends
- Lists service-level health with per-instance breakdown
- Surfaces active alerts with timestamps and severity

---

### ⚙️ Platform Assistant

**Responsibilities:**
- Accepts natural language service setup queries
- Generates step-by-step local environment setup guides
- Supports Infra Setup, Config Generator, and Architecture Help
- Provides preset queries for common services (payment, auth, checkout)

---

### 📄 Documentation Intelligence

**Responsibilities:**
- Detects drift between README documentation and actual implementation
- Identifies missing documentation across services
- Validates README completeness and quality
- Suggests AI-generated fixes for mismatched configurations

---

### 🔍 Log Explorer

**Responsibilities:**
- Converts natural language queries into CloudWatch Insights queries
- Fetches real logs from AWS CloudWatch
- Performs AI-powered root cause analysis on log results
- Supports preset queries for common patterns (payment failures, auth timeouts, DB queries)

---

### 🚨 Incident Copilot

**Responsibilities:**
- Correlates logs, metrics, and deployment events
- Generates AI-powered Root Cause Analysis (RCA)
- Creates runbooks and recovery action plans
- Supports Incident Commander workflow
- Produces postmortem documentation

---

## 🔄 Incident Investigation Workflow

```text
P1 Incident Triggered
        ↓
Evidence Correlation
(Logs + Metrics + Deployments + Alerts)
        ↓
Log Analysis
        ↓
Root Cause Analysis (RCA)
        ↓
Runbook Generation
        ↓
Recovery Actions
        ↓
Incident Commander
        ↓
Executor
        ↓
Postmortem Documentation
```


Replace it with:

```md
## 🏗️ System Architecture

The following diagram illustrates the overall architecture and workflow of OpsCopilot. Microsoft Azure AI Foundry (GPT-4.1-mini) serves as the central AI engine, enabling intelligent incident investigation, log analysis, documentation intelligence, and platform assistance.

<img width="806" height="1922" alt="image" src="https://github.com/user-attachments/assets/84e5b004-b671-4489-8f4a-d290be67e704" />


The architecture highlights the interaction between the major application modules and the AI-powered workflow used throughout the platform.
---

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite 5
- JavaScript (ES6)
- Custom React Components

### Backend / AI
- Microsoft Azure AI Foundry
- Azure OpenAI (GPT-4.1-mini)

### Cloud Integrations
- AWS CloudWatch (Log querying and fetching)

### Development Tools
- Git
- GitHub
- Visual Studio Code
- Mock Data Support

---

## 📁 Project Structure

```text
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
├── screenshots/
│   ├── dashboard.png
│   ├── platform-assistant.png
│   ├── documentation-intelligence.png
│   ├── log-explorer.png
│   └── incident-copilot.png
│
├── package.json
├── package-lock.json
├── vite.config.js
├── .env.example
└── README.md
```

---

## ⚙️ Prerequisites

Before running the application, ensure you have:

- Node.js 18 or later
- npm
- Microsoft Azure AI Foundry Project
- Azure AI Foundry API Key
- Azure AI Foundry model deployment (e.g. `GPT-4.1-mini`)

---

## 🚀 Quick Start

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ops-copilot.git
```

### Navigate to Project

```bash
cd ops-copilot
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Update the `.env` file with your Azure AI Foundry credentials:

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

### Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_AZURE_OPENAI_ENDPOINT` | ✅ | Azure AI Foundry resource endpoint |
| `VITE_AZURE_OPENAI_KEY` | ✅ | Azure AI Foundry API key |
| `VITE_AZURE_OPENAI_DEPLOYMENT` | ✅ | Azure AI Foundry deployment name (e.g. `gpt-4.1-mini`) |
| `USE_MOCK_DATA` | Optional | Enable or disable mock data |
| `VITE_AWS_REGION` | Optional | AWS Region |
| `VITE_AWS_ACCESS_KEY_ID` | Optional | AWS Access Key |
| `VITE_AWS_SECRET_ACCESS_KEY` | Optional | AWS Secret Access Key |
| `VITE_AWS_LOG_GROUP` | Optional | AWS CloudWatch Log Group |

> **Important:** Never commit your `.env` file or API keys to GitHub. Only commit the `.env.example` file with placeholder values.

---

## 🎬 How It Works

**Step 1** — Open the **Dashboard** to review real-time service health, active incidents, P99 latency, error rates, and AI-generated operational insights.

**Step 2** — Ask the AI Copilot a natural language question:
> *"What caused the payment service failures today?"*

**Step 3** — Navigate to **Incident Copilot** to run the full incident investigation workflow:
1. Evidence Correlation
2. Log Analysis
3. Root Cause Analysis (RCA)
4. Runbook Generation
5. Recovery Actions
6. Commander & Executor
7. Postmortem

**Step 4** — Open **Log Explorer**, enter a natural language query such as *"Show payment failures from the last 2 hours"*, and run the pipeline — AI generates the CloudWatch query, fetches real logs, and performs root cause analysis.

**Step 5** — Open **Documentation Intelligence** and click **Detect Drift** to identify mismatches between your README and actual implementation, with AI-suggested fixes.

**Step 6** — Open **Platform Assistant**, enter a service name or question (e.g. *"How do I run the payment service locally?"*), and get a complete step-by-step environment setup guide.

---

## 📈 Business Impact

OpsCopilot helps engineering organizations:

- Reduce Mean Time to Resolution (MTTR) for production incidents
- Eliminate context-switching across fragmented monitoring tools
- Improve documentation quality and reduce onboarding friction
- Enable faster, AI-assisted RCA during P1/P2 incidents
- Increase SRE team productivity through intelligent automation
- Support scalable observability across distributed microservices

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Runs the production build locally |

---

## 🌐 Production Deployment

Generate a production build:

```bash
npm run build
```

Build artifacts are created in the `dist/` directory and can be deployed to:

- Azure Static Web Apps
- Azure App Service
- Azure Storage Static Website
- Vercel
- Netlify
- AWS S3 + CloudFront

---

## 🔮 Future Enhancements

Future versions may include:

- Real-time alerting and PagerDuty integration
- Team-level observability dashboards
- Advanced anomaly detection with ML models
- Slack / Teams bot integration for incident notifications
- Automated postmortem generation and sharing
- Multi-cloud log support (GCP Logging, Azure Monitor)
- Role-based access control (RBAC)
- Enterprise authentication (SSO / Azure AD)

---

## 🏆 Hackathon Challenge Alignment

### Challenge Category

🧠 AI-Powered Operations & Observability

### Demonstrated Capabilities

✅ Azure AI Foundry Integration (GPT-4.1-mini)

✅ Natural Language to CloudWatch Query

✅ AI-Driven Root Cause Analysis

✅ Documentation Drift Detection

✅ Multi-Step Incident Investigation Workflow

✅ Unified SRE Operations Platform

✅ Enterprise DevOps Use Case

---

## 🎯 Why OpsCopilot?

OpsCopilot demonstrates how conversational AI can transform SRE workflows by replacing fragmented, manual operations processes with a unified, intelligent platform.

By combining real-time observability, AI-powered incident investigation, natural language log querying, and documentation intelligence, OpsCopilot showcases the potential of Azure AI Foundry in enterprise DevOps and platform engineering environments.

---

## 👨‍💻 Author

Built for the **Microsoft AI / Foundry Hackathon**.

---

## 📜 License

This project is created for educational, research, and hackathon demonstration purposes.

---

## 🙏 Acknowledgements

- Microsoft Azure AI Foundry
- Azure OpenAI (GPT-4.1-mini)
- AWS CloudWatch
- React & Vite
- Python Open Source Community
- Microsoft AI Ecosystem
