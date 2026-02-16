# Introducción a Java

## ¿Qué es Java?

Java es un **lenguaje de programación orientado a objetos** desarrollado por Sun Microsystems en 1995. Es uno de los lenguajes más utilizados en el mundo empresarial.

### Características principales

- **Multiplataforma**: "Write Once, Run Anywhere"
- **Orientado a objetos**
- **Robusto y seguro**
- **Alto rendimiento**

## Tu primer programa

```java
public class HolaMundo {
    public static void main(String[] args) {
        System.out.println("¡Hola Mundo!");
    }
}
```

## Variables y tipos de datos

### Tipos primitivos

| Tipo | Tamaño | Rango |
|------|--------|-------|
| `byte` | 8 bits | -128 a 127 |
| `short` | 16 bits | -32,768 a 32,767 |
| `int` | 32 bits | -2^31 a 2^31-1 |
| `long` | 64 bits | -2^63 a 2^63-1 |
| `float` | 32 bits | Decimales |
| `double` | 64 bits | Decimales de precisión doble |

### Ejemplo de declaración

```java
int edad = 25;
String nombre = "Prometeo";
double salario = 1500.50;
boolean activo = true;
```

## Estructuras de control

### Condicionales

```java
if (edad >= 18) {
    System.out.println("Mayor de edad");
} else {
    System.out.println("Menor de edad");
}
```

### Bucles

```java
// Bucle for
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}

// Bucle while
while (condicion) {
    // código
}
```

---

> 💡 **Consejo**: Practica escribiendo código todos los días para mejorar tus habilidades.
