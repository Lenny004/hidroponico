---
name: hidroponico-roadmap
description: Guides work through Hidropónico delivery phases (docs-only start, then scaffolding, canvas, EDA, motors). Use when implementing features, scaffolding the monorepo, or when the user mentions fases, TREE.JS, canvas, o motores.
---

# Roadmap Hidropónico

Leer `docs/roadmap.md` y `docs/asunciones.md` antes de tocar código.

## Orden

0. Docs / rules (hecho en el primer pasito) — no es scaffolding de paquetes.
1. Fase 0: monorepo, lint, CI, esquema inicial. Sin motores.
2. Fase 1: canvas mínimo (nodos, aristas, DAG). Sin motores.
3. Fase 2: panel de detalle de `NodoCultivo`.
4. Fase 3: TREE.JS + **solo** `motor.minerales` (tras confirmar agregación).
5. Fase 4: oxígeno, plagas, orquestador.
6. Fase 5: insumos — suma de `cantidad_sol` (sin convertir minerales a litros).
7. Fase 6: persistencia real (dos grafos).

## No hacer

- Adelantar fases.
- Implementar los tres motores juntos.
- Inventar fórmula de litros/concentración.
- Publicar el grafo a BD sin confirmar el botón Guardar/Publicar.

Si el usuario pide “el sistema completo”, entregar solo la fase siguiente acordada y listar lo que queda.
