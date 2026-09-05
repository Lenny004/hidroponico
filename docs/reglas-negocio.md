# Reglas de negocio

Estas reglas son críticas. **No implementar agregación de minerales (regla 1 y 2) sin mostrar antes el plan de esta sección y obtener confirmación.**

## 1. Enlace solo por misma categoría

Dos nodos solo se conectan **para efectos de agregación** si comparten la misma categoría de mineral/variable. No se suman minerales distintos entre sí.

Pendiente de confirmar en UI: ¿una arista visual equivale a un enlace de una sola categoría, o un par de nodos puede tener varios enlaces (uno por categoría)?

## 2. Propagación de `null` en el agregado de grupo

Si **un solo nodo** de un grupo conectado por una categoría tiene esa variable en `null`, el resultado agregado de esa categoría para **todo el grupo** queda en `null`.

- No tratar `null` como `0`.
- No omitir el nodo faltante y sumar el resto.

Es una regla de integridad: un dato faltante invalida el cálculo agregado de ese grupo.

**Asunción abierta:** ¿la UI bloquea la simulación o solo advierte y sigue con grupos válidos?

## 3. Tolerancia a variables faltantes en el nodo individual

Si una variable nunca se definió en un nodo, queda `null` y el **pipeline general sigue**. Distinto de la regla 2 (esta no tumba el pipeline; la 2 sí invalida el agregado de ese grupo).

## 4. Grafo acíclico (DAG)

No se acepta una arista que cree un ciclo. Validar **antes** de insertar.

## 5. Conteo agregado por tipo

El sistema debe responder, sin que el usuario cuente a mano:

- ¿Cuántos nodos hay de tipo X?
- ¿Cuál es la suma de la variable Y entre todos los nodos de tipo X?

Esta suma por tipo es distinta de la agregación por **grupo conectado** (reglas 1 y 2). Hay que no mezclar ambos conceptos en el mismo cálculo.

## Plan propuesto de agregación (a confirmar antes de programar)

1. El grafo tiene aristas etiquetadas por `categoria` (ej. `mineral_magnesio`).
2. Por cada categoría, construir el subgrafo que solo incluye aristas de esa categoría.
3. Hallar componentes conexas (Union-Find).
4. En cada componente, si algún nodo tiene la variable `null` o ausente → resultado del grupo = `null`.
5. Si todos tienen número → sumar.
6. TREE.JS emite resultados por grupo; un `null` de grupo no lanza excepción ni detiene otras categorías.

**No implementar este plan hasta confirmarlo.** En particular falta aclarar si el enlace visual del canvas es por categoría o si la «misma categoría» se infiere de otra forma.
