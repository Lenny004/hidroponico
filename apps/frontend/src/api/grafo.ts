import type { GrafoPersistido } from "@hidroponico/tipos-compartidos";

/**
 * Lee el grafo persistido. Si la base no está, el canvas sigue en local.
 */
export async function obtenerGrafoPersistido(): Promise<GrafoPersistido | null> {
  const respuesta = await fetch("/grafo");
  if (respuesta.status === 503) {
    return null;
  }
  if (!respuesta.ok) {
    throw new Error(`GET /grafo respondió ${respuesta.status}`);
  }
  return (await respuesta.json()) as GrafoPersistido;
}

/**
 * Escribe la instantánea del canvas. Sincronización automática, sin Publicar.
 */
export async function enviarGrafoPersistido(grafo: GrafoPersistido): Promise<void> {
  const respuesta = await fetch("/grafo", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grafo),
  });
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
    throw new Error(cuerpo.error ?? `PUT /grafo respondió ${respuesta.status}`);
  }
}
