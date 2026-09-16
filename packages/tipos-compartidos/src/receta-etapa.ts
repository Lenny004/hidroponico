import {
  copiarVariablesDePlantilla,
  obtenerCultivoPorId,
  type VariablesPlantilla,
} from "./catalogo-cultivos";
import { type EtapaVida } from "./etapas-vida";
import {
  CLAVES_MINERALES,
  type ClaveMineral,
  type VariablesCultivo,
} from "./nodo-cultivo";

const ETAPAS_FRUTO_JENSEN: readonly EtapaVida[] = ["floracion", "cosecha"];

/**
 * Receta vegetativa de fruto (mg/L). Misma reserva y O₂ que Jensen;
 * menos K y Fe que la receta de cuaje. No añade iones fuera del boceto.
 */
const FRUTO_VEGETATIVO: Pick<
  VariablesPlantilla,
  "mineral_magnesio" | "mineral_potasio" | "mineral_manganeso" | "mineral_hierro"
> = {
  mineral_magnesio: 60,
  mineral_potasio: 250,
  mineral_manganeso: 0.5,
  mineral_hierro: 1.5,
};

function etapaUsaJensen(etapa: EtapaVida | null | undefined): boolean {
  return etapa != null && ETAPAS_FRUTO_JENSEN.includes(etapa);
}

/**
 * Plantilla de concentración y litros para una etapa.
 * Hoja/hierba: Hoagland en todas las etapas.
 * Fruto: vegetativo hasta vegetativo; Jensen en floración y cosecha.
 * Etapa nula → germinación (alta en el tubo).
 *
 * @returns Copia mutable, o `null` si el tipo no está en el catálogo.
 */
export function plantillaParaEtapa(
  tipoCultivo: string,
  etapa: EtapaVida | null | undefined,
): VariablesCultivo | null {
  const definicion = obtenerCultivoPorId(tipoCultivo);
  const base = copiarVariablesDePlantilla(tipoCultivo);
  if (!definicion || !base) {
    return null;
  }
  if (definicion.familia !== "fruto" || etapaUsaJensen(etapa ?? "germinacion")) {
    return base;
  }
  return {
    ...base,
    ...FRUTO_VEGETATIVO,
  };
}

/**
 * True si algún mineral del nodo no coincide con la receta de esa etapa.
 * `null` en el nodo cuenta como distinto (no se aplica a ciegas).
 */
export function recetaDifiereDeEtapa(
  variables: VariablesCultivo | undefined,
  tipoCultivo: string,
  etapa: EtapaVida | null | undefined,
): boolean {
  const sugerida = plantillaParaEtapa(tipoCultivo, etapa ?? "germinacion");
  if (!sugerida || !variables) {
    return false;
  }
  return CLAVES_MINERALES.some((clave) => variables[clave] !== sugerida[clave]);
}

/**
 * Copia solo Mg/K/Mn/Fe de la receta de etapa. Conserva O₂ y `cantidad_sol` del nodo.
 */
export function mineralesDeEtapa(
  tipoCultivo: string,
  etapa: EtapaVida | null | undefined,
): Pick<VariablesCultivo, ClaveMineral> | null {
  const plantilla = plantillaParaEtapa(tipoCultivo, etapa ?? "germinacion");
  if (!plantilla) {
    return null;
  }
  const minerales: Pick<VariablesCultivo, ClaveMineral> = {};
  for (const clave of CLAVES_MINERALES) {
    minerales[clave] = plantilla[clave] ?? null;
  }
  return minerales;
}
