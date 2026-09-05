import type { ResultadoPipelineApi } from "../api/pipeline";

export type ResumenGrupoNodo = {
  totales: Record<string, number | null>;
  plagas: string[] | null | undefined;
  solucion_plagas: string[] | null | undefined;
};

/**
 * Totales del grupo conectado al que pertenece el nodo, según el último pipeline.
 */
export function resumenGrupoDeNodo(
  resultado: ResultadoPipelineApi | null,
  idNodo: string,
): ResumenGrupoNodo | null {
  if (!resultado) {
    return null;
  }
  const totales: Record<string, number | null> = {};
  let plagas: string[] | null | undefined;
  let solucion_plagas: string[] | null | undefined;
  let encontrado = false;

  for (const motor of resultado.motores) {
    for (const grupo of motor.grupos) {
      if (!grupo.datos.idsNodos?.includes(idNodo)) {
        continue;
      }
      encontrado = true;
      Object.assign(totales, grupo.datos.totales ?? {});
      if ("plagas" in grupo.datos) {
        plagas = grupo.datos.plagas;
      }
      if ("solucion_plagas" in grupo.datos) {
        solucion_plagas = grupo.datos.solucion_plagas;
      }
    }
  }

  return encontrado ? { totales, plagas, solucion_plagas } : null;
}

export function textoTotalGrupo(total: number | null | undefined): string {
  if (total === undefined) {
    return "";
  }
  return total == null ? "grupo: null" : `grupo: ${total} ml`;
}
