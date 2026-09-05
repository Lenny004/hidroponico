# Reglas de negocio

Agregación de minerales implementada según el plan confirmado abajo.

## 1. Enlace solo por misma categoría

Dos nodos solo se conectan **para efectos de agregación** si se suman la misma categoría. No se suman minerales distintos entre sí.

La arista del canvas es visual (mismo sistema). Dentro de cada componente conexa, Mg, K, Mn y Fe se agregan por separado.

## 2. Propagación de `null` en el agregado de grupo

Si **un solo nodo** de un grupo conectado por una categoría tiene esa variable en `null`, el resultado agregado de esa categoría para **todo el grupo** queda en `null`.

- No tratar `null` como `0`.
- No omitir el nodo faltante y sumar el resto.

Es una regla de integridad: un dato faltante invalida el cálculo agregado de ese grupo.

**Confirmado:** la UI no bloquea; advierte y sigue con los grupos/categorías válidos.

## 3. Tolerancia a variables faltantes en el nodo individual

Si una variable nunca se definió en un nodo, queda `null` y el **pipeline general sigue**. Distinto de la regla 2 (esta no tumba el pipeline; la 2 sí invalida el agregado de ese grupo).

## 4. Grafo acíclico (DAG)

No se acepta una arista que cree un ciclo. Validar **antes** de insertar.

## 5. Conteo agregado por tipo

El sistema debe responder, sin que el usuario cuente a mano:

- ¿Cuántos nodos hay de tipo X?
- ¿Cuál es la suma de la variable Y entre todos los nodos de tipo X?

Esta suma por tipo es distinta de la agregación por **grupo conectado** (reglas 1 y 2). Hay que no mezclar ambos conceptos en el mismo cálculo.

## Plan de agregación (confirmado)

1. Las aristas del canvas son visuales: agrupan plantas en el mismo sistema.
2. Cada categoría (Mg, K, Mn, Fe) se suma **por separado** dentro de cada componente conexa (Union-Find, aristas como no dirigidas). No se suman minerales distintos entre sí.
3. En cada grupo, si algún nodo tiene esa variable en `null` o ausente → total de esa categoría = `null`.
4. Si todos tienen número (incluido 0) → sumar.
5. Un `null` de categoría/grupo no lanza ni detiene otras categorías ni otros grupos.
6. El conteo por `tipoCultivo` es otro cálculo, no se mezcla con los grupos.
