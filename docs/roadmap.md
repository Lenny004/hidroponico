# Roadmap

Orden obligatorio. No adelantar fases «por comodidad».

## Fase 0 — Scaffolding

Monorepo pnpm, lint, CI básico, esquema de base de datos inicial.

**Hecha:** workspaces, ESLint, GitHub Actions, Prisma (`nodos` / `aristas`), bus TREE.JS sin motores.

## Fase 1 — Canvas mínimo

Renderizar nodos y aristas, crear / mover / conectar, validar DAG. Sin motores.

**Hecha:** panel Cultivo, canvas `@xyflow/react`, rechazo de ciclos, resaltado de grupo conectado.

## Fase 2 — Modelo de nodo + panel de detalle

Click en un nodo abre panel editable con `NodoCultivo`.

## Fase 3 — EDA + un solo motor

Bus TREE.JS y `motor.minerales` de punta a punta (agregación por grupo y regla de `null`). **Antes:** confirmar [reglas-negocio.md](reglas-negocio.md).

## Fase 4 — Motores restantes

`motor.oxigeno`, `motor.plagas`, orquestador (botón play central). No implementar los tres de una vez.

## Fase 5 — Simulación de insumos

Cantidad total de solución nutritiva para hidratar el sistema.

**Bloqueado** hasta que Ferresal / el dueño del producto entregue la fórmula real (litros, concentración, etc.). No inventarla.

## Fase 6 — Persistencia real

Separar grafo de construcción (cliente) del grafo de base de datos. El persistido es la fuente de verdad para reportes. Sincronización según lo que se confirme en [asunciones.md](asunciones.md).
