# UT 2: Virtualización de Sistemas Operativos

---

# Objetivos de la unidad

Al finalizar esta unidad, serás capaz de:

1. Comprender el **concepto de virtualización** y su propósito en entornos informáticos.
2. Conocer la **historia y evolución** de la virtualización desde los mainframes hasta los contenedores.
3. Diferenciar los **tipos de hipervisores**: Tipo 1, Tipo 2 y virtualización a nivel de sistema operativo.
4. Identificar las **ventajas y desventajas** de la virtualización.
5. Aprender a **crear y configurar máquinas virtuales** con diferentes parámetros.
6. Conocer los principales **hipervisores** de software libre y propietario.

# Introducción

La virtualización es una tecnología fundamental en la informática moderna que permite ejecutar múltiples sistemas operativos en un mismo hardware físico. Esta capacidad ha revolucionado la forma en que las empresas gestionan sus infraestructuras, permitiendo optimizar recursos, reducir costes y aumentar la flexibilidad.

Comprender la virtualización es esencial para cualquier profesional de sistemas, ya que es la base de tecnologías como la computación en la nube, los contenedores y los entornos de desarrollo modernos.

# 1. Fundamentos de la virtualización

## 1.1. Concepto de virtualización

La virtualización puede entenderse mediante una analogía: imagina un edificio con varios apartamentos, cada uno independiente y con su propio espacio, pero que comparten recursos comunes como el agua, la electricidad y la estructura del edificio.

En la virtualización, cada **máquina virtual** es como un apartamento dentro de un edificio, donde cada una tiene su propio sistema operativo y aplicaciones, pero todas comparten los mismos recursos del hardware del **ordenador anfitrión**.

El propósito de la virtualización es optimizar el uso de los recursos del sistema. Esto permite ejecutar múltiples entornos independientes en un solo hardware, lo que mejora la eficiencia, reduce costos y facilita la gestión de infraestructuras.

## 1.2. Historia y evolución

**Orígenes (años 60)**: La idea de virtualización comenzó con los mainframes, donde se utilizaba para dividir grandes sistemas costosos en particiones más pequeñas, permitiendo un uso más eficiente de los recursos.

**Popularización (años 2000)**: La virtualización ganó popularidad especialmente en el ámbito de los servidores y centros de datos, con el lanzamiento de productos comerciales como VMware, que facilitó la creación y gestión de máquinas virtuales.

**Evolución reciente**: La virtualización ha evolucionado con el auge de tecnologías como los contenedores y los microservicios, lo que ha permitido una mayor flexibilidad y agilidad en los despliegues.

## 1.3. Tipos de hipervisores

El "administrador" del edificio virtual es el **hipervisor**, un programa que crea y gestiona las máquinas virtuales. Existen tres tipos principales:

**Tipo 1 (Bare-metal)**: Se instalan directamente sobre el hardware del ordenador, sin necesidad de un sistema operativo anfitrión. Son muy eficientes y se usan en empresas y centros de datos donde el rendimiento es crucial. Ejemplos: VMware ESXi, Microsoft Hyper-V, KVM.

**Tipo 2 (Hosted)**: Se instalan sobre un sistema operativo anfitrión, como Windows o macOS. Son más fáciles de usar y se utilizan para desarrollo, pruebas y uso personal. Ejemplos: VirtualBox, VMware Workstation.

**Virtualización a nivel de sistema operativo**: En lugar de crear máquinas virtuales completas, se crean contenedores que permiten ejecutar aplicaciones de forma aislada, compartiendo el mismo kernel del sistema operativo. Son muy ligeros y eficientes. Ejemplos: Docker, LXC.

## 1.4. Ventajas de la virtualización

**Ahorro**: Reduce la necesidad de comprar y mantener múltiples ordenadores físicos.

**Eficiencia**: Maximiza el uso de los recursos de hardware.

**Flexibilidad**: Permite crear y configurar máquinas virtuales con diferentes sistemas operativos de forma rápida y sencilla.

**Seguridad**: Aísla las máquinas virtuales entre sí, protegiéndolas de fallos o ataques en otras máquinas virtuales.

**Recuperación ante desastres**: Facilita la creación de copias de seguridad y la recuperación de sistemas en caso de fallos.

**Portabilidad**: Permite mover máquinas virtuales entre diferentes hosts físicos sin necesidad de reinstalar o reconfigurar el sistema.

**Escalabilidad**: Facilita el ajuste de los recursos asignados a una máquina virtual según sus necesidades.

## 1.5. Desventajas de la virtualización

**Rendimiento**: Puede haber una pequeña pérdida de rendimiento en comparación con una máquina física, especialmente si la virtualización no está bien configurada o el hardware es limitado.

**Complejidad**: La gestión de un entorno virtualizado puede ser compleja, especialmente a medida que aumenta el número de máquinas virtuales.

**Costes**: Las soluciones de virtualización propietarias pueden tener costes de licencia elevados.

**Seguridad**: Si el hipervisor tiene vulnerabilidades, todas las máquinas virtuales que gestiona podrían verse afectadas.

**Dependencia del proveedor**: Algunas soluciones propietarias pueden generar dependencia de un proveedor específico.

# 2. Creación y configuración de máquinas virtuales

## 2.1. Instalación de hipervisores

**Hipervisor Tipo 1**: Requiere verificar que el hardware del servidor cumple los requisitos, descargar la imagen ISO desde la web oficial, crear un medio de instalación arrancable, instalar siguiendo el asistente y configurar la red y el almacenamiento.

**Hipervisor Tipo 2**: Requiere asegurar que el sistema operativo anfitrión cumple los requisitos, descargar el instalador desde la web oficial, ejecutar el instalador y seguir el asistente, y configurar los parámetros básicos como la ubicación de archivos.

## 2.2. Configuración de una máquina virtual

Al crear una máquina virtual se deben configurar los siguientes parámetros:

**Nombre**: Asignar un nombre descriptivo para identificarla fácilmente.

**Sistema operativo**: Seleccionar el sistema operativo que se instalará, asegurando compatibilidad con el hipervisor.

**Memoria RAM**: Determinar la cantidad de memoria según el uso previsto y las recomendaciones del sistema operativo.

**CPUs**: Definir el número de CPUs virtuales, equilibrando rendimiento y disponibilidad de recursos del anfitrión.

**Disco duro virtual**: Configurar el tamaño, optando por asignación dinámica (crece según necesidad) o tamaño fijo desde el inicio.

**Adaptadores de red**: Configurar según las necesidades de conectividad:

- **NAT**: La máquina virtual accede a la red externa usando la dirección IP del anfitrión.
- **Puente**: La máquina virtual se conecta directamente a la red física con su propia dirección IP.
- **Solo anfitrión**: Red virtual aislada que solo permite comunicación entre máquinas virtuales y el anfitrión.

## 2.3. Personalización y gestión

**Asignación de recursos**: Ajustar memoria RAM, CPUs y espacio en disco según las necesidades y el rendimiento del sistema anfitrión.

**Configuración de dispositivos**: Añadir o quitar dispositivos como adaptadores de red, discos duros virtuales o dispositivos USB.

**Snapshots**: Crear puntos de restauración que capturan el estado de la máquina virtual en un momento dado, permitiendo revertirla a ese estado si es necesario.

**Clonación**: Crear una copia exacta de una máquina virtual para disponer rápidamente de máquinas con la misma configuración.

# 3. Hipervisores: software libre y propietario

## 3.1. Software libre

**VirtualBox**: Hipervisor de tipo 2 desarrollado por Oracle, gratuito, de código abierto y multiplataforma. Fácil de usar, compatible con snapshots, USB y carpetas compartidas. Ideal para desarrollo, pruebas de software y aprendizaje de virtualización.

**KVM (Kernel-based Virtual Machine)**: Hipervisor de tipo 1 integrado en el kernel de Linux. Alto rendimiento, gran compatibilidad con sistemas operativos invitados, extensible con herramientas como libvirt. Ideal para centros de datos y entornos empresariales de alto rendimiento.

**Xen**: Hipervisor de tipo 1 con soporte para virtualización completa y paravirtualización. Excelente rendimiento, soporta infraestructuras grandes, usado por AWS. Ideal para virtualización a gran escala y nubes empresariales.

## 3.2. Software propietario

**VMware ESXi**: Hipervisor de tipo 1 líder en el mercado. Incluye herramientas como vCenter Server para gestión centralizada y vMotion para migración sin interrupciones. Ideal para centros de datos y entornos críticos de alta disponibilidad.

**Microsoft Hyper-V**: Hipervisor de tipo 1 integrado en Windows Server. Fácil integración con el ecosistema Windows, soporte para virtualización de redes y almacenamiento. Ideal para empresas con infraestructuras basadas en Windows.

**VMware Workstation**: Hipervisor de tipo 2 para Windows y Linux. Ofrece soporte avanzado para gráficos, redes y dispositivos USB. Ideal para pruebas de software y desarrollo multiplataforma.

**Parallels Desktop**: Hipervisor de tipo 2 diseñado para macOS, con optimización para ejecutar Windows y Linux en equipos Apple. Ideal para profesionales y usuarios de Mac que necesitan otros sistemas operativos.

# 4. Casos de uso y aplicaciones prácticas

**Educación**: Creación de laboratorios virtuales para estudiantes, permitiendo acceso a diferentes sistemas operativos sin hardware adicional.

**Empresas**: Consolidación de servidores, mejorando la eficiencia y reduciendo costes.

**Desarrollo de software**: Creación de entornos de desarrollo y pruebas aislados para diferentes proyectos.

**Pruebas de software**: Evaluación de software en diferentes sistemas operativos y configuraciones sin afectar sistemas de producción.

**Infraestructuras de nube**: Creación de servicios de nube privada y pública, permitiendo escalabilidad y flexibilidad.

**Aplicaciones heredadas**: Mantener aplicaciones antiguas que requieren sistemas operativos o entornos específicos.

**Servidores web**: Alojar múltiples sitios web en un solo servidor físico.

**Escritorios virtuales**: Proporcionar a los usuarios acceso remoto a un escritorio virtualizado.

# Mini proyecto guiado

**Instalación de VirtualBox y creación de una máquina virtual Ubuntu**:

**Paso 1**: Descargar VirtualBox desde [www.virtualbox.org](http://www.virtualbox.org/) e instalarlo en el sistema operativo anfitrión.

**Paso 2**: Abrir VirtualBox y crear una nueva máquina virtual. Asignar nombre "Ubuntu-Server", seleccionar tipo "Linux" y versión "Ubuntu (64-bit)".

**Paso 3**: Asignar 2048 MB de memoria RAM (o más si el sistema lo permite).

**Paso 4**: Crear un disco duro virtual VDI con asignación dinámica de 20 GB.

**Paso 5**: Configurar la red en modo NAT para acceso a Internet.

**Paso 6**: Iniciar la máquina virtual y montar la imagen ISO de Ubuntu Server.

**Paso 7**: Seguir el asistente de instalación de Ubuntu Server.

**Paso 8**: Una vez instalado, crear un snapshot llamado "Instalación limpia".

**Paso 9**: Instalar Apache con `sudo apt install apache2`.

**Paso 10**: Clonar la máquina virtual para tener una copia de seguridad del servidor configurado.

# Test de Conocimientos

1. **¿Qué es un hipervisor?**
    - a) Un programa para gestionar máquinas virtuales
    - b) Un sistema operativo para máquinas virtuales
    - c) Un hardware para virtualizar
    - d) Una aplicación para controlar el acceso a Internet
2. **¿Qué tipo de hipervisor se instala directamente sobre el hardware?**
    - a) Tipo 2
    - b) Tipo 1
    - c) Contenedor
    - d) Hosted
3. **¿Cuál de las siguientes NO es una ventaja de la virtualización?**
    - a) Mayor consumo de energía
    - b) Mayor flexibilidad
    - c) Mayor eficiencia
    - d) Recuperación ante desastres
4. **¿Qué es un snapshot?**
    - a) Una copia de seguridad completa de una máquina virtual
    - b) Un punto de restauración de una máquina virtual
    - c) Una clonación de una máquina virtual
    - d) Una imagen ISO de un sistema operativo
5. **¿Qué hipervisor está integrado en Windows Server?**
    - a) VMware ESXi
    - b) Microsoft Hyper-V
    - c) KVM
    - d) VirtualBox

# Ejercicio

Compara los hipervisores de Tipo 1 y Tipo 2, indicando sus características principales, ventajas, desventajas y casos de uso recomendados.

# Resumen profesionalizante

Con este conocimiento, ahora estás preparado para:

- Comprender el **concepto de virtualización** y explicar cómo permite ejecutar múltiples sistemas operativos en un mismo hardware.
- Diferenciar los **tipos de hipervisores** (Tipo 1, Tipo 2 y contenedores) y seleccionar el más adecuado según el caso de uso.
- Evaluar las **ventajas y desventajas** de la virtualización para tomar decisiones informadas en proyectos de infraestructura.
- **Instalar y configurar** hipervisores como VirtualBox, VMware o Hyper-V según los requisitos del entorno.
- **Crear y personalizar máquinas virtuales** configurando correctamente RAM, CPUs, disco y red.
- Utilizar funcionalidades avanzadas como **snapshots y clonación** para gestión eficiente de entornos virtualizados.
- Aplicar la virtualización en **casos de uso profesionales**: laboratorios de pruebas, consolidación de servidores, entornos de desarrollo y despliegues en la nube.
- Comparar y seleccionar entre **hipervisores de software libre y propietario** según necesidades técnicas y presupuestarias.