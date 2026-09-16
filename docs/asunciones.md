# Decisiones confirmadas

Respuestas del dueño del producto (2026-09-05). Lo de abajo deja de ser «abierto».

## 1. Categorías por nodo — solo el boceto del jefe

No se usa la lista de 15 variables (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo, oxígeno, sol, pH). Esa era una interpretación.

Campos numéricos del boceto:

- `mineral_magnesio`, `mineral_potasio`, `mineral_manganeso`, `mineral_hierro` — concentración en **mg/L** (ppm en solución diluida)
- `oxigeno` — oxígeno disuelto en **mg/L**
- `cantidad_sol` — **litros** de reserva NFT de esa planta en el tanque (recircula)

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
- `cantidad_sol`: litros de reserva NFT por planta (hoja ~4 L, hierba ~3 L, fruto ~8 L). El grupo **suma litros**. No es el agua que se gasta al día: el NFT recircula. La reposición diaria (transpiración típica) es un dato de catálogo (`reposicion_dia_L`), no una variable del boceto.

No se convierte aún a gramos de sales (MgSO₄, etc.). Si llega una receta de fertilizante propio, se sustituye el paso de masa elemental. Hasta entonces **no** hay solver tipo HydroBuddy (A+B, EC, calidad de agua). Ver [ampliacion-post-fase-6.md](ampliacion-post-fase-6.md).

Referencias: Hoagland & Arnon, *The water-culture method…*, Calif. Agr. Expt. Sta. Circ. 347, 1950. Jensen / UA-CEA tomato (Ohio State CFAES), mg/L. Reposición: orden de magnitud de transpiración NFT (hoja ~0,4–0,6 L/planta·día; hierba ~0,3–0,4; tomate/pepino ~2; fresa ~0,6).

## 6. Ficha nutricional y consolidado humano (no es un motor)

Vitaminas, kcal y % del valor diario **no** se añaden a `NodoCultivo`. Viven en un catálogo paralelo (`ficha-nutricional`) con cifras educativas por 100 g (USDA FoodData Central) y VD de adulto (FDA 2020).

- Media aritmética: cada planta plantada cuenta igual (% VD de su cosecha típica del día).
- Ponderado: el mismo % pesado por `rendimiento_g_dia` (gramos comestibles estimados).
- Un tipo sin ficha se omite; no bloquea el consolidado.

El enlace a [HerbaZest](https://www.herbazest.com/es) es consulta botánica externa. No se copia su texto; el resumen de la UI es propio.

Agroservicio SV es un lente de extensión (clima tropical, sombra NFT, CENTA/MAG). No es un dictamen oficial ni un motor del pipeline.

## 7. Depósito físico e hidráulica (no son variables del boceto)

La geometría del tanque (bruto/neto) y el caudal NFT son datos de **instalación**, no campos de `NodoCultivo`. Contrastan Σ `cantidad_sol`; no la sustituyen ni inventan litros a partir de minerales. Recirculaciones típicas NFT: 1–2 por hora. El caso de uso `hidraulica` solo cambia el lente del consolidado.
