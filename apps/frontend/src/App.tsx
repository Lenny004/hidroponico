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
    <div className="app">
      <BarraSuperior />
      <div className="app__cuerpo">
        <PanelCultivo />
        <CanvasGrafo />
        <PanelSeleccion />
      </div>
      <PanelResultados />
      <BarraEstado />
    </div>
  );
}
