/**
 * Primer arranque guiado. No es un motor ni un asistente con sensores.
 */
export const PASOS_ONBOARDING = [
  {
    id: "catalogo",
    titulo: "Elige un cultivo",
    detalle: "En el catálogo de la izquierda: lechuga, tomate, hierbas…",
  },
  {
    id: "orificio",
    titulo: "Plántalo en un orificio",
    detalle: "Arrastra al tubo NFT o pulsa la tarjeta para ocupar un hueco.",
  },
  {
    id: "ficha",
    titulo: "Revisa la ficha",
    detalle: "Mg, K, Mn, Fe, O₂ y litros de reserva. Vacío = sin dato, no es 0.",
  },
  {
    id: "pipeline",
    titulo: "Calcula el tanque",
    detalle: "Play en la barra o el recálculo automático: minerales, O₂, plagas e insumos.",
  },
  {
    id: "consolidado",
    titulo: "Mira el consolidado",
    detalle: "Abajo: nutrición, sanidad o hidráulica. El menú Cálculos guarda el detalle y el CSV.",
  },
] as const;

export type IdPasoOnboarding = (typeof PASOS_ONBOARDING)[number]["id"];
