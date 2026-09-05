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

**Hecha:** formulario de las variables del boceto (`null` si el campo está vacío), tipo, plagas, `solucion_plagas` y comentarios. Sin persistir a base de datos.

## Fase 3 — EDA + un solo motor

Bus TREE.JS y `motor.minerales` de punta a punta (agregación por grupo y regla de `null`). **Antes:** confirmar [reglas-negocio.md](reglas-negocio.md).

**Hecha:** Union-Find, `motor.minerales`, orquestador en paralelo, POST `/pipeline`. Un grupo en `null` avisa y no bloquea.

## Fase 4 — Motores restantes

`motor.oxigeno`, `motor.plagas`, orquestador (botón play central). No implementar los tres de una vez.

**Hecha:** oxígeno suma `oxigeno` por grupo; plagas recopila `plagas` y `solucion_plagas` con la misma regla de `null`. Los cuatro plays están activos.

## Fase 5 — Simulación de insumos

Cantidad total de solución nutritiva para hidratar el sistema.

**Criterio usable (mientras Ferresal no entregue otra):** sumar `cantidad_sol` (ml) por grupo, con la misma regla de `null`. Ver [asunciones.md](asunciones.md).

**Hecha:** `motor.insumos` registrado en el pipeline. No hay fórmula minerales→litros.

## Fase 6 — Persistencia real

**Hecha:** GET/PUT `/grafo`, Prisma en caliente, sync automática con debounce. Sin botón Publicar. Si PostgreSQL no está, el canvas sigue en local.
