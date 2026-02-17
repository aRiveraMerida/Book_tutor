# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookTutor is an educational RAG (Retrieval-Augmented Generation) platform for FP Prometeo students. It provides an AI tutor that answers questions about course materials using locally-hosted LLMs (Ollama) and vector search (Qdrant). All inference runs locally — no external API costs.

Language: Spanish (UI, docs, prompts, code comments).

## Architecture

```
Frontend (Next.js 16, port 3000)
    ↕ API routes proxy to backend
Backend (FastAPI, port 8000)
    ↕                    ↕
Qdrant (port 6333)    Ollama (port 11434)
(vector store)        (LLM: qwen3:4b, embeddings: bge-m3)
```

**RAG flow**: User question → embed query via Ollama → Qdrant similarity search (K=4) → build numbered context → Ollama generates answer citing sources [1][2] → stream tokens back to frontend.

**Auto-ingest on startup**: `app.main.lifespan()` scans `backend/docs/` subdirectories, creates Qdrant collections for any new subjects found. Each subfolder name becomes the subject slug.

**Frontend proxies**: Next.js API routes (`frontend/app/api/subjects/`) proxy requests to the FastAPI backend — the frontend never calls Ollama/Qdrant directly.

**LLM provider abstraction**: `backend/app/llm/base.py` defines an ABC; `ollama.py` implements it. Factory function `get_default_provider()` selects provider based on `default_llm_provider` setting.

## Common Commands

### Full stack (Docker)
```bash
docker compose up -d --build        # Start dev environment
docker compose down                 # Stop
```

### Backend (from `backend/`)
```bash
make setup                          # Create venv + install deps (Python 3.12)
make serve                          # uvicorn with --reload on port 8000
make models                         # Pull Ollama models (qwen3:8b, bge-m3)
make test BOOK=programacion Q="qué es una variable"  # Test RAG query
make ingest-all                     # Manually ingest all subjects
make ingest BOOK=programacion       # Ingest single subject
make ingest-force BOOK=programacion # Re-ingest (overwrites existing)
```

Backend linting (used in CI):
```bash
pip install ruff
ruff check app/ --ignore E501
```

### Frontend (from `frontend/`)
```bash
npm install
npm run dev                         # Dev server on port 3000
npm run build                       # Production build (standalone)
npm run lint                        # ESLint
```

### Environment
Copy `.env.example` to `.env` at the repo root. Key variables: `OLLAMA_BASE_URL`, `QDRANT_URL`, `DEFAULT_LLM_MODEL`, `NEXT_PUBLIC_API_URL`.

## Key Backend Paths

| Path | Role |
|------|------|
| `app/main.py` | FastAPI app, lifespan with auto-ingest |
| `app/core/config.py` | Pydantic Settings, env-based, LRU-cached via `get_settings()` |
| `app/api/v1/chat.py` | `POST /{slug}/ask` (full response) and `/{slug}/stream` (SSE) |
| `app/api/v1/asignaturas.py` | Subject listing and details endpoints |
| `app/services/rag_service.py` | Orchestrates embed → search → generate |
| `app/services/ingest_service.py` | Markdown parsing, chunking, embedding, Qdrant upsert |
| `app/services/auto_ingest.py` | Startup scanner for `docs/` subdirectories |
| `app/db/qdrant.py` | Qdrant client wrapper; collections named `book_{slug}` |
| `app/llm/base.py` | Abstract LLM provider interface |
| `app/llm/ollama.py` | Ollama implementation with `/no_think` directive for Qwen 3 |
| `docs/` | Subject content as `.md` files, one subdirectory per subject |

## Key Frontend Paths

| Path | Role |
|------|------|
| `app/page.tsx` | Home — lists subjects |
| `app/asignatura/[subject]/page.tsx` | Subject detail page with document viewer + floating chat |
| `hooks/useChat.ts` | Chat state management, localStorage persistence, SSE streaming |
| `components/chat/ChatPanel.tsx` | Main chat UI |
| `components/chat/FloatingChat.tsx` | Floating chat widget on subject pages |
| `app/api/subjects/` | Next.js API routes proxying to backend |

TypeScript path alias: `@/*` maps to `./` (tsconfig).

## Adding a New Subject

1. Create `backend/docs/<subject-slug>/` with `.md` files
2. Restart the backend — auto-ingest detects new folders and creates the Qdrant collection

## CI/CD

- **CI** (`.github/workflows/ci.yml`): On PR/push to main — ruff lint, ESLint, Next.js build, Docker build test, markdown validation. Lint failures are non-blocking (`|| true`).
- **CD** (`.github/workflows/deploy.yml`): On push to main — builds Docker images, pushes to GHCR, SSH deploys via `docker compose pull && up`.

## Tech Stack Details

- **Backend**: Python 3.12, FastAPI, Pydantic Settings, httpx, qdrant-client 1.7.x, langchain-text-splitters
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, react-markdown with remark-gfm and rehype-highlight
- **Infra**: Qdrant 1.7.4, Ollama (qwen3:4b for chat, bge-m3 for 1024-dim embeddings), Docker Compose
