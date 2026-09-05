import { useCallback, type DragEvent } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import { aristaCreariaCiclo } from "@hidroponico/tipos-compartidos";
import NodoCultivoNodo from "./NodoCultivoNodo";
import { usarGrafoConstruccion, type NodoFlujo } from "../store/usarGrafoConstruccion";

const tiposNodo = { cultivo: NodoCultivoNodo };

export default function CanvasGrafo() {
  const { screenToFlowPosition } = useReactFlow();
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const aristas = usarGrafoConstruccion((estado) => estado.aristas);
  const idsGrupo = usarGrafoConstruccion((estado) => estado.idsGrupo);
  const onNodosChange = usarGrafoConstruccion((estado) => estado.onNodosChange);
  const onAristasChange = usarGrafoConstruccion((estado) => estado.onAristasChange);
  const conectar = usarGrafoConstruccion((estado) => estado.conectar);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);

  const onConnect = useCallback(
    (conexion: Connection) => {
      conectar(conexion);
    },
    [conectar],
  );

  const conexionValida = useCallback(
    (conexion: Connection | { source: string | null; target: string | null }) => {
      const origen = conexion.source;
      const destino = conexion.target;
      if (!origen || !destino) {
        return false;
      }
      const actuales = usarGrafoConstruccion.getState().aristas;
      if (actuales.some((arista) => arista.source === origen && arista.target === destino)) {
        return false;
      }
      return !aristaCreariaCiclo(
        actuales.map((arista) => ({ origenId: arista.source, destinoId: arista.target })),
        origen,
        destino,
      );
    },
    [],
  );

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
      const posicion = screenToFlowPosition({
        x: evento.clientX,
        y: evento.clientY,
      });
      agregarNodo(tipo, posicion);
    },
    [agregarNodo, screenToFlowPosition],
  );

  const aristasConEstilo = aristas.map((arista) => {
    const enGrupo =
      idsGrupo.includes(arista.source) && idsGrupo.includes(arista.target);
    return {
      ...arista,
      style: {
        stroke: enGrupo ? "#fcd34d" : "#64748b",
        strokeWidth: enGrupo ? 2.5 : 1.5,
      },
    };
  });

  return (
    <div className="h-full min-w-0 flex-1 bg-lienzo" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow<NodoFlujo>
        className="h-full w-full"
        nodes={nodos}
        edges={aristasConEstilo}
        onNodesChange={onNodosChange}
        onEdgesChange={onAristasChange}
        onConnect={onConnect}
        isValidConnection={conexionValida}
        nodeTypes={tiposNodo}
        onPaneClick={() => seleccionar(null)}
        onNodeClick={(_, nodo) => seleccionar(nodo.id)}
        colorMode="dark"
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#243049" />
        <Controls />
        <MiniMap<NodoFlujo>
          nodeColor={(nodo) => nodo.data.color}
          maskColor="rgba(11,18,32,0.75)"
        />
      </ReactFlow>
    </div>
  );
}
