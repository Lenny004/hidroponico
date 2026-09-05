import { copiarVariablesDePlantilla, obtenerCultivoPorId } from "./catalogo-cultivos";
import type { NodoCultivo } from "./nodo-cultivo";

/**
 * Factory de nodos de cultivo a partir de una plantilla del catálogo.
 * Copia los ml propuestos por `tipoCultivo`. El usuario puede vaciar un campo a `null`.
 * @param tipoCultivo - Id de la lista blanca (`lechuga`, `tomate`, …).
 * @param id - Identificador único del nodo en el grafo de construcción.
 * @returns Un `NodoCultivo` con la plantilla, o `null` si el tipo no existe.
 */
export function crearNodoDesdePlantilla(
  tipoCultivo: string,
  id: string,
): NodoCultivo | null {
  const definicion = obtenerCultivoPorId(tipoCultivo);
  const variables = copiarVariablesDePlantilla(tipoCultivo);
  if (!definicion || !variables) {
    return null;
  }

  return {
    id,
    tipoCultivo: definicion.id,
    variables,
    plagas: null,
    solucion_plagas: null,
    comentarios: null,
  };
}
