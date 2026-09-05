# Arquitectura

## Dos grafos, no uno

El sistema mantiene **dos grafos separados** de forma intencional:

| Grafo | Dónde vive | Para qué |
|-------|------------|----------|
| **Construcción** | Cliente (canvas) | Trabajo en progreso: posiciones, nodos incompletos, aristas temporales. |
| **Base de datos** | PostgreSQL (`nodos`, `aristas`) | Sistema confirmado en producción. Fuente de verdad para cálculos reales y reportes. |

La sincronización construcción → persistido es **automática** (confirmada). Ver [asunciones](asunciones.md). El cliente hace GET al cargar y PUT con debounce al cambiar el canvas.

Ambos grafos deben ser **DAG** (acíclicos). Antes de aceptar una arista hay que detectar ciclos (DFS con colores o algoritmo de Kahn).

## EDA — núcleo TREE.JS

TREE.JS es un bus de eventos interno. La UI y el grafo **no** conocen la lógica de cada motor.

Eventos previstos:

- `nodo:creado`
- `nodo:actualizado`
- `nodo:eliminado`
- `arista:creada`
- `arista:eliminada`
- `pipeline:ejecutar`

Resiliencia: si una variable no existe en un nodo, queda `null` y el pipeline **continúa**. Nunca una excepción por dato faltante debe detener el cálculo completo.

Implementación prevista: `EventEmitter` tipado en el backend. Escalar después a Redis Pub/Sub o BullMQ solo si hace falta multi-instancia.

## Motores (Strategy + Registry)

Interfaz:

```ts
interface MotorHidroponico {
  nombre: string;
  categoriasQueProcesa: string[];
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor;
}
```

| Motor | Responsabilidad |
|-------|-----------------|
| `motor.minerales` | Masa elemental (mg) = concentración (mg/L) × litros por grupo. |
| `motor.oxigeno` | Oxígeno disuelto del tanque (mg/L); no suma concentraciones. |
| `motor.plagas` | Recopila plagas activas y solución sugerida por nodo/grupo. |
| `motor.insumos` | Suma `cantidad_sol` (L) por grupo. |

El orquestador **registra** motores. Añadir `motor.ph` en el futuro no debe exigir tocar el orquestador.

El botón central de la UI ejecuta el pipeline (motores registrados) y combina resultados. Corren **en paralelo** (`Promise.all`). Ver [asunciones](asunciones.md).

## Patrones

- **Observer / Pub-Sub:** bus TREE.JS.
- **Strategy:** cada motor intercambiable.
- **Registry / Plugin:** lista registrable de motores.
- **Factory:** `CultivoNodeFactory` crea un nodo desde la plantilla del tipo de cultivo.
- **Union-Find / componentes conexas:** agrupar nodos conectados por categoría de mineral antes de sumar.

## Capas

Seguir [PRINCIPIOS.md](PRINCIPIOS.md): presentación, dominio, persistencia e infraestructura no se mezclan. Las reglas de negocio no dependen de React, Fastify ni Prisma.

## Persistencia prevista (Fase 6)

Tablas `nodos` y `aristas`. Variables flexibles en JSONB para permitir `null` y evolucionar el esquema sin migraciones constantes.
