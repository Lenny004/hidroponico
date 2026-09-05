import {
  CLAVES_VARIABLES_CULTIVO,
  type ClaveVariableCultivo,
  type VariablesCultivo,
} from "./nodo-cultivo";

/**
 * Concentración (mg/L) y litros de tanque que propone el catálogo.
 * Minerales de hoja: Hoagland & Arnon 1950. Fruto: receta UA-CEA / Jensen (Ohio State).
 * Oxígeno: 6 mg/L (rango típico NFT 5–8). Litros: reserva NFT por planta.
 */
export type VariablesPlantilla = {
  [K in ClaveVariableCultivo]: number;
};

export interface DefinicionCultivo {
  id: string;
  nombre: string;
  color: string;
  plantilla: VariablesPlantilla;
}

function plantillaNutritiva(valores: {
  magnesio: number;
  potasio: number;
  manganeso: number;
  hierro: number;
  oxigeno: number;
  solucionL: number;
}): VariablesPlantilla {
  return {
    mineral_magnesio: valores.magnesio,
    mineral_potasio: valores.potasio,
    mineral_manganeso: valores.manganeso,
    mineral_hierro: valores.hierro,
    oxigeno: valores.oxigeno,
    cantidad_sol: valores.solucionL,
  };
}

/** Hoagland & Arnon (1950), mg/L. O₂ 6 mg/L. Reserva NFT hoja ~4 L/planta. */
const HOJA = plantillaNutritiva({
  magnesio: 48.6,
  potasio: 235,
  manganeso: 0.5,
  hierro: 1,
  oxigeno: 6,
  solucionL: 4,
});

/** Misma química Hoagland; reserva de hierba ~3 L/planta. */
const AROMA = plantillaNutritiva({
  magnesio: 48.6,
  potasio: 235,
  manganeso: 0.5,
  hierro: 1,
  oxigeno: 6,
  solucionL: 3,
});

/**
 * Tomate maduro UA-CEA / Jensen (Ohio State CFAES), mg/L.
 * Reserva NFT fruto ~8 L/planta.
 */
const FRUTO = plantillaNutritiva({
  magnesio: 60,
  potasio: 350,
  manganeso: 0.55,
  hierro: 2,
  oxigeno: 6,
  solucionL: 8,
});

/**
 * Catálogo MVP: color distintivo y plantilla en unidades de solución nutritiva.
 */
export const CATALOGO_CULTIVOS = [
  { id: "lechuga", nombre: "Lechuga", color: "#7CB342", plantilla: HOJA },
  { id: "tomate", nombre: "Tomate", color: "#E53935", plantilla: FRUTO },
  { id: "albahaca", nombre: "Albahaca", color: "#43A047", plantilla: AROMA },
  { id: "espinaca", nombre: "Espinaca", color: "#2E7D32", plantilla: HOJA },
  { id: "fresa", nombre: "Fresa", color: "#EC407A", plantilla: FRUTO },
  { id: "apio", nombre: "Apio", color: "#9CCC65", plantilla: AROMA },
  { id: "acelga", nombre: "Acelga", color: "#C0CA33", plantilla: HOJA },
  { id: "pepino", nombre: "Pepino", color: "#66BB6A", plantilla: FRUTO },
  { id: "menta", nombre: "Menta", color: "#26A69A", plantilla: AROMA },
  { id: "rucula", nombre: "Rúcula", color: "#558B2F", plantilla: HOJA },
] as const satisfies readonly DefinicionCultivo[];

export type IdCultivoCatalogo = (typeof CATALOGO_CULTIVOS)[number]["id"];

/**
 * Busca una plantilla del catálogo por id.
 * @returns La definición o `null` si el id no está en la lista blanca.
 */
export function obtenerCultivoPorId(id: string): DefinicionCultivo | null {
  return CATALOGO_CULTIVOS.find((cultivo) => cultivo.id === id) ?? null;
}

/**
 * Copia concentración y litros de la plantilla. Mutar el resultado no altera el catálogo.
 * @returns Variables numéricas, o `null` si el tipo no existe.
 */
export function copiarVariablesDePlantilla(tipoCultivo: string): VariablesCultivo | null {
  const definicion = obtenerCultivoPorId(tipoCultivo);
  if (!definicion) {
    return null;
  }
  const copiadas: VariablesCultivo = {};
  for (const clave of CLAVES_VARIABLES_CULTIVO) {
    copiadas[clave] = definicion.plantilla[clave];
  }
  return copiadas;
}
