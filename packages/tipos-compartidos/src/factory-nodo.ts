import { obtenerCultivoPorId } from "./catalogo-cultivos";
import { fechaInicioHoy } from "./etapas-vida";
import type { NodoCultivo } from "./nodo-cultivo";
import { plantillaParaEtapa } from "./receta-etapa";

/**
 * Factory de nodos a partir de la receta de germinación del catálogo.
 * Hoja: Hoagland. Fruto: receta vegetativa (Jensen se aplica en floración).
 * Copia mg/L y litros de reserva `cantidad_sol`. El usuario puede vaciar un campo a `null`.
 * Inicia la trazabilidad con la fecha local de alta. `etapa_vida` queda `null`
 * para que avance sola según los días (germinación el día 0).
 * @param tipoCultivo - Id de la lista blanca (`lechuga`, `tomate`, …).
 * @param id - Identificador único del nodo en el grafo de construcción.
 * @returns Un `NodoCultivo` con la plantilla, o `null` si el tipo no existe.
 */
export function crearNodoDesdePlantilla(
  tipoCultivo: string,
  id: string,
): NodoCultivo | null {
  const definicion = obtenerCultivoPorId(tipoCultivo);
  const variables = plantillaParaEtapa(tipoCultivo, "germinacion");
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
    etapa_vida: null,
    iniciado_en: fechaInicioHoy(),
  };
}
