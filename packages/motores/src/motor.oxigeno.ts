import {
  agregarOxigenoDisueltoEnGrupo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Oxígeno disuelto del tanque (mg/L). No se suman concentraciones.
 * Si los nodos discrepan, el grupo usa el mínimo. Un `null` invalida el grupo.
 */
export class MotorOxigeno implements MotorHidroponico {
  readonly nombre = "oxigeno";
  readonly categoriasQueProcesa = ["oxigeno"];

  /**
   * @param grupoDeNodos - Componente conexa del canvas.
   * @returns DO del tanque en mg/L, o `null` si falta el dato en algún nodo.
   */
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const advertencias: string[] = [];
    const agregado = agregarOxigenoDisueltoEnGrupo(grupoDeNodos);
    if (agregado.invalidadoPorNull) {
      advertencias.push(
        `oxigeno en null para el grupo [${grupoDeNodos.map((nodo) => nodo.id).join(", ")}]`,
      );
    } else {
      const valores = grupoDeNodos.map((nodo) => nodo.variables.oxigeno ?? 0);
      const maximo = Math.max(...valores);
      if (agregado.total != null && maximo > agregado.total) {
        advertencias.push(
          `oxigeno del grupo usa el mínimo ${agregado.total} mg/L (tanque compartido)`,
        );
      }
    }

    return {
      nombreMotor: this.nombre,
      exitoso: true,
      advertencias,
      datos: {
        idsNodos: grupoDeNodos.map((nodo) => nodo.id),
        totales: { oxigeno: agregado.total },
      },
    };
  }
}

export const motorOxigeno = new MotorOxigeno();
