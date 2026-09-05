import type { AristaDirigida } from "./grafo-dag";

/**
 * Devuelve los ids de la componente conexa (no dirigida) que contiene `nodoId`.
 * Sirve para resaltar el grupo visual al seleccionar un nodo (Fase 1).
 * No es la agregación por categoría de mineral (Fase 3).
 *
 * @param aristas - Aristas dirigidas; se tratan como no dirigidas para el resaltado.
 * @param nodoId - Nodo de partida.
 */
export function idsComponenteConexa(
  aristas: AristaDirigida[],
  nodoId: string,
): string[] {
  const adyacencia = new Map<string, Set<string>>();

  const asegurar = (id: string): Set<string> => {
    const existente = adyacencia.get(id);
    if (existente) {
      return existente;
    }
    const creado = new Set<string>();
    adyacencia.set(id, creado);
    return creado;
  };

  for (const arista of aristas) {
    asegurar(arista.origenId).add(arista.destinoId);
    asegurar(arista.destinoId).add(arista.origenId);
  }

  const ids = new Set<string>([nodoId]);
  const pila = [nodoId];

  while (pila.length > 0) {
    const actual = pila.pop();
    if (actual === undefined) {
      continue;
    }
    const vecinos = adyacencia.get(actual) ?? new Set<string>();
    for (const vecino of vecinos) {
      if (!ids.has(vecino)) {
        ids.add(vecino);
        pila.push(vecino);
      }
    }
  }

  return [...ids];
}
