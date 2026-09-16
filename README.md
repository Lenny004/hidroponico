# Hidropónico

Plataforma de planificación y cálculo para instalaciones hidropónicas basada en un **modelo de grafo**. Cada cultivo o módulo se representa como nodo; las conexiones entre circuitos compartidos, como aristas. Un pipeline de **motores** especializados procesa minerales, oxígeno disuelto, plagas e insumos por componentes conexas, respetando la topología del sistema.

La interfaz ofrece un editor visual de nodos (patrón n8n): catálogo de cultivos, lienzo DAG, paneles de edición y ejecución del pipeline con agregación tolerante a datos incompletos (`null` no interrumpe el cálculo global).

## Índice

- [Qué hace](#qué-hace)
- [Cómo arrancar](#cómo-arrancar)
- [Estado](#estado)
- [Arquitectura en breve](#arquitectura-en-breve)
- [Estructura del monorepo](#estructura)
- [Módulos](#módulos)
- [Documentación](#documentación)
- [Scripts](#scripts)

## Qué hace

Las instalaciones hidropónicas combinan tanques compartidos, cultivos con recetas heterogéneas y variables con reglas de agregación distintas: las concentraciones minerales no se suman entre nodos independientes; el oxígeno disuelto corresponde al volumen del tanque. Hidropónico formaliza estas restricciones en un **grafo acíclico dirigido (DAG)** editable desde la interfaz.

**Flujo de trabajo**

1. Selección de un cultivo desde el catálogo e incorporación al lienzo.
2. Configuración de variables por nodo (`mineral_magnesio`, `mineral_potasio`, `oxigeno`, `cantidad_sol`, plagas, entre otras) en el panel de detalle.
3. Conexión de nodos que pertenecen al mismo circuito hidráulico (tanque, módulo NFT, etc.).
4. Ejecución de motores individuales o del pipeline completo; los resultados se presentan por grupo conectado.

**Modelo conceptual**

| Concepto | Definición |
|----------|------------|
| **Nodo** | Cultivo o módulo con receta nutricional y volumen de solución asociado. |
| **Arista** | Relación entre módulos de un mismo circuito; la validación DAG impide ciclos. |
| **Grupo conectado** | Componente conexa del grafo; Union-Find determina la partición antes del cálculo. |
| **Agregación** | Dosificación por categoría mineral: masa (mg) = concentración (mg/L) × litros. Un `null` en cualquier nodo del grupo invalida esa categoría sin detener el pipeline. |
| **Motores** | Cuatro estrategias registradas (minerales, oxígeno, plagas, insumos) ejecutadas en paralelo por el orquestador. |
| **Persistencia** | Grafo de construcción en cliente; grafo persistido en PostgreSQL con sincronización automática. El lienzo opera de forma autónoma si la base de datos no está disponible. |

**Capacidades de la interfaz:** catálogo a la izquierda, diseño 3D NFT junto a la ficha de trazabilidad (HerbaZest + % VD), menú hamburguesa de cálculos del pipeline, casos de uso (incluida extensión agropecuaria en El Salvador) y consolidado diario con media aritmética y ponderado frente a lo que un adulto necesita.

## Cómo arrancar

Requisitos: Node 20+ y [pnpm](https://pnpm.io) 11.

```bash
pnpm install
pnpm dev
```

- UI: http://localhost:5173
- API: http://localhost:3001/salud

Solo frontend: `pnpm dev:frontend`. Solo API: `pnpm dev:backend`.

PostgreSQL (persistencia del grafo). El compose publica Postgres en **5435** (el 5432 suele estar ocupado por otros proyectos):

```bash
docker compose up -d
pnpm --filter @hidroponico/backend prisma:migrate
```

Copia `apps/backend/.env.example` a `apps/backend/.env`. Si Postgres no está, el canvas funciona igual y la barra indica «BD no disponible».

## Estado

| Ítem | Estado |
|------|--------|
| Fase 0 — monorepo, lint, CI, esquema Prisma | Hecho |
| Fase 1 — canvas, arrastre, conexiones DAG, resaltado de grupo | Hecho |
| Fase 2 — panel editable de `NodoCultivo` | Hecho |
| Fase 3 — TREE.JS + motor.minerales | Hecho |
| Fase 4 — motores oxígeno / plagas | Hecho |
| Fase 5 — insumos (`cantidad_sol` por grupo) | Hecho |
| Fase 6 — persistencia Prisma (sync automática) | Hecho |
| Agregación de minerales | Hecha (null no bloquea el pipeline) |

## Arquitectura en breve

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                    │
│  Canvas DAG · paneles · Zustand · sync debounce → API       │
└──────────────────────────┬──────────────────────────────────┘
                           │ GET/PUT /grafo · POST /pipeline
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (Fastify)                                          │
│  TREE.JS (bus de eventos) · rutas REST · Prisma             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  packages/motores — orquestador + motores en paralelo       │
│  packages/tipos-compartidos — dominio, DAG, Union-Find      │
└─────────────────────────────────────────────────────────────┘
```

Dos grafos separados: **construcción** (cliente, trabajo en progreso) y **persistido** (PostgreSQL, fuente de verdad). Detalle en [arquitectura](docs/arquitectura.md).

## Estructura

```
hidroponico/
├── apps/
│   ├── frontend/              # React + Vite + @xyflow/react + Zustand + CSS BEM
│   └── backend/               # Fastify + TREE.JS (bus) + Prisma
├── packages/
│   ├── motores/               # Strategy + Registry + 4 motores + orquestador
│   └── tipos-compartidos/     # Tipos de dominio, DAG, agregación, catálogos
├── docs/                      # Arquitectura, reglas, roadmap, asunciones
├── .cursor/                   # Reglas y skills del proyecto
├── docker-compose.yml         # PostgreSQL en puerto 5435
└── .github/workflows/         # CI (lint, typecheck, test)
```

## Módulos

### `apps/frontend`

Interfaz principal del sistema.

| Área | Contenido |
|------|-----------|
| **Canvas** | `CanvasGrafo` — nodos, aristas, validación DAG, resaltado de grupo conectado |
| **Paneles** | `PanelCultivo`, `PanelTrazabilidad`, `PanelPipeline` (hamburguesa), `PanelCasosUso`, `PanelConsolidado`, `PanelSeleccion` |
| **Catálogo** | `CatalogoPlantado` — arrastre de cultivos desde plantillas al lienzo |
| **Insumos** | `ProyeccionInsumos`, `ConsumoTemporal` — proyección y consumo por etapa de vida |
| **3D** | `LienzoThree`, `ModuloNft`, `EscenaNft` — vista Three.js de módulos NFT |
| **Estado** | Zustand (`usarGrafoConstruccion`, `usarTema`) + hooks de sync y cálculo automático |
| **API cliente** | `api/grafo.ts`, `api/pipeline.ts` — comunicación con el backend |

Stack: React 19, Vite 7, `@xyflow/react`, `@react-three/fiber`, Zustand, CSS BEM.

### `apps/backend`

API REST y bus de eventos.

| Área | Contenido |
|------|-----------|
| **Rutas** | `GET/PUT /grafo`, `POST /pipeline`, `GET /salud` |
| **TREE.JS** | Bus tipado (`nodo:creado`, `pipeline:ejecutar`, etc.) |
| **Persistencia** | Prisma + PostgreSQL (`nodos`, `aristas` con JSONB) |
| **Repositorio** | `repositorio-grafo.ts` — serialización y validación del grafo |

Stack: Fastify 5, Prisma 6, TypeScript.

### `packages/motores`

Motores de cálculo desacoplados de la UI.

| Motor | Responsabilidad |
|-------|-----------------|
| `motor.minerales` | Masa elemental (mg) = concentración (mg/L) × litros por grupo |
| `motor.oxigeno` | Oxígeno disuelto del tanque (mg/L); mínimo del grupo |
| `motor.plagas` | Recopila `plagas` y `solucion_plagas` por nodo/grupo |
| `motor.insumos` | Suma `cantidad_sol` (L) por grupo conectado |

El **orquestador** registra motores y los ejecuta en paralelo (`Promise.all`). Añadir un motor nuevo no requiere tocar el orquestador (patrón Registry).

### `packages/tipos-compartidos`

Dominio compartido entre frontend, backend y motores.

| Área | Contenido |
|------|-----------|
| **Nodo** | `NodoCultivo`, `VariablesCultivo`, factory desde catálogo |
| **Grafo** | Validación DAG, componentes conexas, serialización para persistencia |
| **Agregación** | Union-Find, suma por categoría con regla de `null` |
| **Catálogos** | Cultivos, plagas, etapas de vida, etiquetas de variables |
| **Proyección** | insumos, consumo temporal, árbol Patricia, ficha nutricional, consolidado diario humano, casos de uso |

Sin dependencias de React, Fastify ni Prisma — solo lógica de dominio pura.

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
| `pnpm dev` | Frontend + backend en paralelo |
| `pnpm dev:frontend` | Solo la UI (Vite en :5173) |
| `pnpm dev:backend` | Solo la API (Fastify en :3001) |
| `pnpm build` | Build de todos los paquetes |
| `pnpm lint` | ESLint en todo el monorepo |
| `pnpm typecheck` | TypeScript en todos los paquetes |
| `pnpm test` | Vitest (DAG, factory, componentes conexas, orquestador) |
