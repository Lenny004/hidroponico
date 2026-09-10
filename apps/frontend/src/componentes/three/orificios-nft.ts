export const ORIFICIOS_POR_TUBO = 6;
export const CANTIDAD_TUBOS = 5;
export const CANTIDAD_ORIFICIOS = ORIFICIOS_POR_TUBO * CANTIDAD_TUBOS;

/** Posiciones X de los huecos en un tubo (izquierda a derecha). */
export const POSICIONES_X_ORIFICIO = [-1.85, -1.11, -0.37, 0.37, 1.11, 1.85] as const;

/** Distancia entre ejes de tubos paralelos (eje Z). */
export const ESPACIADO_Z_TUBO = 1.15;

/**
 * Posiciones Z de los cinco tubos. El tubo 0 queda en el origen (el original);
 * 1–4 se colocan en paralelo a ambos lados.
 */
export const POSICIONES_Z_TUBO = [0, -1.15, 1.15, -2.3, 2.3] as const;

/**
 * Índice global de un orificio (0 … CANTIDAD_ORIFICIOS-1).
 * @param tubo - Índice del tubo (0 … CANTIDAD_TUBOS-1).
 * @param hueco - Hueco dentro del tubo (0 … ORIFICIOS_POR_TUBO-1).
 */
export function indiceOrificio(tubo: number, hueco: number): number {
  return tubo * ORIFICIOS_POR_TUBO + hueco;
}

export function primerOrificioLibre(ocupados: Set<number>): number | null {
  for (let indice = 0; indice < CANTIDAD_ORIFICIOS; indice += 1) {
    if (!ocupados.has(indice)) {
      return indice;
    }
  }
  return null;
}

/**
 * Interpreta `position.x` como índice de orificio.
 * Coordenadas antiguas del canvas 2D (píxeles) se descartan.
 */
export function indiceOrificioDePosicion(posicionX: number): number | null {
  if (Number.isInteger(posicionX) && posicionX >= 0 && posicionX < CANTIDAD_ORIFICIOS) {
    return posicionX;
  }
  return null;
}
