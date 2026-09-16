import { aporteDiaPlanta, obtenerFichaNutricional } from "./ficha-nutricional";
import type { NodoCultivo } from "./nodo-cultivo";
import {
  CLAVES_NUTRIENTE,
  porcentajeValorDiario,
  type ClaveNutriente,
} from "./referencia-diaria-humana";

export interface AportePlantaDiario {
  id: string;
  tipoCultivo: string;
  /** Gramos comestibles estimados en el día. `null` si no hay ficha. */
  gramosDia: number | null;
  porcentajes: Partial<Record<ClaveNutriente, number | null>>;
}

export interface MetricaConsolidado {
  clave: ClaveNutriente;
  /** Media de % VD entre plantas con ficha (un voto por planta). */
  mediaAritmeticaPct: number | null;
  /** % VD de la cosecha total del día (ponderado por gramos). */
  ponderadoPct: number | null;
  /** Suma de cantidad del nutriente en el día. */
  totalCantidad: number | null;
  omitidos: number;
}

export interface ConsolidadoDiarioHumano {
  plantas: AportePlantaDiario[];
  gramosDia: number | null;
  metricas: MetricaConsolidado[];
  omitidos: number;
}

/**
 * Media aritmética. Lista vacía o todos `null` → `null`.
 */
export function mediaAritmetica(valores: Array<number | null | undefined>): number | null {
  const finitos = valores.filter((valor): valor is number => valor != null && Number.isFinite(valor));
  if (finitos.length === 0) {
    return null;
  }
  return finitos.reduce((acum, valor) => acum + valor, 0) / finitos.length;
}

/**
 * Media ponderada. Pesos ≤ 0 o no finitos se omiten junto a su valor.
 * Si falta un valor, esa planta no entra (no se convierte a 0).
 */
export function mediaPonderada(
  pares: Array<{ valor: number | null | undefined; peso: number | null | undefined }>,
): number | null {
  let suma = 0;
  let pesoTotal = 0;
  for (const par of pares) {
    if (par.valor == null || par.peso == null) {
      continue;
    }
    if (!Number.isFinite(par.valor) || !Number.isFinite(par.peso) || par.peso <= 0) {
      continue;
    }
    suma += par.valor * par.peso;
    pesoTotal += par.peso;
  }
  if (pesoTotal === 0) {
    return null;
  }
  return suma / pesoTotal;
}

function porcentajesDeTipo(
  tipoCultivo: string,
): Partial<Record<ClaveNutriente, number | null>> {
  const salida: Partial<Record<ClaveNutriente, number | null>> = {};
  for (const clave of CLAVES_NUTRIENTE) {
    salida[clave] = porcentajeValorDiario(aporteDiaPlanta(tipoCultivo, clave), clave);
  }
  return salida;
}

/**
 * Consolidado de cosecha diaria frente a lo que un adulto de referencia necesita.
 * Media aritmética: cada planta cuenta igual. Ponderado: cada planta pesa por `rendimiento_g_dia`.
 * Sin ficha nutricional → se omite; no bloquea al resto.
 *
 * @param nodos - Cultivos plantados. Tipos fuera de catálogo se omiten.
 */
export function consolidarAporteDiarioHumano(
  nodos: Array<Pick<NodoCultivo, "id" | "tipoCultivo">>,
): ConsolidadoDiarioHumano {
  const plantas: AportePlantaDiario[] = [];
  let omitidos = 0;
  for (const nodo of nodos) {
    const ficha = obtenerFichaNutricional(nodo.tipoCultivo);
    if (!ficha) {
      omitidos += 1;
      plantas.push({
        id: nodo.id,
        tipoCultivo: nodo.tipoCultivo,
        gramosDia: null,
        porcentajes: {},
      });
      continue;
    }
    plantas.push({
      id: nodo.id,
      tipoCultivo: nodo.tipoCultivo,
      gramosDia: ficha.rendimiento_g_dia,
      porcentajes: porcentajesDeTipo(nodo.tipoCultivo),
    });
  }

  const validas = plantas.filter((planta) => planta.gramosDia != null);
  const gramosDia =
    validas.length === 0
      ? nodos.length === 0
        ? 0
        : null
      : validas.reduce((acum, planta) => acum + (planta.gramosDia ?? 0), 0);

  const metricas = CLAVES_NUTRIENTE.map((clave) => {
    const valores = validas.map((planta) => planta.porcentajes[clave] ?? null);
    const pesos = validas.map((planta) => planta.gramosDia);
    const omitidosClave = valores.filter((valor) => valor == null).length;
    const cantidades = validas.map((planta) => aporteDiaPlanta(planta.tipoCultivo, clave));
    const finitas = cantidades.filter((valor): valor is number => valor != null);
    const totalCantidad = finitas.length === 0 ? null : finitas.reduce((acum, valor) => acum + valor, 0);
    return {
      clave,
      mediaAritmeticaPct: mediaAritmetica(valores),
      ponderadoPct: mediaPonderada(
        validas.map((planta, indice) => ({
          valor: valores[indice],
          peso: pesos[indice],
        })),
      ),
      totalCantidad,
      omitidos: omitidosClave + (plantas.length - validas.length),
    };
  });

  return {
    plantas,
    gramosDia,
    metricas,
    omitidos,
  };
}

/**
 * % VD de una porción de catálogo (por 100 g, o `porcion_g` de la ficha).
 * Útil en la tarjeta HerbaZest al seleccionar un tipo, sin plantas en el tubo.
 */
export function porcentajesPorcionCatalogo(
  tipoCultivo: string,
): Partial<Record<ClaveNutriente, number | null>> | null {
  const ficha = obtenerFichaNutricional(tipoCultivo);
  if (!ficha) {
    return null;
  }
  const salida: Partial<Record<ClaveNutriente, number | null>> = {};
  for (const clave of CLAVES_NUTRIENTE) {
    const cantidad = (ficha.por_100g[clave] / 100) * ficha.porcion_g;
    salida[clave] = porcentajeValorDiario(cantidad, clave);
  }
  return salida;
}
