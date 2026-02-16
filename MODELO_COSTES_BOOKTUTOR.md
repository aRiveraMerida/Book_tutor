# 📊 BookTutor - Modelo de Costes y Funcionamiento

> **Documento**: Análisis Económico y Técnico  
> **Versión**: 1.0  
> **Fecha**: Febrero 2026  
> **Destinatarios**: Dirección, IT, Administración  
> **Equipo**: FP Prometeo

---

## 1. Resumen Ejecutivo

**BookTutor** es una plataforma de tutoría con Inteligencia Artificial que permite a los estudiantes consultar dudas sobre el material de las asignaturas mediante un chatbot inteligente.

### Propuesta de Valor

| Característica | Descripción |
|----------------|-------------|
| **Tutor IA 24/7** | Disponible cualquier hora, cualquier día |
| **Basado en contenido propio** | Responde SOLO con información de nuestros documentos |
| **100% Privado** | Datos en nuestros servidores, cumple GDPR |
| **Coste mínimo** | €1.15 por alumno/año |

### Números Clave

```
┌────────────────────────────────────────────────────────────┐
│                    ESCENARIO REAL                          │
├────────────────────────────────────────────────────────────┤
│  Alumnos:              2,000                               │
│  Consultas/alumno/día: 20                                  │
│  Días lectivos/año:    180                                 │
│  ──────────────────────────────────────────────────────    │
│  CONSULTAS ANUALES:    7,200,000                           │
│  COSTE ANUAL:          €2,300                              │
│  COSTE POR ALUMNO:     €1.15/año                           │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Modelo de Costes: Únicos vs Recurrentes

BookTutor tiene una estructura de costes muy simple: **costes únicos de setup** (que se hacen una sola vez) y **coste recurrente del servidor**.

### 2.1 Costes Únicos (Setup Inicial)

Estos costes se pagan/ejecutan **UNA SOLA VEZ** al desplegar:

```
┌─────────────────────────────────────────────────────────────────┐
│                     COSTES ÚNICOS (Setup)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  DESCARGA DE MODELOS IA (Ollama)                           │
│      • Se ejecuta: UNA VEZ al desplegar el servidor             │
│      • Qué descarga: qwen3:4b (~2.5GB) + bge-m3 (~1.5GB)         │
│      • Tiempo: ~10-30 minutos (según conexión)                  │
│      • Coste: €0                                                 │
│      • Los modelos quedan en el servidor PERMANENTEMENTE         │
│                                                                 │
│  2️⃣  INGESTIÓN RAG (Por asignatura)                             │
│      • Se ejecuta: UNA VEZ por cada asignatura nueva            │
│      • Qué hace: Procesa .md → Genera embeddings → Guarda       │
│      • Tiempo: ~5-10 minutos por asignatura                     │
│      • Coste: €0 (proceso local con Ollama)                      │
│      • Los datos quedan en Qdrant PERMANENTEMENTE               │
│                                                                 │
│  ───────────────────────────────────────────────────────────  │
│  TOTAL COSTES ÚNICOS: €0                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Coste Recurrente (Mensual)

El único coste recurrente es el **alquiler del servidor**:

```
┌─────────────────────────────────────────────────────────────────┐
│                 SERVIDOR DE PRODUCCIÓN                          │
│                 Hetzner GEX44 - €180/mes                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODO INCLUIDO EN EL SERVIDOR:                                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Frontend   │  │   Backend   │  │   Ollama    │             │
│  │   :3000    │  │    :8000    │  │   :11434   │             │
│  │  (Docker)  │  │  (Docker)   │  │  (Docker)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                       │                                         │
│                ┌───────┴───────┐                                  │
│                │    Qdrant     │  ← Base de datos vectorial      │
│                │     :6333     │    100% LOCAL (Docker)          │
│                │   (Docker)    │    NO es Qdrant Cloud           │
│                └───────────────┘    Coste adicional: €0            │
│                       │                                         │
│                ┌───────┴───────┐                                  │
│                │   Volumen     │  ← Datos persistentes            │
│                │ qdrant_data   │    (no se pierden al reiniciar) │
│                └───────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Resumen: Qué se Paga y Cuándo

| Concepto | Tipo | Cuándo | Coste |
|----------|------|--------|-------|
| Descarga modelos Ollama | **ÚNICO** | Al desplegar | €0 |
| Ingestión RAG | **ÚNICO** | Por asignatura | €0 |
| Qdrant (BD vectorial) | **INCLUIDO** | - | €0 |
| APIs externas | - | - | €0 |
| **Servidor GPU** | **RECURRENTE** | Mensual | **€180/mes** |
| Backup | RECURRENTE | Mensual | €10/mes |
| **TOTAL MENSUAL** | | | **€190/mes** |

### 2.4 Importante: Qdrant es LOCAL

**NO usamos Qdrant Cloud** (servicio de pago). Usamos **Qdrant Local** que corre como contenedor Docker en el mismo servidor:

| Opción | Dónde corre | Coste | ¿Lo usamos? |
|--------|-------------|-------|-------------|
| **Qdrant Local (Docker)** | En nuestro servidor | €0 | ✅ **SÍ** |
| Qdrant Cloud Free | Servidores Qdrant | €0 (1GB límite) | ❌ NO |
| Qdrant Cloud Starter | Servidores Qdrant | €25/mes | ❌ NO |
| Qdrant Cloud Production | Servidores Qdrant | €100+/mes | ❌ NO |

---

## 3. ¿Cómo Funciona BookTutor?

BookTutor utiliza tecnología **RAG** (Retrieval-Augmented Generation), que combina búsqueda inteligente con generación de texto por IA.

### Flujo de Funcionamiento

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ALUMNO    │───▶│   BUSCAR    │───▶│  CONTEXTO   │───▶│  RESPUESTA  │
│  Pregunta   │    │  en Qdrant  │    │  Relevante  │    │     IA      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      │            Base de datos      Fragmentos de       Ollama genera
   "¿Qué es        vectorial con      documentos que      respuesta usando
    Python?"       todos los docs     hablan de Python    solo ese contexto
```

### Componentes del Sistema

| Componente | Función | Tecnología |
|------------|---------|------------|
| **Frontend** | Interfaz web para alumnos | Next.js |
| **Backend** | API y lógica de negocio | FastAPI (Python) |
| **Qdrant** | Base de datos de búsqueda | Vector Database |
| **Ollama** | Motor de IA (LLM local) | qwen3:4b |

---

## 4. Las Dos Fases del Sistema

### FASE 1: Ingestión de Contenido (COSTE ÚNICO: €0)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   FASE 1: INGESTIÓN (UNA SOLA VEZ)                                  │
│   ═════════════════════════════════                                  │
│                                                                     │
│   ¿Quién la hace?    → Equipo técnico (NOSOTROS)                    │
│   ¿Cuándo se hace?   → UNA SOLA VEZ por asignatura                  │
│   ¿Se repite?        → NO (solo si se modifica el contenido)        │
│   ¿Coste?            → €0 (proceso local en el servidor)            │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  PROCESO:                                                    │  │
│   │                                                              │  │
│   │  1. Creamos carpeta: backend/docs/nombre-asignatura/         │  │
│   │  2. Colocamos archivos .md con el contenido                  │  │
│   │  3. Reiniciamos el backend                                   │  │
│   │  4. El sistema AUTOMÁTICAMENTE:                              │  │
│   │     • Lee los documentos                                     │  │
│   │     • Los divide en fragmentos (chunks)                      │  │
│   │     • Genera embeddings con Ollama LOCAL (€0)                │  │
│   │     • Guarda en Qdrant LOCAL (€0)                            │  │
│   │  5. ¡Listo! Los datos quedan PERMANENTEMENTE                 │  │
│   │                                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   TIEMPO: ~5-10 minutos por asignatura                              │
│   FRECUENCIA: Solo al añadir/modificar contenido                    │
│   COSTE TOTAL: €0                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### FASE 2: Uso por Alumnos (COSTE: Solo servidor €180/mes)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   FASE 2: USO DIARIO (Alumnos)                                      │
│   ════════════════════════════                                       │
│                                                                     │
│   ¿Quién la usa?     → Los ALUMNOS                                  │
│   ¿Cuándo se usa?    → Cada vez que tienen una duda                 │
│   ¿Coste por uso?    → €0 (todo es LOCAL en el servidor)            │
│   ¿APIs externas?    → NO - Ollama y Qdrant son locales             │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  PROCESO (automático, 2-5 segundos):                         │  │
│   │                                                              │  │
│   │  1. Alumno escribe: "¿Qué es una variable en Python?"        │  │
│   │  2. Sistema busca en Qdrant LOCAL (ya tiene los datos)       │  │
│   │  3. Encuentra fragmentos relevantes                          │  │
│   │  4. Envía pregunta + contexto a Ollama LOCAL                 │  │
│   │  5. Ollama genera respuesta (modelo ya descargado)           │  │
│   │  6. Alumno recibe respuesta                                  │  │
│   │                                                              │  │
│   │  → TODO ocurre en el servidor, SIN llamadas externas         │  │
│   │  → NO hay coste por consulta                                 │  │
│   │                                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   Da igual si hay 1 consulta o 1 MILLÓN de consultas:               │
│   EL COSTE ES EL MISMO (€180/mes del servidor)                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Diferencia Clave Entre Fases

| Aspecto | FASE 1: Ingestión | FASE 2: Uso |
|---------|-------------------|-------------|
| **Ejecutor** | Equipo técnico | Alumnos |
| **Frecuencia** | Una vez por asignatura | Miles de veces al día |
| **Duración** | 5-10 minutos | 2-5 segundos |
| **Coste** | €0 | Solo servidor |
| **Automatización** | Semi-automático | 100% automático |

---

## 4. Análisis de Costes Detallado

### 4.1 Datos del Escenario

```
Alumnos totales:              2,000
Consultas por alumno/día:     20
Días lectivos al año:         180 (septiembre-junio)
Horas de uso pico:            8 horas/día (09:00-17:00)
```

### 4.2 Volumen de Consultas

```
CÁLCULO DE VOLUMEN
══════════════════

Consultas diarias:
  2,000 alumnos × 20 consultas = 40,000 consultas/día

Consultas anuales:
  40,000 × 180 días = 7,200,000 consultas/año

Consultas en hora pico:
  40,000 ÷ 8 horas = 5,000 consultas/hora
  5,000 ÷ 60 minutos = 83 consultas/minuto
```

### 4.3 Coste de Infraestructura

#### Servidor Recomendado: Hetzner GEX44

| Especificación | Valor |
|----------------|-------|
| **GPU** | NVIDIA RTX 4000 (16GB VRAM) |
| **CPU** | AMD EPYC 8 cores |
| **RAM** | 64 GB DDR4 |
| **Almacenamiento** | 512 GB NVMe SSD |
| **Ancho de banda** | 1 Gbps ilimitado |

#### Desglose de Costes Mensuales

| Concepto | Coste/mes | Coste/año |
|----------|-----------|-----------|
| Servidor GPU (Hetzner GEX44) | €180 | €2,160 |
| Almacenamiento backup (100GB) | €10 | €120 |
| Dominio (.es o .com) | €1.25 | €15 |
| Certificado SSL (Let's Encrypt) | €0 | €0 |
| **TOTAL INFRAESTRUCTURA** | **€191.25** | **€2,295** |

#### Coste de Software y APIs

| Concepto | Coste |
|----------|-------|
| Ollama (LLM local) | €0 |
| Qdrant (base de datos local) | €0 |
| Next.js / FastAPI | €0 (open source) |
| APIs externas | €0 |
| **TOTAL SOFTWARE** | **€0** |

### 4.4 Resumen de Costes

```
┌────────────────────────────────────────────────────────────┐
│                   COSTES TOTALES                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  INFRAESTRUCTURA                                           │
│  ├─ Servidor GPU ............... €2,160/año               │
│  ├─ Backup ..................... €120/año                 │
│  └─ Dominio .................... €15/año                  │
│                                   ──────────               │
│  SUBTOTAL INFRA ................ €2,295/año               │
│                                                            │
│  SOFTWARE Y APIS                                           │
│  ├─ Ollama (IA) ................ €0/año                   │
│  ├─ Qdrant (BD) ................ €0/año                   │
│  └─ APIs externas .............. €0/año                   │
│                                   ──────────               │
│  SUBTOTAL SOFTWARE ............. €0/año                   │
│                                                            │
│  ════════════════════════════════════════════              │
│  TOTAL ANUAL ................... €2,295/año               │
│  ════════════════════════════════════════════              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 4.5 Métricas por Unidad

| Métrica | Cálculo | Resultado |
|---------|---------|-----------|
| **Coste por alumno/año** | €2,295 ÷ 2,000 | **€1.15** |
| **Coste por alumno/mes** | €191 ÷ 2,000 | **€0.10** |
| **Coste por consulta** | €2,295 ÷ 7,200,000 | **€0.00032** |
| **Coste por 1,000 consultas** | €0.00032 × 1,000 | **€0.32** |

---

## 5. Comparativa con Alternativas

### 5.1 APIs de IA Externas (NO recomendado)

Si usáramos APIs externas en lugar de Ollama local:

```
CÁLCULO PARA 7.2 MILLONES DE CONSULTAS/AÑO
══════════════════════════════════════════

Tokens por consulta:
  • Input (contexto + pregunta): ~2,000 tokens
  • Output (respuesta): ~500 tokens
  • Total: ~2,500 tokens/consulta

OpenAI GPT-4o-mini:
  • Input:  7.2M × 2,000 × $0.15/1M = $2,160
  • Output: 7.2M × 500 × $0.60/1M   = $2,160
  • Embeddings: ~$500
  • TOTAL: ~$4,820/año ≈ €4,500/año
  • + Servidor básico: €500/año
  • TOTAL FINAL: ~€5,000/año

OpenAI GPT-4o:
  • Input:  7.2M × 2,000 × $2.50/1M  = $36,000
  • Output: 7.2M × 500 × $10.00/1M   = $36,000
  • TOTAL: ~$72,000/año ≈ €67,000/año
```

### 5.2 Comparativa de Costes Anuales

| Solución | Coste Anual | Coste/Alumno | Factor |
|----------|-------------|--------------|--------|
| ✅ **BookTutor (Self-hosted)** | **€2,300** | **€1.15** | **1x** |
| ❌ BookTutor + GPT-4o-mini | €5,000 | €2.50 | 2.2x |
| ❌ BookTutor + GPT-4o | €67,000 | €33.50 | 29x |
| ❌ ChatGPT Team (2000 usuarios) | €528,000 | €264 | 229x |
| ❌ Microsoft Copilot | €456,000 | €228 | 198x |
| ❌ Khanmigo (Khan Academy) | €88,000 | €44 | 38x |

### 5.3 Ahorro Anual

| Comparado con | Ahorro | Porcentaje |
|---------------|--------|------------|
| GPT-4o-mini API | €2,700/año | 54% |
| GPT-4o API | €64,700/año | 97% |
| ChatGPT Team | €525,700/año | 99.6% |
| Khanmigo | €85,700/año | 97% |

---

## 6. Rendimiento del Sistema

### 6.1 Con GPU (Configuración Recomendada)

| Métrica | Valor |
|---------|-------|
| Tiempo de respuesta | 2-5 segundos |
| Consultas simultáneas | 20-40 |
| Throughput máximo | ~100 consultas/minuto |
| Disponibilidad | 99.9% |
| Capacidad diaria | ~144,000 consultas |

### 6.2 Sin GPU (NO viable para producción)

| Métrica | Valor |
|---------|-------|
| Tiempo de respuesta | 30-60 segundos |
| Consultas simultáneas | 2-5 |
| Throughput máximo | ~5 consultas/minuto |
| Capacidad diaria | ~7,200 consultas |

⚠️ **Sin GPU NO es viable para 2,000 alumnos con 40,000 consultas/día**

---

## 7. Escalabilidad

### 7.1 Capacidad según Número de Alumnos

| Alumnos | Consultas/día | Servidor | Coste/año |
|---------|---------------|----------|-----------|
| <100 | <2,000 | VPS sin GPU | ~€600 |
| 100-500 | 2,000-10,000 | GPU básica | ~€2,000 |
| 500-2,000 | 10,000-40,000 | GPU media | ~€2,300 |
| 2,000-5,000 | 40,000-100,000 | GPU alta | ~€4,200 |
| >5,000 | >100,000 | Múltiples servidores | ~€6,000+ |

### 7.2 Crecimiento Futuro

```
Si necesitamos escalar a más de 5,000 alumnos:

OPCIÓN A: Escalar verticalmente
  • Servidor más potente (A100, H100)
  • Coste: €500-800/mes adicionales

OPCIÓN B: Escalar horizontalmente
  • Añadir segundo servidor Ollama
  • Load balancer entre ambos
  • Coste: ~€180/mes adicionales (duplicar)

OPCIÓN C: Híbrido
  • Servidor propio para carga base
  • API externa para picos de demanda
  • Coste: Variable
```

---

## 8. Ventajas de BookTutor

### 8.1 Ventajas Técnicas

| Ventaja | Descripción |
|---------|-------------|
| **Privacidad** | Datos 100% en nuestros servidores |
| **Sin dependencias** | No dependemos de servicios externos |
| **Personalizable** | Podemos ajustar el modelo y prompts |
| **Escalable** | Añadir servidores según demanda |
| **Open Source** | Stack completamente libre |

### 8.2 Ventajas Pedagógicas

| Ventaja | Descripción |
|---------|-------------|
| **Contenido controlado** | Solo responde con nuestro material |
| **Sin alucinaciones** | No inventa información |
| **Disponibilidad 24/7** | Alumnos pueden consultar siempre |
| **Consistencia** | Mismas explicaciones para todos |
| **Trazabilidad** | Podemos ver qué preguntan |

### 8.3 Ventajas Económicas

| Ventaja | Descripción |
|---------|-------------|
| **Coste fijo** | €190/mes predecible |
| **Sin sorpresas** | No hay facturación por uso |
| **ROI inmediato** | Ahorro vs alternativas desde día 1 |
| **Amortización** | Inversión inicial baja |

---

## 9. Requisitos para Despliegue

### 9.1 Hardware (Servidor)

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| GPU | NVIDIA T4 (16GB) | RTX 4000+ (16GB+) |
| CPU | 4 cores | 8+ cores |
| RAM | 16 GB | 32-64 GB |
| Disco | 50 GB SSD | 100 GB NVMe |
| Red | 100 Mbps | 1 Gbps |

### 9.2 Software

| Componente | Versión |
|------------|---------|
| Docker | 24+ |
| Docker Compose | 2+ |
| Git | 2.30+ |

### 9.3 Red/Firewall

| Puerto | Servicio | Acceso |
|--------|----------|--------|
| 80/443 | Web (Nginx) | Público |
| 3000 | Frontend | Interno |
| 8000 | Backend API | Interno |
| 6333 | Qdrant | Interno |
| 11434 | Ollama | Interno |

---

## 10. Cronograma de Despliegue

| Fase | Duración | Descripción |
|------|----------|-------------|
| **1. Provisión servidor** | 1-2 días | Contratar Hetzner, configurar acceso |
| **2. Instalación base** | 1 día | Docker, Git, dependencias |
| **3. Deploy aplicación** | 1 día | Docker Compose, configuración |
| **4. Descarga modelos IA** | 2-4 horas | Ollama pull qwen3:4b, bge-m3 |
| **5. Ingestión contenido** | 1-2 días | Subir documentos de asignaturas |
| **6. Pruebas** | 2-3 días | Testing funcional y carga |
| **7. Formación** | 1 día | Capacitar a profesores |
| **TOTAL** | **~2 semanas** | |

---

## 11. Mantenimiento

### 11.1 Tareas Periódicas

| Tarea | Frecuencia | Responsable |
|-------|------------|-------------|
| Monitorización logs | Diario | IT |
| Backup Qdrant | Semanal | Automático |
| Actualización contenido | Según necesidad | Profesores |
| Actualización sistema | Mensual | IT |
| Revisión rendimiento | Mensual | IT |

### 11.2 Coste de Mantenimiento

```
Tiempo estimado de mantenimiento: 2-4 horas/mes
Incluido en operación normal de IT
Coste adicional: €0
```

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Caída del servidor | Baja | Alto | Monitorización + backup |
| Respuestas incorrectas | Media | Medio | Revisión de prompts |
| Sobrecarga en exámenes | Media | Medio | Rate limiting |
| Fallo de GPU | Baja | Alto | Servidor con garantía |

---

## 13. Conclusión

### Resumen Ejecutivo Final

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   BookTutor ofrece un tutor IA para 2,000 alumnos por:         │
│                                                                │
│   ╔════════════════════════════════════════════════════════╗   │
│   ║                                                        ║   │
│   ║   COSTE TOTAL: €2,300/año                              ║   │
│   ║   COSTE POR ALUMNO: €1.15/año                          ║   │
│   ║                                                        ║   │
│   ╚════════════════════════════════════════════════════════╝   │
│                                                                │
│   Comparado con alternativas comerciales:                      │
│   • 229x más barato que ChatGPT Team                           │
│   • 38x más barato que Khanmigo                                │
│   • 29x más barato que usar GPT-4o API                         │
│                                                                │
│   Ventajas adicionales:                                        │
│   ✓ Datos 100% privados (GDPR)                                 │
│   ✓ Sin dependencias externas                                  │
│   ✓ Contenido controlado (solo nuestro material)               │
│   ✓ Coste fijo y predecible                                    │
│   ✓ Escalable según necesidad                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Recomendación

✅ **Se recomienda la implementación de BookTutor con servidor GPU dedicado** por las siguientes razones:

1. **Económica**: Coste mínimo (€1.15/alumno/año)
2. **Técnica**: Rendimiento garantizado (2-5s respuesta)
3. **Legal**: Cumplimiento GDPR (datos en servidores propios)
4. **Pedagógica**: Respuestas basadas solo en nuestro contenido
5. **Estratégica**: Independencia tecnológica

---

## Anexos

### A. Documentación Técnica

- [IT_DEPLOYMENT.md](./IT_DEPLOYMENT.md) - Guía de despliegue para IT
- [DEPLOY.md](./DEPLOY.md) - Instrucciones detalladas
- [COST.md](./COST.md) - Análisis de costes técnico
- [README.md](./README.md) - Documentación general

### B. Contacto

| Rol | Contacto |
|-----|----------|
| **Equipo técnico** | FP Prometeo |
| **Email** | soporte@fpprometeo.com |
| **Repositorio** | github.com/tu-org/Book_tutor |

---

*Documento generado por el equipo de BookTutor - Febrero 2026*
