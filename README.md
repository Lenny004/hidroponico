# Hidropónico

Software para gestionar un sistema de cultivo hidropónico modelado como **grafo**. Cada planta es un nodo; el usuario arma el sistema en un canvas tipo n8n y los motores calculan minerales, oxígeno, plagas e insumos del conjunto.

Este repositorio está en el **primer pasito**: estructura, documentación y convenciones de Cursor. **Aún no hay código de aplicación.**

## Estado actual

| Ítem | Estado |
|------|--------|
| Carpetas del monorepo | Creadas (vacías, sin scaffolding de paquetes) |
| Documentación | En `docs/` |
| Rules y skills de Cursor | En `.cursor/` |
| Código (frontend, backend, motores) | Pendiente — Fase 0 / Fase 1 |
| Push a GitHub | No se sube nada en este paso |

## Estructura prevista

```
hidroponico/
├── apps/
│   ├── frontend/          # React + TypeScript + Vite + @xyflow/react
│   └── backend/           # Node.js + TypeScript + Fastify/Express
├── packages/
│   ├── motores/           # Motores de cálculo (Strategy + Registry)
│   └── tipos-compartidos/ # Tipos de dominio compartidos
├── docs/                  # Documentación y principios
└── .cursor/               # Rules y skills del proyecto
```

Los detalles de arquitectura, modelo de datos, reglas de negocio y preguntas abiertas están en [`docs/`](docs/).

## Documentación

- [Principios de calidad](docs/PRINCIPIOS.md) — estándar de microprocesos (copia de Horas Sociales).
- [Arquitectura](docs/arquitectura.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Reglas de negocio](docs/reglas-negocio.md)
- [Roadmap](docs/roadmap.md)
- [Interfaz](docs/interfaz.md)
- [Asunciones abiertas](docs/asunciones.md) — **confirmar con el dueño del producto antes de implementar.**
- [Convenciones](docs/convenciones.md)

## Núcleo TREE.JS

El orquestador del sistema es un bus de eventos (EDA) llamado **TREE.JS**. Escucha cambios del grafo y despacha trabajo a motores registrados, sin que la UI conozca la lógica interna de cada motor.

No se implementa en este paso. Ver [arquitectura](docs/arquitectura.md).

## Stack sugerido (no instalado aún)

- Frontend: React, TypeScript, Vite, `@xyflow/react`, Zustand, Tailwind CSS
- Backend: Node.js, TypeScript, Fastify o Express
- Base de datos: PostgreSQL + Prisma (JSONB para variables de nodo)
- Monorepo: pnpm workspaces
- Tests: Vitest

## Cómo continuar

1. Confirmar las [asunciones abiertas](docs/asunciones.md).
2. Fase 0: scaffolding real del monorepo (sin motores).
3. Fase 1: canvas mínimo (nodos, aristas, arrastre, sin ciclos).

No se implementa la agregación de minerales hasta mostrar y confirmar el plan descrito en `docs/reglas-negocio.md`.
