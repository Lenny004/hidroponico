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
      className={destacado ? "boton-play boton-play--destacado" : "boton-play"}
      aria-label={etiqueta}
    >
      <Icono className="boton-play__icono" strokeWidth={2.25} />
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
    <header className="barra-superior">
      <div className="barra-superior__marca">
        <p className="barra-superior__titulo">Hidropónico</p>
        <p className="barra-superior__subtitulo">TREE.JS</p>
      </div>
      <input
        value={busquedaCatalogo}
        onChange={(evento) => setBusquedaCatalogo(evento.target.value)}
        placeholder="Buscar cultivo"
        className="barra-superior__campo"
      />
      <input
        value={filtroLienzo}
        onChange={(evento) => setFiltroLienzo(evento.target.value)}
        placeholder="Filtrar lienzo"
        className="barra-superior__campo"
      />
      <div className="barra-superior__plays">
        <div className="barra-superior__play">
          <BotonPlay
            etiqueta="Minerales"
            icono={FlaskConical}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("minerales")}
          />
          <span className="barra-superior__play-etiqueta">Minerales</span>
        </div>
        <div className="barra-superior__play">
          <BotonPlay
            etiqueta="Oxígeno"
            icono={Droplets}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("oxigeno")}
          />
          <span className="barra-superior__play-etiqueta">Oxígeno</span>
        </div>
        <div className="barra-superior__play">
          <BotonPlay
            etiqueta="Pipeline"
            icono={Play}
            destacado
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline()}
          />
          <span className="barra-superior__play-etiqueta barra-superior__play-etiqueta--acento">
            Pipeline
          </span>
        </div>
        <div className="barra-superior__play">
          <BotonPlay
            etiqueta="Plagas"
            icono={Bug}
            deshabilitado={ejecutandoPipeline}
            onClick={() => void ejecutarPipeline("plagas")}
          />
          <span className="barra-superior__play-etiqueta">Plagas</span>
        </div>
      </div>
    </header>
  );
}
