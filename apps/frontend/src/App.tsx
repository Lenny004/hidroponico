import { ReactFlowProvider } from "@xyflow/react";
import BarraEstado from "./componentes/BarraEstado";
import BarraSuperior from "./componentes/BarraSuperior";
import CanvasGrafo from "./componentes/CanvasGrafo";
import PanelCultivo from "./componentes/PanelCultivo";
import PanelSeleccion from "./componentes/PanelSeleccion";

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <BarraSuperior />
        <div className="flex min-h-0 flex-1">
          <PanelCultivo />
          <CanvasGrafo />
          <PanelSeleccion />
        </div>
        <BarraEstado />
      </div>
    </ReactFlowProvider>
  );
}
