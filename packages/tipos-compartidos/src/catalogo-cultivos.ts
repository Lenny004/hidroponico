import {
  CLAVES_VARIABLES_CULTIVO,
  type ClaveVariableCultivo,
  type VariablesCultivo,
} from "./nodo-cultivo";
import {
  construirProceso,
  type FamiliaCultivo,
  type ProcesoCultivo,
} from "./etapas-vida";
import type { IdPlagaCatalogo } from "./catalogo-plagas";

/**
 * Concentración (mg/L) y litros de tanque que propone el catálogo.
 * Minerales de hoja: Hoagland & Arnon 1950. Fruto: receta UA-CEA / Jensen (Ohio State).
 * Oxígeno: 6 mg/L (rango típico NFT 5–8). Litros: reserva NFT por planta.
 * `reposicion_dia_L` no es variable del nodo: estima el agua que se añade al día
 * (transpiración), no el vaciado del tanque.
 */
export type VariablesPlantilla = {
  [K in ClaveVariableCultivo]: number;
};

export interface DefinicionCultivo {
  id: string;
  nombre: string;
  color: string;
  plantilla: VariablesPlantilla;
  familia: FamiliaCultivo;
  proceso: ProcesoCultivo;
  plagas_tipicas: readonly IdPlagaCatalogo[];
  /** Litros/día a reponer (transpiración típica NFT). El tanque recircula. */
  reposicion_dia_L: number;
}

/** Orientación educativa para el manejo del cultivo en un sistema NFT. */
export interface GuiaCultivo {
  luz: string;
  agua: string;
  diagnostico: string;
  acciones_preventivas: readonly string[];
}

const GUIAS_POR_FAMILIA: Record<FamiliaCultivo, GuiaCultivo> = {
  hoja: {
    luz: "Luz brillante indirecta o sol suave, 10–14 h al día. En calor intenso, usar sombra parcial para evitar quemadura y espigado.",
    agua: "Agua limpia, filtrada si contiene sedimentos, con baja salinidad y sin cloro residual. Mantener pH 5.5–6.5 y solución fresca, bien oxigenada.",
    diagnostico: "Hojas pálidas suelen indicar revisar nutrición o raíces; bordes secos, calor o sales; manchas húmedas, exceso de humedad o enfermedad foliar.",
    acciones_preventivas: ["Revisar raíces y nivel de solución", "Renovar solución según el manejo del sistema", "Mantener ventilación entre plantas"],
  },
  aroma: {
    luz: "Luz brillante, 10–14 h al día. La mayoría de aromáticas toleran sol suave; protegerlas del sol fuerte de mediodía si el follaje se deshidrata.",
    agua: "Agua limpia y de baja salinidad, sin cloro residual. Mantener pH 5.5–6.5, buena oxigenación y evitar que el canal quede estancado.",
    diagnostico: "Pérdida de aroma o crecimiento débil puede relacionarse con poca luz; hojas lacias obligan a revisar raíces, temperatura y circulación de la solución.",
    acciones_preventivas: ["Podar con herramientas limpias", "Evitar follaje demasiado denso", "Revisar insectos en brotes tiernos"],
  },
  fruto: {
    luz: "Sol directo o iluminación intensa, al menos 12–16 h al día. Requiere buena ventilación y soporte durante floración y fructificación.",
    agua: "Agua limpia, de baja salinidad y sin cloro residual; filtrar sólidos. Mantener pH 5.5–6.5, solución oxigenada y volumen estable en el depósito.",
    diagnostico: "Flores que caen requieren revisar luz, temperatura y polinización; clorosis o frutos deformes requieren comprobar raíces, receta de etapa y presencia de plagas.",
    acciones_preventivas: ["Tutorar antes de que el tallo cargue peso", "Favorecer circulación de aire", "Inspeccionar flores y envés de las hojas semanalmente"],
  },
};

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
 * Catálogo MVP: color, receta, ciclo de vida informativo y plagas frecuentes.
 */
export const CATALOGO_CULTIVOS = [
  {
    id: "lechuga",
    nombre: "Lechuga",
    color: "#7CB342",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso(
      "hoja",
      35,
      "Siembra en cubo, transplante al canal NFT y corte de cabeza o hojas. Evitar sombra entre plantas.",
    ),
    plagas_tipicas: ["pulgon", "mildiu", "mosca_del_suelo"],
    reposicion_dia_L: 0.5,
  },
  {
    id: "tomate",
    nombre: "Tomate",
    color: "#E53935",
    plantilla: FRUTO,
    familia: "fruto",
    proceso: construirProceso(
      "fruto",
      80,
      "Tutorado, desbrote y polinización en floración. Receta de fruto (más K y Fe) hasta cosecha continua.",
    ),
    plagas_tipicas: ["mosca_blanca", "arana_roja", "minador", "oidio"],
    reposicion_dia_L: 2,
  },
  {
    id: "albahaca",
    nombre: "Albahaca",
    color: "#43A047",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso(
      "aroma",
      32,
      "Poda de brotes apicales para ramificar. Cosecha de hojas; no dejar florar si se busca aroma.",
    ),
    plagas_tipicas: ["pulgon", "trips"],
    reposicion_dia_L: 0.35,
  },
  {
    id: "espinaca",
    nombre: "Espinaca",
    color: "#2E7D32",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso(
      "hoja",
      38,
      "Prefiere solución más fresca y sombra parcial. Cosecha de hojas o planta entera antes de espigar.",
    ),
    plagas_tipicas: ["pulgon", "mildiu"],
    reposicion_dia_L: 0.5,
  },
  {
    id: "fresa",
    nombre: "Fresa",
    color: "#EC407A",
    plantilla: FRUTO,
    familia: "fruto",
    proceso: construirProceso(
      "fruto",
      90,
      "Estolones a canal o maceta NFT. Floración y cuaje; retirar frutos dañados para no atraer plagas.",
    ),
    plagas_tipicas: ["arana_roja", "trips", "oidio"],
    reposicion_dia_L: 0.6,
  },
  {
    id: "apio",
    nombre: "Apio",
    color: "#9CCC65",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso(
      "aroma",
      85,
      "Ciclo largo de pencas. Mantener solución constante; cosecha de tallos externos o planta completa.",
    ),
    plagas_tipicas: ["pulgon", "minador"],
    reposicion_dia_L: 0.8,
  },
  {
    id: "acelga",
    nombre: "Acelga",
    color: "#C0CA33",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso(
      "hoja",
      50,
      "Cosecha escalonada de hojas externas. Tolera bien NFT; no dejar el canal seco entre riegos.",
    ),
    plagas_tipicas: ["pulgon", "mosca_blanca"],
    reposicion_dia_L: 0.6,
  },
  {
    id: "pepino",
    nombre: "Pepino",
    color: "#66BB6A",
    plantilla: FRUTO,
    familia: "fruto",
    proceso: construirProceso(
      "fruto",
      60,
      "Tutor vertical y raleo de frutos. Alta demanda de K en cuaje; vigilar oídio en hoja.",
    ),
    plagas_tipicas: ["mosca_blanca", "oidio", "arana_roja"],
    reposicion_dia_L: 2,
  },
  {
    id: "menta",
    nombre: "Menta",
    color: "#26A69A",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso(
      "aroma",
      40,
      "Crecimiento agresivo; recortar para densificar. Cosecha continua de tallos aromáticos.",
    ),
    plagas_tipicas: ["pulgon", "arana_roja"],
    reposicion_dia_L: 0.35,
  },
  {
    id: "rucula",
    nombre: "Rúcula",
    color: "#558B2F",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso(
      "hoja",
      25,
      "Ciclo corto. Cortar hojas jóvenes; si espiga, el sabor se vuelve picante y amargo.",
    ),
    plagas_tipicas: ["pulgon", "mosca_del_suelo"],
    reposicion_dia_L: 0.4,
  },
  {
    id: "col-rizada",
    nombre: "Col rizada",
    color: "#6D8E35",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso("hoja", 55, "Cosecha hojas externas de forma escalonada; prefiere ambiente fresco y buena ventilación."),
    plagas_tipicas: ["pulgon", "mosca_blanca", "mildiu"],
    reposicion_dia_L: 0.6,
  },
  {
    id: "bok-choy",
    nombre: "Bok choy",
    color: "#8AAE4D",
    plantilla: HOJA,
    familia: "hoja",
    proceso: construirProceso("hoja", 35, "Ciclo rápido. Cosechar planta joven o hojas externas antes de que espigue por calor."),
    plagas_tipicas: ["pulgon", "mosca_del_suelo", "mildiu"],
    reposicion_dia_L: 0.45,
  },
  {
    id: "cilantro",
    nombre: "Cilantro",
    color: "#4B9B55",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso("aroma", 40, "Cosechar tallos jóvenes; el calor acelera la floración, por lo que conviene sombra parcial."),
    plagas_tipicas: ["pulgon", "trips", "mildiu"],
    reposicion_dia_L: 0.3,
  },
  {
    id: "perejil",
    nombre: "Perejil",
    color: "#2F7D4A",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso("aroma", 65, "Germinación lenta; cortar tallos externos y no retirar el centro de la mata."),
    plagas_tipicas: ["pulgon", "minador", "oidio"],
    reposicion_dia_L: 0.35,
  },
  {
    id: "cebollin",
    nombre: "Cebollín",
    color: "#78A83C",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso("aroma", 55, "Cosecha por corte dejando base y raíces; evitar encharcamiento alrededor del cuello."),
    plagas_tipicas: ["trips", "mosca_del_suelo", "oidio"],
    reposicion_dia_L: 0.35,
  },
  {
    id: "oregano",
    nombre: "Orégano",
    color: "#6B8540",
    plantilla: AROMA,
    familia: "aroma",
    proceso: construirProceso("aroma", 60, "Podar puntas para ramificar y cosechar antes de floración para conservar mejor aroma."),
    plagas_tipicas: ["pulgon", "arana_roja", "oidio"],
    reposicion_dia_L: 0.3,
  },
  {
    id: "pimiento",
    nombre: "Pimiento",
    color: "#F2A43A",
    plantilla: FRUTO,
    familia: "fruto",
    proceso: construirProceso("fruto", 85, "Tutorar, vigilar floración y cosechar cuando el fruto alcance el color y tamaño deseados."),
    plagas_tipicas: ["mosca_blanca", "trips", "arana_roja", "oidio"],
    reposicion_dia_L: 1.8,
  },
  {
    id: "berenjena",
    nombre: "Berenjena",
    color: "#6A4C93",
    plantilla: FRUTO,
    familia: "fruto",
    proceso: construirProceso("fruto", 90, "Requiere tutores y luz intensa. Retirar hojas muy dañadas y cosechar frutos firmes."),
    plagas_tipicas: ["arana_roja", "mosca_blanca", "trips", "oidio"],
    reposicion_dia_L: 2,
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

/**
 * Agua a reponer al día (L) según el catálogo. No usa `cantidad_sol`.
 * Tipo desconocido → `null`.
 *
 * @param tipoCultivo - Id de la lista blanca.
 */
export function reposicionDiaDe(tipoCultivo: string): number | null {
  return obtenerCultivoPorId(tipoCultivo)?.reposicion_dia_L ?? null;
}

/** Guía de luz, agua y diagnóstico para presentar a personas no técnicas. */
export function guiaDeCultivo(tipoCultivo: string): GuiaCultivo | null {
  const cultivo = obtenerCultivoPorId(tipoCultivo);
  return cultivo ? GUIAS_POR_FAMILIA[cultivo.familia] : null;
}
