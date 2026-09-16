import { obtenerCultivoPorId, reposicionDiaDe } from "./catalogo-cultivos";
import {
  ETIQUETAS_ETAPA_VIDA,
  type EtapaVida,
  type EtapaProceso,
} from "./etapas-vida";
import { CLAVES_MINERALES, type ClaveMineral, type NodoCultivo } from "./nodo-cultivo";
import {
  masaMineralEnVolumen,
  masaMineralesNodo,
  masaReposicionNodo,
} from "./proyeccion-insumos";
import { resumenTrazabilidad } from "./resumen-trazabilidad";

/**
 * Horizonte de 1 día para la reposición de agua. El tanque NFT recircula;
 * no se vacía cada día.
 */
export const DIAS_RECAMBIO_DIARIO = 1;

export interface ConsumoMineralNodo {
  clave: ClaveMineral;
  concentracionMgL: number | null;
  /** Masa disuelta en la reserva del tanque. */
  masaRecambioMg: number | null;
  /** Sales en el agua de reposición de un día. */
  masaReposicionMg: number | null;
}

export interface ConsumoEtapaNodo {
  id: EtapaVida;
  etiqueta: string;
  dias_desde: number;
  dias_hasta: number;
  duracionDias: number;
  reposicionEtapaL: number | null;
  masaEtapaMg: number | null;
  actual: boolean;
}

export interface ConsumoTemporalNodo {
  id: string;
  tipoCultivo: string;
  nombre: string;
  color: string;
  litros: number | null;
  reposicionDiaL: number | null;
  dias: number | null;
  dias_cosecha: number | null;
  dias_restantes: number | null;
  etapa: EtapaVida | null;
  minerales: ConsumoMineralNodo[];
  masaTanqueMg: number | null;
  masaReposicionMg: number | null;
  masaDiaMg: number | null;
  masaHastaCosechaMg: number | null;
  reposicionHastaCosechaL: number | null;
  etapas: ConsumoEtapaNodo[];
}

export interface ConsumoTemporalGrupo {
  idsNodos: string[];
  litros: number | null;
  reposicionDiaL: number | null;
  masaTanqueMg: number | null;
  masaReposicionMg: number | null;
  masaDiaMg: number | null;
  minerales: ConsumoMineralNodo[];
  omitidos: number;
}

function duracionEtapa(etapa: EtapaProceso): number {
  return Math.max(0, etapa.dias_hasta - etapa.dias_desde);
}

/**
 * Días que faltan para la cosecha típica. Sin fecha o sin ciclo → `null`.
 * Si ya se pasó, queda 0 (la reposición sigue mientras el cultivo esté plantado).
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
 * Masa de un mineral en la reserva del nodo: mg/L × L de tanque.
 * Falta concentración o litros → `null`.
 *
 * @param nodo - Cultivo plantado.
 * @param clave - Mineral del boceto.
 */
export function masaMineralRecambio(
  nodo: NodoCultivo,
  clave: ClaveMineral,
): number | null {
  return masaMineralEnVolumen(nodo, clave, nodo.variables.cantidad_sol ?? null);
}

/**
 * Consumo por tiempo de un nodo: reserva del tanque, reposición diaria y
 * sales en el agua añadida. Un `null` local no se convierte en 0.
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
  const reposicionDiaL = reposicionDiaDe(nodo.tipoCultivo);
  const masaTanqueMg = masaMineralesNodo(nodo);
  const masaReposicionMg = masaReposicionNodo(nodo);
  const dias_cosecha = definicion?.proceso.dias_cosecha ?? null;
  const restantes = diasRestantesCosecha(vida.dias, dias_cosecha);
  const minerales = CLAVES_MINERALES.map((clave) => ({
    clave,
    concentracionMgL: nodo.variables[clave] ?? null,
    masaRecambioMg: masaMineralRecambio(nodo, clave),
    masaReposicionMg: masaMineralEnVolumen(nodo, clave, reposicionDiaL),
  }));

  const etapas: ConsumoEtapaNodo[] = (vida.proceso?.etapas ?? []).map((etapa) => {
    const duracionDias = duracionEtapa(etapa);
    return {
      id: etapa.id,
      etiqueta: ETIQUETAS_ETAPA_VIDA[etapa.id],
      dias_desde: etapa.dias_desde,
      dias_hasta: etapa.dias_hasta,
      duracionDias,
      reposicionEtapaL:
        reposicionDiaL == null ? null : reposicionDiaL * duracionDias,
      masaEtapaMg:
        masaReposicionMg == null ? null : masaReposicionMg * duracionDias,
      actual: vida.etapa === etapa.id,
    };
  });

  return {
    id: nodo.id,
    tipoCultivo: nodo.tipoCultivo,
    nombre: definicion?.nombre ?? nodo.tipoCultivo,
    color: definicion?.color ?? "#93a4c3",
    litros,
    reposicionDiaL,
    dias: vida.dias,
    dias_cosecha,
    dias_restantes: restantes,
    etapa: vida.etapa,
    minerales,
    masaTanqueMg,
    masaReposicionMg,
    masaDiaMg: masaReposicionMg,
    masaHastaCosechaMg:
      masaReposicionMg == null || restantes == null
        ? null
        : masaReposicionMg * restantes,
    reposicionHastaCosechaL:
      reposicionDiaL == null || restantes == null ? null : reposicionDiaL * restantes,
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
 * Total del tubo (o del grupo al unirse): reserva + reposición de cada planta.
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
      reposicionDiaL: 0,
      masaTanqueMg: 0,
      masaReposicionMg: 0,
      masaDiaMg: 0,
      minerales: CLAVES_MINERALES.map((clave) => ({
        clave,
        concentracionMgL: null,
        masaRecambioMg: 0,
        masaReposicionMg: 0,
      })),
      omitidos: 0,
    };
  }

  let omitidos = 0;
  const litrosNodo: Array<number | null> = [];
  const reposicionNodo: Array<number | null> = [];
  const masaTanqueNodo: Array<number | null> = [];
  const masaReposicionGrupo: Array<number | null> = [];
  const masasTanquePorMineral: Record<ClaveMineral, Array<number | null>> = {
    mineral_magnesio: [],
    mineral_potasio: [],
    mineral_manganeso: [],
    mineral_hierro: [],
  };
  const masasReposicionPorMineral: Record<ClaveMineral, Array<number | null>> = {
    mineral_magnesio: [],
    mineral_potasio: [],
    mineral_manganeso: [],
    mineral_hierro: [],
  };

  for (const nodo of nodos) {
    const litros = nodo.variables.cantidad_sol ?? null;
    const reposicion = reposicionDiaDe(nodo.tipoCultivo);
    const masaTanque = masaMineralesNodo(nodo);
    const masaReposicion = masaReposicionNodo(nodo);
    litrosNodo.push(litros);
    reposicionNodo.push(reposicion);
    masaTanqueNodo.push(masaTanque);
    masaReposicionGrupo.push(masaReposicion);
    if (litros == null || masaTanque == null || reposicion == null || masaReposicion == null) {
      omitidos += 1;
    }
    for (const clave of CLAVES_MINERALES) {
      masasTanquePorMineral[clave].push(masaMineralRecambio(nodo, clave));
      masasReposicionPorMineral[clave].push(
        masaMineralEnVolumen(nodo, clave, reposicion),
      );
    }
  }

  const sumaLitros = sumarONull(litrosNodo);
  const sumaReposicion = sumarONull(reposicionNodo);
  const sumaMasaTanque = sumarONull(masaTanqueNodo);
  const sumaMasaReposicion = sumarONull(masaReposicionGrupo);

  return {
    idsNodos,
    litros: sumaLitros.vistos > 0 ? sumaLitros.total : null,
    reposicionDiaL: sumaReposicion.vistos > 0 ? sumaReposicion.total : null,
    masaTanqueMg: sumaMasaTanque.vistos > 0 ? sumaMasaTanque.total : null,
    masaReposicionMg: sumaMasaReposicion.vistos > 0 ? sumaMasaReposicion.total : null,
    masaDiaMg: sumaMasaReposicion.vistos > 0 ? sumaMasaReposicion.total : null,
    minerales: CLAVES_MINERALES.map((clave) => {
      const tanque = sumarONull(masasTanquePorMineral[clave]);
      const reposicion = sumarONull(masasReposicionPorMineral[clave]);
      return {
        clave,
        concentracionMgL: null,
        masaRecambioMg: tanque.vistos > 0 ? tanque.total : null,
        masaReposicionMg: reposicion.vistos > 0 ? reposicion.total : null,
      };
    }),
    omitidos,
  };
}
