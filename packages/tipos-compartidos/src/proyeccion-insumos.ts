import { obtenerCultivoPorId, reposicionDiaDe } from "./catalogo-cultivos";
import { formatearMedida } from "./etiquetas-variables";
import { CLAVES_MINERALES, type ClaveMineral, type NodoCultivo } from "./nodo-cultivo";

export const HORIZONTES_PROYECCION = [
  { id: "dia", etiqueta: "1 Día", dias: 1 },
  { id: "semana", etiqueta: "1 Semana (7d)", dias: 7 },
  { id: "mes", etiqueta: "1 Mes (30d)", dias: 30 },
] as const;

export type IdHorizonteProyeccion = (typeof HORIZONTES_PROYECCION)[number]["id"];

export interface FichaPlantado {
  id: string;
  tipoCultivo: string;
  nombre: string;
  color: string;
  litros: number | null;
  reposicionDiaL: number | null;
  masaMg: number | null;
  dias_cosecha: number | null;
}

export interface ProyeccionInsumos {
  /** Litros de reserva en el tanque. Recircula; no se multiplica por días. */
  reservaL: number | null;
  /** Agua a reponer en el horizonte (transpiración × días). */
  reposicionL: number | null;
  /** Minerales disueltos en la reserva (mg = mg/L × L de tanque). */
  masaTanqueMg: number | null;
  /** Sales en el agua de reposición (mg/L × L repuestos). */
  masaReposicionMg: number | null;
  omitidos: number;
}

function masaConVolumen(
  nodo: NodoCultivo,
  litros: number | null,
): number | null {
  if (litros == null) {
    return null;
  }
  let total = 0;
  for (const clave of CLAVES_MINERALES) {
    const concentracion = nodo.variables[clave];
    if (concentracion == null) {
      return null;
    }
    total += concentracion * litros;
  }
  return total;
}

/**
 * Masa elemental de los cuatro minerales de un nodo: Σ (mg/L × L de reserva).
 * Si falta `cantidad_sol` o cualquier concentración, queda `null`.
 * No convierte a gramos de sales. No es el gasto diario de agua.
 *
 * @param nodo - Cultivo plantado.
 * @returns Masa en mg, o `null` si falta un dato.
 */
export function masaMineralesNodo(nodo: NodoCultivo): number | null {
  return masaConVolumen(nodo, nodo.variables.cantidad_sol ?? null);
}

/**
 * Masa elemental en el agua de reposición de un día: Σ (mg/L × L/día).
 * Tipo sin catálogo o concentración faltante → `null`.
 *
 * @param nodo - Cultivo plantado.
 */
export function masaReposicionNodo(nodo: NodoCultivo): number | null {
  return masaConVolumen(nodo, reposicionDiaDe(nodo.tipoCultivo));
}

/**
 * Masa de un mineral en un volumen concreto: mg/L × L.
 * Falta concentración o litros → `null`.
 *
 * @param nodo - Cultivo plantado.
 * @param clave - Mineral del boceto.
 * @param litros - Reserva o reposición.
 */
export function masaMineralEnVolumen(
  nodo: NodoCultivo,
  clave: ClaveMineral,
  litros: number | null,
): number | null {
  const concentracion = nodo.variables[clave] ?? null;
  if (concentracion == null || litros == null) {
    return null;
  }
  return concentracion * litros;
}

/**
 * Ficha de inventario de un orificio: litros de reserva y masa mineral.
 * Un `null` en el nodo no se inventa; el resto de plantados sigue visible.
 *
 * @param nodo - Cultivo en el tubo.
 */
export function fichaPlantado(nodo: NodoCultivo): FichaPlantado {
  const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
  return {
    id: nodo.id,
    tipoCultivo: nodo.tipoCultivo,
    nombre: definicion?.nombre ?? nodo.tipoCultivo,
    color: definicion?.color ?? "#93a4c3",
    litros: nodo.variables.cantidad_sol ?? null,
    reposicionDiaL: definicion?.reposicion_dia_L ?? null,
    masaMg: masaMineralesNodo(nodo),
    dias_cosecha: definicion?.proceso.dias_cosecha ?? null,
  };
}

/**
 * Lista de cultivos en el tubo, estable por nombre e id.
 *
 * @param nodos - Nodos del grafo de construcción.
 */
export function fichasPlantados(nodos: NodoCultivo[]): FichaPlantado[] {
  return nodos
    .map(fichaPlantado)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es") || a.id.localeCompare(b.id));
}

function sumarONull(valores: Array<number | null>): { total: number | null; vistos: number } {
  let total = 0;
  let vistos = 0;
  for (const valor of valores) {
    if (valor == null) {
      continue;
    }
    total += valor;
    vistos += 1;
  }
  return { total: vistos > 0 ? total : null, vistos };
}

/**
 * Reserva del tanque (sin escalar) y agua a reponer en `dias`.
 * Un `null` no anula a los demás: se omite y se cuenta en `omitidos`.
 * Cero plantados → 0 L y 0 mg.
 *
 * @param nodos - Cultivos plantados (toda la instalación).
 * @param dias - Días de reposición (1, 7 o 30). No vacía el tanque.
 */
export function proyectarInsumos(nodos: NodoCultivo[], dias: number): ProyeccionInsumos {
  if (nodos.length === 0) {
    return {
      reservaL: 0,
      reposicionL: 0,
      masaTanqueMg: 0,
      masaReposicionMg: 0,
      omitidos: 0,
    };
  }

  const reservas: Array<number | null> = [];
  const reposiciones: Array<number | null> = [];
  const masasTanque: Array<number | null> = [];
  const masasReposicion: Array<number | null> = [];
  let omitidos = 0;

  for (const nodo of nodos) {
    const reserva = nodo.variables.cantidad_sol ?? null;
    const reposicion = reposicionDiaDe(nodo.tipoCultivo);
    const masaTanque = masaMineralesNodo(nodo);
    const masaReposicion = masaReposicionNodo(nodo);
    reservas.push(reserva);
    reposiciones.push(reposicion);
    masasTanque.push(masaTanque);
    masasReposicion.push(masaReposicion);
    if (reserva == null || masaTanque == null || reposicion == null || masaReposicion == null) {
      omitidos += 1;
    }
  }

  const sumaReserva = sumarONull(reservas);
  const sumaReposicion = sumarONull(reposiciones);
  const sumaMasaTanque = sumarONull(masasTanque);
  const sumaMasaReposicion = sumarONull(masasReposicion);

  return {
    reservaL: sumaReserva.vistos > 0 ? sumaReserva.total : null,
    reposicionL:
      sumaReposicion.vistos > 0 && sumaReposicion.total != null
        ? sumaReposicion.total * dias
        : null,
    masaTanqueMg: sumaMasaTanque.vistos > 0 ? sumaMasaTanque.total : null,
    masaReposicionMg:
      sumaMasaReposicion.vistos > 0 && sumaMasaReposicion.total != null
        ? sumaMasaReposicion.total * dias
        : null,
    omitidos,
  };
}

/**
 * Texto compacto al estilo «4 L | 1140.4 mg» (reserva y minerales en tanque).
 *
 * @param litros - Reserva en litros.
 * @param masaMg - Masa elemental en mg.
 */
export function formatearParInsumos(
  litros: number | null,
  masaMg: number | null,
): string {
  const textoLitros = litros == null ? "— L" : formatearMedida(litros, "L");
  const textoMasa = masaMg == null ? "— mg" : formatearMedida(masaMg, "mg");
  return `${textoLitros} | ${textoMasa}`;
}

/**
 * Reposición diaria al estilo «0.5 L/día | 142.55 mg/día».
 *
 * @param litros - Litros a reponer en el día.
 * @param masaMg - Sales en esa agua, o `null`.
 */
export function formatearReposicion(
  litros: number | null,
  masaMg: number | null,
): string {
  const textoLitros =
    litros == null ? "— L/día" : `${formatearMedida(litros, "L")}/día`;
  const textoMasa =
    masaMg == null ? "— mg/día" : `${formatearMedida(masaMg, "mg")}/día`;
  return `${textoLitros} | ${textoMasa}`;
}
