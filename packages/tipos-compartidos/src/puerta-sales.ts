/**
 * Puerta de asunciones §5: masa elemental, no gramos de sales.
 * No hay solver tipo HydroBuddy (MgSO₄, A+B, EC, calidad de agua)
 * hasta que exista una receta de fertilizante propio.
 */
export const CONVERSION_SALES_ABIERTA = false;

/**
 * Aviso fijo para proyección y CSV. No calcula sales.
 */
export function avisoMasaElemental(): string {
  return "Masa elemental (mg = mg/L × L). No hay gramos de sales hasta receta de fertilizante propio.";
}
