# 💰 Análisis de Costes - BookTutor

Este documento analiza los costes asociados a la operación de BookTutor, desglosando los gastos de infraestructura, procesamiento RAG y peticiones al tutor IA.

---

## 📊 Resumen Ejecutivo

| Escenario | Coste Mensual | Coste por Petición |
|-----------|---------------|-------------------|
| **Self-hosted (Ollama local)** | ~€50-150 | ~€0.00 |
| **Cloud (OpenAI GPT-4o-mini)** | Variable | ~€0.002-0.01 |
| **Híbrido (Cloud + Local)** | ~€100-300 | ~€0.001-0.005 |

---

## 🏗️ Costes de Infraestructura

### Opción 1: Self-Hosted (Recomendado para Educación)

#### Servidor sin GPU

| Proveedor | Especificaciones | Coste Mensual |
|-----------|-----------------|---------------|
| **Hetzner** | CPX41 (8 vCPU, 16GB RAM) | ~€30/mes |
| **DigitalOcean** | Premium (8 vCPU, 16GB) | ~€96/mes |
| **OVH** | B2-30 (8 vCPU, 30GB) | ~€50/mes |

> ⚠️ Sin GPU, cada petición al tutor tarda ~30-60 segundos con qwen3:8b

#### Servidor con GPU (Recomendado)

| Proveedor | GPU | Coste Mensual |
|-----------|-----|---------------|
| **Hetzner** | - | No disponible |
| **AWS** | g4dn.xlarge (T4) | ~€400/mes |
| **Lambda Labs** | A10 (24GB) | ~€300/mes |
| **Vast.ai** | RTX 4090 | ~€150-250/mes |

> ✅ Con GPU, cada petición tarda ~2-5 segundos

### Opción 2: Servicios Cloud (Pago por Uso)

#### Qdrant Cloud

| Plan | Capacidad | Coste |
|------|-----------|-------|
| Free | 1GB, 1 nodo | €0/mes |
| Starter | 4GB | ~€25/mes |
| Production | 20GB+ | ~€100+/mes |

Para BookTutor típico (10 asignaturas, 100 documentos): **~€0-25/mes**

---

## 🧠 Costes de Procesamiento RAG

El pipeline RAG tiene dos fases con costes diferentes:

### Fase 1: Indexación (Embeddings)

Se ejecuta **una vez** al añadir/actualizar documentos.

#### Con Ollama (bge-m3) - GRATIS

```
Coste = €0 (local)
Tiempo = ~0.5s por chunk
```

#### Con OpenAI (text-embedding-3-small)

```
Precio: $0.00002 / 1K tokens

Ejemplo para 1 asignatura:
- 10 documentos × 20 chunks × 300 tokens/chunk = 60,000 tokens
- Coste = 60,000 / 1,000 × $0.00002 = $0.0012 ≈ €0.001
```

**Coste típico de indexar todo el contenido**: €0.01-0.10 (una vez)

### Fase 2: Búsqueda (Query)

Se ejecuta en **cada pregunta** del usuario.

```
1 query embedding = ~20 tokens
Coste OpenAI = $0.00002 × 20 / 1000 = $0.0000004 ≈ DESPRECIABLE
```

---

## 🤖 Costes por Petición al Tutor

### Desglose de una Petición Típica

```
Usuario pregunta: "¿Qué es Python?"

1. Embedding de la pregunta
   - Tokens: ~20
   - Coste (OpenAI): ~€0.0000004
   - Coste (Ollama): €0

2. Búsqueda en Qdrant
   - Operaciones: 1 query
   - Coste (Cloud): ~€0.000001
   - Coste (Self-hosted): €0

3. Generación de respuesta (LLM)
   - Input: ~2000 tokens (contexto + pregunta)
   - Output: ~500 tokens (respuesta)
   - Total: ~2500 tokens
```

### Comparativa de Modelos

| Modelo | Input (1M tok) | Output (1M tok) | Coste/Petición |
|--------|---------------|-----------------|----------------|
| **Ollama qwen3:8b** | €0 | €0 | **€0.00** |
| **OpenAI GPT-4o-mini** | $0.15 | $0.60 | **~€0.002** |
| **OpenAI GPT-4o** | $2.50 | $10.00 | **~€0.03** |
| **Claude 3.5 Haiku** | $0.25 | $1.25 | **~€0.004** |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | **~€0.05** |

### Cálculo Detallado (GPT-4o-mini)

```
Input: 2000 tokens × $0.15/1M = $0.0003
Output: 500 tokens × $0.60/1M = $0.0003
Total por petición: $0.0006 ≈ €0.0005

+ Embedding: ~€0.0000004
+ Qdrant: ~€0.000001

TOTAL: ~€0.0005-0.001 por petición
```

---

## 📈 Proyecciones de Uso

### Escenario: Centro Educativo Pequeño

```
- 100 estudiantes
- 5 preguntas/estudiante/día
- 20 días lectivos/mes

Peticiones mensuales: 100 × 5 × 20 = 10,000 peticiones
```

| Opción | Coste LLM | Infra | **Total Mensual** |
|--------|-----------|-------|-------------------|
| Ollama (self-hosted) | €0 | €50-100 | **~€50-100** |
| GPT-4o-mini | €5-10 | €25 | **~€30-35** |
| GPT-4o | €300 | €25 | **~€325** |

### Escenario: Centro Educativo Grande

```
- 1000 estudiantes
- 10 preguntas/estudiante/día
- 20 días lectivos/mes

Peticiones mensuales: 1000 × 10 × 20 = 200,000 peticiones
```

| Opción | Coste LLM | Infra | **Total Mensual** |
|--------|-----------|-------|-------------------|
| Ollama (GPU) | €0 | €300-400 | **~€300-400** |
| GPT-4o-mini | €100-200 | €100 | **~€200-300** |
| GPT-4o | €6000 | €100 | **~€6100** |

---

## 💡 Recomendaciones

### Para Desarrollo/Pruebas

```
✅ Ollama local (qwen3:8b + bge-m3)
✅ Qdrant local (Docker)
💰 Coste: €0 (solo electricidad)
```

### Para Producción Pequeña (<50 usuarios)

```
✅ Servidor VPS sin GPU (Hetzner CPX41)
✅ Ollama con modelo pequeño (qwen3:4b)
✅ Qdrant local
💰 Coste: ~€30-50/mes
⏱️ Latencia: 20-40s por respuesta
```

### Para Producción Media (50-500 usuarios)

```
✅ Servidor con GPU (Vast.ai RTX 4090)
✅ Ollama qwen3:8b
✅ Qdrant Cloud Starter
💰 Coste: ~€150-250/mes
⏱️ Latencia: 2-5s por respuesta
```

### Para Producción Grande (>500 usuarios)

**Opción A: Full Cloud (Escalable)**
```
✅ OpenAI GPT-4o-mini
✅ Qdrant Cloud
✅ Backend en Cloud Run/Lambda
💰 Coste: Variable (~€0.001/petición)
⏱️ Latencia: 1-3s por respuesta
```

**Opción B: Híbrido (Control + Escalabilidad)**
```
✅ Servidor propio con GPU para carga base
✅ OpenAI como fallback para picos
✅ Qdrant Cloud para HA
💰 Coste: ~€300-500/mes base + variable
```

---

## 📉 Optimización de Costes

### 1. Reducir tokens de contexto

```python
# Actual: 6 chunks × 500 tokens = 3000 tokens
RETRIEVER_K = 6
CHUNK_SIZE = 500

# Optimizado: 4 chunks × 400 tokens = 1600 tokens
RETRIEVER_K = 4
CHUNK_SIZE = 400

# Ahorro: ~47% en costes de LLM
```

### 2. Caché de respuestas frecuentes

```python
# Implementar Redis para cachear preguntas comunes
# Ahorro estimado: 20-40% de peticiones
```

### 3. Rate limiting por usuario

```python
# Limitar a 20 preguntas/usuario/día
# Previene abuso y controla costes
```

### 4. Modelo más pequeño para preguntas simples

```python
# Clasificar complejidad de pregunta
# Simple → qwen3:4b (más rápido, menos recursos)
# Compleja → qwen3:8b (más preciso)
```

---

## 📊 Métricas de Seguimiento

Para controlar costes, monitorizar:

```
- Peticiones/día por usuario
- Tokens promedio por petición
- Tiempo de respuesta (latencia)
- Tasa de caché hits
- Errores/timeouts
```

### Dashboard Recomendado

```bash
# Prometheus + Grafana
# Métricas a exportar:
- booktutor_requests_total
- booktutor_tokens_used
- booktutor_response_time_seconds
- booktutor_cache_hits_total
```

---

## 🔄 Actualización de Precios

Los precios de APIs de LLM cambian frecuentemente. Última actualización: **Febrero 2024**

Fuentes oficiales:
- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Qdrant Pricing](https://qdrant.tech/pricing/)

---

## 📝 Conclusión

| Uso | Recomendación | Coste Estimado |
|-----|---------------|----------------|
| Desarrollo | Ollama local | €0 |
| Piloto (<50 usuarios) | VPS básico + Ollama | €30-50/mes |
| Producción media | GPU cloud + Ollama | €150-300/mes |
| Producción grande | Híbrido o full cloud | €300-1000/mes |

**Para un centro educativo típico (100-500 estudiantes), el coste estimado es de €100-300/mes**, significativamente menor que soluciones comerciales equivalentes.
