import { useCallback, useRef, type DragEvent } from "react";
import LienzoThree from "./three/LienzoThree";
import { resolverOrificioEnPantalla } from "./three/apuntador-orificio";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import BarraAccionesCultivo from "./BarraAccionesCultivo";
import ControlesLienzo3d from "./ControlesLienzo3d";

export default function CanvasGrafo() {
  const origenEventos = useRef<HTMLDivElement>(null);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);

  const onDragOver = useCallback((evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (evento: DragEvent<HTMLDivElement>) => {
      evento.preventDefault();
      const tipo = evento.dataTransfer.getData("application/hidroponico-cultivo");
      if (!tipo) {
        return;
      }
      const hueco = resolverOrificioEnPantalla(evento.clientX, evento.clientY);
      agregarNodo(tipo, hueco ?? undefined);
    },
    [agregarNodo],
  );

  return (
    <div
      className="lienzo"
      ref={origenEventos}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onPointerDown={(evento) => {
        if (evento.target === origenEventos.current) {
          seleccionar(null);
        }
      }}
    >
      <BarraAccionesCultivo />
      <ControlesLienzo3d />
      <LienzoThree origenEventos={origenEventos} />
    </div>
  );
}
