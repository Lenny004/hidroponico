export type { AristaCultivo, ClaveMineral, ClaveVariableCultivo, NodoCultivo, VariablesCultivo } from "./nodo-cultivo";
export { CLAVES_MINERALES, CLAVES_VARIABLES_CULTIVO } from "./nodo-cultivo";

export type { DefinicionCultivo, IdCultivoCatalogo } from "./catalogo-cultivos";
export { CATALOGO_CULTIVOS, obtenerCultivoPorId } from "./catalogo-cultivos";

export { crearNodoDesdePlantilla } from "./factory-nodo";

export type { AristaDirigida } from "./grafo-dag";
export {
  aAristasDirigidas,
  aristaCreariaCiclo,
  existeCaminoDirigido,
} from "./grafo-dag";

export { idsComponenteConexa } from "./componente-conexa";

export { UnionFind, particionarEnGrupos } from "./union-find";
export {
  agregarCategoriaEnGrupo,
  agregarCategoriasPorGrupos,
  type AgregadoCategoria,
  type GrupoAgregado,
} from "./agregar-grupos";
export { conteoPorTipo, sumaVariablePorTipo } from "./conteo-por-tipo";

export { EVENTOS_GRAFO, type NombreEventoGrafo } from "./eventos-grafo";

export { ETIQUETAS_VARIABLES, GRUPOS_VARIABLES } from "./etiquetas-variables";
export {
  esBorradorNumerico,
  normalizarPlagas,
  parsearNumeroONull,
} from "./parsear-valores";
