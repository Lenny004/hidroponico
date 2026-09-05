import {
  agregarCategoriaEnGrupo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Agrega `oxigeno` (ml) por grupo conectado.
 * Un `null` invalida el total del grupo; no lanza ni detiene el pipeline.
 */
export class MotorOxigeno implements MotorHidroponico {
  readonly nombre = "oxigeno";
  readonly categoriasQueProcesa = ["oxigeno"];

  /**
   * @param grupoDeNodos - Componente conexa del canvas.
   * @returns Total de `oxigeno`, o `null` si falta el dato en algún nodo.
   */
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const advertencias: string[] = [];
    const agregado = agregarCategoriaEnGrupo(grupoDeNodos, "oxigeno");
    if (agregado.invalidadoPorNull) {
      advertencias.push(
        `oxigeno en null para el grupo [${grupoDeNodos.map((nodo) => nodo.id).join(", ")}]`,
      );
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
