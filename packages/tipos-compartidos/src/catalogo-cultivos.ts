import {
  CLAVES_VARIABLES_CULTIVO,
  type ClaveVariableCultivo,
  type VariablesCultivo,
} from "./nodo-cultivo";

/**
 * ml por planta que propone el catálogo al crear un nodo.
 * No es receta Hoagland ni conversión de concentración: el usuario puede editarlos.
 */
export type VariablesPlantilla = {
  [K in ClaveVariableCultivo]: number;
};

/**
 * Cultivo de la lista blanca: identidad visual más plantilla numérica del boceto.
 * `plagas`, `solucion_plagas` y `comentarios` no tienen default: salen en `null`.
 */
export interface DefinicionCultivo {
  id: string;
  nombre: string;
  color: string;
  plantilla: VariablesPlantilla;
}

function plantillaMl(valores: {
  magnesio: number;
  potasio: number;
  manganeso: number;
  hierro: number;
  oxigeno: number;
  solucion: number;
}): VariablesPlantilla {
  return {
    mineral_magnesio: valores.magnesio,
    mineral_potasio: valores.potasio,
    mineral_manganeso: valores.manganeso,
    mineral_hierro: valores.hierro,
    oxigeno: valores.oxigeno,
    cantidad_sol: valores.solucion,
  };
}

/**
 * Catálogo MVP: al menos 10 cultivos con color y plantilla de ml por planta.
 */
export const CATALOGO_CULTIVOS = [
  {
    id: "lechuga",
    nombre: "Lechuga",
    color: "#7CB342",
    plantilla: plantillaMl({
      magnesio: 4,
      potasio: 8,
      manganeso: 1,
      hierro: 2,
      oxigeno: 3,
      solucion: 250,
    }),
  },
  {
    id: "tomate",
    nombre: "Tomate",
    color: "#E53935",
    plantilla: plantillaMl({
      magnesio: 8,
      potasio: 20,
      manganeso: 2,
      hierro: 4,
      oxigeno: 6,
      solucion: 450,
    }),
  },
  {
    id: "albahaca",
    nombre: "Albahaca",
    color: "#43A047",
    plantilla: plantillaMl({
      magnesio: 5,
      potasio: 10,
      manganeso: 1,
      hierro: 2,
      oxigeno: 4,
      solucion: 180,
    }),
  },
  {
    id: "espinaca",
    nombre: "Espinaca",
    color: "#2E7D32",
    plantilla: plantillaMl({
      magnesio: 5,
      potasio: 9,
      manganeso: 1,
      hierro: 2,
      oxigeno: 3,
      solucion: 260,
    }),
  },
  {
    id: "fresa",
    nombre: "Fresa",
    color: "#EC407A",
    plantilla: plantillaMl({
      magnesio: 6,
      potasio: 14,
      manganeso: 2,
      hierro: 3,
      oxigeno: 5,
      solucion: 320,
    }),
  },
  {
    id: "apio",
    nombre: "Apio",
    color: "#9CCC65",
    plantilla: plantillaMl({
      magnesio: 6,
      potasio: 12,
      manganeso: 1,
      hierro: 2,
      oxigeno: 4,
      solucion: 300,
    }),
  },
  {
    id: "acelga",
    nombre: "Acelga",
    color: "#C0CA33",
    plantilla: plantillaMl({
      magnesio: 5,
      potasio: 10,
      manganeso: 1,
      hierro: 3,
      oxigeno: 3,
      solucion: 280,
    }),
  },
  {
    id: "pepino",
    nombre: "Pepino",
    color: "#66BB6A",
    plantilla: plantillaMl({
      magnesio: 7,
      potasio: 16,
      manganeso: 2,
      hierro: 3,
      oxigeno: 5,
      solucion: 400,
    }),
  },
  {
    id: "menta",
    nombre: "Menta",
    color: "#26A69A",
    plantilla: plantillaMl({
      magnesio: 4,
      potasio: 9,
      manganeso: 1,
      hierro: 2,
      oxigeno: 4,
      solucion: 160,
    }),
  },
  {
    id: "rucula",
    nombre: "Rúcula",
    color: "#558B2F",
    plantilla: plantillaMl({
      magnesio: 4,
      potasio: 7,
      manganeso: 1,
      hierro: 2,
      oxigeno: 3,
      solucion: 220,
    }),
  },
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
 * Copia los ml de la plantilla. Mutar el resultado no altera el catálogo.
 * @param tipoCultivo - Id de la lista blanca (`lechuga`, `tomate`, …).
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
