import type { FastifyInstance } from "fastify";
import { validarGrafoPersistido } from "@hidroponico/tipos-compartidos";
import {
  leerGrafoPersistido,
  reemplazarGrafoPersistido,
} from "../persistencia/repositorio-grafo";

/**
 * GET/PUT /grafo: frontera entre el canvas de construcción y el grafo persistido.
 * Sin botón Publicar: el cliente sincroniza solo.
 */
export async function registrarRutaGrafo(app: FastifyInstance): Promise<void> {
  app.get("/grafo", async (_solicitud, respuesta) => {
    try {
      const grafo = await leerGrafoPersistido();
      return respuesta.send(grafo);
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "error desconocido";
      return respuesta.code(503).send({
        nodos: [],
        aristas: [],
        error: `Persistencia no disponible: ${detalle}`,
      });
    }
  });

  app.put("/grafo", async (solicitud, respuesta) => {
    const validado = validarGrafoPersistido(solicitud.body);
    if (!validado.ok) {
      return respuesta.code(400).send({ error: validado.motivo });
    }
    try {
      await reemplazarGrafoPersistido(validado.grafo);
      return respuesta.send({ ok: true });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "error desconocido";
      return respuesta.code(503).send({
        error: `No se pudo sincronizar: ${detalle}`,
      });
    }
  });
}
