import { useEffect, useRef, useState } from "react";
import { serializarGrafoConstruccion } from "@hidroponico/tipos-compartidos";
import { enviarGrafoPersistido, obtenerGrafoPersistido } from "../api/grafo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

const ESPERA_MS = 500;

/**
 * Carga el grafo persistido al montar y vuelve a escribirlo cuando cambia el canvas.
 */
export function usarSincronizacionGrafo(): void {
  const [listo, setListo] = useState(false);
  const saltarVacioInicial = useRef(true);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const aristas = usarGrafoConstruccion((estado) => estado.aristas);
  const hidratarGrafo = usarGrafoConstruccion((estado) => estado.hidratarGrafo);
  const setEstadoPersistencia = usarGrafoConstruccion((estado) => estado.setEstadoPersistencia);

  useEffect(() => {
    let cancelado = false;
    void (async () => {
      try {
        const remoto = await obtenerGrafoPersistido();
        if (cancelado) {
          return;
        }
        if (remoto && remoto.nodos.length > 0 && usarGrafoConstruccion.getState().nodos.length === 0) {
          hidratarGrafo(remoto);
        }
        setEstadoPersistencia(remoto ? "sincronizado" : "local");
      } catch {
        if (!cancelado) {
          setEstadoPersistencia("error");
        }
      } finally {
        if (!cancelado) {
          setListo(true);
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [hidratarGrafo, setEstadoPersistencia]);

  const instantanea = JSON.stringify(
    serializarGrafoConstruccion(
      nodos.map((nodo) => ({
        id: nodo.id,
        position: nodo.position,
        cultivo: nodo.data.cultivo,
      })),
      aristas.map((arista) => ({
        id: arista.id,
        origenId: arista.source,
        destinoId: arista.target,
      })),
    ),
  );

  useEffect(() => {
    if (!listo) {
      return;
    }
    if (saltarVacioInicial.current) {
      saltarVacioInicial.current = false;
      if (nodos.length === 0) {
        return;
      }
    }
    const temporizador = window.setTimeout(() => {
      const grafo = JSON.parse(instantanea) as ReturnType<typeof serializarGrafoConstruccion>;
      void enviarGrafoPersistido(grafo)
        .then(() => setEstadoPersistencia("sincronizado"))
        .catch(() => setEstadoPersistencia("error"));
    }, ESPERA_MS);
    return () => window.clearTimeout(temporizador);
  }, [instantanea, listo, nodos.length, setEstadoPersistencia]);
}
