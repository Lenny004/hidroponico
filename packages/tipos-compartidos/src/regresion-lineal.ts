/** Punto observado para un ajuste lineal. */
export interface PuntoRegresion {
  x: number;
  y: number;
}

/** Resultado determinista del ajuste `y = intercepto + pendiente × x`. */
export interface ResultadoRegresionLineal {
  pendiente: number;
  intercepto: number;
  rCuadrado: number;
  minimoX: number;
  maximoX: number;
  minimoY: number;
  maximoY: number;
  puntos: PuntoRegresion[];
}

/**
 * Ajusta una recta por mínimos cuadrados.
 * Devuelve `null` si faltan observaciones, hay valores no finitos o todos los
 * puntos tienen el mismo valor de `x`.
 */
export function calcularRegresionLineal(
  puntos: readonly PuntoRegresion[],
): ResultadoRegresionLineal | null {
  if (
    puntos.length < 2 ||
    puntos.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))
  ) {
    return null;
  }

  const promedioX = puntos.reduce((suma, punto) => suma + punto.x, 0) / puntos.length;
  const promedioY = puntos.reduce((suma, punto) => suma + punto.y, 0) / puntos.length;
  const variacionX = puntos.reduce(
    (suma, punto) => suma + (punto.x - promedioX) ** 2,
    0,
  );
  if (variacionX === 0) {
    return null;
  }

  const covarianza = puntos.reduce(
    (suma, punto) => suma + (punto.x - promedioX) * (punto.y - promedioY),
    0,
  );
  const pendiente = covarianza / variacionX;
  const intercepto = promedioY - pendiente * promedioX;
  const sumaCuadradosTotal = puntos.reduce(
    (suma, punto) => suma + (punto.y - promedioY) ** 2,
    0,
  );
  const sumaCuadradosResidual = puntos.reduce((suma, punto) => {
    const estimado = intercepto + pendiente * punto.x;
    return suma + (punto.y - estimado) ** 2;
  }, 0);
  const rCuadradoSinLimitar =
    sumaCuadradosTotal === 0
      ? 1
      : 1 - sumaCuadradosResidual / sumaCuadradosTotal;
  const rCuadrado = Math.min(1, Math.max(0, rCuadradoSinLimitar));
  const xs = puntos.map((punto) => punto.x);
  const ys = puntos.map((punto) => punto.y);

  return {
    pendiente,
    intercepto,
    rCuadrado,
    minimoX: Math.min(...xs),
    maximoX: Math.max(...xs),
    minimoY: Math.min(...ys),
    maximoY: Math.max(...ys),
    puntos: puntos.map((punto) => ({ ...punto })),
  };
}

/** Calcula el valor estimado por una regresión ya ajustada. */
export function estimarRegresionLineal(
  regresion: Pick<ResultadoRegresionLineal, "pendiente" | "intercepto">,
  x: number,
): number {
  return regresion.intercepto + regresion.pendiente * x;
}
