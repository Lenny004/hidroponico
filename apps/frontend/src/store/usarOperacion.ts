import { create } from "zustand";
import type { MedicionOperativa } from "@hidroponico/tipos-compartidos";

const CLAVE_MEDICIONES = "hidroponico.operacion.mediciones";
const CLAVE_TAREAS = "hidroponico.operacion.tareas";
const CLAVE_HISTORIAL = "hidroponico.operacion.historial";

type NuevaMedicion = Omit<MedicionOperativa, "id">;

export interface EventoOperacion {
  id: string;
  tipo: "medicion" | "cambio";
  fecha: string;
  descripcion: string;
}

function leerLista(): MedicionOperativa[] {
  try {
    const crudo = localStorage.getItem(CLAVE_MEDICIONES);
    if (!crudo) {
      return [];
    }
    const valor = JSON.parse(crudo) as unknown;
    return Array.isArray(valor) ? (valor as MedicionOperativa[]) : [];
  } catch {
    return [];
  }
}

function leerTareas(): string[] {
  try {
    const crudo = localStorage.getItem(CLAVE_TAREAS);
    if (!crudo) {
      return [];
    }
    const valor = JSON.parse(crudo) as unknown;
    return Array.isArray(valor) ? valor.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function leerHistorial(): EventoOperacion[] {
  try {
    const crudo = localStorage.getItem(CLAVE_HISTORIAL);
    if (!crudo) {
      return [];
    }
    const valor = JSON.parse(crudo) as unknown;
    return Array.isArray(valor) ? (valor as EventoOperacion[]) : [];
  } catch {
    return [];
  }
}

function guardarMediciones(mediciones: MedicionOperativa[]): void {
  try {
    localStorage.setItem(CLAVE_MEDICIONES, JSON.stringify(mediciones));
  } catch {
    /* El historial sigue disponible en memoria si el navegador bloquea localStorage. */
  }
}

function guardarTareas(tareas: string[]): void {
  try {
    localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
  } catch {
    /* La lista de tareas sigue disponible en memoria. */
  }
}

function guardarHistorial(historial: EventoOperacion[]): void {
  try {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
  } catch {
    /* El historial sigue disponible en memoria. */
  }
}

interface EstadoOperacion {
  mediciones: MedicionOperativa[];
  tareasCompletadas: string[];
  historial: EventoOperacion[];
  registrarMedicion: (medicion: NuevaMedicion) => void;
  registrarEvento: (evento: Omit<EventoOperacion, "id">) => void;
  quitarMedicion: (id: string) => void;
  alternarTarea: (id: string, fecha: string) => void;
}

export const usarOperacion = create<EstadoOperacion>((set) => ({
  mediciones: typeof localStorage === "undefined" ? [] : leerLista(),
  tareasCompletadas: typeof localStorage === "undefined" ? [] : leerTareas(),
  historial: typeof localStorage === "undefined" ? [] : leerHistorial(),
  registrarMedicion: (medicion) => {
    set((estado) => {
      const id = crypto.randomUUID();
      const siguiente = [
        { ...medicion, id },
        ...estado.mediciones,
      ].slice(0, 120);
      const historial = [
        {
          id: crypto.randomUUID(),
          tipo: "medicion" as const,
          fecha: medicion.fecha,
          descripcion: `Medición registrada: pH ${medicion.ph ?? "—"}, O₂ ${medicion.oxigeno_mgL ?? "—"} mg/L, volumen ${medicion.volumen_L ?? "—"} L.`,
        },
        ...estado.historial,
      ].slice(0, 200);
      guardarMediciones(siguiente);
      guardarHistorial(historial);
      return { mediciones: siguiente, historial };
    });
  },
  registrarEvento: (evento) => {
    set((estado) => {
      const historial = [{ ...evento, id: crypto.randomUUID() }, ...estado.historial].slice(0, 200);
      guardarHistorial(historial);
      return { historial };
    });
  },
  quitarMedicion: (id) => {
    set((estado) => {
      const siguiente = estado.mediciones.filter((medicion) => medicion.id !== id);
      guardarMediciones(siguiente);
      return { mediciones: siguiente };
    });
  },
  alternarTarea: (id, fecha) => {
    const clave = `${id}:${fecha}`;
    set((estado) => {
      const siguiente = estado.tareasCompletadas.includes(clave)
        ? estado.tareasCompletadas.filter((item) => item !== clave)
        : [...estado.tareasCompletadas, clave];
      guardarTareas(siguiente);
      return { tareasCompletadas: siguiente };
    });
  },
}));
