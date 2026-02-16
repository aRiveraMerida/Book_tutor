# 🚀 Guía de Despliegue - BookTutor

Esta guía cubre el despliegue de BookTutor en diferentes entornos.

---

## 📋 Índice

1. [Desarrollo Local](#desarrollo-local)
2. [Docker Compose (Producción)](#docker-compose-producción)
3. [Servidor VPS/Cloud](#servidor-vpscloud)
4. [Kubernetes](#kubernetes)
5. [Troubleshooting](#troubleshooting)

---

## Desarrollo Local

### Requisitos

| Requisito | Versión Mínima | Comando de verificación |
|-----------|----------------|------------------------|
| Python | 3.12+ | `python --version` |
| Node.js | 20+ | `node --version` |
| Docker | 24+ | `docker --version` |
| Ollama | Latest | `ollama --version` |

### Paso 1: Clonar repositorio

```bash
git clone https://github.com/tu-org/book_tutor.git
cd book_tutor
```

### Paso 2: Variables de entorno

```bash
cp .env.example .env
# Editar .env con valores de desarrollo
```

### Paso 3: Servicios Docker (solo Qdrant)

```bash
docker-compose up -d qdrant
```

### Paso 4: Modelos Ollama

```bash
# Descargar modelos (requiere ~7GB de espacio)
ollama pull qwen3:8b    # Modelo de chat
ollama pull bge-m3      # Modelo de embeddings

# Verificar
ollama list
```

### Paso 5: Backend

```bash
cd backend

# Entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencias
pip install -r requirements.txt

# Iniciar (desarrollo con hot-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Paso 6: Frontend

```bash
cd frontend

# Dependencias
npm install

# Iniciar (desarrollo)
npm run dev
```

### Verificar instalación

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Respuesta esperada:
# {"status":"ok","environment":"dev","ollama":{"status":"ok","models":["qwen3:8b","bge-m3"]}}
```

---

## Docker Compose (Producción)

### Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────────┐
│                     docker-compose.prod.yml                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ frontend│  │ backend │  │ qdrant  │  │     ollama      │ │
│  │  :3000  │  │  :8000  │  │  :6333  │  │     :11434      │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
│       │            │            │               │           │
│       └────────────┴────────────┴───────────────┘           │
│                         │                                    │
│                    red interna                               │
└─────────────────────────────────────────────────────────────┘
```

### Paso 1: Preparar servidor

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

### Paso 2: Clonar y configurar

```bash
git clone https://github.com/tu-org/book_tutor.git
cd book_tutor

# Configurar producción
cp .env.example .env
nano .env
```

**Variables de producción importantes:**

```env
# IMPORTANTE: Cambiar en producción
SECRET_KEY=genera-una-clave-segura-aqui-min-32-chars
ENVIRONMENT=production

# URLs de producción
CORS_ORIGINS=["https://tu-dominio.com"]
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com

# Ollama (mismo servidor o remoto)
OLLAMA_BASE_URL=http://ollama:11434
```

### Paso 3: Construir imágenes

```bash
# Construir todas las imágenes
docker-compose -f docker-compose.prod.yml build

# O individualmente
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### Paso 4: Descargar modelos Ollama

```bash
# Iniciar solo Ollama primero
docker-compose -f docker-compose.prod.yml up -d ollama

# Esperar a que inicie (~30s)
sleep 30

# Descargar modelos dentro del contenedor
docker exec -it booktutor-ollama ollama pull qwen3:8b
docker exec -it booktutor-ollama ollama pull bge-m3
```

### Paso 5: Iniciar todo

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Estado de servicios
docker-compose -f docker-compose.prod.yml ps
```

### Paso 6: Nginx Reverse Proxy (opcional)

```nginx
# /etc/nginx/sites-available/booktutor
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/booktutor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## Servidor VPS/Cloud

### Requisitos del servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 16 GB | 32 GB |
| Disco | 50 GB SSD | 100 GB SSD |
| GPU | - | NVIDIA (para Ollama rápido) |

### Opciones de hosting

#### AWS EC2

```bash
# Tipo de instancia recomendada
t3.xlarge    # Sin GPU, para pruebas
g4dn.xlarge  # Con GPU NVIDIA T4
```

#### DigitalOcean

```bash
# Droplet recomendado
CPU-Optimized: 8 vCPU, 16GB RAM
```

#### Hetzner

```bash
# Servidor dedicado económico
AX41-NVMe: Ryzen 5 3600, 64GB RAM
```

### Script de instalación automática

```bash
#!/bin/bash
# install.sh - Ejecutar como root

set -e

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt install -y docker-compose

# Crear directorio de la aplicación
mkdir -p /opt/booktutor
cd /opt/booktutor

# Clonar repositorio
git clone https://github.com/tu-org/book_tutor.git .

# Configurar
cp .env.example .env
echo "Edita /opt/booktutor/.env con tus valores de producción"

# Crear servicio systemd
cat > /etc/systemd/system/booktutor.service << EOF
[Unit]
Description=BookTutor Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/booktutor
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable booktutor
```

---

## Kubernetes

### Helm Chart (básico)

```yaml
# values.yaml
backend:
  replicas: 2
  image: ghcr.io/tu-org/booktutor-backend:latest
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

frontend:
  replicas: 2
  image: ghcr.io/tu-org/booktutor-frontend:latest
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"

qdrant:
  replicas: 1
  persistence:
    size: 10Gi
    
ollama:
  replicas: 1
  gpu: true
  resources:
    limits:
      nvidia.com/gpu: 1
```

### Despliegue

```bash
# Añadir repositorio
helm repo add booktutor https://charts.tu-org.com

# Instalar
helm install booktutor booktutor/booktutor -f values.yaml

# Actualizar
helm upgrade booktutor booktutor/booktutor -f values.yaml
```

---

## Troubleshooting

### Problemas comunes

#### 1. Ollama no responde

```bash
# Verificar que Ollama está corriendo
docker logs booktutor-ollama

# Reiniciar
docker-compose restart ollama

# Verificar modelos
docker exec booktutor-ollama ollama list
```

#### 2. Error de conexión Qdrant

```bash
# Verificar estado
curl http://localhost:6333/health

# Ver logs
docker logs booktutor-qdrant

# Verificar disco
df -h
```

#### 3. Frontend no conecta con backend

```bash
# Verificar CORS
curl -I http://localhost:8000/api/v1/health

# Verificar variable de entorno
echo $NEXT_PUBLIC_API_URL
```

#### 4. Error de memoria

```bash
# Ver uso de memoria
docker stats

# Aumentar swap (si es necesario)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 5. Modelos Ollama lentos

```bash
# Sin GPU, los modelos son lentos. Opciones:
# 1. Usar GPU (recomendado)
# 2. Usar modelo más pequeño
ollama pull qwen3:4b  # En vez de 8b

# 3. Usar servicio externo (OpenAI, etc.)
```

### Logs útiles

```bash
# Todos los logs
docker-compose -f docker-compose.prod.yml logs -f

# Solo backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Últimas 100 líneas
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Backup y restauración

```bash
# Backup de Qdrant
docker exec booktutor-qdrant \
  curl -X POST 'http://localhost:6333/collections/book_programacion/snapshots'

# Backup de datos
tar -czvf backup-$(date +%Y%m%d).tar.gz \
  /opt/booktutor/backend/docs \
  /opt/booktutor/.env

# Restaurar
tar -xzvf backup-20240214.tar.gz -C /
```

---

## Checklist de Despliegue

### Pre-despliegue

- [ ] Variables de entorno configuradas
- [ ] SECRET_KEY cambiada (mínimo 32 caracteres)
- [ ] CORS configurado para dominio de producción
- [ ] Certificado SSL configurado
- [ ] Firewall configurado (puertos 80, 443)

### Post-despliegue

- [ ] Health check responde OK
- [ ] Login funciona
- [ ] Chat RAG responde
- [ ] Modelos Ollama cargados
- [ ] Backup automatizado configurado
- [ ] Monitoreo configurado (opcional)

---

## Contacto

Si tienes problemas con el despliegue, contacta al equipo de desarrollo.
