import {
  agregarMasaMineralEnGrupo,
  CLAVES_MINERALES,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Dosifica Mg, K, Mn y Fe del tanque del grupo.
 * Masa (mg) = concentración (mg/L) × litros. Un `null` invalida esa categoría; no detiene las demás.
 */
export class MotorMinerales implements MotorHidroponico {
  readonly nombre = "minerales";
  readonly categoriasQueProcesa = [...CLAVES_MINERALES];

  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const advertencias: string[] = [];
    const totales: Record<string, number | null> = {};
    const concentraciones: Record<string, number | null> = {};
    let volumenL: number | null = null;

    for (const categoria of this.categoriasQueProcesa) {
      const agregado = agregarMasaMineralEnGrupo(grupoDeNodos, categoria);
      totales[categoria] = agregado.masaMg;
      concentraciones[categoria] = agregado.concentracionMgL;
      if (agregado.volumenL != null) {
        volumenL = agregado.volumenL;
      }
      if (agregado.invalidadoPorNull) {
        advertencias.push(
          `${categoria} requiere mg/L y litros en todos los nodos del grupo [${grupoDeNodos.map((nodo) => nodo.id).join(", ")}]`,
        );
      }
    }

    return {
      nombreMotor: this.nombre,
      exitoso: true,
      advertencias,
      datos: {
        idsNodos: grupoDeNodos.map((nodo) => nodo.id),
        totales,
        volumen_L: volumenL,
        concentraciones,
      },
    };
  }
}

export const motorMinerales = new MotorMinerales();
