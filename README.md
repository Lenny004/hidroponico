# Hidropónico

Software para gestionar un sistema de cultivo hidropónico modelado como **grafo**. Cada planta es un nodo; el usuario arma el sistema en un canvas tipo n8n y los motores calcularán minerales, oxígeno, plagas e insumos del conjunto.

## Cómo arrancar

Requisitos: Node 20+ y [pnpm](https://pnpm.io) 11.

```bash
pnpm install
pnpm dev
```

- UI: http://localhost:5173
- API: http://localhost:3001/salud

Solo frontend: `pnpm dev:frontend`. Solo API: `pnpm dev:backend`.

PostgreSQL (opcional, aún no hay persistencia real):

```bash
docker compose up -d
```

Copia `apps/backend/.env.example` a `apps/backend/.env` cuando vayas a generar el cliente Prisma.

## Estado

| Ítem | Estado |
|------|--------|
| Fase 0 — monorepo, lint, CI, esquema Prisma | Hecho |
| Fase 1 — canvas, arrastre, conexiones DAG, resaltado de grupo | Hecho |
| Fase 2 — panel editable de `NodoCultivo` | Hecho |
| Fase 3 — TREE.JS + motor.minerales | Hecho |
| Motores oxígeno / plagas | Pendiente (Fase 4) |
| Agregación de minerales | Hecha (null no bloquea el pipeline) |

## Estructura

```
hidroponico/
├── apps/frontend/           # React + Vite + @xyflow/react + Zustand + Tailwind v4
├── apps/backend/            # Fastify + TREE.JS (bus) + Prisma schema
├── packages/motores/        # Interfaz Strategy + Registry (sin motores concretos)
├── packages/tipos-compartidos/
├── docs/
└── .cursor/
```

## Documentación

- [Principios de calidad](docs/PRINCIPIOS.md)
- [Arquitectura](docs/arquitectura.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Reglas de negocio](docs/reglas-negocio.md)
- [Roadmap](docs/roadmap.md)
- [Interfaz](docs/interfaz.md)
- [Asunciones abiertas](docs/asunciones.md)
- [Convenciones](docs/convenciones.md)

## Scripts

| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Frontend + backend |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript en todos los paquetes |
| `pnpm test` | Vitest (DAG, factory, componentes conexas) |
