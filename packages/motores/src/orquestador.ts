import {
  conteoPorTipo,
  particionarEnGrupos,
  type AristaDirigida,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";
import type { MotorHidroponico, ResultadoMotor } from "./motor-hidroponico";
import type { RegistroMotores } from "./registro-motores";

export interface ResultadoOrquestacion {
  motores: { nombre: string; grupos: ResultadoMotor[] }[];
  conteoPorTipo: Record<string, number>;
  advertencias: string[];
}

/**
 * Ejecuta los motores registrados en paralelo.
 * Un fallo o un `null` de grupo no detiene el resto del pipeline.
 *
 * @param nombreMotor - Si se indica, solo corre ese motor. Si no, corre todos.
 */
export async function ejecutarPipeline(
  registro: RegistroMotores,
  nodos: NodoCultivo[],
  aristas: AristaDirigida[],
  nombreMotor?: string | null,
): Promise<ResultadoOrquestacion> {
  const motores = seleccionarMotores(registro, nombreMotor);
  const advertencias: string[] = [];

  if (motores.length === 0) {
    advertencias.push("No hay motores registrados para ejecutar.");
    return {
      motores: [],
      conteoPorTipo: conteoPorTipo(nodos),
      advertencias,
    };
  }

  const gruposIds = particionarEnGrupos(
    nodos.map((nodo) => nodo.id),
    aristas,
  );
  const porId = new Map(nodos.map((nodo) => [nodo.id, nodo]));
  const grupos = gruposIds.map((ids) =>
    ids
      .map((id) => porId.get(id))
      .filter((nodo): nodo is NodoCultivo => nodo !== undefined),
  );

  const motoresResultados = await Promise.all(
    motores.map(async (motor) => ({
      nombre: motor.nombre,
      grupos: grupos.map((grupo) => procesarSinTumbar(motor, grupo)),
    })),
  );

  for (const resultado of motoresResultados) {
    for (const grupo of resultado.grupos) {
      advertencias.push(...grupo.advertencias);
    }
  }

  return {
    motores: motoresResultados,
    conteoPorTipo: conteoPorTipo(nodos),
    advertencias,
  };
}

function seleccionarMotores(
  registro: RegistroMotores,
  nombreMotor?: string | null,
): MotorHidroponico[] {
  if (!nombreMotor) {
    return registro.listar();
  }
  const motor = registro.obtener(nombreMotor);
  return motor ? [motor] : [];
}

function procesarSinTumbar(
  motor: MotorHidroponico,
  grupo: NodoCultivo[],
): ResultadoMotor {
  try {
    return motor.procesar(grupo);
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error desconocido";
    return {
      nombreMotor: motor.nombre,
      exitoso: false,
      advertencias: [`Motor ${motor.nombre} aislado: ${detalle}`],
      datos: { idsNodos: grupo.map((nodo) => nodo.id) },
    };
  }
}
