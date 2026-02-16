# JOINs en SQL

## ¿Qué son los JOINs?

Los **JOINs** permiten combinar datos de dos o más tablas basándose en una columna relacionada.

## Tipos de JOIN

### INNER JOIN

Devuelve solo los registros que tienen coincidencia en ambas tablas.

```sql
SELECT usuarios.nombre, pedidos.fecha
FROM usuarios
INNER JOIN pedidos ON usuarios.id = pedidos.usuario_id;
```

### LEFT JOIN

Devuelve todos los registros de la tabla izquierda y los coincidentes de la derecha.

```sql
SELECT usuarios.nombre, pedidos.fecha
FROM usuarios
LEFT JOIN pedidos ON usuarios.id = pedidos.usuario_id;
```

### RIGHT JOIN

Devuelve todos los registros de la tabla derecha y los coincidentes de la izquierda.

```sql
SELECT usuarios.nombre, pedidos.fecha
FROM usuarios
RIGHT JOIN pedidos ON usuarios.id = pedidos.usuario_id;
```

### FULL OUTER JOIN

Devuelve todos los registros cuando hay coincidencia en cualquiera de las tablas.

```sql
SELECT usuarios.nombre, pedidos.fecha
FROM usuarios
FULL OUTER JOIN pedidos ON usuarios.id = pedidos.usuario_id;
```

## Ejemplo práctico

### Tablas de ejemplo

**Tabla `alumnos`**:
| id | nombre | curso_id |
|----|--------|----------|
| 1 | Ana | 1 |
| 2 | Luis | 2 |
| 3 | María | 1 |

**Tabla `cursos`**:
| id | nombre |
|----|--------|
| 1 | DAW |
| 2 | DAM |

### Consulta con JOIN

```sql
SELECT alumnos.nombre AS alumno, cursos.nombre AS curso
FROM alumnos
INNER JOIN cursos ON alumnos.curso_id = cursos.id;
```

**Resultado**:
| alumno | curso |
|--------|-------|
| Ana | DAW |
| Luis | DAM |
| María | DAW |

---

> 💡 **Consejo**: Usa alias de tabla para hacer las consultas más legibles.
