# 💰 Análisis de Costes - BookTutor

> **Versión**: 2.0  
> **Última actualización**: Febrero 2026  
> **Escenario principal**: 2,000 alumnos, 20 consultas/día, 1 año

---

## 📋 Resumen Ejecutivo

### Modelo de Funcionamiento

BookTutor opera en **dos fases completamente separadas**:

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: INGESTIÓN (Una sola vez)                               │
│  ─────────────────────────────────                              │
│  • La realizamos NOSOTROS (equipo técnico)                      │
│  • Subimos documentos .md → Se procesan → Se guardan en Qdrant  │
│  • Coste: €0 (proceso local)                                    │
│  • Tiempo: ~5-10 minutos por asignatura                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Datos en Qdrant]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: USO (Diario - Alumnos)                                 │
│  ──────────────────────────────                                 │
│  • Los alumnos hacen preguntas al chatbot                       │
│  • Se busca en Qdrant → Ollama genera respuesta                 │
│  • Coste: Solo servidor (sin APIs externas)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Coste Total Anual (Escenario Real)

| Concepto | Coste |
|----------|-------|
| **Servidor GPU dedicado** | **€2,160/año** |
| **Almacenamiento adicional** | €120/año |
| **Dominio + SSL** | €15/año |
| **APIs externas** | €0/año |
| **TOTAL ANUAL** | **~€2,300/año** |

| Métrica | Valor |
|---------|-------|
| Coste por alumno/año | **€1.15** |
| Coste por consulta | **€0.00016** |

---

## 🎯 Escenario: 2,000 Alumnos - 1 Año Completo

### Datos de Uso

```
Alumnos totales:           2,000
Consultas por alumno/día:  20
Días lectivos/año:         180 (aproximado)
Horas pico/día:            8 horas (09:00 - 17:00)
```

### Cálculo de Volumen

```
Consultas diarias:     2,000 × 20 = 40,000 consultas/día
Consultas anuales:     40,000 × 180 = 7,200,000 consultas/año
Consultas por hora:    40,000 ÷ 8 = 5,000 consultas/hora (pico)
Consultas por minuto:  5,000 ÷ 60 = ~83 consultas/minuto (pico)
```

### Requisitos Técnicos

Para manejar 83 consultas/minuto con tiempo de respuesta aceptable (2-5s):

| Requisito | Especificación |
|-----------|----------------|
| **GPU** | NVIDIA RTX 4000 o superior |
| **CPU** | 8+ cores |
| **RAM** | 32 GB |
| **SSD** | 100 GB NVMe |
| **Concurrencia** | ~20-40 consultas simultáneas |

---

## 💰 Desglose de Costes Detallado

### Fase 1: Ingestión (Coste Único)

| Concepto | Coste | Notas |
|----------|-------|-------|
| Procesamiento documentos | €0 | Local con Ollama |
| Embeddings (bge-m3) | €0 | Local con Ollama |
| Almacenamiento Qdrant | €0 | Incluido en servidor |
| **TOTAL INGESTIÓN** | **€0** | |

**Proceso de ingestión:**
```
1. Colocamos carpetas con .md en backend/docs/
2. Reiniciamos backend
3. Auto-ingest procesa y genera embeddings
4. Datos guardados en Qdrant (persistente)
5. ¡Listo! No hay que repetir
```

### Fase 2: Uso Anual

#### Opción Recomendada: Servidor GPU Dedicado

| Componente | Proveedor | Especificación | €/mes | €/año |
|------------|-----------|----------------|-------|-------|
| **Servidor GPU** | Hetzner GEX44 | RTX 4000, 16GB VRAM | €180 | €2,160 |
| **Almacenamiento** | Incluido | 100GB SSD | - | - |
| **Backup** | Hetzner | 100GB adicional | €10 | €120 |
| **Dominio** | - | .com/.es | - | €15 |
| **SSL** | Let's Encrypt | Certificado | €0 | €0 |
| **Ollama** | Local | qwen3:4b + bge-m3 | €0 | €0 |
| **Qdrant** | Local | Docker | €0 | €0 |
| **TOTAL** | | | **€190** | **€2,295** |

#### Alternativas de Servidor GPU

| Proveedor | GPU | RAM | Coste/mes | Coste/año |
|-----------|-----|-----|-----------|----------|
| **Hetzner GEX44** | RTX 4000 | 64GB | €180 | €2,160 |
| **Vast.ai** | RTX 4090 | 32GB | €200-300 | €2,400-3,600 |
| **Lambda Labs** | A10 | 32GB | €350 | €4,200 |
| **AWS g4dn.xlarge** | T4 | 16GB | €400 | €4,800 |

---

## 📊 Comparativa: Self-Hosted vs APIs Externas

### Coste por 7.2M Consultas/Año

| Opción | Coste LLM | Infraestructura | **TOTAL ANUAL** |
|--------|-----------|-----------------|------------------|
| ✅ **Self-hosted GPU** | €0 | €2,300 | **€2,300** |
| ❌ OpenAI GPT-4o-mini | €14,400 | €500 | **€14,900** |
| ❌ OpenAI GPT-4o | €216,000 | €500 | **€216,500** |
| ❌ Claude Sonnet | €108,000 | €500 | **€108,500** |

### Cálculo APIs (para referencia)

```
Tokens por consulta: ~2,500 (2000 input + 500 output)
Consultas anuales: 7,200,000

OpenAI GPT-4o-mini:
  Input:  7.2M × 2000 tokens × $0.15/1M = $2,160
  Output: 7.2M × 500 tokens × $0.60/1M  = $2,160
  Total: ~$4,320/año ≈ €4,000/año
  + Embeddings: ~€500/año
  + Servidor: ~€500/año
  TOTAL: ~€5,000/año (MÍNIMO)

OpenAI GPT-4o:
  Input:  7.2M × 2000 × $2.50/1M  = $36,000
  Output: 7.2M × 500 × $10.00/1M  = $36,000
  Total: ~$72,000/año ≈ €67,000/año
```

### Ahorro Anual con Self-Hosted

| vs | Ahorro | Factor |
|----|--------|--------|
| GPT-4o-mini | €12,600/año | **6.5x más barato** |
| GPT-4o | €214,200/año | **94x más barato** |
| Claude Sonnet | €106,200/año | **47x más barato** |

---

## ⚡ Rendimiento Esperado

### Con GPU (RTX 4000/4090)

| Métrica | Valor |
|---------|-------|
| Tiempo de respuesta | 2-5 segundos |
| Consultas simultáneas | 20-40 |
| Throughput máximo | ~100 consultas/minuto |
| Disponibilidad | 99.9% |

### Sin GPU (Solo CPU)

| Métrica | Valor |
|---------|-------|
| Tiempo de respuesta | 30-60 segundos |
| Consultas simultáneas | 2-5 |
| Throughput máximo | ~5 consultas/minuto |

⚠️ **Sin GPU NO es viable para 2,000 alumnos**

---

## 📈 Escalabilidad

### Capacidad por Tipo de Servidor

| Alumnos | Consultas/día | Servidor Recomendado | Coste/año |
|---------|---------------|----------------------|-----------|
| <100 | <2,000 | VPS sin GPU | ~€600 |
| 100-500 | 2,000-10,000 | GPU básica (T4) | ~€2,000 |
| 500-2,000 | 10,000-40,000 | GPU media (RTX 4000) | ~€2,300 |
| 2,000-5,000 | 40,000-100,000 | GPU alta (A10) | ~€4,200 |
| >5,000 | >100,000 | Múltiples servidores | ~€6,000+ |

### Escalar Horizontalmente (Si Fuera Necesario)

```
Si superamos 5,000 alumnos o 100,000 consultas/día:

1. Añadir segundo servidor Ollama (load balancer)
2. Qdrant en modo cluster
3. Coste adicional: ~€2,000/año por servidor
```

---

## 🔧 Optimizaciones Implementadas

Ya aplicadas para minimizar costes:

| Optimización | Impacto |
|--------------|--------|
| Modelo `qwen3:4b` (vs 8b) | -50% memoria, +30% velocidad |
| `chunk_size=1000` | -20% chunks a procesar |
| `retriever_k=4` (vs 6) | -33% contexto en prompt |
| `llm_max_tokens=2048` | Límite respuestas largas |
| Sin autenticación | -100% coste auth service |
| Sin Redis | -€20/mes |
| Sin PostgreSQL | -€30/mes |

---

## 📋 Resumen Final

### Para IT: Números Clave

```
┌────────────────────────────────────────────────────┐
│  ESCENARIO: 2,000 alumnos × 20 consultas × 1 año   │
├────────────────────────────────────────────────────┤
│  Consultas totales:    7,200,000/año               │
│  Coste infraestructura: €2,300/año                 │
│  Coste APIs externas:   €0/año                     │
│  ─────────────────────────────────                 │
│  COSTE TOTAL:          €2,300/año                  │
│  COSTE POR ALUMNO:     €1.15/año                   │
│  COSTE POR CONSULTA:   €0.00032                    │
└────────────────────────────────────────────────────┘
```

### Comparativa con Alternativas Comerciales

| Solución | Coste/alumno/año | Coste 2,000 alumnos |
|----------|------------------|---------------------|
| **BookTutor** | €1.15 | €2,300 |
| ChatGPT Team | €264 | €528,000 |
| Copilot | €228 | €456,000 |
| Khanmigo (Khan Academy) | €44 | €88,000 |

### Decisión

✅ **Self-hosted con GPU es la opción óptima**:
- Coste fijo predecible (€190/mes)
- Sin dependencia de APIs externas
- Datos 100% privados (GDPR compliant)
- Escalable añadiendo servidores
- ROI inmediato vs alternativas comerciales

---

## 📞 Contacto

Para dudas sobre costes o dimensionamiento:
- **Equipo**: FP Prometeo
- **Email**: soporte@fpprometeo.com
