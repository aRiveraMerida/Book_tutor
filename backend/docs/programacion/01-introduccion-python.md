# Introducción a Python

## ¿Qué es Python?

Python es un lenguaje de programación de alto nivel, interpretado y de propósito general. Fue creado por Guido van Rossum y publicado por primera vez en 1991.

### Características principales

- **Sintaxis clara y legible**: Python usa indentación para definir bloques de código
- **Tipado dinámico**: No es necesario declarar el tipo de las variables
- **Multiplataforma**: Funciona en Windows, macOS, Linux
- **Gran ecosistema**: Miles de librerías disponibles

## Instalación

Para instalar Python, descárgalo desde [python.org](https://python.org).

```bash
# Verificar instalación
python --version
```

## Tu primer programa

```python
# Hola Mundo en Python
print("¡Hola, Mundo!")

# Variables
nombre = "Estudiante"
edad = 20

print(f"Hola {nombre}, tienes {edad} años")
```

## Tipos de datos básicos

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| int | 42 | Números enteros |
| float | 3.14 | Números decimales |
| str | "Hola" | Cadenas de texto |
| bool | True | Valores booleanos |
| list | [1, 2, 3] | Listas ordenadas |
| dict | {"a": 1} | Diccionarios |

## Estructuras de control

### Condicionales

```python
edad = 18

if edad >= 18:
    print("Eres mayor de edad")
elif edad >= 13:
    print("Eres adolescente")
else:
    print("Eres menor de edad")
```

### Bucles

```python
# Bucle for
for i in range(5):
    print(f"Iteración {i}")

# Bucle while
contador = 0
while contador < 5:
    print(f"Contador: {contador}")
    contador += 1
```

## Funciones

```python
def saludar(nombre):
    """Función que saluda a una persona."""
    return f"¡Hola, {nombre}!"

# Uso de la función
mensaje = saludar("María")
print(mensaje)  # ¡Hola, María!
```

## Ejercicios propuestos

1. Escribe un programa que calcule el factorial de un número
2. Crea una función que determine si un número es primo
3. Implementa una calculadora básica con operaciones +, -, *, /

---

**Siguiente tema:** [Estructuras de datos en Python](02-estructuras-datos.md)
