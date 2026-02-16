# Programación Orientada a Objetos en Java

## Conceptos fundamentales

La **Programación Orientada a Objetos (POO)** es un paradigma de programación que organiza el código en torno a objetos.

### Los 4 pilares de la POO

1. **Encapsulamiento**
2. **Herencia**
3. **Polimorfismo**
4. **Abstracción**

## Clases y Objetos

### Definición de una clase

```java
public class Persona {
    // Atributos
    private String nombre;
    private int edad;
    
    // Constructor
    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }
    
    // Métodos getters y setters
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    // Método personalizado
    public void saludar() {
        System.out.println("Hola, soy " + nombre);
    }
}
```

### Creación de objetos

```java
Persona alumno = new Persona("Juan", 20);
alumno.saludar(); // Imprime: Hola, soy Juan
```

## Herencia

```java
public class Empleado extends Persona {
    private double salario;
    
    public Empleado(String nombre, int edad, double salario) {
        super(nombre, edad);
        this.salario = salario;
    }
}
```

---

> 📚 **Recuerda**: La herencia permite reutilizar código y establecer relaciones jerárquicas entre clases.
