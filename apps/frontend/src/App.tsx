import { ReactFlowProvider } from "@xyflow/react";
import BarraEstado from "./componentes/BarraEstado";
import BarraSuperior from "./componentes/BarraSuperior";
import CanvasGrafo from "./componentes/CanvasGrafo";
import PanelCultivo from "./componentes/PanelCultivo";
import PanelResultados from "./componentes/PanelResultados";
import PanelSeleccion from "./componentes/PanelSeleccion";
import { usarCalculoAutomatico } from "./hooks/usarCalculoAutomatico";
import { usarSincronizacionGrafo } from "./hooks/usarSincronizacionGrafo";

export default function App() {
  usarSincronizacionGrafo();
  usarCalculoAutomatico();
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <BarraSuperior />
        <div className="flex min-h-0 flex-1">
          <PanelCultivo />
          <CanvasGrafo />
          <PanelSeleccion />
        </div>
        <PanelResultados />
        <BarraEstado />
      </div>
    </ReactFlowProvider>
  );
}
