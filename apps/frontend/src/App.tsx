import { lazy, Suspense } from "react";
import BarraEstado from "./componentes/BarraEstado";
import BarraSuperior from "./componentes/BarraSuperior";
import CanvasGrafo from "./componentes/CanvasGrafo";
import ErrorBoundary from "./componentes/ErrorBoundary";
import { usarCalculoAutomatico } from "./hooks/usarCalculoAutomatico";
import { usarSincronizacionGrafo } from "./hooks/usarSincronizacionGrafo";

const OnboardingCultivo = lazy(() => import("./componentes/OnboardingCultivo"));
const PanelCasosUso = lazy(() => import("./componentes/PanelCasosUso"));
const PanelConsolidado = lazy(() => import("./componentes/PanelConsolidado"));
const PanelCultivo = lazy(() => import("./componentes/PanelCultivo"));
const PanelPipeline = lazy(() => import("./componentes/PanelPipeline"));
const PanelTrazabilidad = lazy(() => import("./componentes/PanelTrazabilidad"));

function PanelCarga({ variante }: { variante: "catalogo" | "trazabilidad" | "pipeline" | "bloque" }) {
  return <div className={`panel-carga panel-carga--${variante}`} aria-hidden />;
}

export default function App() {
  usarSincronizacionGrafo();
  usarCalculoAutomatico();
  return (
    <div className="flex h-full flex-col bg-lienzo text-texto">
      <BarraSuperior />
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <ErrorBoundary fallback={<PanelCarga variante="catalogo" />}>
          <Suspense fallback={<PanelCarga variante="catalogo" />}><PanelCultivo /></Suspense>
        </ErrorBoundary>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}><OnboardingCultivo /></Suspense>
          </ErrorBoundary>
          <div className="flex min-h-0 flex-[1.35] gap-3">
            <CanvasGrafo />
            <ErrorBoundary fallback={<PanelCarga variante="trazabilidad" />}>
              <Suspense fallback={<PanelCarga variante="trazabilidad" />}><PanelTrazabilidad /></Suspense>
            </ErrorBoundary>
          </div>
          <div className="flex min-h-50 max-h-[42%] flex-[0.85] gap-3 max-[1100px]:min-h-44">
            <ErrorBoundary fallback={<PanelCarga variante="bloque" />}>
              <Suspense fallback={<PanelCarga variante="bloque" />}><PanelCasosUso /></Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<PanelCarga variante="bloque" />}>
              <Suspense fallback={<PanelCarga variante="bloque" />}><PanelConsolidado /></Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <ErrorBoundary fallback={<PanelCarga variante="pipeline" />}>
          <Suspense fallback={<PanelCarga variante="pipeline" />}><PanelPipeline /></Suspense>
        </ErrorBoundary>
      </div>
      <BarraEstado />
    </div>
  );
}
