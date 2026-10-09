import {
  contrastarReservaConDeposito,
  volumenDeposito,
  type DepositoInstalacion,
} from "./deposito";
import {
  OXIGENO_NFT_MIN_MG_L,
  OXIGENO_NFT_MAX_MG_L,
} from "./banda-oxigeno";
import { CLAVES_VARIABLES_CULTIVO, type NodoCultivo } from "./nodo-cultivo";
import { obtenerCultivoPorId } from "./catalogo-cultivos";
import { fechaInicioHoy, parsearFechaInicio } from "./etapas-vida";
import { proyectarInsumos } from "./proyeccion-insumos";

export type TipoTareaOperativa = "ph" | "oxigeno" | "reposicion" | "cosecha";

export interface TareaOperativa {
  id: string;
  tipo: TipoTareaOperativa;
  titulo: string;
  descripcion: string;
  fechaObjetivo: string;
  frecuenciaDias: number | null;
  cultivoId?: string;
  cultivoNombre?: string;
}

export interface MedicionOperativa {
  id: string;
  fecha: string;
  ph: number | null;
  oxigeno_mgL: number | null;
  volumen_L: number | null;
  notas: string | null;
}

export type SeveridadAlertaOperativa = "critica" | "advertencia" | "info";

export interface AlertaOperativa {
  id: string;
  severidad: SeveridadAlertaOperativa;
  titulo: string;
  detalle: string;
}

function fechaDesde(valor: string): Date | null {
  const dia = parsearFechaInicio(valor);
  if (!dia) {
    return null;
  }
  const [anio, mes, numero] = dia.split("-").map(Number);
  return new Date(anio, mes - 1, numero);
}

function fechaIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function sumarDias(fecha: string, dias: number): string {
  const base = fechaDesde(fecha) ?? new Date();
  base.setDate(base.getDate() + dias);
  return fechaIso(base);
}

/**
 * Genera las tareas operativas mínimas del sistema y las cosechas previstas.
 * Las tareas de pH, O₂ y reposición son diarias; la cosecha depende del catálogo.
 */
export function calendarioOperativo(
  nodos: readonly NodoCultivo[],
  ahora = new Date(),
): TareaOperativa[] {
  const hoy = fechaInicioHoy(ahora);
  const tareas: TareaOperativa[] = [
    {
      id: "sistema-ph",
      tipo: "ph",
      titulo: "Revisar pH",
      descripcion: "Medir la solución y mantenerla dentro del rango de manejo del cultivo.",
      fechaObjetivo: hoy,
      frecuenciaDias: 1,
    },
    {
      id: "sistema-oxigeno",
      tipo: "oxigeno",
      titulo: "Revisar oxígeno",
      descripcion: `Comprobar el oxígeno disuelto; el rango típico NFT es ${OXIGENO_NFT_MIN_MG_L}–${OXIGENO_NFT_MAX_MG_L} mg/L.`,
      fechaObjetivo: hoy,
      frecuenciaDias: 1,
    },
    {
      id: "sistema-reposicion",
      tipo: "reposicion",
      titulo: "Registrar reposición",
      descripcion: "Anotar los litros añadidos y verificar que la reserva del depósito siga cabiendo.",
      fechaObjetivo: hoy,
      frecuenciaDias: 1,
    },
  ];

  for (const nodo of nodos) {
    const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
    const inicio = nodo.iniciado_en ? parsearFechaInicio(nodo.iniciado_en) : null;
    if (!definicion || !inicio) {
      continue;
    }
    tareas.push({
      id: `cosecha-${nodo.id}`,
      tipo: "cosecha",
      titulo: `Revisar cosecha de ${definicion.nombre}`,
      descripcion: `Comprobar tamaño, sanidad y disponibilidad de la cosecha prevista del ciclo de ${definicion.nombre}.`,
      fechaObjetivo: sumarDias(inicio, definicion.proceso.dias_cosecha),
      frecuenciaDias: null,
      cultivoId: nodo.id,
      cultivoNombre: definicion.nombre,
    });
  }

  return tareas.sort((a, b) => a.fechaObjetivo.localeCompare(b.fechaObjetivo) || a.titulo.localeCompare(b.titulo, "es"));
}

function ultimaMedicion(mediciones: readonly MedicionOperativa[]): MedicionOperativa | null {
  return [...mediciones].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;
}

/**
 * Calcula alertas operativas con datos reales medidos y con la capacidad física.
 * La ausencia de mediciones es informativa; nunca se interpreta como cero.
 */
export function alertasOperacion(
  nodos: readonly NodoCultivo[],
  deposito: DepositoInstalacion,
  mediciones: readonly MedicionOperativa[] = [],
): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const proyeccion = proyectarInsumos([...nodos], 1);
  const contraste = contrastarReservaConDeposito(proyeccion.reservaL, volumenDeposito(deposito).netoL);

  if (contraste.estado === "excede") {
    alertas.push({
      id: "reserva-excede-deposito",
      severidad: "critica",
      titulo: "Reserva insuficiente",
      detalle: `La reserva requerida supera la capacidad neta del depósito por ${Math.abs(contraste.holguraL ?? 0).toFixed(1)} L.`,
    });
  } else if (contraste.estado === "sin_deposito") {
    alertas.push({
      id: "deposito-sin-medidas",
      severidad: "info",
      titulo: "Falta medir el depósito",
      detalle: "Registra las dimensiones del tanque para comparar volumen requerido y capacidad real.",
    });
  } else if (contraste.estado === "reserva_incompleta") {
    alertas.push({
      id: "reserva-incompleta",
      severidad: "advertencia",
      titulo: "Reserva incompleta",
      detalle: "Hay cultivos sin litros de reserva; no se puede validar la capacidad total del tanque.",
    });
  }

  const incompletos = nodos
    .map((nodo) => {
      const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
      const faltantes = CLAVES_VARIABLES_CULTIVO.filter((clave) => nodo.variables[clave] == null);
      return faltantes.length > 0 ? definicion?.nombre ?? nodo.tipoCultivo : null;
    })
    .filter((nombre): nombre is string => nombre != null);
  if (incompletos.length > 0 || proyeccion.omitidos > 0) {
    alertas.push({
      id: "datos-incompletos",
      severidad: "advertencia",
      titulo: "Datos incompletos",
      detalle: `${incompletos.length || proyeccion.omitidos} cultivo(s) necesitan completar variables antes de cerrar el cálculo operativo.`,
    });
  }

  const medicion = ultimaMedicion(mediciones);
  if (!medicion) {
    alertas.push({
      id: "sin-medicion",
      severidad: "info",
      titulo: "Sin medición reciente",
      detalle: "Registra pH, oxígeno y volumen para activar alertas basadas en el estado real del tanque.",
    });
  } else {
    if (medicion.oxigeno_mgL != null && medicion.oxigeno_mgL < OXIGENO_NFT_MIN_MG_L) {
      alertas.push({
        id: "oxigeno-bajo",
        severidad: "critica",
        titulo: "Oxígeno bajo",
        detalle: `La última medición fue ${medicion.oxigeno_mgL} mg/L; el mínimo típico NFT es ${OXIGENO_NFT_MIN_MG_L} mg/L.`,
      });
    }
    if (medicion.ph != null && (medicion.ph < 5.5 || medicion.ph > 6.5)) {
      alertas.push({
        id: "ph-fuera-rango",
        severidad: "advertencia",
        titulo: "pH fuera de rango",
        detalle: `La última medición fue pH ${medicion.ph}; revisa la solución antes de ajustar.`,
      });
    }
    if (medicion.volumen_L != null && proyeccion.reservaL != null && medicion.volumen_L < proyeccion.reservaL) {
      alertas.push({
        id: "volumen-medido-insuficiente",
        severidad: "critica",
        titulo: "Volumen medido insuficiente",
        detalle: `El tanque tiene ${medicion.volumen_L} L medidos y requiere al menos ${proyeccion.reservaL.toFixed(1)} L de reserva.`,
      });
    }
  }

  return alertas.sort((a, b) => {
    const prioridad = { critica: 0, advertencia: 1, info: 2 };
    return prioridad[a.severidad] - prioridad[b.severidad];
  });
}
