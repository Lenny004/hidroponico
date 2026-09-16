# Ampliación post-Fase 6

Las fases 0–6 del [roadmap](roadmap.md) están hechas. Esto no reabre esas fases: son **capas de planificación** encima del grafo NFT, las variables del boceto y los cuatro motores.

Filtro (confirmado en [asunciones.md](asunciones.md)):

- Sí: depósito físico, caudal NFT, recetas Mg/K/Mn/Fe por etapa, banda de O₂ 5–8 mg/L, sanidad cruzada, CSV, onboarding.
- No: pH/EC en el nodo, las 15 variables, ml/planta, minerales→litros, hardware, solver de sales.

## Capa A — Hidráulica (no es un motor)

El pipeline sigue sumando `cantidad_sol` (reserva química, recircula). El **depósito** es geometría opcional de la instalación: no vive en `NodoCultivo`.

- Formas: prisma rectangular o cilindro. Neto = bruto − desplazamiento (L de equipo).
- Si Σ `cantidad_sol` > neto, se avisa. No se sustituye la reserva por el volumen geométrico.
- Caudal NFT orientativo: `reservaL × recirculaciones/h` (default 1–2) y un objetivo de etiqueta con margen fijo (20 %). No hay curva de fabricante.
- Caso de uso `hidraulica`: mismo patrón que nutrición / Agroservicio SV (`casos-uso.ts`).

Persistencia del depósito: cliente (`localStorage`). El grafo Prisma sigue siendo nodos y aristas.

## Capa B — Recetas vivas y alertas

- Hoja y hierba: química Hoagland estable en todas las etapas.
- Fruto: menos K/Fe en germinación–vegetativo; receta Jensen en floración y cosecha. El usuario aplica la receta; no se pisan litros ni O₂.
- O₂: plantilla 6 mg/L; la UI avisa fuera de 5–8 mg/L (típico NFT). No es umbral de laboratorio en ml.
- Onboarding de cinco pasos y export CSV del plan (grupos, proyección, depósito). Unidades: L y mg/L.

## Capa C — Sanidad

Fichas propias (síntoma / causa / acción). Cruce: plagas típicas del tipo vs las marcadas en el nodo. Deficiencias solo de Mg, K, Mn, Fe (si el valor del nodo está claramente por debajo de la receta de etapa; `null` no cuenta como 0).

## Puerta de sales (HydroBuddy)

No hay conversión a gramos de MgSO₄, KNO₃, etc., ni soluciones A+B, ni predicción de EC. [Asunciones §5](asunciones.md): ese paso se abre **solo** si llega una receta de fertilizante propio. Hasta entonces el simulador se queda en `mg = mg/L × L`.

## Fuera de alcance

pH, EC, N, P, Ca, S, Zn, Cu, B, Mo, calidad de agua, bombas peristálticas, Broto/IA, cannabis, DWC/raft, acuaponía, simulador de tienda.
