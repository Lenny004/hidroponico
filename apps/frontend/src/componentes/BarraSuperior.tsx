import type { LucideIcon } from "lucide-react";
import { Bug, Droplets, FlaskConical, Moon, Play, Sprout, Sun } from "lucide-react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarTema } from "../store/usarTema";

const claseBoton =
  "inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-sm disabled:opacity-60";

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
      title={deshabilitado ? "Calculando…" : etiqueta}
      onClick={onClick}
      className={
        destacado
          ? `${claseBoton} border-acento-fuerte bg-acento-fuerte text-sobre-acento hover:border-acento hover:bg-acento`
          : `${claseBoton} border-borde bg-panel hover:border-acento`
      }
    >
      <Icono className="size-3.5" strokeWidth={2} />
      {etiqueta}
    </button>
  );
}

function CampoBusqueda({
  etiqueta,
  valor,
  placeholder,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  placeholder: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex w-46 min-w-0 flex-col gap-1">
      <span className="text-xs text-muted">{etiqueta}</span>
      <input
        value={valor}
        placeholder={placeholder}
        onChange={(evento) => onChange(evento.target.value)}
        className="rounded-pequeno border border-borde bg-lienzo px-2.5 py-1.5 focus:border-acento"
      />
    </label>
  );
}

export default function BarraSuperior() {
  const busquedaCatalogo = usarGrafoConstruccion((estado) => estado.busquedaCatalogo);
  const filtroLienzo = usarGrafoConstruccion((estado) => estado.filtroLienzo);
  const ejecutandoPipeline = usarGrafoConstruccion((estado) => estado.ejecutandoPipeline);
  const setBusquedaCatalogo = usarGrafoConstruccion((estado) => estado.setBusquedaCatalogo);
  const setFiltroLienzo = usarGrafoConstruccion((estado) => estado.setFiltroLienzo);
  const ejecutarPipeline = usarGrafoConstruccion((estado) => estado.ejecutarPipeline);
  const tema = usarTema((estado) => estado.tema);
  const alternarTema = usarTema((estado) => estado.alternarTema);
  const etiquetaTema = tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const IconoTema = tema === "oscuro" ? Sun : Moon;

  return (
    <header className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-borde bg-panel px-4 py-2.5">
      <div className="flex items-center gap-2.5 pb-0.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-acento text-sobre-acento"
          aria-hidden
        >
          <Sprout className="size-5" strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-titulo text-xl font-bold tracking-tight">Hidropónico</h1>
          <p className="text-xs text-muted">Tubos NFT</p>
        </div>
      </div>
      <CampoBusqueda
        etiqueta="Catálogo"
        valor={busquedaCatalogo}
        placeholder="lechuga, pulgón…"
        onChange={setBusquedaCatalogo}
      />
      <CampoBusqueda
        etiqueta="En el tubo"
        valor={filtroLienzo}
        placeholder="filtrar por nombre"
        onChange={setFiltroLienzo}
      />
      <div className="ml-auto flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-xl border border-borde text-muted hover:border-acento hover:text-acento"
          title={etiquetaTema}
          aria-label={etiquetaTema}
          role="switch"
          aria-checked={tema === "oscuro"}
          onClick={alternarTema}
        >
          <IconoTema className="size-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-1.5">
          <BotonPlay
            etiqueta="Minerales"
            icono={FlaskConical}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("minerales")}
          />
          <BotonPlay
            etiqueta="Oxígeno"
            icono={Droplets}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("oxigeno")}
          />
          <BotonPlay
            etiqueta="Calcular"
            icono={Play}
            destacado
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline()}
          />
          <BotonPlay
            etiqueta="Plagas"
            icono={Bug}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("plagas")}
          />
        </div>
      </div>
    </header>
  );
}
