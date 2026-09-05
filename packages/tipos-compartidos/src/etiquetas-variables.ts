import type { ClaveVariableCultivo } from "./nodo-cultivo";

export const ETIQUETAS_VARIABLES: Record<ClaveVariableCultivo, string> = {
  mineral_magnesio: "Magnesio",
  mineral_potasio: "Potasio",
  mineral_manganeso: "Manganeso",
  mineral_hierro: "Hierro",
  oxigeno: "Oxígeno",
  cantidad_sol: "Cantidad de solución",
};

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
