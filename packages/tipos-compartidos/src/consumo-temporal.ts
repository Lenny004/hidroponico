import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  ETIQUETAS_ETAPA_VIDA,
  type EtapaVida,
  type EtapaProceso,
} from "./etapas-vida";
import { CLAVES_MINERALES, type ClaveMineral, type NodoCultivo } from "./nodo-cultivo";
import { masaMineralesNodo } from "./proyeccion-insumos";
import { resumenTrazabilidad } from "./resumen-trazabilidad";

/**
 * Recambio diario de la reserva NFT: se limpia el agua y se reponen los minerales
 * a la concentración del nodo (mg = mg/L × L). No es absorción de la planta ni sales.
 */
export const DIAS_RECAMBIO_DIARIO = 1;

export interface ConsumoMineralNodo {
  clave: ClaveMineral;
  concentracionMgL: number | null;
  masaRecambioMg: number | null;
}

export interface ConsumoEtapaNodo {
  id: EtapaVida;
  etiqueta: string;
  dias_desde: number;
  dias_hasta: number;
  duracionDias: number;
  masaEtapaMg: number | null;
  actual: boolean;
}

export interface ConsumoTemporalNodo {
  id: string;
  tipoCultivo: string;
  nombre: string;
  color: string;
  litros: number | null;
  dias: number | null;
  dias_cosecha: number | null;
  dias_restantes: number | null;
  etapa: EtapaVida | null;
  minerales: ConsumoMineralNodo[];
  masaDiaMg: number | null;
  masaHastaCosechaMg: number | null;
  etapas: ConsumoEtapaNodo[];
}

export interface ConsumoTemporalGrupo {
  idsNodos: string[];
  litros: number | null;
  masaDiaMg: number | null;
  minerales: ConsumoMineralNodo[];
  omitidos: number;
}

function masaDe(concentracion: number | null | undefined, litros: number | null): number | null {
  if (concentracion == null || litros == null) {
    return null;
  }
  return concentracion * litros;
}

function duracionEtapa(etapa: EtapaProceso): number {
  return Math.max(0, etapa.dias_hasta - etapa.dias_desde);
}

/**
 * Días que faltan para la cosecha típica. Sin fecha o sin ciclo → `null`.
 * Si ya se pasó, queda 0 (el recambio diario sigue mientras el cultivo esté plantado).
 *
 * @param dias - Días de vida, o `null`.
 * @param dias_cosecha - Ciclo del catálogo, o `null`.
 */
export function diasRestantesCosecha(
  dias: number | null,
  dias_cosecha: number | null,
): number | null {
  if (dias == null || dias_cosecha == null) {
    return null;
  }
  return Math.max(0, dias_cosecha - dias);
}

/**
 * Masa de un mineral en un recambio de la reserva del nodo: mg/L × L.
 * Falta concentración o litros → `null`.
 *
 * @param nodo - Cultivo plantado.
 * @param clave - Mineral del boceto.
 */
export function masaMineralRecambio(
  nodo: NodoCultivo,
  clave: ClaveMineral,
): number | null {
  return masaDe(nodo.variables[clave] ?? null, nodo.variables.cantidad_sol ?? null);
}

/**
 * Consumo por tiempo de un nodo: medición (mg/L × L), duración de cada etapa y
 * recambio diario hasta la cosecha típica. Un `null` local no se convierte en 0.
 *
 * @param nodo - Cultivo del grafo.
 * @param ahora - Reloj inyectable para pruebas.
 */
export function consumoTemporalNodo(
  nodo: NodoCultivo,
  ahora = new Date(),
): ConsumoTemporalNodo {
  const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
  const vida = resumenTrazabilidad(nodo, ahora);
  const litros = nodo.variables.cantidad_sol ?? null;
  const masaDiaMg = masaMineralesNodo(nodo);
  const dias_cosecha = definicion?.proceso.dias_cosecha ?? null;
  const restantes = diasRestantesCosecha(vida.dias, dias_cosecha);
  const minerales = CLAVES_MINERALES.map((clave) => ({
    clave,
    concentracionMgL: nodo.variables[clave] ?? null,
    masaRecambioMg: masaMineralRecambio(nodo, clave),
  }));

  const etapas: ConsumoEtapaNodo[] = (vida.proceso?.etapas ?? []).map((etapa) => {
    const duracionDias = duracionEtapa(etapa);
    return {
      id: etapa.id,
      etiqueta: ETIQUETAS_ETAPA_VIDA[etapa.id],
      dias_desde: etapa.dias_desde,
      dias_hasta: etapa.dias_hasta,
      duracionDias,
      masaEtapaMg: masaDiaMg == null ? null : masaDiaMg * duracionDias,
      actual: vida.etapa === etapa.id,
    };
  });

  return {
    id: nodo.id,
    tipoCultivo: nodo.tipoCultivo,
    nombre: definicion?.nombre ?? nodo.tipoCultivo,
    color: definicion?.color ?? "#93a4c3",
    litros,
    dias: vida.dias,
    dias_cosecha,
    dias_restantes: restantes,
    etapa: vida.etapa,
    minerales,
    masaDiaMg,
    masaHastaCosechaMg:
      masaDiaMg == null || restantes == null ? null : masaDiaMg * restantes,
    etapas,
  };
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
 * Total del tubo (o del grupo al unirse): cada planta aporta su recambio diario.
 * Un nodo incompleto se omite y se cuenta en `omitidos`; no anula a los demás.
 *
 * @param nodos - Cultivos que se acaban de unir al grafo.
 */
export function consumoTemporalGrupo(nodos: NodoCultivo[]): ConsumoTemporalGrupo {
  const idsNodos = nodos.map((nodo) => nodo.id);
  if (nodos.length === 0) {
    return {
      idsNodos,
      litros: 0,
      masaDiaMg: 0,
      minerales: CLAVES_MINERALES.map((clave) => ({
        clave,
        concentracionMgL: null,
        masaRecambioMg: 0,
      })),
      omitidos: 0,
    };
  }

  let omitidos = 0;
  const litrosNodo: Array<number | null> = [];
  const masaNodo: Array<number | null> = [];
  const masasPorMineral: Record<ClaveMineral, Array<number | null>> = {
    mineral_magnesio: [],
    mineral_potasio: [],
    mineral_manganeso: [],
    mineral_hierro: [],
  };

  for (const nodo of nodos) {
    const litros = nodo.variables.cantidad_sol ?? null;
    const masa = masaMineralesNodo(nodo);
    litrosNodo.push(litros);
    masaNodo.push(masa);
    if (litros == null || masa == null) {
      omitidos += 1;
    }
    for (const clave of CLAVES_MINERALES) {
      masasPorMineral[clave].push(masaMineralRecambio(nodo, clave));
    }
  }

  const sumaLitros = sumarONull(litrosNodo);
  const sumaMasa = sumarONull(masaNodo);

  return {
    idsNodos,
    litros: sumaLitros.vistos > 0 ? sumaLitros.total : null,
    masaDiaMg: sumaMasa.vistos > 0 ? sumaMasa.total : null,
    minerales: CLAVES_MINERALES.map((clave) => {
      const suma = sumarONull(masasPorMineral[clave]);
      return {
        clave,
        concentracionMgL: null,
        masaRecambioMg: suma.vistos > 0 ? suma.total : null,
      };
    }),
    omitidos,
  };
}
