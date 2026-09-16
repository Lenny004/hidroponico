/**
 * Geometría opcional del tanque de la instalación.
 * No es variable de `NodoCultivo` ni sustituye `cantidad_sol`.
 * Contrasta capacidad física (neto) con la reserva química ya sumada.
 */

export const FORMAS_DEPOSITO = ["rectangular", "cilindro"] as const;

export type FormaDeposito = (typeof FORMAS_DEPOSITO)[number];

export const RECIRCULACIONES_NFT_MIN = 1;
export const RECIRCULACIONES_NFT_MAX = 2;
export const RECIRCULACIONES_NFT_DEFAULT = 1.5;
/** Margen sobre el caudal entregado para el “objetivo de etiqueta”. */
export const MARGEN_CAUDAL_DEFAULT = 0.2;
/** Peso educativo del agua: ~1 kg/L. No es un cálculo estructural. */
export const KG_POR_LITRO = 1;

export interface DepositoInstalacion {
  forma: FormaDeposito;
  /** Interior mojado (cm). Rectangular. */
  largo_cm: number | null;
  ancho_cm: number | null;
  /** Diámetro interior (cm). Cilindro. */
  diametro_cm: number | null;
  /** Altura de líquido de trabajo, no el borde. */
  alto_liquido_cm: number | null;
  /** Litros que ocupan equipo o cubos bajo el nivel. */
  desplazamiento_L: number | null;
  recirculaciones_h: number;
  margen_caudal: number;
}

export const DEPOSITO_VACIO: DepositoInstalacion = {
  forma: "rectangular",
  largo_cm: null,
  ancho_cm: null,
  diametro_cm: null,
  alto_liquido_cm: null,
  desplazamiento_L: null,
  recirculaciones_h: RECIRCULACIONES_NFT_DEFAULT,
  margen_caudal: MARGEN_CAUDAL_DEFAULT,
};

export type EstadoReservaVsNeto =
  | "sin_deposito"
  | "reserva_incompleta"
  | "cabe"
  | "excede";

export interface VolumenDeposito {
  brutoL: number | null;
  netoL: number | null;
  pesoKg: number | null;
}

export interface ContrasteReserva {
  reservaL: number | null;
  netoL: number | null;
  holguraL: number | null;
  estado: EstadoReservaVsNeto;
}

export interface CaudalNft {
  recirculaciones_h: number;
  entregado_Lph: number | null;
  etiqueta_Lph: number | null;
}

function dimensionFinita(valor: number | null | undefined): number | null {
  if (valor == null || !Number.isFinite(valor) || valor <= 0) {
    return null;
  }
  return valor;
}

/**
 * Volumen bruto (L) según forma y altura de líquido.
 * Dimensión faltante o ≤ 0 → `null`. No inventa un tanque.
 */
export function volumenBrutoDeposito(deposito: DepositoInstalacion): number | null {
  const alto = dimensionFinita(deposito.alto_liquido_cm);
  if (alto == null) {
    return null;
  }
  if (deposito.forma === "cilindro") {
    const diametro = dimensionFinita(deposito.diametro_cm);
    if (diametro == null) {
      return null;
    }
    const radio = diametro / 2;
    return (Math.PI * radio * radio * alto) / 1000;
  }
  const largo = dimensionFinita(deposito.largo_cm);
  const ancho = dimensionFinita(deposito.ancho_cm);
  if (largo == null || ancho == null) {
    return null;
  }
  return (largo * ancho * alto) / 1000;
}

/**
 * Neto = bruto − desplazamiento. Desplazamiento nulo cuenta como 0 (no invalida).
 * Neto negativo se recorta a 0.
 */
export function volumenDeposito(deposito: DepositoInstalacion): VolumenDeposito {
  const brutoL = volumenBrutoDeposito(deposito);
  if (brutoL == null) {
    return { brutoL: null, netoL: null, pesoKg: null };
  }
  const desplazamiento =
    deposito.desplazamiento_L != null && Number.isFinite(deposito.desplazamiento_L)
      ? Math.max(0, deposito.desplazamiento_L)
      : 0;
  const netoL = Math.max(0, brutoL - desplazamiento);
  return {
    brutoL,
    netoL,
    pesoKg: netoL * KG_POR_LITRO,
  };
}

/**
 * Compara reserva química (Σ `cantidad_sol`) con el neto geométrico.
 * `null` de reserva no se trata como 0.
 */
export function contrastarReservaConDeposito(
  reservaL: number | null,
  netoL: number | null,
): ContrasteReserva {
  if (netoL == null) {
    return { reservaL, netoL, holguraL: null, estado: "sin_deposito" };
  }
  if (reservaL == null) {
    return { reservaL, netoL, holguraL: null, estado: "reserva_incompleta" };
  }
  const holguraL = netoL - reservaL;
  return {
    reservaL,
    netoL,
    holguraL,
    estado: holguraL < 0 ? "excede" : "cabe",
  };
}

function recirculacionesAcotadas(valor: number | null | undefined): number {
  if (valor == null || !Number.isFinite(valor) || valor <= 0) {
    return RECIRCULACIONES_NFT_DEFAULT;
  }
  return Math.min(RECIRCULACIONES_NFT_MAX, Math.max(RECIRCULACIONES_NFT_MIN, valor));
}

function margenAcotado(valor: number | null | undefined): number {
  if (valor == null || !Number.isFinite(valor) || valor < 0) {
    return MARGEN_CAUDAL_DEFAULT;
  }
  return Math.min(1, valor);
}

/**
 * Caudal NFT orientativo a partir de la reserva ya sumada.
 * Entregado = L × recirculaciones/h. Etiqueta = entregado × (1 + margen).
 * No usa curva de bomba ni altura manométrica.
 */
export function caudalNftDeReserva(
  reservaL: number | null,
  deposito: Pick<DepositoInstalacion, "recirculaciones_h" | "margen_caudal">,
): CaudalNft {
  const recirculaciones_h = recirculacionesAcotadas(deposito.recirculaciones_h);
  const margen = margenAcotado(deposito.margen_caudal);
  if (reservaL == null || reservaL < 0) {
    return { recirculaciones_h, entregado_Lph: null, etiqueta_Lph: null };
  }
  const entregado_Lph = reservaL * recirculaciones_h;
  return {
    recirculaciones_h,
    entregado_Lph,
    etiqueta_Lph: entregado_Lph * (1 + margen),
  };
}

export function parsearFormaDeposito(valor: string | null | undefined): FormaDeposito | null {
  const recortado = valor?.trim() ?? "";
  return (FORMAS_DEPOSITO as readonly string[]).includes(recortado)
    ? (recortado as FormaDeposito)
    : null;
}

/**
 * Hidrata un depósito desde JSON (localStorage). Campos inválidos vuelven al vacío.
 */
export function parsearDepositoInstalacion(crudo: unknown): DepositoInstalacion {
  if (!crudo || typeof crudo !== "object") {
    return { ...DEPOSITO_VACIO };
  }
  const dato = crudo as Partial<DepositoInstalacion>;
  const forma = parsearFormaDeposito(dato.forma) ?? DEPOSITO_VACIO.forma;
  const numeroONull = (valor: unknown): number | null =>
    typeof valor === "number" && Number.isFinite(valor) ? valor : null;
  return {
    forma,
    largo_cm: numeroONull(dato.largo_cm),
    ancho_cm: numeroONull(dato.ancho_cm),
    diametro_cm: numeroONull(dato.diametro_cm),
    alto_liquido_cm: numeroONull(dato.alto_liquido_cm),
    desplazamiento_L: numeroONull(dato.desplazamiento_L),
    recirculaciones_h: recirculacionesAcotadas(dato.recirculaciones_h),
    margen_caudal: margenAcotado(dato.margen_caudal),
  };
}
