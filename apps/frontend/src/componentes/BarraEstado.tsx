import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function BarraEstado() {
  const mensajeEstado = usarGrafoConstruccion((estado) => estado.mensajeEstado);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const aristas = usarGrafoConstruccion((estado) => estado.aristas);
  const estadoPersistencia = usarGrafoConstruccion((estado) => estado.estadoPersistencia);
  const etiquetaBd =
    estadoPersistencia === "sincronizado"
      ? "BD sincronizada"
      : estadoPersistencia === "error"
        ? "BD no disponible"
        : "solo canvas";

  return (
    <footer className="flex items-center justify-between gap-4 border-t border-borde bg-panel px-4 py-1.5 text-xs text-muted">
      <span>{mensajeEstado}</span>
      <span>
        {nodos.length} nodos · {aristas.length} aristas · grafo de construcción · {etiquetaBd}
      </span>
    </footer>
  );
}
