import { Download, Menu, X } from "lucide-react";
import {
  csvPlanificacion,
  nombreArchivoCsv,
} from "@hidroponico/tipos-compartidos";
import ArbolPatricia from "./ArbolPatricia";
import CatalogoPlantado from "./CatalogoPlantado";
import PanelResultados from "./PanelResultados";
import ProyeccionInsumos from "./ProyeccionInsumos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarInterfaz } from "../store/usarInterfaz";
import { descargarTexto } from "../util/descargar-texto";

export default function PanelPipeline() {
  const abierto = usarInterfaz((estado) => estado.pipelineAbierto);
  const alternar = usarInterfaz((estado) => estado.alternarPipeline);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const deposito = usarGrafoConstruccion((estado) => estado.deposito);

  const exportar = () => {
    const csv = csvPlanificacion({
      nodos: nodos.map((nodo) => nodo.data.cultivo),
      deposito,
    });
    descargarTexto(csv, nombreArchivoCsv(), "text/csv;charset=utf-8");
  };

  return (
    <aside
      className={abierto ? "panel-pipeline" : "panel-pipeline panel-pipeline--cerrado"}
      aria-label="Cálculos del pipeline"
    >
      <button
        type="button"
        className="panel-pipeline__hamburguesa"
        aria-expanded={abierto}
        title={abierto ? "Ocultar cálculos" : "Mostrar cálculos"}
        onClick={alternar}
      >
        {abierto ? <X strokeWidth={2.25} /> : <Menu strokeWidth={2.25} />}
        {abierto ? <span>Cálculos</span> : null}
      </button>
      {abierto ? (
        <div className="panel-pipeline__cuerpo">
          <button
            type="button"
            className="boton-secundario"
            onClick={exportar}
            title="Exportar plan en CSV (L y mg/L)"
          >
            <Download strokeWidth={2.1} aria-hidden />
            Exportar CSV
          </button>
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
