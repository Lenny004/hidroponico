import { parsearCasoUso, type IdCasoUso } from "@hidroponico/tipos-compartidos";
import { create } from "zustand";

export const ZOOM_MIN = 16;
export const ZOOM_MAX = 80;
export const ZOOM_PASO = 8;
export const ZOOM_INICIAL = 32;

type EstadoInterfaz = {
  casoUso: IdCasoUso;
  pipelineAbierto: boolean;
  zoom: number;
  anclado: boolean;
  setCasoUso: (id: string) => void;
  setPipelineAbierto: (abierto: boolean) => void;
  alternarPipeline: () => void;
  acercar: () => void;
  alejar: () => void;
  setAnclado: (anclado: boolean) => void;
  alternarAnclado: () => void;
};

function acotarZoom(valor: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, valor));
}

export const usarInterfaz = create<EstadoInterfaz>((set) => ({
  casoUso: "nutricion",
  pipelineAbierto: true,
  zoom: ZOOM_INICIAL,
  anclado: false,
  setCasoUso: (id) => {
    const caso = parsearCasoUso(id);
    if (caso) {
      set({ casoUso: caso });
    }
  },
  setPipelineAbierto: (pipelineAbierto) => set({ pipelineAbierto }),
  alternarPipeline: () => set((estado) => ({ pipelineAbierto: !estado.pipelineAbierto })),
  acercar: () => set((estado) => ({ zoom: acotarZoom(estado.zoom + ZOOM_PASO) })),
  alejar: () => set((estado) => ({ zoom: acotarZoom(estado.zoom - ZOOM_PASO) })),
  setAnclado: (anclado) => set({ anclado }),
  alternarAnclado: () => set((estado) => ({ anclado: !estado.anclado })),
}));
