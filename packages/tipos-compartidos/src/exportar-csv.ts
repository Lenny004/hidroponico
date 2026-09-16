import { avisoBandaOxigeno } from "./banda-oxigeno";
import { obtenerCultivoPorId } from "./catalogo-cultivos";
import {
  caudalNftDeReserva,
  contrastarReservaConDeposito,
  volumenDeposito,
  type DepositoInstalacion,
} from "./deposito";
import { ETIQUETAS_ETAPA_VIDA } from "./etapas-vida";
import { formatearMedida } from "./etiquetas-variables";
import type { NodoCultivo } from "./nodo-cultivo";
import { avisoMasaElemental } from "./puerta-sales";
import { proyectarInsumos } from "./proyeccion-insumos";
import { resumenTrazabilidad } from "./resumen-trazabilidad";

function celda(valor: string | number | null | undefined): string {
  if (valor == null || valor === "") {
    return "";
  }
  const texto = String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

function linea(valores: Array<string | number | null | undefined>): string {
  return valores.map(celda).join(",");
}

/**
 * CSV del plan: cultivos, proyección, depósito vs reserva y caudal NFT.
 * Unidades L y mg/L. No incluye gramos de sales.
 */
export function csvPlanificacion(params: {
  nodos: NodoCultivo[];
  deposito: DepositoInstalacion;
}): string {
  const { nodos, deposito } = params;
  const insumos = proyectarInsumos(nodos, 1);
  const volumen = volumenDeposito(deposito);
  const contraste = contrastarReservaConDeposito(insumos.reservaL, volumen.netoL);
  const caudal = caudalNftDeReserva(insumos.reservaL, deposito);

  const lineas: string[] = [
    "# Hidropónico — plan de instalación",
    `# ${avisoMasaElemental()}`,
    linea(["seccion", "campo", "valor", "unidad"]),
    linea(["proyeccion", "reserva_L", insumos.reservaL, "L"]),
    linea(["proyeccion", "reposicion_dia_L", insumos.reposicionL, "L"]),
    linea(["proyeccion", "masa_tanque", insumos.masaTanqueMg, "mg"]),
    linea(["deposito", "forma", deposito.forma, ""]),
    linea(["deposito", "bruto_L", volumen.brutoL, "L"]),
    linea(["deposito", "neto_L", volumen.netoL, "L"]),
    linea(["deposito", "estado_vs_reserva", contraste.estado, ""]),
    linea(["caudal", "recirculaciones_h", caudal.recirculaciones_h, "1/h"]),
    linea(["caudal", "entregado_Lph", caudal.entregado_Lph, "L/h"]),
    linea(["caudal", "objetivo_etiqueta_Lph", caudal.etiqueta_Lph, "L/h"]),
    "",
    linea([
      "id",
      "tipo",
      "etapa",
      "Mg_mg_L",
      "K_mg_L",
      "Mn_mg_L",
      "Fe_mg_L",
      "O2_mg_L",
      "aviso_O2",
      "cantidad_sol_L",
      "plagas",
    ]),
  ];

  for (const nodo of nodos) {
    const tipo = obtenerCultivoPorId(nodo.tipoCultivo)?.nombre ?? nodo.tipoCultivo;
    const vida = resumenTrazabilidad(nodo);
    const etapa = vida.etapa ? ETIQUETAS_ETAPA_VIDA[vida.etapa] : "";
    const o2 = nodo.variables.oxigeno ?? null;
    lineas.push(
      linea([
        nodo.id,
        tipo,
        etapa,
        nodo.variables.mineral_magnesio ?? null,
        nodo.variables.mineral_potasio ?? null,
        nodo.variables.mineral_manganeso ?? null,
        nodo.variables.mineral_hierro ?? null,
        o2,
        avisoBandaOxigeno(o2) ?? "",
        nodo.variables.cantidad_sol ?? null,
        (nodo.plagas ?? []).join("; "),
      ]),
    );
  }

  return `${lineas.join("\n")}\n`;
}

export function nombreArchivoCsv(ahora = new Date()): string {
  const iso = ahora.toISOString().slice(0, 10);
  return `hidroponico-plan-${iso}.csv`;
}

export function formatearHolgura(holguraL: number | null): string {
  if (holguraL == null) {
    return "—";
  }
  if (holguraL < 0) {
    return `${formatearMedida(-holguraL, "L")} de más respecto al neto`;
  }
  return `${formatearMedida(holguraL, "L")} de holgura`;
}
