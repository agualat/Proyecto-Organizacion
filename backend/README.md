## Ciclo de instrucción

El procesador simulado ejecuta instrucciones mediante un ciclo básico dividido en cuatro etapas:

### 1. FETCH (búsqueda)
La CPU utiliza el Program Counter (PC) para obtener la siguiente instrucción desde memoria y almacenarla en el Instruction Register (IR).

### 2. DECODE (decodificación)
La Unidad de Control interpreta la instrucción contenida en el IR, determinando qué operación debe ejecutarse.

### 3. EXECUTE (ejecución)
Se realiza la operación correspondiente. Si es una operación aritmética o lógica, interviene la ALU.

### 4. WRITEBACK (escritura)
El resultado de la operación se almacena en un registro o en memoria.

Finalmente, el PC se actualiza para apuntar a la siguiente instrucción.
