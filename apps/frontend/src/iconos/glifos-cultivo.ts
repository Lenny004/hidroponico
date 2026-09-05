import type { LucideIcon } from "lucide-react";
import {
  Bean,
  Cherry,
  Flower2,
  Hop,
  Leaf,
  LeafyGreen,
  Salad,
  Sprout,
  Vegan,
  Wheat,
} from "lucide-react";
import type { IdCultivoCatalogo } from "@hidroponico/tipos-compartidos";

export const ICONOS_CULTIVO: Record<IdCultivoCatalogo, LucideIcon> = {
  lechuga: Salad,
  tomate: Cherry,
  albahaca: Leaf,
  espinaca: LeafyGreen,
  fresa: Flower2,
  apio: Sprout,
  acelga: Wheat,
  pepino: Bean,
  menta: Hop,
  rucula: Vegan,
};

export function iconoDeCultivo(tipoCultivo: string): LucideIcon {
  return ICONOS_CULTIVO[tipoCultivo as IdCultivoCatalogo] ?? Sprout;
}
