# Introducción a SQL

## ¿Qué es SQL?

**SQL** (Structured Query Language) es el lenguaje estándar para gestionar bases de datos relacionales.

## Tipos de comandos SQL

### DDL (Data Definition Language)

Comandos para definir estructuras:

- `CREATE` - Crear objetos
- `ALTER` - Modificar objetos
- `DROP` - Eliminar objetos

### DML (Data Manipulation Language)

Comandos para manipular datos:

- `SELECT` - Consultar datos
- `INSERT` - Insertar datos
- `UPDATE` - Actualizar datos
- `DELETE` - Eliminar datos

## Consultas básicas

### SELECT

```sql
-- Seleccionar todos los campos
SELECT * FROM usuarios;

-- Seleccionar campos específicos
SELECT nombre, email FROM usuarios;

-- Con condición WHERE
SELECT * FROM usuarios WHERE edad > 18;

-- Ordenar resultados
SELECT * FROM usuarios ORDER BY nombre ASC;
```

### INSERT

```sql
INSERT INTO usuarios (nombre, email, edad) 
VALUES ('Juan García', 'juan@email.com', 25);
```

### UPDATE

```sql
UPDATE usuarios 
SET email = 'nuevo@email.com' 
WHERE id = 1;
```

### DELETE

```sql
DELETE FROM usuarios WHERE id = 1;
```

## Funciones de agregación

```sql
-- Contar registros
SELECT COUNT(*) FROM usuarios;

-- Suma
SELECT SUM(salario) FROM empleados;

-- Promedio
SELECT AVG(edad) FROM usuarios;

-- Máximo y mínimo
SELECT MAX(salario), MIN(salario) FROM empleados;
```

---

> ⚠️ **Importante**: Siempre usa `WHERE` en `UPDATE` y `DELETE` para evitar modificar todos los registros.
