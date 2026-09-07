export const CANTIDAD_ORIFICIOS = 6;

/** Posiciones X del tubo NFT (mismo orden que los huecos de izquierda a derecha). */
export const POSICIONES_X_ORIFICIO = [-1.85, -1.11, -0.37, 0.37, 1.11, 1.85] as const;

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
