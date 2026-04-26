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
