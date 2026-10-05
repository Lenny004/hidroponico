<!-- readme-standard:v1 -->
<!-- Esta línea permite que los agentes de IA reconozcan y actualicen este README. No la borres. -->

<!-- section:header -->
# Hidropónico

> Plataforma de planificación y cálculo para instalaciones hidropónicas basada en un modelo de grafo.

[![CI](https://github.com/Lenny004/hidroponico/actions/workflows/ci.yml/badge.svg)](https://github.com/Lenny004/hidroponico/actions/workflows/ci.yml)

<!-- section:toc -->
## 📑 Contenido

- [Aspectos destacados](#-aspectos-destacados)
- [Descripción](#-descripción)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Configuración](#-configuración)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Pruebas](#-pruebas)
- [Hoja de ruta y estado](#-hoja-de-ruta-y-estado)
- [Soporte y contribuciones](#-soporte-y-contribuciones)
- [Licencia](#-licencia)

<!-- section:highlights -->
## 🌟 Aspectos destacados

- **Editor de circuitos**: arrastras un cultivo al lienzo, conectas los módulos del mismo tanque y el grafo rechaza los ciclos.
- **Cálculo por grupo**: minerales, oxígeno, plagas e insumos se agregan en cada componente conexa; un `null` vacía esa categoría y el pipeline sigue.
- **Lienzo autónomo**: si PostgreSQL no responde, el editor sigue en el cliente y sincroniza el grafo cuando la API está disponible.
- **Plan de la instalación**: proyección de insumos, depósito frente a la reserva, vista 3D de módulos NFT y consolidado diario frente a lo que necesita un adulto.
- **Motores desacoplados**: el orquestador ejecuta los cuatro en paralelo y un motor nuevo se registra sin reescribir el orquestador.

<!-- section:overview -->
## ℹ️ Descripción

Hidropónico modela una instalación como un grafo acíclico dirigido: cada cultivo o módulo es un nodo y cada circuito compartido (tanque, módulo NFT) es una arista. Sirve a quien combina tanques compartidos y recetas distintas y necesita totales por grupo conectado.

Las concentraciones minerales, el oxígeno del tanque y los litros de solución no siguen la misma regla. Un pipeline de motores aplica cada regla sobre la componente conexa (Union-Find) y presenta el resultado por grupo. La interfaz es un editor visual: catálogo, lienzo, paneles de detalle y ejecución del cálculo.

Las guías largas están en `docs/`: [principios](docs/PRINCIPIOS.md), [arquitectura](docs/arquitectura.md), [modelo de datos](docs/modelo-datos.md), [reglas de negocio](docs/reglas-negocio.md), [roadmap](docs/roadmap.md), [interfaz](docs/interfaz.md), [asunciones](docs/asunciones.md), [ampliación post-Fase 6](docs/ampliacion-post-fase-6.md) y [convenciones](docs/convenciones.md).

**Stack:** TypeScript, React 19, Vite 7, Tailwind CSS 4, React Flow, Three.js, Zustand, Fastify 5, Prisma 6, PostgreSQL 16 y pnpm.

<!-- keep -->
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

**Capacidades de la interfaz:** catálogo a la izquierda, diseño 3D NFT junto a la ficha de trazabilidad (HerbaZest + % VD), menú hamburguesa de cálculos (proyección, depósito vs reserva, caudal NFT, CSV), casos de uso (incluida extensión agropecuaria en El Salvador e hidráulica) y consolidado diario con media aritmética y ponderado frente a lo que un adulto necesita.

```text
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

Dos grafos separados: **construcción** (cliente, trabajo en progreso) y **persistido** (PostgreSQL, fuente de verdad).
<!-- /keep -->

<!-- section:requirements -->
## 📋 Requisitos

- Node.js ≥ 20 (`engines` del `package.json` raíz; la CI usa Node 22)
- pnpm 11.1.3 (`packageManager`)
- Docker con Compose, para PostgreSQL 16. El lienzo arranca igual si el contenedor está apagado.

<!-- section:installation -->
## ⬇️ Instalación

```bash
git clone https://github.com/Lenny004/hidroponico.git
cd hidroponico
pnpm install
```

Persistencia del grafo. El compose publica Postgres en el puerto **5435**:

```bash
docker compose up -d
cp apps/backend/.env.example apps/backend/.env
pnpm --filter @hidroponico/backend prisma:generate
pnpm --filter @hidroponico/backend prisma:migrate
```

<!-- section:usage -->
## 🚀 Uso

```bash
pnpm dev
```

Resultado esperado: la interfaz en http://localhost:5173 y la API en http://localhost:3001/salud (`estado` en `ok`). Si Postgres no está, el lienzo sigue en local y la barra indica que la base de datos no está disponible.

```bash
pnpm dev:frontend
pnpm dev:backend
```

`dev:frontend` abre solo Vite en el puerto 5173. `dev:backend` abre solo Fastify en el puerto 3001.

<!-- section:configuration -->
## ⚙️ Configuración

Copia [`apps/backend/.env.example`](apps/backend/.env.example) a `apps/backend/.env`. Sustituye la contraseña por la de tu Postgres.

| Variable | Descripción | Ejemplo | Requerida |
|---|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL donde se guarda el grafo. Si falta, el backend usa la URL local del compose. | `postgresql://USUARIO:TU_VALOR_AQUI@localhost:5435/hidroponico` | No |
| `PORT` | Puerto HTTP de la API. Si falta, escucha en 3001. | `3001` | No |

<!-- section:structure -->
## 🗂️ Estructura del proyecto

```text
.
├── apps/
│   ├── frontend/              # React + Vite: lienzo, paneles y vista 3D
│   └── backend/               # Fastify, bus TREE.JS y Prisma
├── packages/
│   ├── motores/               # Orquestador y cuatro motores de cálculo
│   └── tipos-compartidos/     # Dominio, DAG, agregación y catálogos
├── docs/                      # Arquitectura, reglas, roadmap y asunciones
├── .github/workflows/         # CI: generar Prisma, typecheck, lint, test y build
├── .githooks/                 # Hooks del mensaje de commit
├── .cursor/                   # Reglas y skills del repositorio
├── docker-compose.yml         # PostgreSQL 16 en el puerto 5435
├── package.json               # Scripts del monorepo y Node ≥ 20
├── pnpm-lock.yaml             # Dependencias fijadas; el gestor es pnpm
└── pnpm-workspace.yaml        # Workspaces apps/* y packages/*
```

<!-- keep -->
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

Stack: React 19, Vite 7, Tailwind CSS 4, `@xyflow/react`, `@react-three/fiber`, Zustand.

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
<!-- /keep -->

<!-- section:development -->
## 🛠️ Desarrollo

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter @hidroponico/backend prisma:generate
```

`pnpm lint` ejecuta ESLint en el monorepo. `pnpm typecheck` y `pnpm build` recorren `apps/` y `packages/`. `prisma:generate` regenera el cliente de Prisma. La CI hace esos cuatro pasos, más `pnpm test`, con pnpm 11.1.3 y Node 22.

`pnpm install` ejecuta `prepare`, que llama a `node scripts/instalar-hooks.mjs`.

<!-- section:testing -->
## ✅ Pruebas

```bash
pnpm test
```

Vitest en `@hidroponico/motores` (los cuatro motores y el orquestador) y en `@hidroponico/tipos-compartidos` (DAG, agregación, grafo persistido, proyección, hidráulica, sanidad y consolidado).

<!-- section:roadmap -->
## 🗺️ Hoja de ruta y estado

| Ítem | Estado |
|------|--------|
| Fase 0 — monorepo, lint, CI, esquema Prisma | Hecho |
| Fase 1 — canvas, arrastre, conexiones DAG, resaltado de grupo | Hecho |
| Fase 2 — panel editable de `NodoCultivo` | Hecho |
| Fase 3 — TREE.JS + motor.minerales | Hecho |
| Fase 4 — motores oxígeno / plagas | Hecho |
| Fase 5 — insumos (`cantidad_sol` por grupo) | Hecho |
| Fase 6 — persistencia Prisma (sync automática) | Hecho |
| Agregación de minerales | Hecha (`null` no bloquea el pipeline) |

Las capas de planificación posteriores (hidráulica, recetas por etapa, banda de oxígeno, sanidad cruzada, CSV y onboarding) están en la interfaz. Detalle y exclusiones: [ampliación post-Fase 6](docs/ampliacion-post-fase-6.md).

- [ ] Puerta de sales: gramos de fertilizante, solo cuando exista una receta propia

<!-- section:contributing -->
## 💭 Soporte y contribuciones

Para reportar un error o proponer un cambio, abre un issue en el repositorio.

<!-- section:license -->
## 📄 Licencia

TODO(readme): no hay archivo `LICENSE` ni un tipo de licencia declarado en el repositorio.
