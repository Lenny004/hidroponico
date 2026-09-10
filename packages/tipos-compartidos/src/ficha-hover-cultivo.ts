import { obtenerCultivoPorId } from "./catalogo-cultivos";
import { ETIQUETAS_FAMILIA, type FamiliaCultivo } from "./etapas-vida";
import { CLAVES_MINERALES, type ClaveMineral, type NodoCultivo } from "./nodo-cultivo";

export const SIMBOLOS_MINERAL = {
  mineral_magnesio: "Mg",
  mineral_potasio: "K",
  mineral_manganeso: "Mn",
  mineral_hierro: "Fe",
} as const satisfies Record<ClaveMineral, string>;

export interface DatoHoverMineral {
  clave: ClaveMineral;
  simbolo: string;
  etiqueta: string;
  concentracion: number | null;
  masaMg: number | null;
}

export interface FichaHoverCultivo {
  tipoCultivo: string;
  nombre: string;
  color: string;
  familia: FamiliaCultivo | null;
  etiquetaFamilia: string | null;
  dias_cosecha: number | null;
  litros: number | null;
  oxigeno: number | null;
  masaTotalMg: number | null;
  minerales: DatoHoverMineral[];
}

const ETIQUETA_MINERAL: Record<ClaveMineral, string> = {
  mineral_magnesio: "Magnesio",
  mineral_potasio: "Potasio",
  mineral_manganeso: "Manganeso",
  mineral_hierro: "Hierro",
};

function masaDe(concentracion: number | null | undefined, litros: number | null): number | null {
  if (concentracion == null || litros == null) {
    return null;
  }
  return concentracion * litros;
}

function armarFicha(entrada: {
  tipoCultivo: string;
  concentraciones: Partial<Record<ClaveMineral, number | null>>;
  litros: number | null;
  oxigeno: number | null;
}): FichaHoverCultivo {
  const definicion = obtenerCultivoPorId(entrada.tipoCultivo);
  const minerales = CLAVES_MINERALES.map((clave) => {
    const concentracion = entrada.concentraciones[clave] ?? null;
    return {
      clave,
      simbolo: SIMBOLOS_MINERAL[clave],
      etiqueta: ETIQUETA_MINERAL[clave],
      concentracion,
      masaMg: masaDe(concentracion, entrada.litros),
    };
  });
  const masas = minerales.map((item) => item.masaMg);
  const masaTotalMg = masas.every((valor) => valor != null)
    ? masas.reduce<number>((acum, valor) => acum + (valor ?? 0), 0)
    : null;

  return {
    tipoCultivo: entrada.tipoCultivo,
    nombre: definicion?.nombre ?? entrada.tipoCultivo,
    color: definicion?.color ?? "#93a4c3",
    familia: definicion?.familia ?? null,
    etiquetaFamilia: definicion ? ETIQUETAS_FAMILIA[definicion.familia] : null,
    dias_cosecha: definicion?.proceso.dias_cosecha ?? null,
    litros: entrada.litros,
    oxigeno: entrada.oxigeno,
    masaTotalMg,
    minerales,
  };
}

/**
 * Ficha de hover con la plantilla del catálogo (mg/L y litros típicos).
 * No inventa vitaminas ni biomasa.
 *
 * @param tipoCultivo - Id de la lista blanca.
 * @returns Ficha, o `null` si el tipo no existe.
 */
export function fichaHoverDesdeCatalogo(tipoCultivo: string): FichaHoverCultivo | null {
  const definicion = obtenerCultivoPorId(tipoCultivo);
  if (!definicion) {
    return null;
  }
  return armarFicha({
    tipoCultivo: definicion.id,
    concentraciones: definicion.plantilla,
    litros: definicion.plantilla.cantidad_sol,
    oxigeno: definicion.plantilla.oxigeno,
  });
}

/**
 * Ficha de hover con los valores reales del nodo plantado.
 * Concentración o litros en `null` → esa masa queda `null`.
 *
 * @param nodo - Cultivo en el tubo.
 */
export function fichaHoverDesdeNodo(nodo: NodoCultivo): FichaHoverCultivo {
  return armarFicha({
    tipoCultivo: nodo.tipoCultivo,
    concentraciones: {
      mineral_magnesio: nodo.variables.mineral_magnesio ?? null,
      mineral_potasio: nodo.variables.mineral_potasio ?? null,
      mineral_manganeso: nodo.variables.mineral_manganeso ?? null,
      mineral_hierro: nodo.variables.mineral_hierro ?? null,
    },
    litros: nodo.variables.cantidad_sol ?? null,
    oxigeno: nodo.variables.oxigeno ?? null,
  });
}
