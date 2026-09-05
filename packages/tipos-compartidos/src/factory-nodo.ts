import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  CLAVES_VARIABLES_CULTIVO,
  type NodoCultivo,
  type VariablesCultivo,
} from "./nodo-cultivo";

/**
 * Crea las 15 variables en `null`.
 * Un dato no definido no es 0: el pipeline debe tolerarlo (regla de negocio 3).
 */
function variablesVacias(): VariablesCultivo {
  const variables: VariablesCultivo = {};
  for (const clave of CLAVES_VARIABLES_CULTIVO) {
    variables[clave] = null;
  }
  return variables;
}

/**
 * Factory de nodos de cultivo a partir de una plantilla del catálogo.
 * @param tipoCultivo - Id de la lista blanca (`lechuga`, `tomate`, …).
 * @param id - Identificador único del nodo en el grafo de construcción.
 * @returns Un `NodoCultivo` con variables en `null`, o `null` si el tipo no existe.
 */
export function crearNodoDesdePlantilla(
  tipoCultivo: string,
  id: string,
): NodoCultivo | null {
  const plantilla = obtenerCultivoPorId(tipoCultivo);
  if (!plantilla) {
    return null;
  }

  return {
    id,
    tipoCultivo: plantilla.id,
    variables: variablesVacias(),
    plagas: null,
    solucion_plagas: null,
    comentarios: null,
  };
}
