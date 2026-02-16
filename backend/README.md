# BookTutor Backend

RAG-based educational API - Talk to your books.

## Quick Start

### 1. Prerequisites

- Python 3.12+
- [Ollama](https://ollama.ai) running locally with:
  - `qwen3:8b` (LLM)
  - `bge-m3` (embeddings)
- Docker (for Qdrant)

### 2. Setup

```bash
# Clone and enter directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 3. Start Services

```bash
# Start Qdrant (vector database)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Or use Docker Compose from root:
cd ..
docker compose up qdrant -d
```

### 4. Run API

```bash
# Development mode
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login, get JWT | - |
| GET | `/api/v1/auth/me` | Get current user | User |

**Demo credentials:**
- Admin: `admin` / `admin123`
- User: `user` / `user123`

### Asignaturas (Admin Only for mutations)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/asignaturas` | List all | User |
| GET | `/api/v1/asignaturas/{slug}` | Get details | User |
| POST | `/api/v1/asignaturas` | Create + upload MDs | **Admin** |
| POST | `/api/v1/asignaturas/{slug}/upload` | Add more MDs | **Admin** |
| DELETE | `/api/v1/asignaturas/{slug}` | Delete | **Admin** |

### Chat (RAG)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/chat/{slug}/ask` | Ask question | User |
| POST | `/api/v1/chat/{slug}/stream` | Stream answer (SSE) | User |

## Architecture

```
backend/
├── app/
│   ├── api/v1/          # API routers
│   │   ├── auth.py      # Authentication
│   │   ├── asignaturas.py # Subject management
│   │   └── chat.py      # RAG chat
│   ├── core/            # Core configuration
│   │   ├── config.py    # Settings
│   │   └── security.py  # JWT auth
│   ├── db/              # Database clients
│   │   └── qdrant.py    # Vector store
│   ├── llm/             # LLM providers
│   │   ├── base.py      # Abstract interface
│   │   └── ollama.py    # Ollama implementation
│   └── services/        # Business logic
│       ├── rag_service.py    # RAG Q&A
│       └── ingest_service.py # Document processing
├── main.py              # FastAPI app
└── requirements.txt
```

## Environment Variables

See `.env.example` for all options. Key ones:

```env
QDRANT_URL=http://localhost:6333
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=qwen3:8b
SECRET_KEY=change-this-in-production
```

## Docker

```bash
# Build
docker build -t booktutor-backend .

# Run
docker run -p 8000:8000 \
  -e QDRANT_URL=http://host.docker.internal:6333 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  booktutor-backend
```

## License

MIT

# RAG Local — Plataforma de Libros FP Prometeo

Sistema RAG (Retrieval Augmented Generation) 100% local y gratuito para la plataforma de libros de FP Prometeo. Los usuarios hacen preguntas sobre un libro y reciben respuestas basadas en su contenido.

**Cada libro es un RAG independiente.** No hay contaminación entre contenidos.

---

## Requisitos

### Hardware mínimo
- **RAM:** 16 GB (8 GB mínimo)
- **Disco:** 20 GB libres (modelos + datos)
- **CPU:** 4+ cores recomendado
- **GPU:** No necesaria (Ollama corre en CPU)

### Software
- Python 3.11+
- Ollama
- Docker (opcional, recomendado para servidor)

---

## Despliegue

### Opción A: Con Docker (recomendado para servidor)

```bash
# 1. Descomprimir y entrar
unzip RAG_QWEN.zip && cd RAG_QWEN

# 2. Copiar configuración
cp .env.example .env

# 3. Meter libros (exportados de Notion como Markdown)
mkdir docs/mi-libro/
cp archivo-exportado.md docs/mi-libro/

# 4. Levantar servicios
docker compose up -d --build

# 5. Descargar modelos (~6 GB, solo la primera vez)
docker exec ollama ollama pull qwen3:8b
docker exec ollama ollama pull bge-m3

# 6. Ingestar libros
docker exec rag-api python scripts/ingest.py --all

# 7. Verificar
curl http://localhost:8000/health
curl http://localhost:8000/books
```

### Opción B: Sin Docker

```bash
# 1. Descomprimir y entrar
unzip RAG_QWEN.zip && cd RAG_QWEN

# 2. Instalar Ollama (https://ollama.com/download)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3:8b
ollama pull bge-m3

# 3. Crear entorno Python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 4. Copiar configuración
cp .env.example .env

# 5. Meter libros
mkdir docs/mi-libro/
cp archivo-exportado.md docs/mi-libro/

# 6. Ingestar
python scripts/ingest.py --all

# 7. Arrancar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Gestión de libros

```bash
# Añadir libro nuevo
mkdir docs/{book-id}/
cp archivo.md docs/{book-id}/
python scripts/ingest.py --book-id {book-id}

# Re-ingestar (actualizar contenido)
python scripts/ingest.py --book-id {book-id} --force

# Ver libros ingestados
python scripts/ingest.py --list

# Probar una consulta
python scripts/test_query.py --book-id {book-id} --question "tu pregunta"
```

**Convención de nombres para book-id:** slug en minúsculas con guiones (`prompting-avanzado`, `copilot-excel`). Debe coincidir con el identificador del frontend.

> Los exports de Notion con headers en negrita (`## **Titulo**`) se limpian automáticamente durante la ingesta.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio y modelos |
| GET | `/books` | Lista de libros ingestados |
| POST | `/ask/{book_id}` | Hacer una pregunta sobre un libro |

### Ejemplo de consulta

```bash
curl -X POST http://localhost:8000/ask/mi-libro \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué es el pruning en IA?"}'
```

Respuesta:
```json
{
  "answer": "El pruning es...",
  "sources": [{"source": "archivo.md", "seccion": "Optimización"}],
  "book_id": "mi-libro"
}
```

---

## Configuración

Editar `.env` para ajustar parámetros:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LLM_MODEL` | `qwen3:8b` | Modelo de generación |
| `EMBEDDING_MODEL` | `bge-m3` | Modelo de embeddings |
| `CHUNK_SIZE` | `1500` | Tamaño de chunks en la ingesta |
| `RETRIEVER_K` | `6` | Chunks recuperados por consulta |
| `LLM_TEMPERATURE` | `0.1` | Creatividad del modelo (bajo = más fiel al texto) |
| `CORS_ORIGINS` | Ver `.env` | Orígenes permitidos para el frontend |

---

## Arquitectura

```
Frontend (Vercel)                        Backend (VPS)
┌──────────────────┐        HTTPS        ┌──────────────────────────┐
│ plataforma-libros│ ──────────────────► │ FastAPI + Uvicorn        │
│ .vercel.app      │                     │  ├── /ask/{book_id}      │
│                  │                     │  ├── /books              │
│ POST /ask/{id}   │                     │  └── /health             │
└──────────────────┘                     │                          │
                                         │  ChromaDB    Ollama      │
                                         │  (vectores)  ├─ Qwen 3  │
                                         │  colección   │  8B      │
                                         │  por libro   ├─ BGE-M3  │
                                         └──────────────────────────┘
```

**Ingesta** (offline, 1 vez por libro): Notion export `.md` → chunking por headers → embeddings BGE-M3 → ChromaDB

**Consulta** (online): Pregunta → busca 6 chunks relevantes → Qwen 3 genera respuesta → JSON con fuentes

---

## Notas

- **Rendimiento en CPU:** Qwen 3 8B tarda ~15-40s por respuesta. Aceptable para uso individual. Para más velocidad, usar VPS con GPU.
- **Concurrencia:** 1 petición simultánea al LLM (workers=1). Más workers causan colas y OOM.
- **Sin memoria:** Cada pregunta es independiente, no hay historial de conversación.
- **Solo texto:** No procesa imágenes de los libros.
