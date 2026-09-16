import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  CLAVES_NUTRIENTE,
  type ClaveNutriente,
} from "./referencia-diaria-humana";

/**
 * Perfil comestible por 100 g crudos (USDA FoodData Central) y enlace botánico.
 * No copia texto de terceros. Las vitaminas no viven en `NodoCultivo`.
 */
export type NutrientesPor100g = {
  [K in ClaveNutriente]: number;
};

export interface FichaNutricionalCultivo {
  tipoCultivo: string;
  nombre_cientifico: string;
  /** Cosecha comestible típica por planta y día (g). Ciclo único: cosecha / días. */
  rendimiento_g_dia: number;
  porcion_g: number;
  por_100g: NutrientesPor100g;
  /** Resumen educativo propio (no es texto de HerbaZest). */
  resumen: string;
  url_herbazest: string;
  fuente_nutricion: string;
}

const USDA = "USDA FoodData Central, 100 g crudos. Educativo; no es receta clínica.";

function nutrientes(valores: NutrientesPor100g): NutrientesPor100g {
  return { ...valores };
}

/**
 * Fichas de los 10 cultivos del catálogo. Enlace a HerbaZest para el perfil botánico.
 */
export const FICHAS_NUTRICIONALES = [
  {
    tipoCultivo: "lechuga",
    nombre_cientifico: "Lactuca sativa",
    rendimiento_g_dia: 5,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 15,
      vitamina_a: 370,
      vitamina_c: 9.2,
      vitamina_k: 126,
      folato: 38,
      mineral_magnesio: 13,
      mineral_potasio: 194,
      mineral_manganeso: 0.25,
      mineral_hierro: 0.86,
    }),
    resumen:
      "Hoja de baja energía, rica en vitamina K y carotenoides. Factibilidad: cubre K y A mejor que calorías.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/lechuga",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "tomate",
    nombre_cientifico: "Solanum lycopersicum",
    rendimiento_g_dia: 25,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 18,
      vitamina_a: 42,
      vitamina_c: 13.7,
      vitamina_k: 7.9,
      folato: 15,
      mineral_magnesio: 11,
      mineral_potasio: 237,
      mineral_manganeso: 0.11,
      mineral_hierro: 0.27,
    }),
    resumen:
      "Fruto acuoso con vitamina C y potasio. El rendimiento diario pondera más que una hoja en el consolidado.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/tomate",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "albahaca",
    nombre_cientifico: "Ocimum basilicum",
    rendimiento_g_dia: 8,
    porcion_g: 15,
    por_100g: nutrientes({
      energia_kcal: 23,
      vitamina_a: 264,
      vitamina_c: 18,
      vitamina_k: 415,
      folato: 68,
      mineral_magnesio: 64,
      mineral_potasio: 295,
      mineral_manganeso: 1.15,
      mineral_hierro: 3.17,
    }),
    resumen:
      "Hierba densa en vitamina K, Mn y Mg. La porción culinaria es pequeña; el % diario se escala por gramos cosechados.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/albahaca",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "espinaca",
    nombre_cientifico: "Spinacia oleracea",
    rendimiento_g_dia: 4,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 23,
      vitamina_a: 469,
      vitamina_c: 28.1,
      vitamina_k: 483,
      folato: 194,
      mineral_magnesio: 79,
      mineral_potasio: 558,
      mineral_manganeso: 0.9,
      mineral_hierro: 2.71,
    }),
    resumen:
      "Hoja de alta densidad: folato, K, Mg y hierro. Un plato cubre de sobra vitamina K del adulto de referencia.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/espinaca",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "fresa",
    nombre_cientifico: "Fragaria × ananassa",
    rendimiento_g_dia: 3,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 32,
      vitamina_a: 1,
      vitamina_c: 58.8,
      vitamina_k: 2.2,
      folato: 24,
      mineral_magnesio: 13,
      mineral_potasio: 153,
      mineral_manganeso: 0.39,
      mineral_hierro: 0.41,
    }),
    resumen:
      "Fruto con mucha vitamina C por 100 g. El rendimiento NFT diario es bajo; el ponderado no iguala a tomate o pepino.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/fresa",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "apio",
    nombre_cientifico: "Apium graveolens",
    rendimiento_g_dia: 5,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 16,
      vitamina_a: 22,
      vitamina_c: 3.1,
      vitamina_k: 29.3,
      folato: 36,
      mineral_magnesio: 11,
      mineral_potasio: 260,
      mineral_manganeso: 0.1,
      mineral_hierro: 0.2,
    }),
    resumen:
      "Penca acuosa, más potasio que calorías. Aporta volumen al plato con poco % de vitaminas.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/apio",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "acelga",
    nombre_cientifico: "Beta vulgaris var. cicla",
    rendimiento_g_dia: 10,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 19,
      vitamina_a: 306,
      vitamina_c: 30,
      vitamina_k: 830,
      folato: 14,
      mineral_magnesio: 81,
      mineral_potasio: 379,
      mineral_manganeso: 0.37,
      mineral_hierro: 1.8,
    }),
    resumen:
      "Cosecha escalonada: Mg y vitamina K muy altos. En El Salvador tolera calor mejor que lechuga.",
    url_herbazest: "https://www.herbazest.com/es/hierbas",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "pepino",
    nombre_cientifico: "Cucumis sativus",
    rendimiento_g_dia: 25,
    porcion_g: 100,
    por_100g: nutrientes({
      energia_kcal: 15,
      vitamina_a: 5,
      vitamina_c: 2.8,
      vitamina_k: 16.4,
      folato: 7,
      mineral_magnesio: 13,
      mineral_potasio: 147,
      mineral_manganeso: 0.08,
      mineral_hierro: 0.28,
    }),
    resumen:
      "Fruto de alto rendimiento y baja densidad nutricional. Pondera hidratación más que vitaminas.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/pepino",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "menta",
    nombre_cientifico: "Mentha spicata",
    rendimiento_g_dia: 8,
    porcion_g: 15,
    por_100g: nutrientes({
      energia_kcal: 44,
      vitamina_a: 203,
      vitamina_c: 13.3,
      vitamina_k: 0,
      folato: 105,
      mineral_magnesio: 63,
      mineral_potasio: 458,
      mineral_manganeso: 1.12,
      mineral_hierro: 5.08,
    }),
    resumen:
      "Aroma con Mg, K y folato densos. La porción de infusión es chica; el consolidado usa gramos cosechados.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/menta-piperita",
    fuente_nutricion: USDA,
  },
  {
    tipoCultivo: "rucula",
    nombre_cientifico: "Eruca vesicaria",
    rendimiento_g_dia: 3,
    porcion_g: 50,
    por_100g: nutrientes({
      energia_kcal: 25,
      vitamina_a: 119,
      vitamina_c: 15,
      vitamina_k: 109,
      folato: 97,
      mineral_magnesio: 47,
      mineral_potasio: 369,
      mineral_manganeso: 0.32,
      mineral_hierro: 1.46,
    }),
    resumen:
      "Ciclo corto, buena vitamina K y folato. Útil para factibilidad de hoja en NFT tropical con sombra.",
    url_herbazest: "https://www.herbazest.com/es/hierbas/arugula",
    fuente_nutricion: USDA,
  },
] as const satisfies readonly FichaNutricionalCultivo[];

/**
 * Busca la ficha nutricional por id de catálogo.
 * @returns Ficha o `null` si el tipo no tiene perfil.
 */
export function obtenerFichaNutricional(tipoCultivo: string): FichaNutricionalCultivo | null {
  return FICHAS_NUTRICIONALES.find((ficha) => ficha.tipoCultivo === tipoCultivo) ?? null;
}

/**
 * Cantidad de un nutriente en `gramos` de cosecha. Escala lineal desde 100 g.
 * Tipo desconocido o gramos no finitos → `null`.
 */
export function cantidadNutrienteEnGramos(
  tipoCultivo: string,
  clave: ClaveNutriente,
  gramos: number | null | undefined,
): number | null {
  if (gramos == null || !Number.isFinite(gramos)) {
    return null;
  }
  const ficha = obtenerFichaNutricional(tipoCultivo);
  if (!ficha) {
    return null;
  }
  return (ficha.por_100g[clave] / 100) * gramos;
}

/**
 * Aporte de un día de cosecha típica de una planta (`rendimiento_g_dia`).
 */
export function aporteDiaPlanta(
  tipoCultivo: string,
  clave: ClaveNutriente,
): number | null {
  const ficha = obtenerFichaNutricional(tipoCultivo);
  if (!ficha) {
    return null;
  }
  return cantidadNutrienteEnGramos(tipoCultivo, clave, ficha.rendimiento_g_dia);
}

/**
 * Confirma que el tipo existe en el catálogo de cultivos y tiene ficha.
 */
export function fichaNutricionalDeCatalogo(
  tipoCultivo: string,
): FichaNutricionalCultivo | null {
  if (!obtenerCultivoPorId(tipoCultivo)) {
    return null;
  }
  return obtenerFichaNutricional(tipoCultivo);
}

export function clavesNutriente(): readonly ClaveNutriente[] {
  return CLAVES_NUTRIENTE;
}
