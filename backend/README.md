# Backend - Simulador de Computador

## Arquitectura del computador simulado

Este módulo implementa la lógica interna del computador simulado. Se define una arquitectura académica simplificada de 8 bits, diseñada para representar de forma clara el funcionamiento básico de un procesador.

### Componentes principales

- Memoria principal: almacena instrucciones y datos.
- Registros generales: R0, R1, R2, R3.
- PC (Program Counter): indica la dirección de la siguiente instrucción.
- IR (Instruction Register): almacena la instrucción actual.
- ALU (Unidad Aritmético-Lógica): realiza operaciones matemáticas y lógicas.
- Unidad de Control: coordina la ejecución de instrucciones.
- Bus de datos: permite la transferencia de información entre componentes.
- Salida: muestra los resultados del procesamiento.

### Tamaño de datos

El sistema trabaja con datos enteros de 8 bits (valores entre 0 y 255).

## Ciclo de instrucción

El procesador simulado ejecuta instrucciones mediante un ciclo básico dividido en cuatro etapas:

### 1. FETCH (búsqueda)
La CPU utiliza el Program Counter (PC) para obtener la siguiente instrucción desde memoria y almacenarla en el Instruction Register (IR).

### 2. DECODE (decodificación)
La Unidad de Control interpreta la instrucción contenida en el IR, determinando qué operación debe ejecutarse.

### 3. EXECUTE (ejecución)
Se realiza la operación correspondiente. Si es una operación aritmética o lógica, interviene la ALU.

### 4. WRITEBACK (escritura)
El resultado de la operación se almacena en un registro, memoria o salida.

Finalmente, el PC se actualiza para apuntar a la siguiente instrucción.