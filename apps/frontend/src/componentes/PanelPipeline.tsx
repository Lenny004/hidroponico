import { Menu, X } from "lucide-react";
import ArbolPatricia from "./ArbolPatricia";
import CatalogoPlantado from "./CatalogoPlantado";
import PanelResultados from "./PanelResultados";
import ProyeccionInsumos from "./ProyeccionInsumos";
import { usarInterfaz } from "../store/usarInterfaz";

export default function PanelPipeline() {
  const abierto = usarInterfaz((estado) => estado.pipelineAbierto);
  const alternar = usarInterfaz((estado) => estado.alternarPipeline);

  return (
    <aside
      className={abierto ? "panel-pipeline" : "panel-pipeline panel-pipeline--cerrado"}
      aria-label="Cálculos del pipeline"
    >
      <button
        type="button"
        className="panel-pipeline__hamburguesa"
        aria-expanded={abierto}
        title={abierto ? "Ocultar cálculos" : "Mostrar cálculos del pipeline"}
        onClick={alternar}
      >
        {abierto ? <X strokeWidth={2.25} /> : <Menu strokeWidth={2.25} />}
        {abierto ? <span>Cálculos</span> : null}
      </button>
      {abierto ? (
        <div className="panel-pipeline__cuerpo">
          <PanelResultados />
          <details className="seccion-plegable">
            <summary>Proyección de insumos</summary>
            <ProyeccionInsumos />
          </details>
          <details className="seccion-plegable">
            <summary>Plantados</summary>
            <CatalogoPlantado />
          </details>
          <details className="seccion-plegable">
            <summary>Grafo Patricia</summary>
            <ArbolPatricia />
          </details>
        </div>
      ) : null}
    </aside>
  );
}
