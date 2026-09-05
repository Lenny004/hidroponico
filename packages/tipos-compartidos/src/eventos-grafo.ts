/**
 * Nombres de eventos del bus TREE.JS.
 * La UI y el grafo emiten estos eventos; los motores se suscriben sin acoplarse a la UI.
 */
export const EVENTOS_GRAFO = {
  NODO_CREADO: "nodo:creado",
  NODO_ACTUALIZADO: "nodo:actualizado",
  NODO_ELIMINADO: "nodo:eliminado",
  ARISTA_CREADA: "arista:creada",
  ARISTA_ELIMINADA: "arista:eliminada",
  PIPELINE_EJECUTAR: "pipeline:ejecutar",
} as const;

export type NombreEventoGrafo =
  (typeof EVENTOS_GRAFO)[keyof typeof EVENTOS_GRAFO];
