import type { ClaveVariableCultivo } from "./nodo-cultivo";

export const ETIQUETAS_VARIABLES: Record<ClaveVariableCultivo, string> = {
  mineral_magnesio: "Magnesio",
  mineral_potasio: "Potasio",
  mineral_manganeso: "Manganeso",
  mineral_hierro: "Hierro",
  oxigeno: "Oxígeno disuelto",
  cantidad_sol: "Solución nutritiva",
};

/** Unidad del valor en el nodo (lo que se edita). */
export const UNIDAD_NODO: Record<ClaveVariableCultivo, string> = {
  mineral_magnesio: "mg/L",
  mineral_potasio: "mg/L",
  mineral_manganeso: "mg/L",
  mineral_hierro: "mg/L",
  oxigeno: "mg/L",
  cantidad_sol: "L",
};

/** Unidad del agregado de grupo (masa de mineral, DO compartido, litros). */
export const UNIDAD_AGREGADO: Record<ClaveVariableCultivo, string> = {
  mineral_magnesio: "mg",
  mineral_potasio: "mg",
  mineral_manganeso: "mg",
  mineral_hierro: "mg",
  oxigeno: "mg/L",
  cantidad_sol: "L",
};

export function formatearMedida(valor: number, unidad: string): string {
  const redondeado = Math.round(valor * 100) / 100;
  return `${redondeado} ${unidad}`;
}

export const GRUPOS_VARIABLES: {
  titulo: string;
  claves: ClaveVariableCultivo[];
}[] = [
  {
    titulo: "Minerales",
    claves: [
      "mineral_magnesio",
      "mineral_potasio",
      "mineral_manganeso",
      "mineral_hierro",
    ],
  },
  {
    titulo: "Solución y oxígeno",
    claves: ["cantidad_sol", "oxigeno"],
  },
];
