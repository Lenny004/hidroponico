import {
  agregarCategoriaEnGrupo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Suma `cantidad_sol` (L) por grupo conectado: litros de solución a preparar.
 * No convierte minerales a sales. Un `null` invalida el grupo; no lanza ni detiene el pipeline.
 */
export class MotorInsumos implements MotorHidroponico {
  readonly nombre = "insumos";
  readonly categoriasQueProcesa = ["cantidad_sol"];

  /**
   * @param grupoDeNodos - Componente conexa del canvas.
   * @returns Total de `cantidad_sol` en litros, o `null` si falta el dato en algún nodo.
   */
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const advertencias: string[] = [];
    const agregado = agregarCategoriaEnGrupo(grupoDeNodos, "cantidad_sol");
    if (agregado.invalidadoPorNull) {
      advertencias.push(
        `cantidad_sol en null para el grupo [${grupoDeNodos.map((nodo) => nodo.id).join(", ")}]`,
      );
    }

    return {
      nombreMotor: this.nombre,
      exitoso: true,
      advertencias,
      datos: {
        idsNodos: grupoDeNodos.map((nodo) => nodo.id),
        totales: { cantidad_sol: agregado.total },
      },
    };
  }
}

export const motorInsumos = new MotorInsumos();
