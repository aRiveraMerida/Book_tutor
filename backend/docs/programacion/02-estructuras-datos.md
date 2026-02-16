# Estructuras de Datos en Python

## Listas

Las listas son colecciones ordenadas y mutables que pueden contener elementos de diferentes tipos.

```python
# Crear una lista
frutas = ["manzana", "banana", "naranja"]

# Acceder a elementos
print(frutas[0])  # manzana
print(frutas[-1])  # naranja (último elemento)

# Modificar elementos
frutas[1] = "pera"

# Añadir elementos
frutas.append("uva")
frutas.insert(0, "fresa")

# Eliminar elementos
frutas.remove("pera")
del frutas[0]
elemento = frutas.pop()  # elimina y devuelve el último
```

### Operaciones con listas

```python
numeros = [3, 1, 4, 1, 5, 9, 2, 6]

# Ordenar
numeros.sort()  # [1, 1, 2, 3, 4, 5, 6, 9]
numeros.sort(reverse=True)  # orden descendente

# Longitud
print(len(numeros))  # 8

# Buscar
print(4 in numeros)  # True
print(numeros.index(5))  # posición de 5

# Copiar
copia = numeros.copy()
otra_copia = numeros[:]
```

## Tuplas

Las tuplas son colecciones ordenadas e **inmutables**.

```python
# Crear tupla
coordenadas = (10, 20)
punto = 10, 20  # también válido

# Desempaquetado
x, y = coordenadas
print(f"X: {x}, Y: {y}")

# Tuplas con un elemento
single = (42,)  # la coma es importante
```

## Diccionarios

Los diccionarios almacenan pares clave-valor.

```python
# Crear diccionario
estudiante = {
    "nombre": "Ana",
    "edad": 22,
    "carrera": "Informática",
    "notas": [8.5, 9.0, 7.5]
}

# Acceder a valores
print(estudiante["nombre"])  # Ana
print(estudiante.get("email", "No disponible"))

# Modificar/añadir
estudiante["edad"] = 23
estudiante["email"] = "ana@email.com"

# Eliminar
del estudiante["carrera"]
email = estudiante.pop("email")

# Iterar
for clave, valor in estudiante.items():
    print(f"{clave}: {valor}")
```

## Conjuntos (Sets)

Los conjuntos son colecciones desordenadas de elementos únicos.

```python
# Crear conjunto
numeros = {1, 2, 3, 4, 5}
letras = set("abracadabra")  # {'a', 'b', 'c', 'd', 'r'}

# Operaciones de conjuntos
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)  # unión: {1, 2, 3, 4, 5, 6}
print(a & b)  # intersección: {3, 4}
print(a - b)  # diferencia: {1, 2}
print(a ^ b)  # diferencia simétrica: {1, 2, 5, 6}
```

## List Comprehensions

Forma concisa de crear listas.

```python
# Forma tradicional
cuadrados = []
for x in range(10):
    cuadrados.append(x ** 2)

# Con list comprehension
cuadrados = [x ** 2 for x in range(10)]

# Con condición
pares = [x for x in range(20) if x % 2 == 0]

# Anidado
matriz = [[i * j for j in range(5)] for i in range(5)]
```

## Ejercicios

1. Crea una función que elimine duplicados de una lista manteniendo el orden
2. Implementa un diccionario que cuente la frecuencia de palabras en un texto
3. Escribe una función que encuentre la intersección de múltiples listas

---

**Tema anterior:** [Introducción a Python](01-introduccion-python.md)  
**Siguiente tema:** [Programación Orientada a Objetos](03-poo.md)
