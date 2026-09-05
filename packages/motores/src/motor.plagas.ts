import {
  agregarPlagasEnGrupo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Recopila `plagas` y `solucion_plagas` por grupo conectado.
 * Un `null` invalida esa categoría del grupo; no lanza ni detiene el pipeline.
 */
export class MotorPlagas implements MotorHidroponico {
  readonly nombre = "plagas";
  readonly categoriasQueProcesa = ["plagas", "solucion_plagas"];

  /**
   * @param grupoDeNodos - Componente conexa del canvas.
   * @returns Listas unificadas, o `null` si algún nodo no tiene el dato.
   */
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const agregado = agregarPlagasEnGrupo(grupoDeNodos);
    const ids = grupoDeNodos.map((nodo) => nodo.id);
    const advertencias: string[] = [];

    if (agregado.invalidadoPorNullPlagas) {
      advertencias.push(`plagas en null para el grupo [${ids.join(", ")}]`);
    }
    if (agregado.invalidadoPorNullSolucion) {
      advertencias.push(`solucion_plagas en null para el grupo [${ids.join(", ")}]`);
    }

    return {
      nombreMotor: this.nombre,
      exitoso: true,
      advertencias,
      datos: {
        idsNodos: ids,
        plagas: agregado.plagas,
        solucion_plagas: agregado.solucion_plagas,
      },
    };
  }
}

export const motorPlagas = new MotorPlagas();
