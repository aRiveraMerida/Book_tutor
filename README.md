# 📚 BookTutor

**Plataforma educativa con tutor IA basado en RAG (Retrieval-Augmented Generation)**

BookTutor permite a los estudiantes leer documentos de estudio y hacer preguntas a un tutor IA que responde basándose exclusivamente en el contenido del material.

---

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│     Ollama      │
│   (Next.js)     │     │   (FastAPI)     │     │   (LLM Local)   │
│   Puerto 3000   │     │   Puerto 8000   │     │  Puerto 11434   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     Qdrant      │
                        │ (Vector Store)  │
                        │   Puerto 6333   │
                        └─────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Frontend | Next.js + React | 15.x |
| Backend | FastAPI + Python | 3.12+ |
| LLM | Ollama (qwen3:4b) | Local |
| Embeddings | Ollama (bge-m3) | 1024 dims |
| Vector DB | Qdrant | 1.7.x |

---

## 📁 Estructura del Proyecto

```
Book_tutor/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Endpoints REST
│   │   │   ├── asignaturas.py # Listar asignaturas
│   │   │   ├── chat.py       # RAG Q&A
│   │   │   └── health.py     # Health check
│   │   ├── core/
│   │   │   └── config.py     # Settings (pydantic)
│   │   ├── db/
│   │   │   └── qdrant.py     # Qdrant client
│   │   ├── llm/
│   │   │   └── ollama.py     # Ollama provider
│   │   └── services/
│   │       ├── auto_ingest.py    # Auto-RAG on startup
│   │       ├── ingest_service.py # Document processing
│   │       └── rag_service.py    # RAG orchestration
│   ├── docs/                  # 📂 Documentos por asignatura
│   │   ├── programacion/      # → Auto-RAG como "programacion"
│   │   └── bases-de-datos/    # → Auto-RAG como "bases-de-datos"
│   └── requirements.txt
│
├── frontend/
│   ├── app/                   # Next.js App Router
│   │   ├── asignatura/[subject]/
│   │   └── api/subjects/      # API routes
│   └── components/
│       └── chat/              # Chat components
│
├── .github/workflows/         # CI/CD
│   ├── ci.yml                 # Tests en PRs
│   └── deploy.yml             # Deploy automático
│
├── docker-compose.yml         # Desarrollo
└── docker-compose.prod.yml    # Producción
```

---

## 🚀 Inicio Rápido

### Prerequisitos

- Python 3.12+
- Node.js 20+
- Docker (para Qdrant)
- Ollama instalado localmente

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd Book_tutor
cp backend/.env.example backend/.env
```

### 2. Iniciar Qdrant

```bash
docker compose up -d qdrant
```

### 3. Configurar Ollama

```bash
# Instalar modelos (optimizado para bajo coste)
ollama pull qwen3:4b      # Chat model (~2.5GB)
ollama pull bge-m3        # Embeddings (~1.5GB)
```

### 4. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Iniciar servidor (auto-ingesta RAGs de docs/)
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Acceder

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Qdrant UI**: http://localhost:6333/dashboard

---

## 📖 Uso del Sistema

### Flujo Automático

1. **Subir documentos** → Crear carpeta en `backend/docs/{asignatura}/` con archivos `.md`
2. **Reiniciar backend** → Auto-ingesta detecta nueva carpeta y crea RAG
3. **Chatbot disponible** → Los estudiantes pueden hacer preguntas sobre la asignatura

### Añadir Nueva Asignatura

```bash
# 1. Crear carpeta con nombre de la asignatura (slug)
mkdir backend/docs/matematicas

# 2. Añadir documentos markdown
cp mis-apuntes/*.md backend/docs/matematicas/

# 3. Reiniciar backend (auto-ingesta)
# El chatbot de "matematicas" estará disponible automáticamente
```

---

## 🔌 API Endpoints

### Asignaturas

```
GET  /api/v1/asignaturas              # Listar todas
GET  /api/v1/asignaturas/{slug}       # Detalle + documentos
GET  /api/v1/asignaturas/{slug}/documents/{file}  # Contenido documento
```

### Chat RAG

```
POST /api/v1/chat/{slug}/ask
Body: { "question": "¿Qué es Python?" }
Response: {
  "answer": "Python es un lenguaje...",
  "sources": [
    { "source_file": "01-intro.md", "seccion": "Introducción", "score": 0.85 }
  ],
  "model_used": "qwen3:4b"
}

POST /api/v1/chat/{slug}/stream  # Respuesta en streaming (SSE)
```

### Health Check

```
GET /api/v1/health
Response: { "status": "ok", "ollama": { "status": "ok", "models": [...] } }
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Modelos (optimizado para bajo coste)
DEFAULT_LLM_MODEL=qwen3:4b
EMBEDDING_MODEL=bge-m3

# Qdrant
QDRANT_URL=http://localhost:6333

# RAG Settings (optimizado)
CHUNK_SIZE=1000
RETRIEVER_K=4
LLM_MAX_TOKENS=2048

# Documents
DOCS_DIR=./docs
```

---

## 🚀 CI/CD

El proyecto usa GitHub Actions para despliegue automático:

1. **Push a `main`** con cambios en `backend/docs/`
2. **GitHub Actions** construye imágenes Docker
3. **Deploy automático** al servidor
4. **Backend reinicia** y auto-ingesta nuevas asignaturas
5. **Chatbot disponible** automáticamente

### Configurar Secretos en GitHub

```
SERVER_HOST      → IP del servidor
SERVER_USER      → Usuario SSH
SERVER_SSH_KEY   → Clave privada SSH
DEPLOY_PATH      → Ruta del proyecto en servidor
```

---

## 📚 Documentación Adicional

- [DEPLOY.md](./DEPLOY.md) - Guía de despliegue en producción
- [COST.md](./COST.md) - Análisis de costes

---

## 📜 Licencia

MIT License

---

## 👥 Equipo

Desarrollado por el equipo de FP Prometeo.
