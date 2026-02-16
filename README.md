# 📚 BookTutor

**Plataforma educativa con tutor IA basado en RAG (Retrieval-Augmented Generation)**

BookTutor permite a los estudiantes leer documentos de estudio y hacer preguntas a un tutor IA que responde basándose exclusivamente en el contenido del material, citando las fuentes.

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
| LLM | Ollama (qwen3:8b) | Local |
| Embeddings | Ollama (bge-m3) | 1024 dims |
| Vector DB | Qdrant | 1.7.x |
| Auth | JWT (HS256) | - |

---

## 📁 Estructura del Proyecto

```
Book_tutor/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Endpoints REST
│   │   │   ├── auth.py       # Login, JWT
│   │   │   ├── asignaturas.py # CRUD asignaturas
│   │   │   ├── chat.py       # RAG Q&A
│   │   │   └── health.py     # Health check
│   │   ├── core/
│   │   │   ├── config.py     # Settings (pydantic)
│   │   │   └── security.py   # JWT, passwords
│   │   ├── db/
│   │   │   └── qdrant.py     # Qdrant client
│   │   ├── llm/
│   │   │   ├── base.py       # LLM abstract
│   │   │   └── ollama.py     # Ollama provider
│   │   ├── services/
│   │   │   ├── chunker.py    # Document splitting
│   │   │   └── rag_service.py # RAG orchestration
│   │   └── main.py           # FastAPI app
│   ├── docs/                  # Documentos por asignatura
│   │   └── {slug}/           # e.g., programacion/
│   └── requirements.txt
│
├── frontend/
│   ├── app/                   # Next.js App Router
│   │   ├── asignatura/[subject]/[file]/
│   │   ├── admin/
│   │   └── login/
│   ├── components/
│   │   └── chat/
│   │       ├── FloatingChat.tsx
│   │       └── ChatPanel.tsx
│   └── lib/
│       └── api.ts            # API client
│
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── scripts/
│   ├── start.sh              # Dev startup
│   └── seed_data.py          # Data seeding
│
├── docker-compose.yml        # Desarrollo
├── docker-compose.prod.yml   # Producción
└── .env.example
```

---

## 🚀 Inicio Rápido (Desarrollo)

### Prerequisitos

- Python 3.12+
- Node.js 20+
- Docker y Docker Compose
- Ollama instalado localmente

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd Book_tutor
cp .env.example .env
```

### 2. Iniciar servicios Docker

```bash
# Qdrant (vector database)
docker-compose up -d qdrant
```

### 3. Configurar Ollama

```bash
# Instalar modelos requeridos
ollama pull qwen3:8b      # Chat model (~5GB)
ollama pull bge-m3        # Embeddings (~1.5GB)
```

### 4. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Iniciar servidor
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

### Credenciales Demo

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Admin |
| user | user123 | User |

---

## 📖 Uso del Sistema

### Flujo del Usuario

1. **Login** → Autenticación con JWT
2. **Seleccionar asignatura** → Ver lista de documentos
3. **Leer documento** → Markdown renderizado
4. **Chat con tutor** → Botón flotante o `⌘K`
5. **Hacer preguntas** → Respuestas con citas `[1][2]`

### Flujo del Admin

1. **Login como admin**
2. **Panel Admin** → `/admin`
3. **Crear asignatura** → Nombre, slug, icono
4. **Subir documentos** → Markdown
5. **Procesar** → Chunking + Embeddings → Qdrant

---

## 🔌 API Endpoints

### Autenticación

```
POST /api/v1/auth/login
Body: { "username": "user", "password": "user123" }
Response: { "access_token": "...", "token_type": "bearer", "role": "user" }
```

### Asignaturas

```
GET  /api/v1/asignaturas              # Listar todas
GET  /api/v1/asignaturas/{slug}       # Detalle + documentos
POST /api/v1/asignaturas              # Crear (admin)
POST /api/v1/asignaturas/{slug}/process # Procesar docs (admin)
```

### Chat RAG

```
POST /api/v1/chat/{slug}/ask
Headers: Authorization: Bearer <token>
Body: { "question": "¿Qué es Python?" }
Response: {
  "answer": "Python es un lenguaje... [1]",
  "sources": [
    { "source_file": "01-intro.md", "seccion": "¿Qué es Python?", "score": 0.85 }
  ],
  "model_used": "qwen3:8b"
}
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
# Backend
SECRET_KEY=your-secret-key-here
ENVIRONMENT=dev
CORS_ORIGINS=["http://localhost:3000"]

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=qwen3:8b
EMBEDDING_MODEL=bge-m3

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_PREFIX=book_

# RAG Settings
CHUNK_SIZE=500
CHUNK_OVERLAP=100
RETRIEVER_K=6
MIN_RELEVANCE_SCORE=0.4

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

---

## 📚 Añadir Contenido

### Formato de Documentos

Los documentos deben estar en Markdown con estructura jerárquica:

```markdown
# Título del Documento

## Sección Principal

Contenido de la sección...

### Subsección

Más contenido...
```

### Ubicación

```
backend/docs/{slug-asignatura}/
├── 01-introduccion.md
├── 02-conceptos-basicos.md
└── 03-ejercicios.md
```

### Procesar Documentos

```bash
# Via API (admin)
curl -X POST "http://localhost:8000/api/v1/asignaturas/programacion/process" \
  -H "Authorization: Bearer <admin-token>"
```

---

## 🛠️ Desarrollo

### Convenciones de Código

- **Python**: PEP 8, type hints
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional Commits

### Estructura de Branches

```
main        # Producción estable
├── develop # Desarrollo
└── feature/xxx # Nuevas funcionalidades
```

### Pre-commit (recomendado)

```bash
# Backend
pip install black isort ruff
black app/
isort app/
ruff check app/

# Frontend
npm run lint
npm run format
```

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

---

## 📄 Documentación Adicional

- [DEPLOY.md](./DEPLOY.md) - Guía de despliegue
- [COST.md](./COST.md) - Análisis de costes

---

## 📜 Licencia

MIT License - Ver [LICENSE](./LICENSE) para más detalles.

---

## 👥 Equipo

Desarrollado por el equipo de FP Prometeo.
