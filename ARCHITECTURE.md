# Arquitectura de BookTutor

BookTutor es una plataforma educativa **RAG (Retrieval-Augmented Generation)** para estudiantes de FP Prometeo. Proporciona un tutor IA que responde preguntas **exclusivamente basandose en el material del curso** — no alucina ni usa conocimiento externo. Todo se ejecuta localmente sin costes de API externos.

---

## Servicios

```
Frontend (Next.js 16, puerto 3000)     ← Lo que ven los estudiantes
    ↕ API route proxies
Backend (FastAPI, puerto 8000)          ← Orquesta todo
    ↕                    ↕
Qdrant (puerto 6333)    Ollama (puerto 11434)
(base de datos          (modelos IA locales)
 vectorial)
```

| Servicio | Rol |
|----------|-----|
| **Ollama** | Servidor de inferencia local que aloja dos modelos: `qwen3:4b` (chat) y `bge-m3` (embeddings) |
| **Qdrant** | Base de datos vectorial que almacena chunks de documentos como embeddings y realiza busquedas por similitud coseno |
| **FastAPI** | Backend Python que conecta todo: ingesta, recuperacion y generacion |
| **Next.js** | Frontend React con un chat flotante por asignatura |

---

## Modelos de IA

### qwen3:4b — Modelo de chat

- Genera las respuestas del tutor
- Elegido sobre qwen3:8b por menor consumo de recursos (50% menos)
- Configuracion: `temperature=0.2` (respuestas deterministas), `max_tokens=2048`
- Se usa la directiva `/no_think` para desactivar el razonamiento verbose de Qwen 3
- Cualquier bloque `<think>...</think>` residual se elimina del output

### bge-m3 — Modelo de embeddings

- Convierte texto en vectores de 1024 dimensiones
- Multilingue (funciona bien en espanol)
- Se usa tanto para indexar los documentos como para las consultas del usuario
- Ambos textos se mapean al mismo espacio vectorial, permitiendo la busqueda por similitud

---

## Fase 1: Ingesta de documentos

La ingesta ocurre **automaticamente al arrancar el backend** via el evento lifespan de `app/main.py`.

### Paso 1 — Escaneo de asignaturas

`auto_ingest.py` escanea `backend/docs/` buscando subdirectorios. Cada nombre de carpeta se convierte en el slug de la asignatura:

```
backend/docs/
  ├── programacion/      → slug: "programacion"
  │   ├── 01-intro.md
  │   ├── 02-variables.md
  │   └── ...
  └── bases-de-datos/    → slug: "bases-de-datos"
      └── 01-introduccion-sql.md
```

Si la coleccion de Qdrant `book_programacion` ya existe, se salta esa asignatura. Para anadir una nueva asignatura basta con crear una carpeta con ficheros `.md` y reiniciar.

### Paso 2 — Parsing y chunking del markdown

`ingest_service.py` procesa cada fichero `.md` con una **estrategia de chunking jerarquico**:

1. Limpia cabeceras bold de Notion (`## **Titulo**` → `## Titulo`)
2. Divide primero por cabeceras `##` (limites semanticos de seccion)
3. Si una seccion sigue siendo grande (>1000 chars), divide por parrafos (`\n\n`)
4. Cada chunk conserva metadatos: `source_file`, `titulo` (h1), `seccion` (h2), `subseccion` (h3)

Configuracion: `chunk_size=1000 caracteres`, `chunk_overlap=100 caracteres`.

### Paso 3 — Generacion de embeddings

El texto de cada chunk se envia al modelo **bge-m3 de Ollama** via `POST /api/embeddings`. Esto devuelve un vector de 1024 floats que representa el significado semantico del texto.

### Paso 4 — Almacenamiento en Qdrant

`qdrant.py` crea una coleccion `book_{slug}` configurada con distancia coseno, y hace upsert de todos los chunks como puntos con su vector de embedding y su payload de metadatos (content, source_file, titulo, seccion, subseccion, chunk_index).

```
Documento .md
    ↓ parse + chunk
[chunk1, chunk2, chunk3, ...]
    ↓ bge-m3 embedding
[[0.12, -0.34, ...], [0.56, 0.78, ...], ...]   ← vectores 1024-dim
    ↓ upsert
Qdrant collection "book_{slug}"
```

---

## Fase 2: Pipeline RAG (como se responde una pregunta)

Este es el flujo principal cuando un estudiante hace una pregunta. Orquestado por `rag_service.py`.

### Paso 1 — Embedding de la pregunta

La pregunta del usuario se convierte en un vector de 1024 dimensiones usando el mismo modelo **bge-m3**. Esto la situa en el mismo espacio vectorial que los chunks de documentos.

### Paso 2 — Busqueda por similitud en Qdrant

```python
results = qdrant.search(
    collection_name="book_{slug}",
    query_vector=question_embedding,
    limit=12,                    # sobre-busqueda
    score_threshold=0.3,         # relevancia minima
)
results = results[:4]            # quedarse con los 4 mas relevantes
```

Qdrant calcula la **similitud coseno** entre el vector de la pregunta y todos los vectores almacenados. Los chunks con puntuacion menor a 0.3 se descartan. Solo se conservan los 4 mejores — esto mantiene bajos los costes de tokens.

### Paso 3 — Construccion del contexto numerado

Los chunks seleccionados se formatean en un string de contexto numerado:

```
[1] Contenido del chunk mas relevante...

[2] Contenido del segundo chunk...

[3] Contenido del tercer chunk...

[4] Contenido del cuarto chunk...
```

Tambien se construye una lista de `sources` con metadatos (fichero, titulo, seccion, score) para que el frontend los muestre.

### Paso 4 — Prompt al LLM

El system prompt (en espanol) instruye al modelo para:
- Actuar como tutor educativo
- Responder **SOLO** con informacion del contexto proporcionado — nunca inventar
- Citar fuentes usando `[1]`, `[2]`, etc. al final de las afirmaciones
- Responder en espanol con formato markdown
- Decir "no tengo informacion suficiente" si el contexto no cubre la pregunta

### Paso 5 — Streaming de la respuesta

Para el endpoint de streaming (`/chat/{slug}/stream`), la respuesta se entrega como **Server-Sent Events (SSE)**:

```
event: sources
data: [{"source_file": "01-intro.md", "titulo": "...", "score": 0.87}, ...]

event: token
data: {"token": "Una"}

event: token
data: {"token": " variable"}

event: token
data: {"token": " es"}
...

event: done
data: {"status": "complete"}
```

Las fuentes se envian primero para que la UI las muestre inmediatamente, luego los tokens llegan uno a uno.

---

## Fase 3: Como llega el streaming al usuario (Frontend)

### Capa proxy

El frontend **nunca llama a Ollama o Qdrant directamente**. Las API routes de Next.js actuan como proxies:

```
Navegador → POST /api/subjects/{slug}/stream     (Next.js route)
          → POST /api/v1/chat/{slug}/stream       (FastAPI backend)
```

Esto mantiene la URL del backend privada y permite desplegar el frontend por separado.

### El hook `useChat`

`hooks/useChat.ts` gestiona todo el estado del chat:

1. El usuario envia un mensaje → se anade al estado con `role: 'user'`
2. Se crea un mensaje placeholder del asistente con `isStreaming: true`
3. `streamAnswer()` en `lib/api.ts` abre una conexion SSE
4. Es un **AsyncGenerator** que parsea los eventos SSE:
   - `event: sources` → se parsean y se adjuntan al mensaje
   - `event: token` → se anade al contenido del mensaje, React re-renderiza
   - `event: done` → `isStreaming` se pone a false
   - `event: error` → se muestra el error
5. Un `AbortController` permite cancelar el stream a mitad
6. El historial del chat se **persiste en localStorage** bajo `chat_{slug}` para sobrevivir a recargas de pagina

### Interfaz de usuario

- **Pagina principal** (`app/page.tsx`) — lista todas las asignaturas disponibles con iconos
- **Pagina de asignatura** (`app/asignatura/[subject]/page.tsx`) — visor de documentos para leer los ficheros markdown + **chat flotante** (esquina inferior derecha, togglable con Cmd+K)
- **ChatPanel** renderiza mensajes con `react-markdown` + `remark-gfm` + `rehype-highlight` para resaltado de sintaxis de codigo

---

## Flujo completo: de pregunta a respuesta

```
Estudiante escribe: "¿Que es una variable?"
        ↓
FloatingChat → useChat.sendMessage()
        ↓
POST /api/subjects/programacion/stream
        ↓
Next.js proxy → POST /api/v1/chat/programacion/stream
        ↓
RAGService.astream():
  1. Embed pregunta con bge-m3 → [0.12, -0.34, ...]
  2. Busqueda coseno en Qdrant (book_programacion) → top 4 chunks
  3. Construir contexto: "[1] Una variable es... [2] Los tipos de..."
  4. System prompt: "Eres un tutor, usa SOLO el contexto..."
  5. Ollama qwen3:4b genera respuesta, streaming de tokens
        ↓
SSE: sources → tokens → done
        ↓
useChat actualiza estado React token a token
        ↓
Estudiante ve: "Una variable es un espacio en memoria que
almacena un valor [1]. Existen diferentes tipos... [2]"
```

---

## Decisiones de diseno

| Decision | Razon |
|----------|-------|
| Todo local (Ollama + Qdrant) | Sin costes de API externos |
| qwen3:4b en vez de 8b | 50% menos recursos con calidad suficiente |
| bge-m3 para embeddings | Multilingue, 1024 dims, buen rendimiento en espanol |
| chunk_size=1000, K=4 | Menor consumo de tokens manteniendo calidad |
| temperature=0.2 | Respuestas deterministas y consistentes |
| score_threshold=0.3 | Corte estricto de relevancia, evita ruido |
| SSE streaming | Latencia minima, el usuario ve tokens en tiempo real |
| Proxy via Next.js API routes | Backend URL privada, despliegue independiente |
| localStorage para historial | Persistencia sin base de datos adicional |
| Auto-ingesta al arrancar | Anadir asignatura = crear carpeta + reiniciar |
| `/no_think` para Qwen 3 | Output limpio sin razonamiento interno visible |

---

## Anadir una nueva asignatura

1. Crear `backend/docs/<slug-asignatura>/` con ficheros `.md`
2. Reiniciar el backend — la auto-ingesta detecta la nueva carpeta, parsea los markdowns, genera embeddings y crea la coleccion en Qdrant
3. La asignatura aparece automaticamente en el frontend

---

## Stack tecnologico

| Capa | Tecnologias |
|------|-------------|
| **Backend** | Python 3.12, FastAPI, Pydantic Settings, httpx, qdrant-client 1.7.x, langchain-text-splitters |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, react-markdown, remark-gfm, rehype-highlight |
| **IA** | Ollama (qwen3:4b para chat, bge-m3 para embeddings 1024-dim) |
| **Vector DB** | Qdrant 1.7.4 |
| **Infra** | Docker Compose, GitHub Actions (CI/CD) |
