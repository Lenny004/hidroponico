import { obtenerCultivoPorId } from "./catalogo-cultivos";
import { formatearMedida } from "./etiquetas-variables";
import { CLAVES_MINERALES, type NodoCultivo } from "./nodo-cultivo";

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
  masaMg: number | null;
  dias_cosecha: number | null;
}

export interface ProyeccionInsumos {
  litros: number | null;
  masaMg: number | null;
  omitidos: number;
}

/**
 * Masa elemental de los cuatro minerales de un nodo: Σ (mg/L × L).
 * Si falta `cantidad_sol` o cualquier concentración, queda `null`.
 * No convierte a gramos de sales.
 *
 * @param nodo - Cultivo plantado.
 * @returns Masa en mg, o `null` si falta un dato.
 */
export function masaMineralesNodo(nodo: NodoCultivo): number | null {
  const litros = nodo.variables.cantidad_sol;
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

/**
 * Suma litros y masa de los nodos con dato, y escala por días de recambio.
 * Un `null` no anula a los demás: se omite y se cuenta en `omitidos`.
 * Cero plantados → 0 L y 0 mg.
 *
 * @param nodos - Cultivos plantados (toda la instalación).
 * @param dias - Recambios de la reserva NFT (1, 7 o 30).
 */
export function proyectarInsumos(nodos: NodoCultivo[], dias: number): ProyeccionInsumos {
  let litros = 0;
  let masaMg = 0;
  let vistosLitros = 0;
  let vistosMasa = 0;
  let omitidos = 0;

  for (const nodo of nodos) {
    const reserva = nodo.variables.cantidad_sol ?? null;
    const masa = masaMineralesNodo(nodo);
    if (reserva == null || masa == null) {
      omitidos += 1;
    }
    if (reserva != null) {
      litros += reserva;
      vistosLitros += 1;
    }
    if (masa != null) {
      masaMg += masa;
      vistosMasa += 1;
    }
  }

  return {
    litros: nodos.length === 0 || vistosLitros > 0 ? litros * dias : null,
    masaMg: nodos.length === 0 || vistosMasa > 0 ? masaMg * dias : null,
    omitidos,
  };
}

/**
 * Texto compacto al estilo «4 L | 1140.4 mg». Vacío = «—».
 *
 * @param litros - Reserva o proyección en litros.
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
