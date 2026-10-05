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
    <div className="flex h-full flex-col bg-lienzo text-texto">
      <BarraSuperior />
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <PanelCultivo />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <OnboardingCultivo />
          <div className="flex min-h-0 flex-[1.35] gap-3">
            <CanvasGrafo />
            <PanelTrazabilidad />
          </div>
          <div className="flex min-h-50 max-h-[42%] flex-[0.85] gap-3 max-[1100px]:min-h-44">
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
