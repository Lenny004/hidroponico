import { particionarEnGrupos } from "./union-find";
import type { AristaDirigida } from "./grafo-dag";
import type { ClaveMineral, ClaveVariableCultivo, NodoCultivo } from "./nodo-cultivo";

export interface AgregadoMasaMineral {
  categoria: ClaveMineral;
  /** Masa elemental a preparar: Σ (mg/L × L). */
  masaMg: number | null;
  /** Concentración ponderada por volumen, o `null` si no hay litros. */
  concentracionMgL: number | null;
  volumenL: number | null;
  invalidadoPorNull: boolean;
}

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
 * Suma una magnitud aditiva (p. ej. `cantidad_sol` en L). Un `null` deja el total en `null`.
 * No usar para minerales en mg/L: ahí va `agregarMasaMineralEnGrupo`.
 *
 * @param nodos - Nodos de la componente conexa.
 * @param categoria - Clave a sumar. No se mezcla con otras.
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
 * Masa de un mineral en el tanque del grupo: concentración (mg/L) × litros.
 * No se suman mg/L entre plantas: eso no es una concentración real.
 * Falta la concentración o `cantidad_sol` en un nodo → masa del grupo `null`.
 *
 * @param nodos - Componente conexa (mismo sistema / mismo tanque).
 * @param categoria - Mineral a dosificar. No se mezcla con otros.
 */
export function agregarMasaMineralEnGrupo(
  nodos: NodoCultivo[],
  categoria: ClaveMineral,
): AgregadoMasaMineral {
  const concentraciones = nodos.map((nodo) => nodo.variables[categoria]);
  const volumenes = nodos.map((nodo) => nodo.variables.cantidad_sol);
  if (concentraciones.some((valor) => valor == null) || volumenes.some((valor) => valor == null)) {
    return {
      categoria,
      masaMg: null,
      concentracionMgL: null,
      volumenL: null,
      invalidadoPorNull: true,
    };
  }

  const volumenL = volumenes.reduce<number>((acum, valor) => acum + (valor ?? 0), 0);
  const masaMg = nodos.reduce<number>((acum, nodo) => {
    return acum + (nodo.variables[categoria] ?? 0) * (nodo.variables.cantidad_sol ?? 0);
  }, 0);
  const concentracionMgL = volumenL === 0 ? null : masaMg / volumenL;
  return { categoria, masaMg, concentracionMgL, volumenL, invalidadoPorNull: false };
}

/**
 * Oxígeno disuelto del tanque compartido (mg/L). No se suma.
 * Un `null` invalida el grupo. Si los nodos discrepan, el total es el mínimo (el más limitante).
 */
export function agregarOxigenoDisueltoEnGrupo(nodos: NodoCultivo[]): AgregadoCategoria {
  const valores = nodos.map((nodo) => nodo.variables.oxigeno);
  if (valores.some((valor) => valor == null)) {
    return { categoria: "oxigeno", total: null, invalidadoPorNull: true };
  }
  const numeros = valores.map((valor) => valor ?? 0);
  return {
    categoria: "oxigeno",
    total: Math.min(...numeros),
    invalidadoPorNull: false,
  };
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
