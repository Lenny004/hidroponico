import {
  agregarCategoriaEnGrupo,
  CLAVES_MINERALES,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";

/**
 * Agrega Mg, K, Mn y Fe por grupo conectado.
 * Un `null` invalida esa categoría del grupo; no lanza ni detiene otras categorías.
 */
export class MotorMinerales implements MotorHidroponico {
  readonly nombre = "minerales";
  readonly categoriasQueProcesa = [...CLAVES_MINERALES];

  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor {
    const advertencias: string[] = [];
    const totales: Record<string, number | null> = {};

    for (const categoria of this.categoriasQueProcesa) {
      const agregado = agregarCategoriaEnGrupo(grupoDeNodos, categoria);
      totales[categoria] = agregado.total;
      if (agregado.invalidadoPorNull) {
        advertencias.push(
          `${categoria} en null para el grupo [${grupoDeNodos.map((nodo) => nodo.id).join(", ")}]`,
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
      },
    };
  }
}

export const motorMinerales = new MotorMinerales();
