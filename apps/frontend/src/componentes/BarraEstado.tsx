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
    <footer className="barra-estado">
      <p className="barra-estado__mensaje">{mensajeEstado}</p>
      <p className="barra-estado__meta">
        {nodos.length} cultivos · {aristas.length} conexiones · {etiquetaBd}
      </p>
    </footer>
  );
}
