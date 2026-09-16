export type { AristaCultivo, ClaveMineral, ClaveVariableCultivo, NodoCultivo, VariablesCultivo } from "./nodo-cultivo";
export { CLAVES_MINERALES, CLAVES_VARIABLES_CULTIVO } from "./nodo-cultivo";

export type {
  DefinicionCultivo,
  IdCultivoCatalogo,
  VariablesPlantilla,
} from "./catalogo-cultivos";
export {
  CATALOGO_CULTIVOS,
  copiarVariablesDePlantilla,
  obtenerCultivoPorId,
  reposicionDiaDe,
} from "./catalogo-cultivos";

export { crearNodoDesdePlantilla } from "./factory-nodo";

export type { AristaDirigida } from "./grafo-dag";
export {
  aAristasDirigidas,
  aristaCreariaCiclo,
  existeCaminoDirigido,
  grafoTieneCiclo,
} from "./grafo-dag";

export { idsComponenteConexa } from "./componente-conexa";

export { UnionFind, particionarEnGrupos } from "./union-find";
export {
  agregarCategoriaEnGrupo,
  agregarCategoriasPorGrupos,
  agregarMasaMineralEnGrupo,
  agregarOxigenoDisueltoEnGrupo,
  type AgregadoCategoria,
  type AgregadoMasaMineral,
  type GrupoAgregado,
} from "./agregar-grupos";
export { agregarPlagasEnGrupo, type AgregadoPlagas } from "./agregar-plagas";
export { conteoPorTipo, sumaVariablePorTipo } from "./conteo-por-tipo";

export { EVENTOS_GRAFO, type NombreEventoGrafo } from "./eventos-grafo";

export {
  serializarGrafoConstruccion,
  validarGrafoPersistido,
  type AristaPersistida,
  type GrafoPersistido,
  type NodoConstruccionSerial,
  type NodoPersistido,
} from "./grafo-persistido";

export type { FamiliaCultivo, EtapaVida, EtapaProceso, ProcesoCultivo } from "./etapas-vida";
export {
  ETAPAS_VIDA,
  ETIQUETAS_ETAPA_VIDA,
  ETIQUETAS_FAMILIA,
  construirProceso,
  diasDeVida,
  etapaSugeridaPorDias,
  fechaInicioHoy,
  parsearEtapaVida,
  parsearFechaInicio,
  progresoCosecha,
} from "./etapas-vida";

export type { DefinicionPlaga, IdPlagaCatalogo } from "./catalogo-plagas";
export {
  CATALOGO_PLAGAS,
  obtenerPlagaPorIdONombre,
} from "./catalogo-plagas";

export {
  fichasPlagasDeNodo,
  resumenTrazabilidad,
  type ResumenTrazabilidad,
} from "./resumen-trazabilidad";

export {
  HORIZONTES_PROYECCION,
  fichaPlantado,
  fichasPlantados,
  formatearParInsumos,
  formatearReposicion,
  masaMineralEnVolumen,
  masaMineralesNodo,
  masaReposicionNodo,
  proyectarInsumos,
  type FichaPlantado,
  type IdHorizonteProyeccion,
  type ProyeccionInsumos,
} from "./proyeccion-insumos";

export {
  SIMBOLOS_MINERAL,
  fichaHoverDesdeCatalogo,
  fichaHoverDesdeNodo,
  type DatoHoverMineral,
  type FichaHoverCultivo,
} from "./ficha-hover-cultivo";

export {
  ArbolPatricia,
  arbolPatriciaDeNodos,
  bitEnClave,
  clavePatricia,
  construirArbolPatricia,
  primerBitDistinto,
  vistaArbolPatricia,
  comprimirVistaPorTipo,
  hojasDeVista,
  type EntradaPatricia,
  type HojaCultivoPatricia,
  type NodoPatricia,
  type VistaPatricia,
} from "./arbol-patricia";

export {
  DIAS_RECAMBIO_DIARIO,
  consumoTemporalGrupo,
  consumoTemporalNodo,
  diasRestantesCosecha,
  masaMineralRecambio,
  type ConsumoEtapaNodo,
  type ConsumoMineralNodo,
  type ConsumoTemporalGrupo,
  type ConsumoTemporalNodo,
} from "./consumo-temporal";

export {
  CLAVES_NUTRIENTE,
  ETIQUETAS_NUTRIENTE,
  GRUPOS_NUTRIENTE,
  REFERENCIA_DIARIA_HUMANA,
  SIMBOLOS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
  porcentajeValorDiario,
  type ClaveNutriente,
} from "./referencia-diaria-humana";

export {
  FICHAS_NUTRICIONALES,
  aporteDiaPlanta,
  cantidadNutrienteEnGramos,
  fichaNutricionalDeCatalogo,
  obtenerFichaNutricional,
  type FichaNutricionalCultivo,
  type NutrientesPor100g,
} from "./ficha-nutricional";

export {
  consolidarAporteDiarioHumano,
  mediaAritmetica,
  mediaPonderada,
  porcentajesPorcionCatalogo,
  type AportePlantaDiario,
  type ConsolidadoDiarioHumano,
  type MetricaConsolidado,
} from "./consolidado-diario";

export {
  AGROSERVICIO_EL_SALVADOR,
  CASOS_USO,
  CATALOGO_CASOS_USO,
  obtenerCasoUso,
  parsearCasoUso,
  type DefinicionCasoUso,
  type IdCasoUso,
} from "./casos-uso";

export { ETIQUETAS_VARIABLES, GRUPOS_VARIABLES, UNIDAD_AGREGADO, UNIDAD_NODO, formatearMedida } from "./etiquetas-variables";
export {
  esBorradorNumerico,
  normalizarPlagas,
  parsearNumeroONull,
} from "./parsear-valores";
