import { normalizarPlagas } from "./parsear-valores";
import type { NodoCultivo } from "./nodo-cultivo";

export interface AgregadoPlagas {
  plagas: string[] | null;
  solucion_plagas: string[] | null;
  invalidadoPorNullPlagas: boolean;
  invalidadoPorNullSolucion: boolean;
}

function textoONull(valor: string | null | undefined): string | null {
  const recortado = valor?.trim() ?? "";
  return recortado.length === 0 ? null : recortado;
}

/**
 * Recopila plagas y soluciones de un grupo conectado.
 * Un `null` o vacío en un nodo invalida esa categoría del grupo; no se omite el nodo ni se trata como lista vacía.
 *
 * @param nodos - Nodos de la componente conexa.
 * @returns Listas unificadas, o `null` en la categoría que tenga un dato faltante.
 */
export function agregarPlagasEnGrupo(nodos: NodoCultivo[]): AgregadoPlagas {
  const plagasPorNodo = nodos.map((nodo) => normalizarPlagas(nodo.plagas));
  const solucionesPorNodo = nodos.map((nodo) => textoONull(nodo.solucion_plagas));
  const invalidadoPorNullPlagas = plagasPorNodo.some((lista) => lista == null);
  const invalidadoPorNullSolucion = solucionesPorNodo.some((texto) => texto == null);

  return {
    plagas: invalidadoPorNullPlagas
      ? null
      : normalizarPlagas(plagasPorNodo.flatMap((lista) => lista ?? [])),
    solucion_plagas: invalidadoPorNullSolucion
      ? null
      : normalizarPlagas(solucionesPorNodo.filter((texto): texto is string => texto != null)),
    invalidadoPorNullPlagas,
    invalidadoPorNullSolucion,
  };
}
