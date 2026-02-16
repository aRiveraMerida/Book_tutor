# Introducción a SQL

## ¿Qué es SQL?

SQL (Structured Query Language) es el lenguaje estándar para gestionar y manipular bases de datos relacionales. Fue desarrollado en los años 70 por IBM.

### Tipos de comandos SQL

1. **DDL (Data Definition Language)**: CREATE, ALTER, DROP
2. **DML (Data Manipulation Language)**: SELECT, INSERT, UPDATE, DELETE
3. **DCL (Data Control Language)**: GRANT, REVOKE
4. **TCL (Transaction Control Language)**: COMMIT, ROLLBACK

## Bases de datos relacionales

Una base de datos relacional organiza los datos en **tablas** (relaciones) compuestas por:

- **Filas** (registros/tuplas): Cada instancia de datos
- **Columnas** (campos/atributos): Características de los datos

### Ejemplo: Base de datos de una tienda

```
┌─────────────────────────────────────┐
│           CLIENTES                  │
├─────────┬──────────┬───────────────┤
│ id      │ nombre   │ email         │
├─────────┼──────────┼───────────────┤
│ 1       │ Juan     │ juan@mail.com │
│ 2       │ María    │ maria@mail.com│
└─────────┴──────────┴───────────────┘

┌─────────────────────────────────────────────┐
│              PEDIDOS                        │
├─────────┬────────────┬──────────┬──────────┤
│ id      │ cliente_id │ fecha    │ total    │
├─────────┼────────────┼──────────┼──────────┤
│ 1       │ 1          │ 2024-01-15│ 150.00  │
│ 2       │ 2          │ 2024-01-16│ 89.50   │
└─────────┴────────────┴──────────┴──────────┘
```

## Crear tablas (CREATE TABLE)

```sql
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

## Insertar datos (INSERT)

```sql
-- Insertar un registro
INSERT INTO clientes (nombre, email)
VALUES ('Juan García', 'juan@email.com');

-- Insertar múltiples registros
INSERT INTO clientes (nombre, email) VALUES
    ('María López', 'maria@email.com'),
    ('Pedro Sánchez', 'pedro@email.com'),
    ('Ana Martínez', 'ana@email.com');
```

## Consultar datos (SELECT)

```sql
-- Seleccionar todos los campos
SELECT * FROM clientes;

-- Seleccionar campos específicos
SELECT nombre, email FROM clientes;

-- Con condiciones (WHERE)
SELECT * FROM clientes WHERE activo = TRUE;

-- Ordenar resultados
SELECT * FROM clientes ORDER BY nombre ASC;

-- Limitar resultados
SELECT * FROM clientes LIMIT 10;
```

## Actualizar datos (UPDATE)

```sql
-- Actualizar un campo
UPDATE clientes
SET email = 'nuevo@email.com'
WHERE id = 1;

-- Actualizar múltiples campos
UPDATE clientes
SET nombre = 'Juan Carlos García',
    activo = FALSE
WHERE id = 1;
```

## Eliminar datos (DELETE)

```sql
-- Eliminar registros específicos
DELETE FROM clientes WHERE id = 1;

-- Eliminar con condición
DELETE FROM clientes WHERE activo = FALSE;

-- ¡CUIDADO! Esto elimina todos los registros
DELETE FROM clientes;
```

## Claves primarias y foráneas

- **Clave primaria (PRIMARY KEY)**: Identifica de forma única cada registro
- **Clave foránea (FOREIGN KEY)**: Referencia a la clave primaria de otra tabla

```sql
-- Ejemplo de relación
CREATE TABLE productos (
    id INT PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL(10, 2)
);

CREATE TABLE detalles_pedido (
    id INT PRIMARY KEY,
    pedido_id INT,
    producto_id INT,
    cantidad INT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

## Ejercicios

1. Crea una base de datos para una biblioteca con tablas: libros, autores, préstamos
2. Escribe consultas para encontrar los clientes que han hecho pedidos este mes
3. Implementa una consulta que muestre el total de ventas por cliente

---

**Siguiente tema:** [Consultas avanzadas con JOIN](02-joins-sql.md)
