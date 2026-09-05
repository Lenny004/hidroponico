import type { MotorHidroponico } from "./motor-hidroponico";

/**
 * Registry/Plugin: el orquestador lista motores registrados.
 * Añadir un motor nuevo no debe exigir cambiar esta clase (OCP).
 * En Fase 0/1 el registro permanece vacío a propósito.
 */
export class RegistroMotores {
  private readonly motores = new Map<string, MotorHidroponico>();

  /**
   * @param motor - Estrategia a registrar. Si el nombre ya existe, se reemplaza.
   */
  registrar(motor: MotorHidroponico): void {
    this.motores.set(motor.nombre, motor);
  }

  /**
   * @returns Copia de los motores en orden de registro.
   */
  listar(): MotorHidroponico[] {
    return [...this.motores.values()];
  }

  /**
   * @param nombre - Identificador del motor.
   * @returns El motor o `null` si no está registrado.
   */
  obtener(nombre: string): MotorHidroponico | null {
    return this.motores.get(nombre) ?? null;
  }
}
