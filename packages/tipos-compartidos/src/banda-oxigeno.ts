/**
 * Banda típica de oxígeno disuelto en NFT (mg/L).
 * Coincide con asunciones: plantilla 6; rango 5–8. No es un umbral de laboratorio en ml.
 */
export const OXIGENO_NFT_MIN_MG_L = 5;
export const OXIGENO_NFT_MAX_MG_L = 8;
export const OXIGENO_NFT_PLANTILLA_MG_L = 6;

export type BandaOxigeno = "bajo" | "ok" | "alto" | "sin_dato";

/**
 * Clasifica un DO. `null` o no finito → `sin_dato` (no se trata como 0).
 */
export function bandaOxigeno(mgL: number | null | undefined): BandaOxigeno {
  if (mgL == null || !Number.isFinite(mgL)) {
    return "sin_dato";
  }
  if (mgL < OXIGENO_NFT_MIN_MG_L) {
    return "bajo";
  }
  if (mgL > OXIGENO_NFT_MAX_MG_L) {
    return "alto";
  }
  return "ok";
}

/**
 * Texto corto para la UI. `ok` y `sin_dato` no alarman.
 */
export function avisoBandaOxigeno(mgL: number | null | undefined): string | null {
  const banda = bandaOxigeno(mgL);
  if (banda === "bajo") {
    return `O₂ por debajo de ${OXIGENO_NFT_MIN_MG_L}–${OXIGENO_NFT_MAX_MG_L} mg/L (típico NFT).`;
  }
  if (banda === "alto") {
    return `O₂ por encima de ${OXIGENO_NFT_MIN_MG_L}–${OXIGENO_NFT_MAX_MG_L} mg/L (típico NFT).`;
  }
  return null;
}
