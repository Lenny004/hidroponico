export interface ResultadoMotorApi {
  nombreMotor: string;
  exitoso: boolean;
  advertencias: string[];
  datos: {
    idsNodos?: string[];
    totales?: Record<string, number | null>;
    plagas?: string[] | null;
    solucion_plagas?: string[] | null;
  };
}

export interface ResultadoPipelineApi {
  motores: { nombre: string; grupos: ResultadoMotorApi[] }[];
  conteoPorTipo: Record<string, number>;
  advertencias: string[];
  bloqueado: boolean;
}

/**
 * Envía el grafo de construcción a TREE.JS.
 * @param motor - Nombre de un motor, o `null` para todos los registrados (en paralelo).
 */
export async function solicitarPipeline(
  nodos: unknown[],
  aristas: { origenId: string; destinoId: string }[],
  motor?: string | null,
): Promise<ResultadoPipelineApi> {
  const respuesta = await fetch("/pipeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodos, aristas, motor: motor ?? null }),
  });
  if (!respuesta.ok) {
    throw new Error(`TREE.JS respondió ${respuesta.status}`);
  }
  return (await respuesta.json()) as ResultadoPipelineApi;
}
