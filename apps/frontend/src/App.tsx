import BarraEstado from "./componentes/BarraEstado";
import BarraSuperior from "./componentes/BarraSuperior";
import CanvasGrafo from "./componentes/CanvasGrafo";
import OnboardingCultivo from "./componentes/OnboardingCultivo";
import PanelCasosUso from "./componentes/PanelCasosUso";
import PanelConsolidado from "./componentes/PanelConsolidado";
import PanelCultivo from "./componentes/PanelCultivo";
import PanelPipeline from "./componentes/PanelPipeline";
import PanelTrazabilidad from "./componentes/PanelTrazabilidad";
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
        <div className="app__principal">
          <OnboardingCultivo />
          <div className="app__escenario">
            <CanvasGrafo />
            <PanelTrazabilidad />
          </div>
          <div className="app__inferior">
            <PanelCasosUso />
            <PanelConsolidado />
          </div>
        </div>
        <PanelPipeline />
      </div>
      <BarraEstado />
    </div>
  );
}
