# Reglas de negocio

Agregación implementada según el plan confirmado abajo.

## 1. Enlace solo por misma categoría

Dos nodos solo se conectan **para efectos de agregación** si se trata la misma categoría. No se mezclan minerales distintos entre sí.

La arista del canvas es visual (mismo tanque / mismo sistema). Dentro de cada componente conexa, Mg, K, Mn y Fe se dosifican por separado.

## 2. Propagación de `null` en el agregado de grupo

Si **un solo nodo** de un grupo conectado tiene esa variable en `null` (o, en minerales, si falta `cantidad_sol`), el resultado de esa categoría para **todo el grupo** queda en `null`.

- No tratar `null` como `0`.
- No omitir el nodo faltante y calcular el resto.

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

1. Las aristas del canvas son visuales: agrupan plantas en el mismo tanque.
2. Cada mineral se trata **por separado**. La concentración del nodo está en mg/L. La masa del grupo es **Σ (mg/L × L)**. No se suman mg/L entre plantas.
3. En cada grupo, si algún nodo tiene esa concentración o `cantidad_sol` en `null` → masa de esa categoría = `null`.
4. `cantidad_sol` (L) sí se suma. `oxigeno` (mg/L) no se suma: el tanque usa el valor compartido; si discrepan, el mínimo.
5. Un `null` de categoría/grupo no lanza ni detiene otras categorías ni otros grupos.
6. El conteo por `tipoCultivo` es otro cálculo, no se mezcla con los grupos.
