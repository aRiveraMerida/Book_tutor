# UT 3: Sistemas Operativos Linux, versiones y licencia

---

# Objetivos de la unidad

Al finalizar esta unidad, serás capaz de:

1. Conocer los **orígenes de Linux** y su relación con Unix, Minix y el proyecto GNU.
2. Comprender el papel de **Linus Torvalds** y **Richard Stallman** en el desarrollo del software libre.
3. Entender la **licencia GPL** y su importancia en el ecosistema Linux.
4. Identificar los **componentes principales** de un sistema Linux: kernel, shell, sistema de archivos y daemons.
5. Conocer las principales **distribuciones de Linux** y sus características.
6. Comprender la **popularidad de Linux** en servidores, supercomputadoras y la nube.

# Introducción

Linux es uno de los sistemas operativos más importantes en el mundo de la informática actual. Aunque su uso en escritorios domésticos es limitado comparado con Windows o macOS, domina absolutamente en servidores, supercomputadoras, dispositivos móviles (Android) e infraestructuras en la nube.

Comprender Linux, su historia, arquitectura y las diferentes distribuciones disponibles es fundamental para cualquier profesional de sistemas, ya que tarde o temprano trabajará con este sistema operativo en entornos de producción.

# 1. Historia y orígenes de Linux

## 1.1. Las raíces en Unix

Linux tiene sus raíces en **Unix**, un sistema operativo desarrollado en los años 60 por **Dennis Ritchie** y **Ken Thompson** en los Laboratorios Bell. Para entender mejor la historia de Linux, es necesario conocer a **Andrew Tanenbaum**, quien creó **Minix**, un sistema similar a Unix con fines educativos. Sin embargo, Tanenbaum no permitía modificaciones en Minix para mantener su simplicidad para los estudiantes.

## 1.2. La contribución de Linus Torvalds

**Linus Torvalds**, un estudiante finlandés, buscaba un sistema más flexible que Minix. Al no poder modificarlo, decidió crear su propio sistema operativo compatible con Unix, lo que eventualmente se convertiría en Linux.

El desarrollo del kernel comenzó en 1991 como un proyecto personal. La primera versión, Linux 0.01, se publicó en el grupo de noticias comp.os.minix. Gracias a la colaboración abierta, el kernel evolucionó rápidamente.

## 1.3. El proyecto GNU y la licencia GPL

Paralelamente, **Richard Stallman** lideraba el proyecto **GNU** (GNU's Not Unix), con el objetivo de crear un sistema operativo completamente libre. GNU ya contaba con muchas herramientas, pero le faltaba un componente esencial: el kernel.

Aquí es donde Linux encajó perfectamente, combinándose con las herramientas de GNU para crear un sistema operativo completo. La **Licencia Pública General (GPL)** de GNU fue clave para asegurar que este nuevo sistema fuera libre y abierto, garantizando que cualquier modificación también debiera ser libre.

# 2. Componentes de un sistema Linux

## 2.1. El kernel

El **kernel** es el corazón de Linux. Gestiona los recursos del hardware (memoria, CPU, dispositivos) y proporciona una interfaz entre el hardware y el software. Sus funciones principales incluyen: control de procesos, gestión de memoria, control de dispositivos, sistemas de archivos y seguridad.

**Tipos de kernels**:

**Kernel monolítico**: Todos los componentes del sistema operativo se ejecutan en modo kernel, en un solo espacio de memoria. Ofrece alto rendimiento pero es menos seguro que un microkernel. Ejemplos: Linux, Unix.

**Microkernel**: Solo las funciones básicas se ejecutan en modo kernel. Los servicios adicionales se ejecutan en espacio de usuario. Es más seguro y modular, pero puede ser menos eficiente. Ejemplos: Minix, Mach.

## 2.2. El shell

El **shell** permite a los usuarios interactuar con el sistema operativo, ejecutando comandos directamente o mediante scripts. Puede ser una interfaz de línea de comandos (CLI) o gráfica (GUI).

**Tipos de shells**:

- **Bash** (Bourne Again Shell): El más común en Linux.
- **Zsh** (Z Shell): Similar a Bash con características adicionales.
- **Ksh** (Korn Shell): Combina características de Bourne Shell y C Shell.
- **Fish** (Friendly Interactive Shell): Diseñado para ser fácil de usar.

**Usos del shell**: Ejecutar comandos para gestionar archivos, procesos y configuraciones; escribir scripts para automatizar tareas repetitivas; personalizar el entorno configurando variables, alias y funciones.

## 2.3. Sistema de archivos

**Estructura de directorios**:

| Directorio | Descripción |
| --- | --- |
| `/` | Directorio raíz, contiene todos los demás directorios |
| `/bin` | Ejecutables esenciales del sistema |
| `/etc` | Archivos de configuración del sistema |
| `/home` | Directorios personales de los usuarios |
| `/var` | Datos variables como registros del sistema |
| `/usr` | Programas y archivos de uso común |
| `/tmp` | Almacenamiento temporal de archivos |

**Comandos básicos**:

- `ls`: Lista archivos y directorios
- `cd`: Cambia el directorio actual
- `cp`: Copia archivos o directorios
- `mv`: Mueve o renombra archivos o directorios
- `rm`: Elimina archivos o directorios

**Permisos de archivos**: Los archivos en Linux tienen permisos que controlan quién puede leerlos (r), escribirlos (w) o ejecutarlos (x), aplicados a propietario, grupo y otros.

## 2.4. Daemons

Los **daemons** son procesos que se ejecutan en segundo plano y realizan tareas sin intervención del usuario. Ejemplos:

- `cron`: Tareas programadas
- `sshd`: Servidor SSH
- `httpd`: Servidor web
- `systemd`: Sistema de inicialización

# 3. Utilidades y herramientas

## 3.1. Herramientas comunes

Linux ofrece una variedad de herramientas para interactuar con el sistema:

- `grep`: Busca patrones de texto en archivos
- `find`: Busca archivos en el sistema
- `top`: Muestra los procesos en ejecución en tiempo real
- `df`: Informa sobre el uso del disco
- `ps`: Muestra una lista de procesos activos
- `tar`: Archiva y desarchiva archivos

## 3.2. Herramientas de gestión

- `sudo`: Ejecuta comandos con privilegios de administrador
- `systemctl`: Controla el sistema systemd (iniciar, detener, habilitar servicios)
- `apt`, `yum`, `dnf`: Gestores de paquetes para instalar software según la distribución

# 4. Distribuciones de Linux

## 4.1. Concepto de distribución

Una **distribución de Linux** es una versión completa del sistema operativo basada en el kernel de Linux, combinada con software adicional, herramientas y configuraciones que la hacen funcional para diversos usos. Estas distribuciones están diseñadas para adaptarse a diferentes necesidades.

## 4.2. Componentes de una distribución

**Kernel**: Núcleo del sistema, gestiona hardware y recursos.

**Gestor de paquetes**: Administra instalación y actualización de software (APT en Debian/Ubuntu, YUM/DNF en Red Hat/Fedora, PACMAN en Arch).

**Entorno de escritorio**: Interfaz gráfica (GNOME, KDE, XFCE).

**Aplicaciones base**: Programas esenciales como navegadores y editores de texto.

**Utilidades del sistema**: Herramientas para administración y monitoreo.

**Script de arranque**: Gestiona el inicio del sistema (Systemd, SysVinit).

## 4.3. Principales distribuciones

**Ubuntu**: Basada en Debian, destaca por su facilidad de uso y soporte amplio, siendo ideal para principiantes. Popular tanto en escritorios como en servidores, con opciones de soporte a largo plazo (LTS).

**Debian**: Reconocida por su gran estabilidad y enfoque en la calidad. Es una de las distribuciones más antiguas y sirve como base para muchas otras, como Ubuntu y Mint.

**Fedora**: Famosa por estar a la vanguardia de la innovación en software. Sirve como plataforma para tecnologías que luego se integran en Red Hat Enterprise Linux (RHEL).

**Arch Linux**: Ofrece un sistema extremadamente personalizable, con un modelo de actualización continua (rolling release). Ideal para usuarios avanzados que quieren control total sobre su sistema.

# 5. Popularidad y casos de uso de Linux

## 5.1. Linux en supercomputadoras

En los años 90, el proyecto Beowulf impulsó el uso de Linux en clústeres de computación de alto rendimiento (HPC). Desde el año 2000, Linux ha dominado la lista TOP500 de las supercomputadoras más rápidas del mundo. Supercomputadoras como IBM Summit, Fugaku y Sunway TaihuLight utilizan Linux.

El dominio de Linux se debe a su escalabilidad, flexibilidad para adaptarse a las necesidades específicas de cada supercomputadora, y al apoyo de la comunidad de código abierto.

## 5.2. Linux en servidores

En los años 90, Linux ganó popularidad en servidores por su eficiencia, flexibilidad y bajo costo. Empresas como IBM, Oracle y Dell comenzaron a ofrecer soporte para Linux.

Linux, junto con servidores web como Apache y Nginx, se convirtió en la plataforma líder para alojar sitios web. La mayoría de los servidores web en Internet ejecutan Linux.

## 5.3. Linux en la nube

Linux es el sistema operativo preferido en la nube, especialmente en Amazon Web Services (AWS), Google Cloud y Microsoft Azure. La tecnología de contenedores (Docker, Kubernetes) también se basa en Linux, lo que ha consolidado su posición en infraestructuras modernas.

# Mini proyecto guiado

**Exploración básica de Linux**: Realiza las siguientes tareas en un sistema Linux (puede ser una máquina virtual).

**Paso 1**: Abre el terminal y verifica la versión del kernel con `uname -r`.

**Paso 2**: Lista los archivos del directorio raíz con `ls /`.

**Paso 3**: Navega al directorio `/etc` con `cd /etc` y lista su contenido.

**Paso 4**: Crea un directorio en tu home con `mkdir ~/mi_proyecto`.

**Paso 5**: Crea un archivo de texto con `echo "Hola Linux" > ~/mi_proyecto/saludo.txt`.

**Paso 6**: Visualiza el contenido del archivo con `cat ~/mi_proyecto/saludo.txt`.

**Paso 7**: Copia el archivo a otro nombre con `cp ~/mi_proyecto/saludo.txt ~/mi_proyecto/copia.txt`.

**Paso 8**: Lista los archivos del directorio con `ls -la ~/mi_proyecto`.

**Paso 9**: Mueve el archivo copiado con `mv ~/mi_proyecto/copia.txt ~/mi_proyecto/backup.txt`.

**Paso 10**: Elimina el archivo de backup con `rm ~/mi_proyecto/backup.txt`.

# Test de Conocimientos

1. **¿Quién creó el kernel de Linux?**
    - a) Richard Stallman
    - b) Linus Torvalds
    - c) Andrew Tanenbaum
    - d) Dennis Ritchie
2. **¿Qué es una distribución de Linux?**
    - a) El kernel de Linux
    - b) Una colección de herramientas GNU
    - c) Un sistema operativo completo que incluye el kernel de Linux
    - d) Un hipervisor
3. **¿Qué licencia utiliza Linux?**
    - a) Licencia MIT
    - b) Licencia Apache
    - c) Licencia Pública General (GPL)
    - d) No tiene licencia
4. **¿Qué es el shell en Linux?**
    - a) El núcleo del sistema operativo
    - b) La interfaz de usuario para ejecutar comandos
    - c) Un gestor de paquetes
    - d) Un editor de texto
5. **¿Cuál es el comando para listar archivos en Linux?**
    - a) dir
    - b) show
    - c) ls
    - d) list

# Ejercicio

Describe los componentes principales de un sistema Linux y explica cómo interactúan entre sí para proporcionar un sistema operativo funcional.

# Resumen profesionalizante

Con este conocimiento, ahora estás preparado para:

- Explicar los **orígenes de Linux** y su relación con Unix, Minix y el proyecto GNU, comprendiendo el contexto histórico del software libre.
- Entender el significado e importancia de la **licencia GPL** y cómo garantiza las libertades del software libre.
- Identificar los **componentes fundamentales** de un sistema Linux: kernel, shell, sistema de archivos, daemons y utilidades.
- Utilizar **comandos básicos** del terminal para navegar, gestionar archivos y obtener información del sistema.
- Diferenciar entre las principales **distribuciones de Linux** (Ubuntu, Debian, Fedora, Arch) y seleccionar la más adecuada según el caso de uso.
- Comprender por qué Linux **domina en servidores**, supercomputadoras e infraestructuras en la nube.
- Trabajar con **entornos Linux** en contextos profesionales de administración de sistemas, desarrollo y despliegue de aplicaciones.
- Aplicar estos conocimientos como base para la **instalación, configuración y administración** de sistemas Linux en unidades posteriores.