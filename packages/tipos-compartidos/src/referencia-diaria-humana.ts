/**
 * Valores diarios de un adulto de referencia (FDA 2020, etiqueta nutricional).
 * Sirven para factibilidad educativa: % de lo que un humano necesita al día.
 * No son variables del nodo ni entran a los motores.
 *
 * @see https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 */
export const CLAVES_NUTRIENTE = [
  "energia_kcal",
  "vitamina_a",
  "vitamina_c",
  "vitamina_k",
  "folato",
  "mineral_magnesio",
  "mineral_potasio",
  "mineral_manganeso",
  "mineral_hierro",
] as const;

export type ClaveNutriente = (typeof CLAVES_NUTRIENTE)[number];

export const GRUPOS_NUTRIENTE = {
  vitaminas: ["vitamina_a", "vitamina_c", "vitamina_k", "folato"],
  minerales_energia: ["mineral_potasio", "mineral_magnesio", "mineral_hierro"],
  minerales: [
    "mineral_magnesio",
    "mineral_potasio",
    "mineral_manganeso",
    "mineral_hierro",
  ],
} as const satisfies Record<string, readonly ClaveNutriente[]>;

export const ETIQUETAS_NUTRIENTE: Record<ClaveNutriente, string> = {
  energia_kcal: "Energía",
  vitamina_a: "Vitamina A",
  vitamina_c: "Vitamina C",
  vitamina_k: "Vitamina K",
  folato: "Folato",
  mineral_magnesio: "Magnesio",
  mineral_potasio: "Potasio",
  mineral_manganeso: "Manganeso",
  mineral_hierro: "Hierro",
};

export const SIMBOLOS_NUTRIENTE: Record<ClaveNutriente, string> = {
  energia_kcal: "kcal",
  vitamina_a: "A",
  vitamina_c: "C",
  vitamina_k: "K",
  folato: "B9",
  mineral_magnesio: "Mg",
  mineral_potasio: "K",
  mineral_manganeso: "Mn",
  mineral_hierro: "Fe",
};

export const UNIDAD_NUTRIENTE: Record<ClaveNutriente, string> = {
  energia_kcal: "kcal",
  vitamina_a: "µg",
  vitamina_c: "mg",
  vitamina_k: "µg",
  folato: "µg",
  mineral_magnesio: "mg",
  mineral_potasio: "mg",
  mineral_manganeso: "mg",
  mineral_hierro: "mg",
};

/**
 * Valor diario (VD) adulto. Energía 2000 kcal es el referente de etiqueta, no un gasto real.
 */
export const REFERENCIA_DIARIA_HUMANA: Record<ClaveNutriente, number> = {
  energia_kcal: 2000,
  vitamina_a: 900,
  vitamina_c: 90,
  vitamina_k: 120,
  folato: 400,
  mineral_magnesio: 420,
  mineral_potasio: 4700,
  mineral_manganeso: 2.3,
  mineral_hierro: 18,
};

/**
 * Porcentaje del valor diario. `null` si falta el dato o el VD no es positivo.
 *
 * @param cantidad - Cantidad en la unidad del nutriente.
 * @param clave - Nutriente del catálogo.
 */
export function porcentajeValorDiario(
  cantidad: number | null | undefined,
  clave: ClaveNutriente,
): number | null {
  if (cantidad == null || !Number.isFinite(cantidad)) {
    return null;
  }
  const referencia = REFERENCIA_DIARIA_HUMANA[clave];
  if (!(referencia > 0)) {
    return null;
  }
  return (cantidad / referencia) * 100;
}
