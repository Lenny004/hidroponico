# Decisiones confirmadas

Respuestas del dueño del producto (2026-09-05). Lo de abajo deja de ser «abierto».

## 1. Categorías por nodo — solo el boceto del jefe

No se usa la lista de 15 variables (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo, oxígeno, sol, pH). Esa era una interpretación.

Campos numéricos del boceto:

- `mineral_magnesio`, `mineral_potasio`, `mineral_manganeso`, `mineral_hierro` — concentración en **mg/L** (ppm en solución diluida)
- `oxigeno` — oxígeno disuelto en **mg/L**
- `cantidad_sol` — **litros** de solución nutritiva de esa planta en el tanque

Campos de texto / listas: `comentarios`, `plagas`, `solucion_plagas`.

## 2. Sincronización construcción ↔ base de datos

**Automática** (sin botón Guardar/Publicar). El grafo de construcción se sincroniza solo.

Implementada en Fase 6: GET al recargar, PUT automático al editar. Si la base no responde, el canvas sigue siendo usable.

## 3. UI cuando un grupo queda en `null`

**No se bloquea** la simulación. Se advierte y se sigue calculando el resto de grupos y categorías válidos.

## 4. Orden de los motores

**En paralelo.** No hay dependencia entre minerales, oxígeno, plagas e insumos. El orquestador usa `Promise.all` sobre el registro. Añadir un motor no cambia el orquestador.

## 5. Unidades y fórmula (no es ml)

El boceto decía ml; en hidroponía **no se dosifican minerales en ml por planta**.

- Minerales: concentración de la solución en **mg/L**. Hoagland & Arnon (1950) para hoja; receta UA-CEA / Jensen (Ohio State) para fruto. En agua diluida, mg/L ≡ ppm.
- Masa a preparar en el tanque: **mg = mg/L × L**. No se suman concentraciones entre plantas del mismo loop.
- Oxígeno: **mg/L** disueltos (típico NFT 5–8; plantilla 6). El tanque tiene un solo DO; si los nodos discrepan, el grupo usa el **mínimo**.
- `cantidad_sol`: litros de reserva NFT por planta (hoja ~4 L, hierba ~3 L, fruto ~8 L). El grupo **suma litros**.

No se convierte aún a gramos de sales (MgSO₄, etc.). Si llega una receta de fertilizante propio, se sustituye el paso de masa elemental.

Referencias: Hoagland & Arnon, *The water-culture method…*, Calif. Agr. Expt. Sta. Circ. 347, 1950. Jensen / UA-CEA tomato (Ohio State CFAES), mg/L.
