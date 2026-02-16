# HTML - Fundamentos

## ¿Qué es HTML?

**HTML** (HyperText Markup Language) es el lenguaje de marcado estándar para crear páginas web.

## Estructura básica

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi página web</title>
</head>
<body>
    <h1>¡Hola Mundo!</h1>
    <p>Este es mi primer párrafo.</p>
</body>
</html>
```

## Etiquetas principales

### Encabezados

```html
<h1>Encabezado nivel 1</h1>
<h2>Encabezado nivel 2</h2>
<h3>Encabezado nivel 3</h3>
<!-- ... hasta h6 -->
```

### Texto

```html
<p>Párrafo de texto</p>
<strong>Texto en negrita</strong>
<em>Texto en cursiva</em>
<br> <!-- Salto de línea -->
<hr> <!-- Línea horizontal -->
```

### Listas

```html
<!-- Lista desordenada -->
<ul>
    <li>Elemento 1</li>
    <li>Elemento 2</li>
</ul>

<!-- Lista ordenada -->
<ol>
    <li>Primer paso</li>
    <li>Segundo paso</li>
</ol>
```

### Enlaces e imágenes

```html
<!-- Enlace -->
<a href="https://ejemplo.com">Visitar ejemplo</a>

<!-- Imagen -->
<img src="imagen.jpg" alt="Descripción de la imagen">
```

### Formularios

```html
<form action="/enviar" method="POST">
    <label for="nombre">Nombre:</label>
    <input type="text" id="nombre" name="nombre" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <button type="submit">Enviar</button>
</form>
```

## Semántica HTML5

```html
<header>Cabecera del sitio</header>
<nav>Navegación</nav>
<main>Contenido principal</main>
<article>Artículo independiente</article>
<section>Sección de contenido</section>
<aside>Contenido lateral</aside>
<footer>Pie de página</footer>
```

---

> 📝 **Importante**: Usa etiquetas semánticas para mejorar la accesibilidad y el SEO.
