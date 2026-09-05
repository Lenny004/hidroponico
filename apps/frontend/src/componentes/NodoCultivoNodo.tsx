import { Handle, Position, type NodeProps } from "@xyflow/react";
import { obtenerCultivoPorId } from "@hidroponico/tipos-compartidos";
import { ICONOS_CULTIVO } from "../iconos/iconos-cultivo";
import {
  usarGrafoConstruccion,
  type NodoFlujo,
} from "../store/usarGrafoConstruccion";

export default function NodoCultivoNodo({ id, data, selected }: NodeProps<NodoFlujo>) {
  const idsGrupo = usarGrafoConstruccion((estado) => estado.idsGrupo);
  const filtroLienzo = usarGrafoConstruccion((estado) => estado.filtroLienzo);
  const definicion = obtenerCultivoPorId(data.cultivo.tipoCultivo);
  const nombre = definicion?.nombre ?? data.cultivo.tipoCultivo;
  const Icono =
    ICONOS_CULTIVO[data.cultivo.tipoCultivo as keyof typeof ICONOS_CULTIVO] ??
    ICONOS_CULTIVO.lechuga;
  const enGrupo = idsGrupo.includes(id);
  const filtro = filtroLienzo.trim().toLowerCase();
  const coincideFiltro =
    filtro.length === 0 ||
    nombre.toLowerCase().includes(filtro) ||
    data.cultivo.tipoCultivo.toLowerCase().includes(filtro);

  const anillo = selected
    ? "ring-4 ring-white"
    : enGrupo
      ? "ring-4 ring-amber-300"
      : "ring-2 ring-black/30";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Nodo ${nombre}`}
      className={`relative flex flex-col items-center gap-1 ${coincideFiltro ? "opacity-100" : "opacity-25"}`}
    >
      <Handle type="target" position={Position.Left} className="!size-2.5 !bg-white" />
      <div
        className={`flex size-16 items-center justify-center rounded-full text-white shadow-lg ${anillo}`}
        style={{ backgroundColor: data.color }}
      >
        <Icono className="size-8" />
      </div>
      <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
        {nombre}
      </span>
      <Handle type="source" position={Position.Right} className="!size-2.5 !bg-white" />
    </div>
  );
}
