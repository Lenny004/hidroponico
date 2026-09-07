import { obtenerCultivoPorId } from "./catalogo-cultivos";
import { obtenerPlagaPorIdONombre, type DefinicionPlaga } from "./catalogo-plagas";
import {
  diasDeVida,
  etapaSugeridaPorDias,
  parsearEtapaVida,
  progresoCosecha,
  type EtapaVida,
  type ProcesoCultivo,
} from "./etapas-vida";
import type { NodoCultivo } from "./nodo-cultivo";

export interface ResumenTrazabilidad {
  proceso: ProcesoCultivo | null;
  dias: number | null;
  etapa: EtapaVida | null;
  etapaSugerida: EtapaVida | null;
  progreso: number | null;
}

/**
 * Une la ficha de catálogo con la vida del nodo (fecha y etapa).
 * Si `etapa_vida` es `null`, se usa la etapa sugerida por días.
 *
 * @param cultivo - Nodo del grafo de construcción.
 * @param ahora - Reloj inyectable para pruebas.
 */
export function resumenTrazabilidad(
  cultivo: Pick<NodoCultivo, "tipoCultivo" | "etapa_vida" | "iniciado_en">,
  ahora = new Date(),
): ResumenTrazabilidad {
  const proceso = obtenerCultivoPorId(cultivo.tipoCultivo)?.proceso ?? null;
  const dias = diasDeVida(cultivo.iniciado_en, ahora);
  const sugerida = etapaSugeridaPorDias(proceso, dias);
  return {
    proceso,
    dias,
    etapa: parsearEtapaVida(cultivo.etapa_vida) ?? sugerida,
    etapaSugerida: sugerida,
    progreso: progresoCosecha(proceso, dias),
  };
}

/**
 * Fichas del catálogo para las plagas registradas en el nodo.
 * Los nombres que no están en el catálogo se omiten (siguen existiendo en el nodo).
 *
 * @param plagas - Lista libre del nodo, o `null`.
 * @returns Fichas únicas en el orden de aparición.
 */
export function fichasPlagasDeNodo(
  plagas: string[] | null | undefined,
): DefinicionPlaga[] {
  if (!plagas) {
    return [];
  }
  const vistas = new Set<string>();
  const fichas: DefinicionPlaga[] = [];
  for (const nombre of plagas) {
    const ficha = obtenerPlagaPorIdONombre(nombre);
    if (!ficha || vistas.has(ficha.id)) {
      continue;
    }
    vistas.add(ficha.id);
    fichas.push(ficha);
  }
  return fichas;
}
