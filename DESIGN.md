# DESIGN.md - Laboratorio Ciberpunk (Industrial Cyberpunk)

## Visión General
Una estética de "alto contraste" e industrial, inspirada en interfaces de terminales tácticas y hardware expuesto. La idea es que el usuario sienta que está operando maquinaria pesada digital.

## 1. Paleta de Colores
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| **Primary** | `#00F0FF` | Neon Cyan: Botones activos, flujos de datos principales, bordes brillantes. |
| **Background** | `#090A0F` | Void Black: Fondo profundo de la página. |
| **Surface** | `#121620` | Gunmetal: Chasis de componentes, tarjetas, paneles inactivos. |
| **Text** | `#E0E6ED` | Frost White: Texto legible principal. |
| **Muted** | `#2A3241` | Dark Steel: Líneas de cuadrícula, trazas inactivas, bordes secundarios. |
| **Accent** | `#FF003C` | Neon Magenta: Errores, operaciones críticas, nodos de resta/división. |
| **Success** | `#39FF14` | Electric Green: Resultados finales, nodos de suma/multiplicación. |

## 2. Tipografía
- **Headings:** `Space Mono`, 700. Para títulos de secciones y nombres de componentes.
- **Body:** `Rajdhani`, 500. Para descripciones y etiquetas de UI.
- **Numbers/Data:** `Share Tech Mono`, 400. Para valores hexadecimales, binarios y resultados de la calculadora.
- **Buttons:** `Space Mono`, 700, Uppercase.

## 3. Estilo Visual (CSS Global)
- **Border Radius:** `0px` (Esquinas afiladas obligatorias).
- **Clipped Corners:** Uso de `clip-path: polygon(...)` para crear ese look de "esquina cortada" industrial.
- **Neon Glow:** `box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);` para elementos primarios.
- **Scanlines:** Un overlay de gradiente lineal repetitivo para simular el efecto de monitor CRT antiguo (opacidad 0.05).

## 4. Componentes Clave

### A. Terminal Input (Calculadora)
- **Contenedor:** Fondo `#121620`, borde sólido de 2px en `#2A3241`.
- **Display:** Fondo `#090A0F`, texto `#00F0FF`, cursor de bloque parpadeante `_`.
- **Botones:** 64x64px, estado hover con glow cian.

### B. Data Bus (Trazas)
- **Líneas:** Grosor 4px, `linear-gradient` animado que se llena a medida que el dato avanza.
- **Paquetes:** Cuadrados de 12px con brillo intenso (Cian o Magenta).

### C. ALU Gates (Diamantes Lógicos)
- **Forma:** Diamantes rotados 45 grados.
- **Indicadores LED:** Círculos pequeños de 8px. Verde para `1`, Rojo para `0`.

### D. CRT Output (Monitor de Resultado)
- **Pantalla:** Efecto de curvatura con `inner shadow` pesado.
- **Texto Resultado:** Tamaño masivo (120px+), tipografía `Space Mono` con glow verde eléctrico.

## 5. Animaciones Sugeridas
- **Data Flow:** `framer-motion` para mover paquetes a lo largo de las trazas de los buses.
- **Pulse:** Efecto de respiración en los bordes neón de los componentes activos.
- **Glitch:** Sutil animación de desplazamiento horizontal (1-2px) aleatoria en el texto de error.