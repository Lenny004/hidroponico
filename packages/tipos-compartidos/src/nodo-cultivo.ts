/**
 * Claves de las 15 variables por nodo.
 *
 * ASUNCIÓN NO CONFIRMADA: esta lista interpreta el boceto de «15 categorías».
 * No tratarla como esquema definitivo hasta validación del dueño del producto.
 * Ver docs/asunciones.md y docs/modelo-datos.md.
 */
export const CLAVES_VARIABLES_CULTIVO = [
  "mineral_nitrogeno",
  "mineral_fosforo",
  "mineral_potasio",
  "mineral_calcio",
  "mineral_magnesio",
  "mineral_azufre",
  "mineral_hierro",
  "mineral_manganeso",
  "mineral_zinc",
  "mineral_cobre",
  "mineral_boro",
  "mineral_molibdeno",
  "oxigeno",
  "cantidad_sol",
  "ph",
] as const;

export type ClaveVariableCultivo = (typeof CLAVES_VARIABLES_CULTIVO)[number];

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
  /** Reservado para agregación por categoría (Fase 3). El canvas de Fase 1 no lo usa. */
  categoria?: string | null;
}
