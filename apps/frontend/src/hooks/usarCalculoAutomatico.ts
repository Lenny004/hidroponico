import { useEffect } from "react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

const ESPERA_MS = 450;

/**
 * Recalcula el pipeline al cambiar nodos, variables o aristas.
 * No usa la posición del canvas: eso no entra en los motores.
 */
export function usarCalculoAutomatico(): void {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const aristas = usarGrafoConstruccion((estado) => estado.aristas);
  const ejecutarPipeline = usarGrafoConstruccion((estado) => estado.ejecutarPipeline);

  const instantanea = JSON.stringify({
    nodos: nodos.map((nodo) => nodo.data.cultivo),
    aristas: aristas.map((arista) => ({
      origenId: arista.source,
      destinoId: arista.target,
    })),
  });

  useEffect(() => {
    if (nodos.length === 0) {
      return;
    }
    const temporizador = window.setTimeout(() => {
      void ejecutarPipeline(undefined, { silencioso: true });
    }, ESPERA_MS);
    return () => window.clearTimeout(temporizador);
  }, [ejecutarPipeline, instantanea, nodos.length]);
}
