import type { LucideIcon } from "lucide-react";
import { Bug, Droplets, FlaskConical, Moon, Play, Sun } from "lucide-react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarTema } from "../store/usarTema";

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
      className={destacado ? "boton-play boton-play--destacado" : "boton-play"}
    >
      <Icono className="boton-play__icono" strokeWidth={2} />
      {etiqueta}
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
  const tema = usarTema((estado) => estado.tema);
  const alternarTema = usarTema((estado) => estado.alternarTema);
  const etiquetaTema = tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const IconoTema = tema === "oscuro" ? Sun : Moon;

  return (
    <header className="barra-superior">
      <div className="barra-superior__marca">
        <h1 className="barra-superior__titulo">Hidropónico</h1>
        <p className="barra-superior__subtitulo">Tubos NFT</p>
      </div>
      <label className="barra-superior__busqueda">
        <span className="barra-superior__etiqueta">Catálogo</span>
        <input
          value={busquedaCatalogo}
          onChange={(evento) => setBusquedaCatalogo(evento.target.value)}
          placeholder="lechuga, pulgón…"
          className="barra-superior__campo"
        />
      </label>
      <label className="barra-superior__busqueda">
        <span className="barra-superior__etiqueta">En el tubo</span>
        <input
          value={filtroLienzo}
          onChange={(evento) => setFiltroLienzo(evento.target.value)}
          placeholder="filtrar por nombre"
          className="barra-superior__campo"
        />
      </label>
      <div className="barra-superior__acciones">
        <button
          type="button"
          className="boton-tema"
          title={etiquetaTema}
          aria-label={etiquetaTema}
          role="switch"
          aria-checked={tema === "oscuro"}
          onClick={alternarTema}
        >
          <IconoTema className="boton-tema__icono" strokeWidth={2} />
        </button>
        <div className="barra-superior__plays">
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
