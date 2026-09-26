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

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function validarCuerpoPipeline(valor: unknown): { ok: true; cuerpo: CuerpoPipeline } | { ok: false; motivo: string } {
  if (!esObjeto(valor)) {
    return { ok: false, motivo: "El cuerpo debe ser un objeto JSON." };
  }
  const { nodos, aristas, motor } = valor;
  if (nodos !== undefined && !Array.isArray(nodos)) {
    return { ok: false, motivo: "nodos debe ser una lista." };
  }
  if (aristas !== undefined && !Array.isArray(aristas)) {
    return { ok: false, motivo: "aristas debe ser una lista." };
  }
  if (motor !== undefined && motor !== null && typeof motor !== "string") {
    return { ok: false, motivo: "motor debe ser texto o null." };
  }
  if (Array.isArray(nodos)) {
    for (const nodo of nodos) {
      if (!esObjeto(nodo) || typeof nodo.id !== "string" || typeof nodo.tipoCultivo !== "string" || !esObjeto(nodo.variables)) {
        return { ok: false, motivo: "Cada nodo debe incluir id, tipoCultivo y variables." };
      }
    }
  }
  if (Array.isArray(aristas)) {
    for (const arista of aristas) {
      if (!esObjeto(arista) || typeof arista.origenId !== "string" || typeof arista.destinoId !== "string") {
        return { ok: false, motivo: "Cada arista debe incluir origenId y destinoId." };
      }
    }
  }
  return { ok: true, cuerpo: valor as CuerpoPipeline };
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
    const validado = validarCuerpoPipeline(solicitud.body ?? {});
    if (!validado.ok) {
      return respuesta.code(400).send({ error: validado.motivo });
    }
    const cuerpo = validado.cuerpo;
    if (cuerpo.motor && registro.obtener(cuerpo.motor) === null) {
      return respuesta.code(400).send({ error: `Motor desconocido: ${cuerpo.motor}` });
    }
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
