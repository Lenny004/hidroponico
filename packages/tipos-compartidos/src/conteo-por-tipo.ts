import type { ClaveVariableCultivo, NodoCultivo } from "./nodo-cultivo";

/**
 * Cuenta nodos por `tipoCultivo` sin recorrer el canvas a mano.
 */
export function conteoPorTipo(nodos: NodoCultivo[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const nodo of nodos) {
    conteo[nodo.tipoCultivo] = (conteo[nodo.tipoCultivo] ?? 0) + 1;
  }
  return conteo;
}

/**
 * Suma una variable entre todos los nodos de un tipo.
 * Un `null` en ese tipo invalida la suma (misma integridad que el grupo conectado).
 *
 * @returns Total, o `null` si falta un dato o no hay nodos de ese tipo.
 */
export function sumaVariablePorTipo(
  nodos: NodoCultivo[],
  tipoCultivo: string,
  categoria: ClaveVariableCultivo,
): number | null {
  const delTipo = nodos.filter((nodo) => nodo.tipoCultivo === tipoCultivo);
  if (delTipo.length === 0) {
    return null;
  }
  const valores = delTipo.map((nodo) => nodo.variables[categoria]);
  if (valores.some((valor) => valor == null)) {
    return null;
  }
  return valores.reduce<number>((acum, valor) => acum + (valor ?? 0), 0);
}
