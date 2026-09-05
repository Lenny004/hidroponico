import { normalizarPlagas } from "./parsear-valores";
import { grafoTieneCiclo, type AristaDirigida } from "./grafo-dag";
import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  CLAVES_VARIABLES_CULTIVO,
  type NodoCultivo,
  type VariablesCultivo,
} from "./nodo-cultivo";

export interface NodoPersistido {
  id: string;
  tipoCultivo: string;
  variables: VariablesCultivo;
  plagas: string[] | null;
  solucion_plagas: string | null;
  comentarios: string | null;
  posicionX: number;
  posicionY: number;
}

export interface AristaPersistida {
  id: string;
  origenId: string;
  destinoId: string;
  categoria: string | null;
}

export interface GrafoPersistido {
  nodos: NodoPersistido[];
  aristas: AristaPersistida[];
}

export interface NodoConstruccionSerial {
  id: string;
  position: { x: number; y: number };
  cultivo: NodoCultivo;
}

function variablesPersistibles(variables: VariablesCultivo | undefined): VariablesCultivo {
  const limpias: VariablesCultivo = {};
  for (const clave of CLAVES_VARIABLES_CULTIVO) {
    const valor = variables?.[clave];
    limpias[clave] = typeof valor === "number" && Number.isFinite(valor) ? valor : null;
  }
  return limpias;
}

function textoONull(valor: string | null | undefined): string | null {
  const recortado = valor?.trim() ?? "";
  return recortado.length === 0 ? null : recortado;
}

/**
 * Pasa el grafo de construcción (cliente) al contrato del grafo persistido.
 * El color e ícono no se guardan: se reconstruyen del catálogo al hidratar.
 *
 * @param nodos - Nodos del canvas con posición y ficha de cultivo.
 * @param aristas - Aristas dirigidas del lienzo.
 */
export function serializarGrafoConstruccion(
  nodos: NodoConstruccionSerial[],
  aristas: Array<{ id: string; origenId: string; destinoId: string }>,
): GrafoPersistido {
  return {
    nodos: nodos.map((nodo) => ({
      id: nodo.id,
      tipoCultivo: nodo.cultivo.tipoCultivo,
      variables: variablesPersistibles(nodo.cultivo.variables),
      plagas: normalizarPlagas(nodo.cultivo.plagas),
      solucion_plagas: textoONull(nodo.cultivo.solucion_plagas),
      comentarios: textoONull(nodo.cultivo.comentarios),
      posicionX: nodo.position.x,
      posicionY: nodo.position.y,
    })),
    aristas: aristas.map((arista) => ({
      id: arista.id,
      origenId: arista.origenId,
      destinoId: arista.destinoId,
      categoria: null,
    })),
  };
}

export interface ErrorValidacionGrafo {
  ok: false;
  motivo: string;
}

export interface GrafoValidado {
  ok: true;
  grafo: GrafoPersistido;
}

/**
 * Valida un cuerpo recibido por la API antes de escribir en la base.
 * Rechaza ciclos, aristas huérfanas y tipos fuera del catálogo.
 *
 * @param crudo - Payload PUT /grafo.
 */
export function validarGrafoPersistido(crudo: unknown): GrafoValidado | ErrorValidacionGrafo {
  if (!crudo || typeof crudo !== "object") {
    return { ok: false, motivo: "El cuerpo debe ser un objeto." };
  }
  const cuerpo = crudo as { nodos?: unknown; aristas?: unknown };
  if (!Array.isArray(cuerpo.nodos) || !Array.isArray(cuerpo.aristas)) {
    return { ok: false, motivo: "nodos y aristas deben ser listas." };
  }

  const nodos: NodoPersistido[] = [];
  const ids = new Set<string>();
  for (const item of cuerpo.nodos) {
    if (!item || typeof item !== "object") {
      return { ok: false, motivo: "Cada nodo debe ser un objeto." };
    }
    const nodo = item as Partial<NodoPersistido>;
    if (typeof nodo.id !== "string" || nodo.id.length === 0) {
      return { ok: false, motivo: "Cada nodo necesita un id." };
    }
    if (!obtenerCultivoPorId(String(nodo.tipoCultivo ?? ""))) {
      return { ok: false, motivo: `Tipo de cultivo no reconocido: ${String(nodo.tipoCultivo)}` };
    }
    if (ids.has(nodo.id)) {
      return { ok: false, motivo: `Nodo duplicado: ${nodo.id}` };
    }
    ids.add(nodo.id);
    nodos.push({
      id: nodo.id,
      tipoCultivo: String(nodo.tipoCultivo),
      variables: variablesPersistibles(nodo.variables),
      plagas: normalizarPlagas(nodo.plagas as string[] | null | undefined),
      solucion_plagas: textoONull(nodo.solucion_plagas),
      comentarios: textoONull(nodo.comentarios),
      posicionX: Number.isFinite(nodo.posicionX) ? Number(nodo.posicionX) : 0,
      posicionY: Number.isFinite(nodo.posicionY) ? Number(nodo.posicionY) : 0,
    });
  }

  const aristas: AristaPersistida[] = [];
  const pares = new Set<string>();
  for (const item of cuerpo.aristas) {
    if (!item || typeof item !== "object") {
      return { ok: false, motivo: "Cada arista debe ser un objeto." };
    }
    const arista = item as Partial<AristaPersistida>;
    if (typeof arista.id !== "string" || arista.id.length === 0) {
      return { ok: false, motivo: "Cada arista necesita un id." };
    }
    if (typeof arista.origenId !== "string" || typeof arista.destinoId !== "string") {
      return { ok: false, motivo: "Cada arista necesita origenId y destinoId." };
    }
    if (!ids.has(arista.origenId) || !ids.has(arista.destinoId)) {
      return { ok: false, motivo: "Hay una arista hacia un nodo que no existe." };
    }
    const par = `${arista.origenId}->${arista.destinoId}`;
    if (pares.has(par)) {
      return { ok: false, motivo: "Hay aristas duplicadas." };
    }
    pares.add(par);
    aristas.push({
      id: arista.id,
      origenId: arista.origenId,
      destinoId: arista.destinoId,
      categoria: textoONull(arista.categoria),
    });
  }

  const dirigidas: AristaDirigida[] = aristas.map((arista) => ({
    origenId: arista.origenId,
    destinoId: arista.destinoId,
  }));
  if (grafoTieneCiclo(dirigidas)) {
    return { ok: false, motivo: "El grafo persistido debe ser un DAG." };
  }

  return { ok: true, grafo: { nodos, aristas } };
}
