import type { AristaCultivo } from "./nodo-cultivo";

export interface AristaDirigida {
  origenId: string;
  destinoId: string;
}

/**
 * Indica si existe un camino dirigido desde `origenId` hasta `destinoId`.
 * @param aristas - Aristas actuales del DAG.
 * @param origenId - Nodo de partida.
 * @param destinoId - Nodo buscado.
 */
export function existeCaminoDirigido(
  aristas: AristaDirigida[],
  origenId: string,
  destinoId: string,
): boolean {
  if (origenId === destinoId) {
    return true;
  }

  const adyacencia = new Map<string, string[]>();
  for (const arista of aristas) {
    const lista = adyacencia.get(arista.origenId) ?? [];
    lista.push(arista.destinoId);
    adyacencia.set(arista.origenId, lista);
  }

  const visitados = new Set<string>();
  const pila = [origenId];

  while (pila.length > 0) {
    const actual = pila.pop();
    if (actual === undefined || visitados.has(actual)) {
      continue;
    }
    visitados.add(actual);
    if (actual === destinoId) {
      return true;
    }
    const vecinos = adyacencia.get(actual) ?? [];
    for (const vecino of vecinos) {
      if (!visitados.has(vecino)) {
        pila.push(vecino);
      }
    }
  }

  return false;
}

/**
 * Valida la regla DAG: rechaza la arista si introduciría un ciclo.
 * Una arista `origen → destino` cicla si ya hay camino de destino hacia origen,
 * o si origen y destino son el mismo nodo.
 *
 * @param aristas - Aristas actuales (sin la candidata).
 * @param origenId - Origen de la arista propuesta.
 * @param destinoId - Destino de la arista propuesta.
 * @returns `true` si la arista crearía un ciclo y debe rechazarse.
 */
export function aristaCreariaCiclo(
  aristas: AristaDirigida[],
  origenId: string,
  destinoId: string,
): boolean {
  if (origenId === destinoId) {
    return true;
  }
  return existeCaminoDirigido(aristas, destinoId, origenId);
}

/**
 * Indica si el conjunto de aristas ya forma un ciclo.
 * @param aristas - Aristas dirigidas del grafo completo.
 */
export function grafoTieneCiclo(aristas: AristaDirigida[]): boolean {
  const acumuladas: AristaDirigida[] = [];
  for (const arista of aristas) {
    if (aristaCreariaCiclo(acumuladas, arista.origenId, arista.destinoId)) {
      return true;
    }
    acumuladas.push(arista);
  }
  return false;
}

/**
 * Normaliza aristas del dominio o del canvas a pares dirigidos.
 */
export function aAristasDirigidas(
  aristas: Pick<AristaCultivo, "origenId" | "destinoId">[],
): AristaDirigida[] {
  return aristas.map((arista) => ({
    origenId: arista.origenId,
    destinoId: arista.destinoId,
  }));
}
