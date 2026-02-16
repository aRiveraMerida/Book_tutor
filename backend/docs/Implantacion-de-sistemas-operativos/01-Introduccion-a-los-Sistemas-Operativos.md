# UT 1: Introducción a los Sistemas Operativos

---

# Objetivos de la unidad

Al finalizar esta unidad, serás capaz de:

1. Comprender la **evolución histórica** de los ordenadores a través de sus generaciones.
2. Conocer los **sistemas de representación** de la información: binario, hexadecimal y códigos alfanuméricos.
3. Identificar los **componentes fundamentales** del hardware de un ordenador.
4. Diferenciar entre **software de sistema y software de aplicación**.
5. Clasificar los **tipos de ordenadores** según su capacidad y uso.

# Introducción

Los ordenadores han experimentado una evolución asombrosa a lo largo de la historia. Desde enormes máquinas que ocupaban habitaciones enteras hasta los dispositivos portátiles actuales, la tecnología informática ha avanzado a pasos agigantados. Comprender esta evolución y los fundamentos de cómo funcionan los ordenadores es esencial para cualquier profesional del ámbito informático.

Esta unidad sienta las bases para entender cómo los sistemas operativos gestionan el hardware y el software, proporcionando el contexto histórico y técnico necesario para las unidades posteriores.

# 1. Historia del computador

## 1.1. Primera generación (1940-1956)

La tecnología de esta época se basaba en **válvulas de vacío** para realizar cálculos. Estas válvulas funcionaban como bombillas que se encendían y apagaban para representar los unos y ceros del lenguaje binario.

Debido a las válvulas de vacío, estos ordenadores eran enormes, costosos y poco fiables. Requerían mucho espacio, generaban mucho calor y necesitaban mantenimiento constante. Ejemplos destacados de esta generación son el **ENIAC** (Electronic Numerical Integrator and Computer) y el **UNIVAC I** (Universal Automatic Computer I).

## 1.2. Segunda generación (1956-1963)

La introducción de los **transistores** marcó un antes y un después en la historia de la informática. Los transistores reemplazaron a las válvulas de vacío, permitiendo reducir el tamaño de los ordenadores y aumentar su fiabilidad.

Los ordenadores de esta generación eran más pequeños, más eficientes y requerían menos mantenimiento que sus predecesores. El **IBM 7094** y el **UNIVAC II** son ejemplos representativos.

## 1.3. Tercera generación (1964-1971)

La invención de los **circuitos integrados** (chips) permitió integrar una mayor cantidad de componentes electrónicos en un espacio reducido.

Los ordenadores de esta generación experimentaron un aumento significativo en su capacidad de procesamiento y una reducción en sus costes de fabricación. Ejemplos notables son el **IBM System/360** y el **PDP-8**.

## 1.4. Cuarta generación (1971-presente)

La aparición de los **microprocesadores**, que integran toda la unidad central de procesamiento (CPU) en un solo chip, revolucionó la informática.

Esta generación vio el nacimiento de los ordenadores personales, lo que popularizó el uso de la informática en hogares, oficinas y dispositivos móviles. El **Intel 4004**, el **Apple II** y el **IBM PC** son ejemplos destacados.

## 1.5. Quinta generación (futuro)

Esta generación se centra en la **inteligencia artificial**, la **computación paralela** y la **computación cuántica**.

Los ordenadores de esta generación serán capaces de aprender, tomar decisiones autónomas y resolver problemas complejos de manera más eficiente. Las investigaciones en inteligencia artificial y el desarrollo de ordenadores cuánticos son ejemplos de esta generación.

# 2. Representación de la información

## 2.1. Código binario

El código binario es un sistema de numeración en base 2 que utiliza solo dos dígitos: 0 y 1. Es el lenguaje nativo de los ordenadores, y todo lo que ocurre dentro de ellos se representa en binario.

**Conversión decimal a binario**: Se divide el número entre 2 y se anota el residuo. Se repite este proceso con el cociente hasta que este sea 0. Los residuos, leídos en orden inverso, forman el número binario.

**Conversión binario a decimal**: Se asigna una potencia de 2 a cada posición del número, comenzando con 2⁰ en la posición más a la derecha. Cada dígito binario se multiplica por la potencia correspondiente y se suman todos los resultados.

## 2.2. Código hexadecimal

El código hexadecimal es un sistema de numeración en base 16 que utiliza los dígitos del 0 al 9 y las letras de la A a la F. Se utiliza para representar números binarios de forma más compacta y legible.

**Conversión binario a hexadecimal**: Se agrupan los dígitos binarios en bloques de 4, comenzando por la derecha. Cada bloque se convierte a su equivalente hexadecimal.

**Conversión hexadecimal a binario**: Cada dígito hexadecimal se convierte a su equivalente binario de 4 bits.

## 2.3. Códigos alfanuméricos

Los códigos alfanuméricos se utilizan para representar caracteres como letras, números y símbolos.

**ASCII** (American Standard Code for Information Interchange): Código de 7 bits que representa caracteres alfanuméricos y símbolos. La letra 'A' corresponde al valor decimal 65, que en binario se representa como 01000001 y en hexadecimal como 41.

**UTF-8** (Unicode Transformation Format - 8 bits): Codificación de longitud variable que puede representar una amplia gama de caracteres internacionales y símbolos especiales. Permite representar caracteres de diferentes idiomas, lo que lo hace ideal para la comunicación global.

# 3. Estructura del ordenador

## 3.1. Procesador (CPU)

El procesador es el "cerebro" del ordenador. Se encarga de ejecutar las instrucciones de los programas y realizar cálculos.

Sus componentes principales son:

**Unidad de Control**: Coordina las actividades del ordenador, como un director de orquesta.

**Unidad Aritmético-Lógica (ALU)**: Realiza operaciones matemáticas y lógicas, como sumas, restas y comparaciones.

**Registros**: Pequeñas unidades de memoria que almacenan datos temporales y resultados intermedios.

**Caché**: Memoria rápida que almacena datos e instrucciones de uso frecuente para acelerar el acceso del procesador.

## 3.2. Memoria

**RAM (Memoria de Acceso Aleatorio)**: Memoria volátil cuyo contenido se borra cuando se apaga el ordenador. Almacena los datos y programas que están en uso. Es rápida pero de capacidad limitada.

**ROM (Memoria de Solo Lectura)**: Memoria no volátil que contiene el firmware necesario para iniciar el sistema. Su contenido es permanente y no se borra al apagar el ordenador.

**Memoria Caché**: Memoria de alta velocidad ubicada entre la CPU y la RAM. Almacena datos de acceso frecuente para acelerar el acceso del procesador.

## 3.3. Dispositivos de entrada/salida

**Dispositivos de entrada**: Permiten al usuario enviar información al ordenador. Ejemplos: teclado, ratón, cámara, micrófono, escáner.

**Dispositivos de salida**: Permiten al ordenador mostrar información al usuario. Ejemplos: monitor, impresora, altavoces.

## 3.4. Buses y conexiones

Los buses son canales de comunicación que facilitan el paso de datos entre los distintos componentes del ordenador.

**Bus de datos**: Transporta los datos entre los componentes.

**Bus de direcciones**: Distribuye las direcciones de memoria para acceder a los datos.

**Bus de control**: Envía señales de control que coordinan el funcionamiento de los demás buses y componentes.

# 4. Software

## 4.1. Software de sistema

El software de sistema se encarga de gestionar el hardware del ordenador y proporcionar una plataforma para ejecutar aplicaciones.

**Sistema operativo**: Es el software más importante del ordenador. Gestiona el hardware y proporciona una interfaz para que el usuario pueda interactuar con el ordenador. Ejemplos: Windows, macOS, Linux. Sus funciones incluyen la gestión de archivos, control de dispositivos y administración de procesos.

**Utilidades del sistema**: Programas diseñados para realizar tareas de mantenimiento y optimización del sistema. Ejemplos: antivirus, desfragmentadores de disco, herramientas de copia de seguridad.

## 4.2. Software de aplicación

El software de aplicación son programas diseñados para realizar tareas específicas para el usuario.

**Aplicaciones de productividad**: Herramientas para elaborar documentos, hojas de cálculo y presentaciones.

**Aplicaciones de entretenimiento**: Juegos, reproductores multimedia y programas de edición de video.

**Aplicaciones empresariales**: Software para la administración de proyectos, contabilidad y recursos humanos.

## 4.3. Software en la nube

El software en la nube son aplicaciones y servicios accesibles a través de Internet, en lugar de ser instalados localmente en el ordenador.

Sus ventajas incluyen: acceso remoto desde cualquier lugar con conexión a Internet, actualización automática sin intervención del usuario, almacenamiento seguro y accesible en línea, y colaboración en tiempo real entre varios usuarios.

Ejemplos: Google Drive, Dropbox, Office 365.

# 5. Tipos de ordenadores

## 5.1. Superordenadores

Son los ordenadores más rápidos y potentes del mundo. Se utilizan para realizar cálculos complejos y simulaciones a gran escala como modelado climático, investigación científica y análisis de grandes cantidades de datos. Ejemplos: IBM Blue Gene, Cray XT5, Fugaku.

## 5.2. Mainframes

Son ordenadores grandes y potentes utilizados por grandes empresas y organizaciones para gestionar grandes volúmenes de datos y transacciones. Se usan para procesamiento de operaciones financieras, gestión de bases de datos corporativas y supervisión de sistemas esenciales. Ejemplos: IBM zSeries, Unisys ClearPath.

## 5.3. Ordenadores personales (PC)

Son los ordenadores más comunes, utilizados en hogares y oficinas para tareas cotidianas como escritura de documentos, navegación por Internet, edición multimedia y juegos. Incluyen ordenadores de sobremesa, portátiles y tablets.

## 5.4. Dispositivos móviles

Son dispositivos compactos y portátiles como smartphones y tablets que ofrecen funcionalidades similares a las de un ordenador personal. Se utilizan para comunicación, acceso a internet, uso de aplicaciones móviles y entretenimiento digital. Ejemplos: iPad, Samsung Galaxy S.

# Mini proyecto guiado

**Conversión de sistemas numéricos**: Realiza las siguientes conversiones paso a paso.

**Paso 1**: Convierte el número decimal 75 a binario.

- 75 ÷ 2 = 37, residuo 1
- 37 ÷ 2 = 18, residuo 1
- 18 ÷ 2 = 9, residuo 0
- 9 ÷ 2 = 4, residuo 1
- 4 ÷ 2 = 2, residuo 0
- 2 ÷ 2 = 1, residuo 0
- 1 ÷ 2 = 0, residuo 1
- Resultado: 1001011

**Paso 2**: Convierte el binario 1001011 a hexadecimal.

- Agrupamos en bloques de 4: 0100 1011
- 0100 = 4
- 1011 = B
- Resultado: 4B

**Paso 3**: Verifica convirtiendo 4B hexadecimal a decimal.

- 4 × 16¹ + 11 × 16⁰ = 64 + 11 = 75

# Test de Conocimientos

1. **¿Cuál de las siguientes opciones NO es un componente de la CPU?**
    - a) Unidad de Control
    - b) Memoria RAM
    - c) Unidad Aritmético-Lógica
    - d) Registros
2. **¿Qué tipo de memoria se borra al apagar el ordenador?**
    - a) ROM
    - b) Caché
    - c) RAM
    - d) Ninguna de las anteriores
3. **¿Qué sistema de numeración utiliza solo dos dígitos?**
    - a) Decimal
    - b) Hexadecimal
    - c) Binario
    - d) Octal
4. **¿Cuál de los siguientes es un ejemplo de software de sistema?**
    - a) Microsoft Word
    - b) Adobe Photoshop
    - c) Windows
    - d) Google Chrome
5. **¿Qué tipo de ordenador se utiliza para realizar simulaciones climáticas?**
    - a) Ordenador personal
    - b) Mainframe
    - c) Superordenador
    - d) Dispositivo móvil

# Ejercicio

Describe las funciones de la CPU y sus componentes principales, explicando cómo colaboran para ejecutar un programa.

# Resumen profesionalizante

> Con este conocimiento, ahora estás preparado para:
> 
- Contextualizar la **evolución tecnológica** de los ordenadores desde las válvulas de vacío hasta los microprocesadores actuales.
- Realizar **conversiones entre sistemas numéricos** (binario, decimal, hexadecimal) fundamentales para comprender el funcionamiento interno de los ordenadores.
- Identificar y describir los **componentes hardware** de un ordenador: CPU, memoria, dispositivos de entrada/salida y buses.
- Diferenciar entre **software de sistema y de aplicación**, comprendiendo el papel central del sistema operativo.
- Clasificar los **tipos de ordenadores** según su capacidad y ámbito de uso: superordenadores, mainframes, PCs y dispositivos móviles.
- Comprender las bases técnicas necesarias para abordar la **instalación y configuración de sistemas operativos** en unidades posteriores.