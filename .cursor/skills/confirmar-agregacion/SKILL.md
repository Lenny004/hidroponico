---
name: confirmar-agregacion
description: Muestra el plan de agregación por categoría y null-propagation antes de programarlo. Use when implementing motor.minerales, Union-Find, grupos conectados, regla de null, o suma de minerales.
---

# Confirmar agregación antes de codear

**No escribir** la regla de suma de minerales hasta mostrar el plan y obtener confirmación.

## Qué presentar (resumen, no código)

1. Aristas etiquetadas por `categoria` vs. un solo enlace visual — qué se asumió.
2. Subgrafo por categoría → componentes conexas (Union-Find).
3. En cada grupo: un `null` ⇒ agregado del grupo `null` (no `0`, no omitir el nodo).
4. Nodo sin la variable: `null` local; el pipeline no lanza.
5. Conteo por `tipoCultivo` es **otro** cálculo (no mezclarlo con grupos).

Fuente: `docs/reglas-negocio.md`.

## Después de confirmar

Implementar un motor (`motor.minerales`) vía TREE.JS. Variables faltantes = `null`, el pipeline sigue.

Si el usuario no ha confirmado, parar y preguntar.
