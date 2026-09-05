import type { LucideIcon } from "lucide-react";
import { Bug, Droplets, FlaskConical, Play } from "lucide-react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function BotonPlay({
  etiqueta,
  icono: Icono,
  destacado = false,
  deshabilitado = false,
  onClick,
}: {
  etiqueta: string;
  icono: LucideIcon;
  destacado?: boolean;
  deshabilitado?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={deshabilitado}
      title={deshabilitado ? "Ejecutando…" : etiqueta}
      onClick={onClick}
      className={
        destacado
          ? "flex size-12 items-center justify-center rounded-full bg-acento-fuerte text-lienzo shadow-[0_0_24px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          : "flex size-9 items-center justify-center rounded-full border border-borde bg-panel text-acento disabled:cursor-not-allowed disabled:opacity-60"
      }
      aria-label={etiqueta}
    >
      <Icono className={destacado ? "size-6" : "size-4"} strokeWidth={2.25} />
    </button>
  );
}

export default function BarraSuperior() {
  const busquedaCatalogo = usarGrafoConstruccion((estado) => estado.busquedaCatalogo);
  const filtroLienzo = usarGrafoConstruccion((estado) => estado.filtroLienzo);
  const ejecutandoPipeline = usarGrafoConstruccion((estado) => estado.ejecutandoPipeline);
  const setBusquedaCatalogo = usarGrafoConstruccion((estado) => estado.setBusquedaCatalogo);
  const setFiltroLienzo = usarGrafoConstruccion((estado) => estado.setFiltroLienzo);
  const ejecutarPipeline = usarGrafoConstruccion((estado) => estado.ejecutarPipeline);

  return (
    <header className="flex items-center gap-3 border-b border-borde bg-panel px-4 py-2">
      <div className="shrink-0">
        <p className="text-sm font-semibold">Hidropónico</p>
        <p className="text-[10px] tracking-wide text-muted uppercase">TREE.JS</p>
      </div>
      <input
        value={busquedaCatalogo}
        onChange={(evento) => setBusquedaCatalogo(evento.target.value)}
        placeholder="Buscar cultivo"
        className="w-44 rounded-lg border border-borde bg-lienzo px-3 py-1.5 text-sm outline-none focus:border-acento"
      />
      <input
        value={filtroLienzo}
        onChange={(evento) => setFiltroLienzo(evento.target.value)}
        placeholder="Filtrar lienzo"
        className="w-44 rounded-lg border border-borde bg-lienzo px-3 py-1.5 text-sm outline-none focus:border-acento"
      />
      <div className="ml-auto flex items-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <BotonPlay
            etiqueta="Minerales"
            icono={FlaskConical}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("minerales")}
          />
          <span className="text-[10px] text-muted">Minerales</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <BotonPlay
            etiqueta="Oxígeno"
            icono={Droplets}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("oxigeno")}
          />
          <span className="text-[10px] text-muted">Oxígeno</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <BotonPlay
            etiqueta="Pipeline"
            icono={Play}
            destacado
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline()}
          />
          <span className="text-[10px] font-medium text-acento">Pipeline</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <BotonPlay
            etiqueta="Plagas"
            icono={Bug}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("plagas")}
          />
          <span className="text-[10px] text-muted">Plagas</span>
        </div>
      </div>
    </header>
  );
}
