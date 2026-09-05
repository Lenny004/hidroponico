import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import {
  aristaCreariaCiclo,
  crearNodoDesdePlantilla,
  idsComponenteConexa,
  obtenerCultivoPorId,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";

export type DatosNodoCultivo = {
  cultivo: NodoCultivo;
  color: string;
};

export type NodoFlujo = Node<DatosNodoCultivo>;

type EstadoGrafoConstruccion = {
  nodos: NodoFlujo[];
  aristas: Edge[];
  idSeleccionado: string | null;
  idsGrupo: string[];
  busquedaCatalogo: string;
  filtroLienzo: string;
  mensajeEstado: string;
  onNodosChange: (cambios: NodeChange<NodoFlujo>[]) => void;
  onAristasChange: (cambios: EdgeChange<Edge>[]) => void;
  conectar: (conexion: Connection) => boolean;
  agregarNodo: (tipoCultivo: string, posicion: { x: number; y: number }) => void;
  seleccionar: (id: string | null) => void;
  setBusquedaCatalogo: (valor: string) => void;
  setFiltroLienzo: (valor: string) => void;
};

function aristasDirigidas(aristas: Edge[]) {
  return aristas.map((arista) => ({
    origenId: arista.source,
    destinoId: arista.target,
  }));
}

function grupoDesde(nodos: NodoFlujo[], aristas: Edge[], id: string | null): string[] {
  if (!id) {
    return [];
  }
  const ids = new Set(nodos.map((nodo) => nodo.id));
  return idsComponenteConexa(aristasDirigidas(aristas), id).filter((nodoId) =>
    ids.has(nodoId),
  );
}

export const usarGrafoConstruccion = create<EstadoGrafoConstruccion>((set, get) => ({
  nodos: [],
  aristas: [],
  idSeleccionado: null,
  idsGrupo: [],
  busquedaCatalogo: "",
  filtroLienzo: "",
  mensajeEstado: "Arrastra un cultivo al lienzo para empezar.",

  onNodosChange: (cambios) => {
    set((estado) => {
      const nodos = applyNodeChanges(cambios, estado.nodos);
      const seleccionado =
        nodos.find((nodo) => nodo.selected)?.id ??
        (nodos.some((nodo) => nodo.id === estado.idSeleccionado)
          ? estado.idSeleccionado
          : null);
      return {
        nodos,
        idSeleccionado: seleccionado,
        idsGrupo: grupoDesde(nodos, estado.aristas, seleccionado),
      };
    });
  },

  onAristasChange: (cambios) => {
    set((estado) => {
      const aristas = applyEdgeChanges(cambios, estado.aristas);
      return {
        aristas,
        idsGrupo: grupoDesde(estado.nodos, aristas, estado.idSeleccionado),
      };
    });
  },

  conectar: (conexion) => {
    const { source, target } = conexion;
    if (!source || !target) {
      return false;
    }

    const { aristas } = get();
    const duplicada = aristas.some(
      (arista) => arista.source === source && arista.target === target,
    );
    if (duplicada) {
      set({ mensajeEstado: "Esa conexión ya existe." });
      return false;
    }

    if (aristaCreariaCiclo(aristasDirigidas(aristas), source, target)) {
      set({
        mensajeEstado:
          "Conexión rechazada: el grafo debe ser acíclico (DAG).",
      });
      return false;
    }

    const nueva: Edge = {
      id: `arista-${source}-${target}`,
      source,
      target,
    };

    set((estado) => {
      const aristas = [...estado.aristas, nueva];
      return {
        aristas,
        idsGrupo: grupoDesde(estado.nodos, aristas, estado.idSeleccionado),
        mensajeEstado: "Conexión creada.",
      };
    });
    return true;
  },

  agregarNodo: (tipoCultivo, posicion) => {
    const id = crypto.randomUUID();
    const cultivo = crearNodoDesdePlantilla(tipoCultivo, id);
    const definicion = obtenerCultivoPorId(tipoCultivo);
    if (!cultivo || !definicion) {
      set({ mensajeEstado: "Tipo de cultivo no reconocido." });
      return;
    }

    const nodo: NodoFlujo = {
      id,
      type: "cultivo",
      position: posicion,
      data: { cultivo, color: definicion.color },
    };

    set((estado) => ({
      nodos: [...estado.nodos, nodo],
      mensajeEstado: `Nodo de ${definicion.nombre} creado.`,
    }));
  },

  seleccionar: (id) => {
    set((estado) => ({
      idSeleccionado: id,
      idsGrupo: grupoDesde(estado.nodos, estado.aristas, id),
      nodos: estado.nodos.map((nodo) => ({
        ...nodo,
        selected: nodo.id === id,
      })),
    }));
  },

  setBusquedaCatalogo: (valor) => set({ busquedaCatalogo: valor }),
  setFiltroLienzo: (valor) => set({ filtroLienzo: valor }),
}));
