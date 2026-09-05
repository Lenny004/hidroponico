import type { NodoCultivo } from "@hidroponico/tipos-compartidos";

/**
 * Resultado uniforme de cualquier motor.
 * `datos` puede contener `null` por grupo; nunca debe usarse para lanzar.
 */
export interface ResultadoMotor {
  nombreMotor: string;
  exitoso: boolean;
  advertencias: string[];
  datos: Record<string, unknown>;
}

/**
 * Contrato Strategy de los motores hidropónicos.
 * Implementaciones: minerales, oxígeno y plagas.
 */
export interface MotorHidroponico {
  nombre: string;
  categoriasQueProcesa: string[];
  /**
   * Procesa un grupo de nodos conectados.
   * Si una variable no existe, se deja `null` y no se lanza excepción.
   */
  procesar(grupoDeNodos: NodoCultivo[]): ResultadoMotor;
}
