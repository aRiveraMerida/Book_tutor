# 🚀 Guía de Despliegue - BookTutor

Esta guía explica cómo desplegar BookTutor en producción con CI/CD automático.

---

## 📋 Índice

1. [Requisitos del Servidor](#requisitos-del-servidor)
2. [Configuración Inicial](#configuración-inicial)
3. [CI/CD con GitHub Actions](#cicd-con-github-actions)
4. [Añadir Nueva Asignatura](#añadir-nueva-asignatura)
5. [Troubleshooting](#troubleshooting)

---

## Requisitos del Servidor

### Hardware Mínimo

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 16 GB | 32 GB |
| Disco | 50 GB SSD | 100 GB SSD |
| GPU | No requerida | NVIDIA (opcional) |

### Software

- Docker y Docker Compose
- Git
- (Opcional) Nginx para reverse proxy

---

## Configuración Inicial

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reiniciar sesión
```

### 2. Clonar Repositorio

```bash
cd /opt
git clone https://github.com/tu-usuario/Book_tutor.git
cd Book_tutor
cp .env.example .env
```

### 3. Descargar Modelos Ollama

```bash
# Iniciar Ollama
docker compose -f docker-compose.prod.yml up -d ollama

# Descargar modelos (optimizados para bajo coste)
docker exec booktutor-ollama ollama pull qwen3:4b
docker exec booktutor-ollama ollama pull bge-m3
```

### 4. Iniciar Servicios

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verificar

```bash
curl http://localhost:8000/api/v1/health
```

---

## CI/CD con GitHub Actions

### Flujo Automático

```
1. Push a main (nueva carpeta en docs/)
       ↓
2. GitHub Actions detecta cambios
       ↓
3. Build de imágenes Docker
       ↓
4. Push a GitHub Container Registry
       ↓
5. SSH al servidor → docker compose pull → up
       ↓
6. Backend reinicia → auto-ingesta nuevos RAGs
       ↓
7. Chatbot disponible automáticamente
```

### Configurar Secretos en GitHub

Ve a `Settings > Secrets and variables > Actions` y añade:

| Secreto | Descripción | Ejemplo |
|---------|-------------|--------|
| `SERVER_HOST` | IP del servidor | `123.45.67.89` |
| `SERVER_USER` | Usuario SSH | `deploy` |
| `SERVER_SSH_KEY` | Clave privada SSH | `-----BEGIN OPENSSH...` |
| `DEPLOY_PATH` | Ruta del proyecto | `/opt/Book_tutor` |

### Configurar Variables

| Variable | Descripción | Ejemplo |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL pública de la API | `https://api.tu-dominio.com/api/v1` |

### Generar Clave SSH para Deploy

```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/deploy_key.pub usuario@servidor

# Copiar clave privada a GitHub Secrets (SERVER_SSH_KEY)
cat ~/.ssh/deploy_key
```

---

## Añadir Nueva Asignatura

### Opción 1: Via Git (Recomendado - CI/CD)

```bash
# En tu máquina local
git clone https://github.com/tu-usuario/Book_tutor.git
cd Book_tutor

# Crear carpeta con documentos
mkdir backend/docs/matematicas
cp mis-apuntes/*.md backend/docs/matematicas/

# Commit y push
git add backend/docs/matematicas/
git commit -m "feat: añadir asignatura matemáticas"
git push origin main

# GitHub Actions desplegará automáticamente
# El RAG se creará al reiniciar el backend
```

### Opción 2: Directamente en Servidor

```bash
# SSH al servidor
ssh usuario@servidor

# Añadir documentos
mkdir -p /opt/Book_tutor/backend/docs/matematicas
cp /tmp/apuntes/*.md /opt/Book_tutor/backend/docs/matematicas/

# Reiniciar backend para auto-ingest
docker compose -f docker-compose.prod.yml restart backend

# Verificar
curl http://localhost:8000/api/v1/asignaturas
```

---

## Nginx Reverse Proxy (Opcional)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_read_timeout 300s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/booktutor /etc/nginx/sites-enabled/
sudo certbot --nginx -d tu-dominio.com
```

---

## Troubleshooting

### Ollama no responde

```bash
docker logs booktutor-ollama
docker compose -f docker-compose.prod.yml restart ollama
```

### RAG no encuentra información

1. Verificar documentos en `backend/docs/{slug}/`
2. Reiniciar backend: `docker compose restart backend`
3. Reducir `MIN_RELEVANCE_SCORE` en config

### Ver logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Contacto

Para problemas, abrir issue en GitHub o contactar al equipo FP Prometeo.
