# BookTutor Backend

RAG-based educational API - Talk to your books.

## Quick Start

### 1. Prerequisites

- Python 3.12+
- [Ollama](https://ollama.ai) running locally with:
  - `qwen3:4b` (LLM - optimizado para bajo coste)
  - `bge-m3` (embeddings)
- Docker (for Qdrant)

### 2. Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 3. Start Services

```bash
# Start Qdrant (vector database)
docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant

# Or use Docker Compose from root:
cd ..
docker compose up qdrant -d
```

### 4. Add Documents

```bash
# Create subject folder with markdown files
mkdir -p docs/mi-asignatura
cp mis-apuntes/*.md docs/mi-asignatura/
```

### 5. Run API

```bash
# Development mode (auto-ingests docs/ on startup)
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Auto-Ingest

El backend detecta automáticamente carpetas en `docs/` al iniciar:

```
docs/
├── programacion/      → Crea RAG "programacion"
│   ├── 01-intro.md
│   └── 02-variables.md
└── bases-de-datos/    → Crea RAG "bases-de-datos"
    └── sql-basics.md
```

**No es necesario ejecutar scripts de ingesta manualmente.**

## API Endpoints

### Asignaturas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/asignaturas` | List all |
| GET | `/api/v1/asignaturas/{slug}` | Get details |
| GET | `/api/v1/asignaturas/{slug}/documents/{file}` | Get document content |

### Chat (RAG)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/{slug}/ask` | Ask question |
| POST | `/api/v1/chat/{slug}/stream` | Stream answer (SSE) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Service status |

## Architecture

```
backend/
├── app/
│   ├── api/v1/              # API routers
│   │   ├── asignaturas.py   # Subject listing
│   │   ├── chat.py          # RAG chat
│   │   └── health.py        # Health check
│   ├── core/
│   │   └── config.py        # Settings
│   ├── db/
│   │   └── qdrant.py        # Vector store
│   ├── llm/
│   │   └── ollama.py        # Ollama provider
│   └── services/
│       ├── auto_ingest.py   # Auto-RAG on startup
│       ├── ingest_service.py # Document processing
│       └── rag_service.py   # RAG Q&A
├── docs/                    # Subject documents
│   └── {slug}/*.md
├── main.py
└── requirements.txt
```

## Environment Variables

See `.env.example` for all options. Key ones:

```env
QDRANT_URL=http://localhost:6333
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=qwen3:4b
CHUNK_SIZE=1000
RETRIEVER_K=4
```

## Docker

```bash
# Build
docker build -t booktutor-backend -f Dockerfile .

# Run
docker run -p 8000:8000 \
  -e QDRANT_URL=http://host.docker.internal:6333 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -v $(pwd)/docs:/app/docs \
  booktutor-backend
```

## License

MIT
