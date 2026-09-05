import type { ClaveVariableCultivo } from "./nodo-cultivo";

export const ETIQUETAS_VARIABLES: Record<ClaveVariableCultivo, string> = {
  mineral_nitrogeno: "Nitrógeno",
  mineral_fosforo: "Fósforo",
  mineral_potasio: "Potasio",
  mineral_calcio: "Calcio",
  mineral_magnesio: "Magnesio",
  mineral_azufre: "Azufre",
  mineral_hierro: "Hierro",
  mineral_manganeso: "Manganeso",
  mineral_zinc: "Zinc",
  mineral_cobre: "Cobre",
  mineral_boro: "Boro",
  mineral_molibdeno: "Molibdeno",
  oxigeno: "Oxígeno",
  cantidad_sol: "Cantidad de solución",
  ph: "pH",
};

export const GRUPOS_VARIABLES: {
  titulo: string;
  claves: ClaveVariableCultivo[];
}[] = [
  {
    titulo: "Macronutrientes",
    claves: [
      "mineral_nitrogeno",
      "mineral_fosforo",
      "mineral_potasio",
      "mineral_calcio",
      "mineral_magnesio",
      "mineral_azufre",
    ],
  },
  {
    titulo: "Micronutrientes",
    claves: [
      "mineral_hierro",
      "mineral_manganeso",
      "mineral_zinc",
      "mineral_cobre",
      "mineral_boro",
      "mineral_molibdeno",
    ],
  },
  {
    titulo: "Ambientales",
    claves: ["oxigeno", "cantidad_sol", "ph"],
  },
];
