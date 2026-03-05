<div align="center">
  <h1>CareerForge</h1>
  <p><strong>Your AI-powered career team. Open source.</strong></p>
  <p>
    <a href="https://forge-your-future.com">Website</a> •
    <a href="https://github.com/Career-Forge/careerforge/issues">Issues</a> •
    <a href="https://github.com/Career-Forge/careerforge/blob/main/LICENSE">License</a>
  </p>
  <p>
    <img src="https://img.shields.io/github/license/Career-Forge/careerforge?color=blue" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/built%20with-AI-blueviolet" alt="Built with AI" />
  </p>
</div>

---

CareerForge is an open-source, multi-agent career platform that goes far beyond a resume builder. It combines deterministic processing with generative AI across a team of specialized agents — each one handling a different part of your job search, from crafting ATS-optimized resumes to researching companies, simulating interviews, and proactively surfacing opportunities.

## Features

| Feature | Description |
|---|---|
| **ResumeForge** | LaTeX-based, ATS-optimized resume generation using a 2-pass hybrid AI pipeline |
| **ForgeScore** | Hybrid resume-to-JD match scoring across 6 dimensions with gap analysis |
| **CoverForge** | Tailored cover letters with RLVR-style hallucination prevention |
| **Interview AI** | Voice-to-voice mock interviews with multiple AI interviewer personalities |
| **Company Intel** | Deep company research — health scores, layoff tracking, sentiment analysis |
| **Contact Finder** | Discover recruiters and hiring managers with AI-powered outreach drafts |
| **Job Discovery** | Proactive job alerts via direct ATS API polling (Greenhouse, Lever, Ashby, Workday) |
| **Job Tracker** | Full application lifecycle management with Kanban board |
| **BYOK** | Bring Your Own Key — use your own API keys, your data stays yours |

## Architecture

CareerForge is built on a **hybrid agent system** — not everything needs an LLM. Deterministic agents handle what code does best; GenAI agents handle what language models do best. The result is a system that is faster, cheaper, and more reliable than pure LLM approaches.

```
Interface Layer      ->  Web App  •  Telegram  •  Slack  •  Discord
Orchestration Layer  ->  Brian (Router)  •  The Conductor (FSM)
Agent Registry       ->  28 specialized agents across 7 domains
Validation Layer     ->  The Judge (4-stage)  •  RLVR Shadow Observer
Unified State Layer  ->  PostgreSQL + pgvector  •  MongoDB  •  Redis
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, tRPC, XState FSM |
| Python Services | FastAPI, Python 3.11+ |
| Database | PostgreSQL + pgvector, MongoDB, Redis |
| AI | Multi-provider (OpenAI, Anthropic, Google, DeepSeek) with BYOK |
| Infrastructure | Docker, GCP Cloud Run, Azure Container Apps |

## Getting Started

```bash
git clone https://github.com/Career-Forge/careerforge.git
cd careerforge
cp .env.example .env
docker-compose up -d
pnpm install && pnpm dev:web
```

## Self-Hosting

Full self-hosting documentation coming soon. CareerForge is designed to run entirely on your own infrastructure with your own API keys.

## Contributing

Contributions are welcome. Please open an issue before submitting a PR for significant changes.

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE) for details.

This means you can self-host freely, but any public deployment must remain open source under AGPL.


