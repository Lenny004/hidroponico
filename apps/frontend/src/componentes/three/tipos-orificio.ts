import type { FamiliaCultivo } from "@hidroponico/tipos-compartidos";

export type CultivoEnOrificio = {
  id: string;
  nombre: string;
  color: string;
  familia: FamiliaCultivo;
  seleccionado: boolean;
  enGrupo: boolean;
  atenuado: boolean;
  progreso: number | null;
};
