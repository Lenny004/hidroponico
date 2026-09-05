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

Implementada en Fase 6: GET al recargar, PUT automático al editar. Si la base no responde, el canvas sigue siendo usable.

## 3. UI cuando un grupo queda en `null`

**No se bloquea** la simulación. Se advierte y se sigue calculando el resto de grupos y categorías válidos.

## 4. Orden de los motores

**En paralelo.** No hay dependencia entre minerales, oxígeno, plagas e insumos. El orquestador usa `Promise.all` sobre el registro. Añadir un motor no cambia el orquestador.

## 5. Fórmulas públicas vs. el boceto

Hay recetas en la literatura; no encajan con las unidades ni las variables del boceto, así que **no se copian al código**.

- Minerales: Hoagland & Arnon (1950) da ppm de N, P, K, Ca, Mg, S, Fe, Mn, etc. El boceto solo tiene Mg, K, Mn y Fe, y en **ml por planta**, no mg/L.
- Oxígeno: los papers de NFT hablan de oxígeno **disuelto** (típico 5–8 mg/L en la solución), no de mililitros por nodo. No hay una fórmula «lechuga = X ml de `oxigeno`».

**Regla usable ahora:** el catálogo propone ml por planta al crear (o al cambiar el tipo). Quien arma el canvas puede editarlos o vaciarlos a `null`. `cantidad_sol` es ml de solución a preparar para esa planta. El total del sistema es la **suma de `cantidad_sol`** por grupo conectado, con la misma regla de `null` (un faltante invalida el total de ese grupo, no el pipeline). Si llega una fórmula propia del proyecto, se sustituye este criterio.

Referencia (no usada en código): Hoagland & Arnon, *The water-culture method…*, Calif. Agr. Expt. Sta. Circ. 347, 1950.
