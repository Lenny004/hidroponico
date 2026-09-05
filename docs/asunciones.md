# Decisiones confirmadas

Respuestas del dueño del producto (2026-09-05). Lo de abajo deja de ser «abierto».

## 1. Categorías por nodo — solo el boceto del jefe

No se usa la lista de 15 variables (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo, oxígeno, sol, pH). Esa era una interpretación.

Campos numéricos del boceto (unidades: ml):

- `mineral_magnesio`
- `mineral_potasio`
- `mineral_manganeso`
- `mineral_hierro`
- `oxigeno`
- `cantidad_sol`

Campos de texto / listas: `comentarios`, `plagas`, `solucion_plagas`.

## 2. Sincronización construcción ↔ base de datos

**Automática** (sin botón Guardar/Publicar). El grafo de construcción se sincroniza solo.

Pendiente de implementación en Fase 6 (Prisma). Hasta entonces el canvas sigue siendo la fuente de trabajo en el cliente.

## 3. UI cuando un grupo queda en `null`

**No se bloquea** la simulación. Se advierte y se sigue calculando el resto de grupos y categorías válidos.

## 4. Orden de los motores

**En paralelo.** No hay dependencia entre minerales, oxígeno y plagas. El orquestador usa `Promise.all` sobre el registro. Añadir un motor no cambia el orquestador.

## 5. Fórmula de solución nutritiva

Ferresal no entregó fórmula. No se puede inventar un paso «minerales → litros» con Hoagland: esa receta exige N, Ca, P, etc., y el boceto solo tiene Mg, K, Mn y Fe.

**Regla usable ahora:** `cantidad_sol` de cada nodo es ml de solución a preparar para esa planta. El total del sistema es la **suma de `cantidad_sol`** por grupo conectado, con la misma regla de `null` (un faltante invalida el total de ese grupo, no el pipeline).

Referencia bibliográfica (no usada en código): Hoagland & Arnon, *The water-culture method…*, Calif. Agr. Expt. Sta. Circ. 347, 1950. Cuando Ferresal dé la fórmula real, se sustituye este criterio.
