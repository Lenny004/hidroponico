import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  CATALOGO_DEFICIENCIAS,
  type DefinicionDeficiencia,
} from "./catalogo-deficiencias";
import {
  obtenerPlagaPorIdONombre,
  type DefinicionPlaga,
  type IdPlagaCatalogo,
} from "./catalogo-plagas";
import { resumenTrazabilidad } from "./resumen-trazabilidad";
import { plantillaParaEtapa } from "./receta-etapa";
import { CLAVES_MINERALES, type NodoCultivo } from "./nodo-cultivo";

/** Por debajo de este ratio respecto a la receta de etapa se avisa. `null` no entra. */
export const UMBRAL_DEFICIENCIA_RECETA = 0.7;

export interface PlagaDetectada {
  plaga: DefinicionPlaga;
  nodos: string[];
}

export interface PlagaTipicaSinMarcar {
  tipoCultivo: string;
  nombreCultivo: string;
  plaga: DefinicionPlaga;
}

export interface DeficienciaDetectada {
  ficha: DefinicionDeficiencia;
  nodos: string[];
}

export interface CruceSanidad {
  detectadas: PlagaDetectada[];
  tipicasSinMarcar: PlagaTipicaSinMarcar[];
  deficiencias: DeficienciaDetectada[];
}

function idsPlagaNodo(nodo: Pick<NodoCultivo, "plagas">): Set<string> {
  const ids = new Set<string>();
  for (const nombre of nodo.plagas ?? []) {
    const ficha = obtenerPlagaPorIdONombre(nombre);
    if (ficha) {
      ids.add(ficha.id);
    }
  }
  return ids;
}

/**
 * Cruza plagas del tubo con las típicas del catálogo y señala minerales
 * por debajo del 70 % de la receta de etapa. Un `null` no se trata como 0.
 */
export function cruzarSanidad(
  nodos: Array<Pick<NodoCultivo, "id" | "tipoCultivo" | "plagas" | "variables" | "etapa_vida" | "iniciado_en">>,
): CruceSanidad {
  const detectadasMap = new Map<string, PlagaDetectada>();
  const tipicas: PlagaTipicaSinMarcar[] = [];
  const vistasTipicas = new Set<string>();
  const deficienciasMap = new Map<string, DeficienciaDetectada>();

  for (const nodo of nodos) {
    const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
    const marcadas = idsPlagaNodo(nodo);

    for (const nombre of nodo.plagas ?? []) {
      const plaga = obtenerPlagaPorIdONombre(nombre);
      if (!plaga) {
        continue;
      }
      const previa = detectadasMap.get(plaga.id);
      if (previa) {
        previa.nodos.push(nodo.id);
      } else {
        detectadasMap.set(plaga.id, { plaga, nodos: [nodo.id] });
      }
    }

    if (definicion) {
      for (const idPlaga of definicion.plagas_tipicas as readonly IdPlagaCatalogo[]) {
        if (marcadas.has(idPlaga)) {
          continue;
        }
        const clave = `${definicion.id}:${idPlaga}`;
        if (vistasTipicas.has(clave)) {
          continue;
        }
        vistasTipicas.add(clave);
        const plaga = obtenerPlagaPorIdONombre(idPlaga);
        if (plaga) {
          tipicas.push({
            tipoCultivo: definicion.id,
            nombreCultivo: definicion.nombre,
            plaga,
          });
        }
      }
    }

    const etapa = resumenTrazabilidad(nodo).etapa;
    const receta = plantillaParaEtapa(nodo.tipoCultivo, etapa);
    if (!receta) {
      continue;
    }
    for (const clave of CLAVES_MINERALES) {
      const valor = nodo.variables[clave];
      const objetivo = receta[clave];
      if (valor == null || objetivo == null || objetivo <= 0) {
        continue;
      }
      if (valor >= objetivo * UMBRAL_DEFICIENCIA_RECETA) {
        continue;
      }
      const ficha = CATALOGO_DEFICIENCIAS.find((item) => item.id === clave);
      if (!ficha) {
        continue;
      }
      const previa = deficienciasMap.get(clave);
      if (previa) {
        previa.nodos.push(nodo.id);
      } else {
        deficienciasMap.set(clave, { ficha, nodos: [nodo.id] });
      }
    }
  }

  return {
    detectadas: [...detectadasMap.values()],
    tipicasSinMarcar: tipicas,
    deficiencias: [...deficienciasMap.values()],
  };
}
