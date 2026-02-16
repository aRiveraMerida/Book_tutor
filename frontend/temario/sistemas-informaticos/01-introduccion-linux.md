# Introducción a Linux

## ¿Qué es Linux?

**Linux** es un sistema operativo de código abierto basado en Unix, creado por Linus Torvalds en 1991.

## Distribuciones populares

- **Ubuntu**: Ideal para principiantes
- **Debian**: Estable y robusto
- **CentOS/RHEL**: Enfocado a servidores
- **Fedora**: Innovador con últimas tecnologías
- **Arch Linux**: Para usuarios avanzados

## Comandos básicos

### Navegación por el sistema de archivos

```bash
# Ver directorio actual
pwd

# Listar contenido
ls -la

# Cambiar de directorio
cd /ruta/destino

# Volver al directorio home
cd ~
```

### Gestión de archivos

```bash
# Crear directorio
mkdir nuevo_directorio

# Crear archivo vacío
touch archivo.txt

# Copiar archivo
cp origen.txt destino.txt

# Mover/renombrar archivo
mv archivo.txt nuevo_nombre.txt

# Eliminar archivo
rm archivo.txt

# Eliminar directorio
rm -r directorio/
```

### Permisos

```bash
# Ver permisos
ls -l archivo.txt

# Cambiar permisos
chmod 755 script.sh

# Cambiar propietario
chown usuario:grupo archivo.txt
```

## Estructura de directorios

| Directorio | Descripción |
|------------|-------------|
| `/` | Raíz del sistema |
| `/home` | Directorios de usuarios |
| `/etc` | Archivos de configuración |
| `/var` | Datos variables |
| `/tmp` | Archivos temporales |

---

> 🐧 **Tip**: Usa `man comando` para ver el manual de cualquier comando.
