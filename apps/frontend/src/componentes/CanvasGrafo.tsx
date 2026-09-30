import { lazy, Suspense, useCallback, useRef, type DragEvent, type MouseEvent } from "react";
import { resolverOrificioEnPantalla } from "./three/apuntador-orificio";
import { indiceOrificioDePosicion } from "./three/orificios-nft";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import BarraAccionesCultivo from "./BarraAccionesCultivo";
import ControlesLienzo3d from "./ControlesLienzo3d";

const LienzoThree = lazy(() => import("./three/LienzoThree"));

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

  const seleccionarDesdeLienzo = useCallback(
    (evento: MouseEvent<HTMLDivElement>) => {
      const destino = evento.target;
      if (
        destino instanceof Element &&
        destino.closest(".barra-acciones-cultivo, .controles-lienzo, button, input, select, textarea")
      ) {
        return;
      }
      const orificio = resolverOrificioEnPantalla(evento.clientX, evento.clientY);
      if (orificio == null) {
        return;
      }
      const nodo = usarGrafoConstruccion
        .getState()
        .nodos.find((item) => indiceOrificioDePosicion(item.position.x) === orificio);
      seleccionar(nodo?.id ?? null);
    },
    [seleccionar],
  );

  return (
    <div
      className="lienzo"
      ref={origenEventos}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={seleccionarDesdeLienzo}
      onPointerDown={(evento) => {
        if (evento.target === origenEventos.current) {
          seleccionar(null);
        }
      }}
    >
      <BarraAccionesCultivo />
      <ControlesLienzo3d />
      <Suspense fallback={<div className="lienzo__cargando" role="status">Cargando vista 3D…</div>}>
        <LienzoThree origenEventos={origenEventos} />
      </Suspense>
    </div>
  );
}
