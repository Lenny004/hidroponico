import { EventEmitter } from "node:events";
import {
  EVENTOS_GRAFO,
  type NombreEventoGrafo,
} from "@hidroponico/tipos-compartidos";

/**
 * Núcleo TREE.JS: bus pub/sub del grafo.
 * Los motores se suscriben aquí; la UI no conoce su lógica interna.
 * En Fase 0/1 no hay motores registrados: el bus queda listo sin orquestar cálculos.
 */
export class BusEventosTree {
  private readonly emisor = new EventEmitter();

  constructor() {
    this.emisor.setMaxListeners(50);
  }

  /**
   * Publica un evento del grafo.
   * Nunca lanza por datos faltantes: el payload puede traer `null`.
   */
  emitir(nombre: NombreEventoGrafo, payload: unknown): void {
    this.emisor.emit(nombre, payload);
  }

  /**
   * Suscribe un listener. Devuelve una función para cancelar la suscripción.
   */
  suscribir(nombre: NombreEventoGrafo, listener: (payload: unknown) => void): () => void {
    this.emisor.on(nombre, listener);
    return () => {
      this.emisor.off(nombre, listener);
    };
  }

  nombresConocidos(): NombreEventoGrafo[] {
    return Object.values(EVENTOS_GRAFO);
  }
}

export function crearBusEventosTree(): BusEventosTree {
  return new BusEventosTree();
}
