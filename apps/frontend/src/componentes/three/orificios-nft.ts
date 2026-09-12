export const ORIFICIOS_POR_TUBO = 6;
export const CANTIDAD_TUBOS = 5;
export const CANTIDAD_ORIFICIOS = ORIFICIOS_POR_TUBO * CANTIDAD_TUBOS;

/** Posiciones X de los huecos en un canal (izquierda a derecha). */
export const POSICIONES_X_ORIFICIO = [-1.85, -1.11, -0.37, 0.37, 1.11, 1.85] as const;

/** Distancia vertical entre ejes de canales apilados. */
export const ESPACIADO_Y_TUBO = 1.45;

/**
 * Posiciones Y de los cinco canales, de abajo hacia arriba.
 * El tubo 0 (orificios 0–5) queda en el canal inferior; el índice
 * persistido no cambia respecto al módulo horizontal.
 */
export const POSICIONES_Y_TUBO = [1.55, 3.0, 4.45, 5.9, 7.35] as const;

/**
 * Índice global de un orificio (0 … CANTIDAD_ORIFICIOS-1).
 * @param tubo - Índice del canal (0 … CANTIDAD_TUBOS-1), 0 = inferior.
 * @param hueco - Hueco dentro del canal (0 … ORIFICIOS_POR_TUBO-1).
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
