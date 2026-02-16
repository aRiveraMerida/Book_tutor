# Git - Control de Versiones

## ¿Qué es Git?

**Git** es un sistema de control de versiones distribuido que permite gestionar el historial de cambios de un proyecto.

## Configuración inicial

```bash
# Configurar nombre de usuario
git config --global user.name "Tu Nombre"

# Configurar email
git config --global user.email "tu@email.com"

# Ver configuración
git config --list
```

## Comandos esenciales

### Iniciar un repositorio

```bash
# Crear nuevo repositorio
git init

# Clonar repositorio existente
git clone https://github.com/usuario/repo.git
```

### Flujo básico de trabajo

```bash
# Ver estado del repositorio
git status

# Añadir archivos al staging
git add archivo.txt
git add .  # Añadir todos los archivos

# Hacer commit
git commit -m "Mensaje descriptivo del cambio"

# Ver historial de commits
git log --oneline
```

### Trabajar con ramas

```bash
# Ver ramas
git branch

# Crear nueva rama
git branch nueva-rama

# Cambiar de rama
git checkout nueva-rama

# Crear y cambiar en un solo comando
git checkout -b otra-rama

# Fusionar rama
git merge nueva-rama
```

### Sincronizar con remoto

```bash
# Añadir repositorio remoto
git remote add origin https://github.com/usuario/repo.git

# Subir cambios
git push origin main

# Descargar cambios
git pull origin main
```

## Buenas prácticas

1. ✅ Hacer commits pequeños y frecuentes
2. ✅ Escribir mensajes de commit descriptivos
3. ✅ Usar ramas para nuevas funcionalidades
4. ✅ Revisar cambios antes de hacer commit

---

> 🔧 **Recuerda**: Git es tu red de seguridad. ¡Úsalo desde el principio de cada proyecto!
