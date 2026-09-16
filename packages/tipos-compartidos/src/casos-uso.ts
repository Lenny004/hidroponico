/**
 * Modos de trabajo de la franja inferior. No son motores nuevos:
 * cambian qué se enfatiza (plagas, extensión SV, minerales, O₂, nutrición humana, insumos).
 */
export const CASOS_USO = [
  "sanidad",
  "agroservicio",
  "minerales",
  "oxigeno",
  "nutricion",
  "insumos",
] as const;

export type IdCasoUso = (typeof CASOS_USO)[number];

export interface DefinicionCasoUso {
  id: IdCasoUso;
  titulo: string;
  ayuda: string;
  /** Motor del pipeline a resaltar, o `null` si el caso es solo de UI. */
  motor: "minerales" | "oxigeno" | "plagas" | "insumos" | null;
}

export const CATALOGO_CASOS_USO: readonly DefinicionCasoUso[] = [
  {
    id: "sanidad",
    titulo: "Sanidad vegetal",
    ayuda: "Plagas del tubo, síntomas y solucion_plagas. Lente de diagnóstico, no un motor extra.",
    motor: "plagas",
  },
  {
    id: "agroservicio",
    titulo: "Agroservicio SV",
    ayuda: "Extensión tipo CENTA/MAG: clima tropical, sombra NFT y calendario de El Salvador.",
    motor: null,
  },
  {
    id: "minerales",
    titulo: "Minerales",
    ayuda: "Dosificación del tanque: mg = mg/L × L por grupo conectado.",
    motor: "minerales",
  },
  {
    id: "oxigeno",
    titulo: "Oxígeno",
    ayuda: "Oxígeno disuelto del tanque compartido (mínimo del grupo).",
    motor: "oxigeno",
  },
  {
    id: "nutricion",
    titulo: "Nutrición humana",
    ayuda: "Media y ponderado de la cosecha diaria frente al valor diario de un adulto.",
    motor: null,
  },
  {
    id: "insumos",
    titulo: "Insumos",
    ayuda: "Reserva NFT y reposición de agua por transpiración (L/día).",
    motor: "insumos",
  },
];

export function obtenerCasoUso(id: string): DefinicionCasoUso | null {
  return CATALOGO_CASOS_USO.find((caso) => caso.id === id) ?? null;
}

export function parsearCasoUso(valor: string | null | undefined): IdCasoUso | null {
  if (!valor) {
    return null;
  }
  return CASOS_USO.find((id) => id === valor) ?? null;
}

/**
 * Notas de extensión para hidroponía en El Salvador (educativo, no es un dictamen MAG).
 * Época lluviosa aprox. mayo–octubre; calor y humedad suben oomicetos en NFT.
 */
export const AGROSERVICIO_EL_SALVADOR = {
  entidad: "CENTA / MAG El Salvador",
  url_mag: "https://www.mag.gob.sv/",
  url_centa: "https://www.centa.gob.sv/",
  clima:
    "Trópico: época seca (nov–abr) con calor y radiación alta; lluviosa (may–oct) con humedad que favorece Pythium y mildiu en canales.",
  nft: [
    "Sombra 30–50 % sobre lechuga y rúcula en horas de máximo sol.",
    "Airear el tanque: el O₂ baja con agua caliente; apuntar 5–8 mg/L.",
    "No dejar el canal seco entre riegos: el sustrato de cubo se sobrecalienta.",
    "Tomate y pepino piden tutor y más K; hoja y hierba arrancan más fácil en NFT casero.",
  ],
  cultivos_recomendados: ["lechuga", "albahaca", "menta", "rucula", "espinaca", "acelga"],
} as const;
