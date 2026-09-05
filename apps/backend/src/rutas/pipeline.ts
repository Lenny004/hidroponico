import type { FastifyInstance } from "fastify";
import {
  EVENTOS_GRAFO,
  type AristaDirigida,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import { ejecutarPipeline, type RegistroMotores } from "@hidroponico/motores";
import type { BusEventosTree } from "../tree-js/bus-eventos";

interface CuerpoPipeline {
  nodos?: NodoCultivo[];
  aristas?: AristaDirigida[];
  motor?: string | null;
}

/**
 * POST /pipeline: la UI dispara TREE.JS sin conocer la lógica de cada motor.
 */
export async function registrarRutaPipeline(
  app: FastifyInstance,
  bus: BusEventosTree,
  registro: RegistroMotores,
): Promise<void> {
  app.post("/pipeline", async (solicitud, respuesta) => {
    const cuerpo = (solicitud.body ?? {}) as CuerpoPipeline;
    const nodos = Array.isArray(cuerpo.nodos) ? cuerpo.nodos : [];
    const aristas = Array.isArray(cuerpo.aristas) ? cuerpo.aristas : [];

    bus.emitir(EVENTOS_GRAFO.PIPELINE_EJECUTAR, {
      motor: cuerpo.motor ?? null,
      cantidadNodos: nodos.length,
    });

    const resultado = await ejecutarPipeline(
      registro,
      nodos,
      aristas,
      cuerpo.motor,
    );

    return respuesta.send({
      ...resultado,
      bloqueado: false,
    });
  });
}
