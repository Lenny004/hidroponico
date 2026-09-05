# Asunciones abiertas

Marcar estas decisiones como **no confirmadas**. Preguntar al dueño del producto; no implementar en silencio.

## 1. Las 15 categorías / subnodos

**Propuesta (interpretación, no dato del jefe):** 12 minerales (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo) + `oxigeno` + `cantidad_sol` + `ph`.

¿Es esta la lista correcta?

## 2. Sincronización construcción ↔ base de datos

¿El grafo de construcción se publica con un botón explícito «Guardar / Publicar», o se sincroniza solo?

**Hasta confirmar:** no implementar el flujo de commit a base de datos.

## 3. UI cuando un grupo queda en `null`

Si la regla de propagación de `null` invalida un grupo:

- ¿bloquear toda la simulación?
- ¿solo advertir y continuar con los grupos válidos?

## 4. Orden de los motores

¿Los 3 motores corren en paralelo, o hay dependencia (por ejemplo plagas depende de minerales)?

**Hasta confirmar:** no cablear orquestación más allá de un registro vacío.

## 5. Fórmula de solución nutritiva

¿Qué fórmula real convierte totales de minerales en litros / concentración a preparar?

Esto lo debe dar Ferresal / el dueño del producto. **No inventar** una fórmula para la Fase 5.
