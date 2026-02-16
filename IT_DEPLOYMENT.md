# 🚀 BookTutor - Guía de Despliegue para IT

> **Versión**: 2.0.0  
> **Fecha**: Febrero 2026  
> **Contacto**: equipo FP Prometeo

---

## 📋 Resumen Ejecutivo

BookTutor es una plataforma educativa con tutor IA basado en RAG. Permite a estudiantes leer documentos y hacer preguntas a un chatbot que responde basándose en el contenido.

### Características Clave
- ✅ **Sin autenticación** - Acceso directo
- ✅ **Auto-ingest** - Nuevas asignaturas se detectan automáticamente
- ✅ **100% Local** - LLM y embeddings corren con Ollama (sin APIs externas)
- ✅ **CI/CD** - Deploy automático via GitHub Actions

---

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│     Ollama      │
│   Next.js 15    │     │   FastAPI       │     │  qwen3:4b       │
│   :3000         │     │   :8000         │     │  :11434         │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │     Qdrant      │
                        │  Vector Store   │
                        │   :6333         │
                        └─────────────────┘
```

### Servicios Requeridos

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 3000 | Interfaz web (Next.js) |
| Backend | 8000 | API REST (FastAPI) |
| Qdrant | 6333 | Base de datos vectorial |
| Ollama | 11434 | LLM local |

---

## 💰 Costes Estimados

### Modelo de Costes

```
FASE 1: INGESTIÓN (Una vez) → Coste: €0 (lo hacemos nosotros)
FASE 2: USO (Diario)        → Coste: Solo servidor
```

### Escenario Real: 2,000 Alumnos × 20 Consultas/Día × 1 Año

| Concepto | Coste Mensual | Coste Anual |
|----------|---------------|-------------|
| Servidor GPU (Hetzner GEX44) | €180 | €2,160 |
| Backup + Dominio | €10 | €135 |
| APIs externas (Ollama local) | €0 | €0 |
| **TOTAL** | **€190/mes** | **€2,295/año** |

| Métrica | Valor |
|---------|-------|
| Coste por alumno/año | **€1.15** |
| Coste por consulta | **€0.00032** |
| Consultas anuales | 7,200,000 |

### Comparativa

| Opción | Coste Anual |
|--------|-------------|
| ✅ **BookTutor (Self-hosted)** | **€2,300** |
| ❌ OpenAI GPT-4o-mini | €14,900 |
| ❌ ChatGPT Team | €528,000 |

> 📄 Ver [COST.md](./COST.md) para análisis detallado

---

## ⚙️ Requisitos del Servidor

### Hardware Mínimo

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 16 GB | 32 GB |
| Disco | 50 GB SSD | 100 GB SSD |
| GPU | No requerida | NVIDIA (opcional) |

### Software

- Docker 24+
- Docker Compose 2+
- Git

---

## 🚀 Despliegue Rápido

### 1. Clonar y Configurar

```bash
# Clonar repositorio
cd /opt
git clone https://github.com/tu-org/Book_tutor.git
cd Book_tutor

# Configurar entorno
cp .env.example .env
```

### 2. Descargar Modelos IA (~4GB)

```bash
# Iniciar Ollama
docker compose -f docker-compose.prod.yml up -d ollama

# Esperar 30s y descargar modelos
sleep 30
docker exec booktutor-ollama ollama pull qwen3:4b
docker exec booktutor-ollama ollama pull bge-m3
```

### 3. Iniciar Todos los Servicios

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4. Verificar

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Listar asignaturas
curl http://localhost:8000/api/v1/asignaturas
```

### 5. Acceder

- **Frontend**: http://IP-SERVIDOR:3000
- **API Docs**: http://IP-SERVIDOR:8000/docs
- **Qdrant UI**: http://IP-SERVIDOR:6333/dashboard

---

## 📂 Añadir Asignaturas

Las asignaturas se añaden automáticamente al colocar carpetas con archivos `.md` en `backend/docs/`:

```
backend/docs/
├── programacion/        ← Asignatura "Programacion"
│   ├── 01-intro.md
│   └── 02-variables.md
├── bases-de-datos/      ← Asignatura "Bases De Datos"
│   └── sql-basics.md
└── matematicas/         ← Asignatura "Matematicas" (NUEVA)
    └── algebra.md
```

**Después de añadir carpetas, reiniciar backend:**

```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## 🔄 CI/CD (GitHub Actions)

El proyecto incluye pipelines de CI/CD que despliegan automáticamente cuando se hace push a `main`.

### Flujo Automático

```
Push a main → Build Docker → Push Registry → SSH Deploy → Auto-ingest RAG
```

### Secretos Requeridos en GitHub

| Secreto | Valor |
|---------|-------|
| `SERVER_HOST` | IP del servidor |
| `SERVER_USER` | Usuario SSH (ej: `deploy`) |
| `SERVER_SSH_KEY` | Clave privada SSH |
| `DEPLOY_PATH` | `/opt/Book_tutor` |

### Variables

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://dominio.com/api/v1` |

---

## 🔒 Seguridad

### Puertos a Exponer (Firewall)

| Puerto | Acceso |
|--------|--------|
| 80/443 | Público (via Nginx) |
| 3000 | Interno (Frontend) |
| 8000 | Interno (Backend) |
| 6333 | Interno (Qdrant) |
| 11434 | Interno (Ollama) |

### Nginx Reverse Proxy (Recomendado)

```bash
# Instalar Nginx y Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Copiar configuración
sudo cp docker/nginx.conf /etc/nginx/sites-available/booktutor
sudo ln -s /etc/nginx/sites-available/booktutor /etc/nginx/sites-enabled/

# SSL automático
sudo certbot --nginx -d tu-dominio.com
```

---

## 📊 Monitorización

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo backend
docker compose -f docker-compose.prod.yml logs -f backend

# Últimas 100 líneas
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Estado de Servicios

```bash
docker compose -f docker-compose.prod.yml ps
```

### Uso de Recursos

```bash
docker stats
```

---

## 🔧 Mantenimiento

### Actualizar Aplicación

```bash
cd /opt/Book_tutor
git pull origin main
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Backup

```bash
# Backup de datos vectoriales
docker run --rm -v booktutor-qdrant-data:/data -v $(pwd):/backup \
  alpine tar cvf /backup/qdrant-backup-$(date +%Y%m%d).tar /data

# Backup de documentos
tar cvf docs-backup-$(date +%Y%m%d).tar backend/docs/
```

### Limpiar Imágenes Antiguas

```bash
docker image prune -f
```

---

## ❓ Troubleshooting

| Problema | Solución |
|----------|----------|
| Ollama lento (30-60s) | Normal sin GPU. Usar `qwen3:4b` en vez de `8b` |
| RAG no encuentra info | Verificar docs en `backend/docs/`, reiniciar backend |
| Error de memoria | Añadir swap: `fallocate -l 4G /swapfile` |
| Frontend no conecta | Verificar `NEXT_PUBLIC_API_URL` en `.env` |

### Comandos de Diagnóstico

```bash
# Verificar Ollama
docker exec booktutor-ollama ollama list

# Verificar Qdrant
curl http://localhost:6333/collections

# Ver logs de errores
docker compose -f docker-compose.prod.yml logs backend 2>&1 | grep -i error
```

---

## 📚 Documentación Relacionada

- [README.md](./README.md) - Documentación general
- [DEPLOY.md](./DEPLOY.md) - Guía detallada de despliegue
- [COST.md](./COST.md) - Análisis de costes
- [backend/README.md](./backend/README.md) - Documentación del backend

---

## ✅ Checklist de Despliegue

### Pre-despliegue
- [ ] Servidor cumple requisitos mínimos (4 cores, 16GB RAM)
- [ ] Docker y Docker Compose instalados
- [ ] Puertos 3000, 8000, 6333, 11434 disponibles
- [ ] Git configurado

### Despliegue
- [ ] Repositorio clonado en `/opt/Book_tutor`
- [ ] Archivo `.env` configurado
- [ ] Modelos Ollama descargados (qwen3:4b, bge-m3)
- [ ] Servicios iniciados con docker compose
- [ ] Health check responde OK

### Post-despliegue
- [ ] Nginx configurado (si se usa dominio)
- [ ] SSL configurado (certbot)
- [ ] Firewall configurado
- [ ] Backup automatizado
- [ ] CI/CD secretos configurados en GitHub

### Verificación
- [ ] Frontend accesible en :3000
- [ ] API responde en :8000/api/v1/health
- [ ] Chat IA funciona y responde preguntas
- [ ] Asignaturas se muestran correctamente

---

## 📞 Soporte

- **Issues**: https://github.com/tu-org/Book_tutor/issues
- **Email**: soporte@fpprometeo.com
- **Equipo**: FP Prometeo
