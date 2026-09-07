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
  copiarVariablesDePlantilla,
  crearNodoDesdePlantilla,
  idsComponenteConexa,
  normalizarPlagas,
  obtenerCultivoPorId,
  parsearEtapaVida,
  parsearFechaInicio,
  type ClaveVariableCultivo,
  type GrafoPersistido,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import { solicitarPipeline, type ResultadoPipelineApi } from "../api/pipeline";
import {
  CANTIDAD_ORIFICIOS,
  indiceOrificioDePosicion,
  primerOrificioLibre,
} from "../componentes/three/orificios-nft";

export type DatosNodoCultivo = {
  cultivo: NodoCultivo;
  color: string;
};

export type NodoFlujo = Node<DatosNodoCultivo>;

export type EstadoPersistencia = "local" | "sincronizado" | "error";

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
  agregarNodo: (tipoCultivo: string, orificio?: number) => void;
  quitarNodo: (id: string) => void;
  seleccionar: (id: string | null) => void;
  actualizarTipoCultivo: (id: string, tipoCultivo: string) => void;
  actualizarVariable: (id: string, clave: ClaveVariableCultivo, valor: number | null) => void;
  actualizarTextoNodo: (
    id: string,
    campo: "comentarios" | "solucion_plagas",
    valor: string | null,
  ) => void;
  actualizarPlagas: (id: string, plagas: string[] | null) => void;
  actualizarTrazabilidad: (
    id: string,
    campo: "etapa_vida" | "iniciado_en",
    valor: string | null,
  ) => void;
  resultadoPipeline: ResultadoPipelineApi | null;
  ejecutandoPipeline: boolean;
  estadoPersistencia: EstadoPersistencia;
  ejecutarPipeline: (nombreMotor?: string, opciones?: { silencioso?: boolean }) => Promise<void>;
  hidratarGrafo: (grafo: GrafoPersistido) => void;
  setEstadoPersistencia: (estado: EstadoPersistencia) => void;
  setBusquedaCatalogo: (valor: string) => void;
  setFiltroLienzo: (valor: string) => void;
};

function aristasDirigidas(aristas: Edge[]) {
  return aristas.map((arista) => ({
    origenId: arista.source,
    destinoId: arista.target,
  }));
}

function orificiosOcupados(nodos: NodoFlujo[]): Set<number> {
  const ocupados = new Set<number>();
  for (const nodo of nodos) {
    const indice = indiceOrificioDePosicion(nodo.position.x);
    if (indice != null) {
      ocupados.add(indice);
    }
  }
  return ocupados;
}

function aristasEnCadena(nodos: NodoFlujo[]): Edge[] {
  const ordenados = [...nodos].sort((a, b) => a.position.x - b.position.x);
  const aristas: Edge[] = [];
  for (let i = 0; i < ordenados.length - 1; i += 1) {
    const origen = ordenados[i];
    const destino = ordenados[i + 1];
    aristas.push({
      id: `arista-${origen.id}-${destino.id}`,
      source: origen.id,
      target: destino.id,
    });
  }
  return aristas;
}

function asignarOrificios(nodos: NodoFlujo[]): NodoFlujo[] {
  const usados = new Set<number>();
  return nodos.map((nodo, orden) => {
    const actual = indiceOrificioDePosicion(nodo.position.x);
    let indice = actual != null && !usados.has(actual) ? actual : primerOrificioLibre(usados);
    if (indice == null) {
      indice = orden % CANTIDAD_ORIFICIOS;
    }
    usados.add(indice);
    return { ...nodo, position: { x: indice, y: 0 } };
  });
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
  mensajeEstado: "Arrastra un cultivo a un orificio del tubo NFT.",
  resultadoPipeline: null,
  ejecutandoPipeline: false,
  estadoPersistencia: "local",

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

  agregarNodo: (tipoCultivo, orificio) => {
    const id = crypto.randomUUID();
    const cultivo = crearNodoDesdePlantilla(tipoCultivo, id);
    const definicion = obtenerCultivoPorId(tipoCultivo);
    if (!cultivo || !definicion) {
      set({ mensajeEstado: "Tipo de cultivo no reconocido." });
      return;
    }

    const ocupados = orificiosOcupados(get().nodos);
    const hueco = orificio ?? primerOrificioLibre(ocupados);
    if (hueco == null) {
      set({ mensajeEstado: `El tubo NFT está lleno (${CANTIDAD_ORIFICIOS} orificios).` });
      return;
    }
    if (ocupados.has(hueco)) {
      set({ mensajeEstado: "Ese orificio ya tiene un cultivo." });
      return;
    }

    const nodo: NodoFlujo = {
      id,
      type: "cultivo",
      position: { x: hueco, y: 0 },
      data: { cultivo, color: definicion.color },
    };

    set((estado) => {
      const nodos = [...estado.nodos, nodo];
      const aristas = aristasEnCadena(nodos);
      return {
        nodos,
        aristas,
        mensajeEstado: `${definicion.nombre} colocado en el orificio ${hueco + 1}.`,
      };
    });
  },

  quitarNodo: (id) => {
    set((estado) => {
      const nodos = estado.nodos.filter((nodo) => nodo.id !== id);
      const aristas = aristasEnCadena(nodos);
      const seleccionado = estado.idSeleccionado === id ? null : estado.idSeleccionado;
      return {
        nodos,
        aristas,
        idSeleccionado: seleccionado,
        idsGrupo: grupoDesde(nodos, aristas, seleccionado),
        mensajeEstado: "Cultivo retirado del orificio.",
      };
    });
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

  actualizarTipoCultivo: (id, tipoCultivo) => {
    const definicion = obtenerCultivoPorId(tipoCultivo);
    const variables = copiarVariablesDePlantilla(tipoCultivo);
    if (!definicion || !variables) {
      set({ mensajeEstado: "Tipo de cultivo no reconocido." });
      return;
    }
    set((estado) => ({
      nodos: estado.nodos.map((nodo) =>
        nodo.id === id
          ? {
              ...nodo,
              data: {
                color: definicion.color,
                cultivo: {
                  ...nodo.data.cultivo,
                  tipoCultivo: definicion.id,
                  variables,
                },
              },
            }
          : nodo,
      ),
      mensajeEstado: `Tipo cambiado a ${definicion.nombre}. Se aplicó su receta (mg/L y litros).`,
    }));
  },

  actualizarVariable: (id, clave, valor) => {
    set((estado) => ({
      nodos: estado.nodos.map((nodo) =>
        nodo.id === id
          ? {
              ...nodo,
              data: {
                ...nodo.data,
                cultivo: {
                  ...nodo.data.cultivo,
                  variables: { ...nodo.data.cultivo.variables, [clave]: valor },
                },
              },
            }
          : nodo,
      ),
    }));
  },

  actualizarTextoNodo: (id, campo, valor) => {
    const limpio = valor?.trim() ? valor : null;
    set((estado) => ({
      nodos: estado.nodos.map((nodo) =>
        nodo.id === id
          ? {
              ...nodo,
              data: {
                ...nodo.data,
                cultivo: { ...nodo.data.cultivo, [campo]: limpio },
              },
            }
          : nodo,
      ),
    }));
  },

  actualizarPlagas: (id, plagas) => {
    const normalizadas = normalizarPlagas(plagas);
    set((estado) => ({
      nodos: estado.nodos.map((nodo) =>
        nodo.id === id
          ? {
              ...nodo,
              data: {
                ...nodo.data,
                cultivo: { ...nodo.data.cultivo, plagas: normalizadas },
              },
            }
          : nodo,
      ),
      mensajeEstado:
        normalizadas === null
          ? "Sin plagas registradas."
          : `${normalizadas.length} plaga(s) en el nodo.`,
    }));
  },

  actualizarTrazabilidad: (id, campo, valor) => {
    const limpio =
      campo === "etapa_vida" ? parsearEtapaVida(valor) : parsearFechaInicio(valor);
    set((estado) => ({
      nodos: estado.nodos.map((nodo) =>
        nodo.id === id
          ? {
              ...nodo,
              data: {
                ...nodo.data,
                cultivo: { ...nodo.data.cultivo, [campo]: limpio },
              },
            }
          : nodo,
      ),
      mensajeEstado:
        campo === "etapa_vida"
          ? limpio
            ? `Etapa de vida: ${limpio}.`
            : "Etapa de vida: automática según días."
          : limpio
            ? `Inicio de vida: ${limpio}.`
            : "Sin fecha de inicio.",
    }));
  },

  ejecutarPipeline: async (nombreMotor, opciones) => {
    const { nodos, aristas } = get();
    if (nodos.length === 0) {
      set({ resultadoPipeline: null });
      return;
    }
    const silencioso = opciones?.silencioso === true;
    set({
      ejecutandoPipeline: true,
      ...(silencioso
        ? {}
        : {
            mensajeEstado: nombreMotor
              ? `Ejecutando motor ${nombreMotor}…`
              : "Ejecutando pipeline (motores en paralelo)…",
          }),
    });
    try {
      const resultado = await solicitarPipeline(
        nodos.map((nodo) => nodo.data.cultivo),
        aristas.map((arista) => ({
          origenId: arista.source,
          destinoId: arista.target,
        })),
        nombreMotor,
      );
      const extras = resultado.advertencias.length
        ? ` · ${resultado.advertencias.length} advertencia(s), el cálculo siguió`
        : "";
      set({
        resultadoPipeline: resultado,
        ejecutandoPipeline: false,
        ...(silencioso ? {} : { mensajeEstado: `Pipeline listo${extras}.` }),
      });
    } catch {
      set({
        ejecutandoPipeline: false,
        ...(silencioso
          ? {}
          : { mensajeEstado: "No se pudo contactar TREE.JS. ¿Está corriendo el backend?" }),
      });
    }
  },

  setBusquedaCatalogo: (valor) => set({ busquedaCatalogo: valor }),
  setFiltroLienzo: (valor) => set({ filtroLienzo: valor }),

  setEstadoPersistencia: (estadoPersistencia) => set({ estadoPersistencia }),

  hidratarGrafo: (grafo) => {
    const sinAsignar: NodoFlujo[] = [];
    for (const nodo of grafo.nodos) {
      const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
      if (!definicion) {
        continue;
      }
      sinAsignar.push({
        id: nodo.id,
        type: "cultivo",
        position: { x: nodo.posicionX, y: nodo.posicionY },
        data: {
          color: definicion.color,
          cultivo: {
            id: nodo.id,
            tipoCultivo: definicion.id,
            variables: nodo.variables,
            plagas: nodo.plagas,
            solucion_plagas: nodo.solucion_plagas,
            comentarios: nodo.comentarios,
            etapa_vida: nodo.etapa_vida,
            iniciado_en: nodo.iniciado_en,
          },
        },
      });
    }
    const nodos = asignarOrificios(sinAsignar).slice(0, CANTIDAD_ORIFICIOS);
    const aristas = aristasEnCadena(nodos);
    set({
      nodos,
      aristas,
      idSeleccionado: null,
      idsGrupo: [],
      mensajeEstado: `Grafo persistido cargado (${nodos.length} cultivos en el tubo).`,
    });
  },
}));
