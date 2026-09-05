import type { AristaDirigida } from "./grafo-dag";

/**
 * Union-Find para componentes conexas no dirigidas del grafo de construcción.
 * Las aristas visuales agrupan plantas; cada mineral se suma aparte (no se mezclan categorías).
 */
export class UnionFind {
  private readonly padre = new Map<string, string>();
  private readonly rango = new Map<string, number>();

  constructor(ids: string[]) {
    for (const id of ids) {
      this.padre.set(id, id);
      this.rango.set(id, 0);
    }
  }

  /**
   * @returns Representante del conjunto. Ids desconocidos se registran como singleton.
   */
  find(id: string): string {
    const actual = this.padre.get(id);
    if (actual === undefined) {
      this.padre.set(id, id);
      this.rango.set(id, 0);
      return id;
    }
    if (actual !== id) {
      const raiz = this.find(actual);
      this.padre.set(id, raiz);
      return raiz;
    }
    return id;
  }

  union(origenId: string, destinoId: string): void {
    const raizOrigen = this.find(origenId);
    const raizDestino = this.find(destinoId);
    if (raizOrigen === raizDestino) {
      return;
    }
    const rangoOrigen = this.rango.get(raizOrigen) ?? 0;
    const rangoDestino = this.rango.get(raizDestino) ?? 0;
    if (rangoOrigen < rangoDestino) {
      this.padre.set(raizOrigen, raizDestino);
    } else if (rangoOrigen > rangoDestino) {
      this.padre.set(raizDestino, raizOrigen);
    } else {
      this.padre.set(raizDestino, raizOrigen);
      this.rango.set(raizOrigen, rangoOrigen + 1);
    }
  }

  /**
   * @returns Una lista de ids por componente. El orden interno no está garantizado.
   */
  componentes(): string[][] {
    const grupos = new Map<string, string[]>();
    for (const id of this.padre.keys()) {
      const raiz = this.find(id);
      const lista = grupos.get(raiz) ?? [];
      lista.push(id);
      grupos.set(raiz, lista);
    }
    return [...grupos.values()];
  }
}

/**
 * Parte el grafo en grupos conectados (aristas como no dirigidas).
 * Un nodo aislado es un grupo de uno.
 */
export function particionarEnGrupos(
  idsNodos: string[],
  aristas: AristaDirigida[],
): string[][] {
  const unionFind = new UnionFind(idsNodos);
  const conocidos = new Set(idsNodos);
  for (const arista of aristas) {
    if (conocidos.has(arista.origenId) && conocidos.has(arista.destinoId)) {
      unionFind.union(arista.origenId, arista.destinoId);
    }
  }
  return unionFind.componentes();
}
