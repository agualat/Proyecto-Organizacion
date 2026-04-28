# Frontend - Laboratorio Ciberpunk

Interfaz web para visualizar el ciclo de instruccion de una CPU academica (FETCH -> DECODE -> EXECUTE -> WRITEBACK) con estilo industrial cyberpunk.

## Requisitos

- Node.js 18+
- Backend FastAPI ejecutandose en `http://localhost:8000`

## Ejecutar

```bash
npm install
npm run dev
```

El frontend usa `/api` en desarrollo y Vite hace proxy al backend.

## Build

```bash
npm run build
npm run preview
```

## Docker

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

Detener:

```bash
docker compose down
```
