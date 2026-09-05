/**
 * Variables numéricas del boceto del jefe (ml).
 * No ampliar esta lista sin confirmación: la propuesta de 15 categorías quedó descartada.
 */
export const CLAVES_VARIABLES_CULTIVO = [
  "mineral_magnesio",
  "mineral_potasio",
  "mineral_manganeso",
  "mineral_hierro",
  "oxigeno",
  "cantidad_sol",
] as const;

export type ClaveVariableCultivo = (typeof CLAVES_VARIABLES_CULTIVO)[number];

export const CLAVES_MINERALES = [
  "mineral_magnesio",
  "mineral_potasio",
  "mineral_manganeso",
  "mineral_hierro",
] as const satisfies readonly ClaveVariableCultivo[];

export type ClaveMineral = (typeof CLAVES_MINERALES)[number];

/**
 * Valores numéricos o `null` si el dato no existe.
 * Un `null` no debe convertirse en 0 al agregar grupos (regla de negocio 2).
 */
export type VariablesCultivo = {
  [K in ClaveVariableCultivo]?: number | null;
};

export interface NodoCultivo {
  id: string;
  tipoCultivo: string;
  variables: VariablesCultivo;
  plagas?: string[] | null;
  solucion_plagas?: string | null;
  comentarios?: string | null;
}

export interface AristaCultivo {
  id: string;
  origenId: string;
  destinoId: string;
  categoria?: string | null;
}
