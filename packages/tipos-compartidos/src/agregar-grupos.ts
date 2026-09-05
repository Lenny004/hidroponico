import { particionarEnGrupos } from "./union-find";
import type { AristaDirigida } from "./grafo-dag";
import type { ClaveVariableCultivo, NodoCultivo } from "./nodo-cultivo";

export interface AgregadoCategoria {
  categoria: ClaveVariableCultivo;
  total: number | null;
  invalidadoPorNull: boolean;
}

export interface GrupoAgregado {
  idsNodos: string[];
  categorias: AgregadoCategoria[];
}

/**
 * Suma una categoría en un grupo. Un solo `null` o ausente deja el total en `null`.
 * No convierte `null` en 0 ni omite el nodo.
 *
 * @param nodos - Nodos de la componente conexa.
 * @param categoria - Clave a agregar. No se mezcla con otras categorías.
 */
export function agregarCategoriaEnGrupo(
  nodos: NodoCultivo[],
  categoria: ClaveVariableCultivo,
): AgregadoCategoria {
  const valores = nodos.map((nodo) => nodo.variables[categoria]);
  if (valores.some((valor) => valor == null)) {
    return { categoria, total: null, invalidadoPorNull: true };
  }
  const total = valores.reduce<number>((acum, valor) => acum + (valor ?? 0), 0);
  return { categoria, total, invalidadoPorNull: false };
}

/**
 * Por cada grupo visual, agrega cada categoría por separado.
 * Un `null` invalida esa categoría en ese grupo; el resto del pipeline sigue.
 */
export function agregarCategoriasPorGrupos(
  nodos: NodoCultivo[],
  aristas: AristaDirigida[],
  categorias: readonly ClaveVariableCultivo[],
): GrupoAgregado[] {
  const porId = new Map(nodos.map((nodo) => [nodo.id, nodo]));
  const grupos = particionarEnGrupos(
    nodos.map((nodo) => nodo.id),
    aristas,
  );

  return grupos.map((idsNodos) => {
    const miembros = idsNodos
      .map((id) => porId.get(id))
      .filter((nodo): nodo is NodoCultivo => nodo !== undefined);
    return {
      idsNodos,
      categorias: categorias.map((categoria) =>
        agregarCategoriaEnGrupo(miembros, categoria),
      ),
    };
  });
}
