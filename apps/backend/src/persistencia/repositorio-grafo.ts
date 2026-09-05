import type { GrafoPersistido } from "@hidroponico/tipos-compartidos";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Lee el grafo persistido (fuente de verdad para recargas y reportes).
 * @returns Nodos y aristas tal como están en PostgreSQL.
 */
export async function leerGrafoPersistido(): Promise<GrafoPersistido> {
  const [nodos, aristas] = await Promise.all([
    prisma.nodo.findMany(),
    prisma.arista.findMany(),
  ]);

  return {
    nodos: nodos.map((nodo) => ({
      id: nodo.id,
      tipoCultivo: nodo.tipoCultivo,
      variables: (nodo.variables ?? {}) as GrafoPersistido["nodos"][number]["variables"],
      plagas: Array.isArray(nodo.plagas) ? (nodo.plagas as string[]) : null,
      solucion_plagas: nodo.solucion_plagas,
      comentarios: nodo.comentarios,
      posicionX: nodo.posicionX ?? 0,
      posicionY: nodo.posicionY ?? 0,
    })),
    aristas: aristas.map((arista) => ({
      id: arista.id,
      origenId: arista.origenId,
      destinoId: arista.destinoId,
      categoria: arista.categoria,
    })),
  };
}

/**
 * Reemplaza el grafo persistido por una instantánea validada del canvas.
 * Borra y reescribe en una transacción para no dejar un DAG a medias.
 *
 * @param grafo - Snapshot ya pasado por `validarGrafoPersistido`.
 */
export async function reemplazarGrafoPersistido(grafo: GrafoPersistido): Promise<void> {
  const ahora = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.arista.deleteMany();
    await tx.nodo.deleteMany();
    if (grafo.nodos.length > 0) {
      await tx.nodo.createMany({
        data: grafo.nodos.map((nodo) => ({
          id: nodo.id,
          tipoCultivo: nodo.tipoCultivo,
          variables: nodo.variables,
          plagas: nodo.plagas === null ? Prisma.DbNull : nodo.plagas,
          solucion_plagas: nodo.solucion_plagas,
          comentarios: nodo.comentarios,
          posicionX: nodo.posicionX,
          posicionY: nodo.posicionY,
          actualizadoEn: ahora,
        })),
      });
    }
    if (grafo.aristas.length > 0) {
      await tx.arista.createMany({
        data: grafo.aristas.map((arista) => ({
          id: arista.id,
          origenId: arista.origenId,
          destinoId: arista.destinoId,
          categoria: arista.categoria,
        })),
      });
    }
  });
}
