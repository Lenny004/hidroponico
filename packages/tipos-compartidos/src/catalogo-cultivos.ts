export interface DefinicionCultivo {
  id: string;
  nombre: string;
  color: string;
}

/**
 * Catálogo MVP: al menos 10 cultivos con color distintivo para el panel y el canvas.
 */
export const CATALOGO_CULTIVOS = [
  { id: "lechuga", nombre: "Lechuga", color: "#7CB342" },
  { id: "tomate", nombre: "Tomate", color: "#E53935" },
  { id: "albahaca", nombre: "Albahaca", color: "#43A047" },
  { id: "espinaca", nombre: "Espinaca", color: "#2E7D32" },
  { id: "fresa", nombre: "Fresa", color: "#EC407A" },
  { id: "apio", nombre: "Apio", color: "#9CCC65" },
  { id: "acelga", nombre: "Acelga", color: "#C0CA33" },
  { id: "pepino", nombre: "Pepino", color: "#66BB6A" },
  { id: "menta", nombre: "Menta", color: "#26A69A" },
  { id: "rucula", nombre: "Rúcula", color: "#558B2F" },
] as const satisfies readonly DefinicionCultivo[];

export type IdCultivoCatalogo = (typeof CATALOGO_CULTIVOS)[number]["id"];

/**
 * Busca una plantilla del catálogo por id.
 * @returns La definición o `null` si el id no está en la lista blanca.
 */
export function obtenerCultivoPorId(id: string): DefinicionCultivo | null {
  return CATALOGO_CULTIVOS.find((cultivo) => cultivo.id === id) ?? null;
}
