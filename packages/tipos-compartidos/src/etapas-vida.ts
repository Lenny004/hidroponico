/**
 * Etapas de vida de un cultivo en el sistema (trazabilidad por nodo).
 * No forma parte de las variables de minerales; no entra en la agregación de grupos.
 */
export const ETAPAS_VIDA = [
  "germinacion",
  "plantula",
  "vegetativo",
  "floracion",
  "cosecha",
] as const;

export type EtapaVida = (typeof ETAPAS_VIDA)[number];

export type FamiliaCultivo = "hoja" | "aroma" | "fruto";

export const ETIQUETAS_ETAPA_VIDA: Record<EtapaVida, string> = {
  germinacion: "Germinación",
  plantula: "Plántula",
  vegetativo: "Vegetativo",
  floracion: "Floración",
  cosecha: "Cosecha",
};

export const ETIQUETAS_FAMILIA: Record<FamiliaCultivo, string> = {
  hoja: "Hoja",
  aroma: "Hierba",
  fruto: "Fruto",
};

export interface EtapaProceso {
  id: EtapaVida;
  dias_desde: number;
  dias_hasta: number;
}

/**
 * Datos informativos del ciclo (catálogo). No sustituyen la receta mg/L × L.
 */
export interface ProcesoCultivo {
  familia: FamiliaCultivo;
  sistema: string;
  dias_cosecha: number;
  resumen: string;
  etapas: EtapaProceso[];
}

const FRACCIONES_HOJA: Array<{ id: EtapaVida; desde: number; hasta: number }> = [
  { id: "germinacion", desde: 0, hasta: 0.12 },
  { id: "plantula", desde: 0.12, hasta: 0.3 },
  { id: "vegetativo", desde: 0.3, hasta: 0.8 },
  { id: "cosecha", desde: 0.8, hasta: 1 },
];

const FRACCIONES_FRUTO: Array<{ id: EtapaVida; desde: number; hasta: number }> = [
  { id: "germinacion", desde: 0, hasta: 0.1 },
  { id: "plantula", desde: 0.1, hasta: 0.25 },
  { id: "vegetativo", desde: 0.25, hasta: 0.5 },
  { id: "floracion", desde: 0.5, hasta: 0.8 },
  { id: "cosecha", desde: 0.8, hasta: 1 },
];

function etapasDesdeFracciones(
  fracciones: Array<{ id: EtapaVida; desde: number; hasta: number }>,
  diasCosecha: number,
): EtapaProceso[] {
  return fracciones.map((tramo, indice) => {
    const esUltima = indice === fracciones.length - 1;
    return {
      id: tramo.id,
      dias_desde: Math.round(tramo.desde * diasCosecha),
      dias_hasta: esUltima ? diasCosecha : Math.round(tramo.hasta * diasCosecha),
    };
  });
}

function sistemaPorFamilia(familia: FamiliaCultivo): string {
  if (familia === "fruto") {
    return "NFT fruto";
  }
  if (familia === "aroma") {
    return "NFT hierba";
  }
  return "NFT hoja";
}

/**
 * Construye el proceso típico de un cultivo a partir de familia y días a cosecha.
 * Hoja y hierba no incluyen floración; el fruto sí.
 *
 * @param familia - Tipo de receta / hábito de cosecha.
 * @param dias_cosecha - Días típicos desde el alta en el tanque hasta cosecha.
 * @param resumen - Texto informativo del manejo NFT.
 */
export function construirProceso(
  familia: FamiliaCultivo,
  dias_cosecha: number,
  resumen: string,
): ProcesoCultivo {
  const fracciones = familia === "fruto" ? FRACCIONES_FRUTO : FRACCIONES_HOJA;
  return {
    familia,
    sistema: sistemaPorFamilia(familia),
    dias_cosecha,
    resumen,
    etapas: etapasDesdeFracciones(fracciones, dias_cosecha),
  };
}

/**
 * Acepta `YYYY-MM-DD` o un ISO datetime. Vacío o inválido queda `null`.
 */
export function parsearFechaInicio(valor: string | null | undefined): string | null {
  const recortado = valor?.trim() ?? "";
  if (recortado.length === 0) {
    return null;
  }
  const soloDia = recortado.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(soloDia)) {
    return null;
  }
  const [anio, mes, dia] = soloDia.split("-").map(Number);
  if (!anio || !mes || !dia) {
    return null;
  }
  const fecha = new Date(anio, mes - 1, dia);
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }
  return soloDia;
}

/**
 * Fecha local de hoy en `YYYY-MM-DD` para el alta de un nodo.
 */
export function fechaInicioHoy(ahora = new Date()): string {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/**
 * Días transcurridos desde `iniciado_en` (inclusive el día 0).
 * @returns Entero ≥ 0, o `null` si no hay fecha válida.
 */
export function diasDeVida(
  iniciado_en: string | null | undefined,
  ahora = new Date(),
): number | null {
  const dia = parsearFechaInicio(iniciado_en);
  if (!dia) {
    return null;
  }
  const [anio, mes, numero] = dia.split("-").map(Number);
  const inicio = new Date(anio ?? 0, (mes ?? 1) - 1, numero ?? 1);
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const ms = hoy.getTime() - inicio.getTime();
  if (!Number.isFinite(ms)) {
    return null;
  }
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Etapa del catálogo que corresponde a los días de vida.
 * Si se pasa de `dias_cosecha`, queda en `cosecha`.
 * @returns Etapa, o `null` si no hay proceso o los días son `null`.
 */
export function etapaSugeridaPorDias(
  proceso: ProcesoCultivo | null | undefined,
  dias: number | null,
): EtapaVida | null {
  if (!proceso || dias == null || !Number.isFinite(dias)) {
    return null;
  }
  const ordenadas = [...proceso.etapas].sort((a, b) => a.dias_desde - b.dias_desde);
  let encontrada: EtapaVida | null = ordenadas[0]?.id ?? null;
  for (const etapa of ordenadas) {
    if (dias >= etapa.dias_desde) {
      encontrada = etapa.id;
    }
  }
  return encontrada;
}

/**
 * Progreso hacia la cosecha típica (0–1). Días nulos → `null`. Por encima del ciclo → 1.
 */
export function progresoCosecha(
  proceso: ProcesoCultivo | null | undefined,
  dias: number | null,
): number | null {
  if (!proceso || dias == null || proceso.dias_cosecha <= 0) {
    return null;
  }
  return Math.min(1, Math.max(0, dias / proceso.dias_cosecha));
}

/**
 * Lista blanca de etapas. Texto desconocido o vacío → `null`.
 */
export function parsearEtapaVida(valor: string | null | undefined): EtapaVida | null {
  const recortado = valor?.trim() ?? "";
  return (ETAPAS_VIDA as readonly string[]).includes(recortado)
    ? (recortado as EtapaVida)
    : null;
}
