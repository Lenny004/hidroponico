import {
  ETIQUETAS_FAMILIA,
  ETIQUETAS_NUTRIENTE,
  GRUPOS_NUTRIENTE,
  SIMBOLOS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
  fichaHoverDesdeCatalogo,
  fichaHoverDesdeNodo,
  formatearMedida,
  obtenerCultivoPorId,
  obtenerFichaNutricional,
  porcentajesPorcionCatalogo,
  type ClaveNutriente,
} from "@hidroponico/tipos-compartidos";
import { ExternalLink } from "lucide-react";
import GlifoCultivo from "../iconos/GlifoCultivo";
import PanelSeleccion from "./PanelSeleccion";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function textoPct(valor: number | null | undefined): string {
  if (valor == null) {
    return "—";
  }
  const redondeado = Math.round(valor * 10) / 10;
  return `${redondeado} % VD`;
}

function anchoBarra(valor: number | null | undefined): number {
  if (valor == null) {
    return 0;
  }
  return Math.min(100, Math.max(0, valor));
}

function FilasNutriente({
  claves,
  porcentajes,
  por100g,
}: {
  claves: readonly ClaveNutriente[];
  porcentajes: Partial<Record<ClaveNutriente, number | null>> | null;
  por100g?: Partial<Record<ClaveNutriente, number>>;
}) {
  return (
    <ul className="ficha-herbazest__lista">
      {claves.map((clave) => {
        const pct = porcentajes?.[clave] ?? null;
        const crudo = por100g?.[clave];
        return (
          <li key={clave} className="ficha-herbazest__fila">
            <div className="ficha-herbazest__fila-texto">
              <span>
                <strong>{SIMBOLOS_NUTRIENTE[clave]}</strong> {ETIQUETAS_NUTRIENTE[clave]}
              </span>
              <span>
                {crudo != null ? `${formatearMedida(crudo, UNIDAD_NUTRIENTE[clave])} /100 g · ` : ""}
                {textoPct(pct)}
              </span>
            </div>
            <div className="ficha-herbazest__pista" aria-hidden>
              <div
                className="ficha-herbazest__relleno"
                style={{ width: `${anchoBarra(pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function PanelTrazabilidad() {
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const tipoCatalogoActivo = usarGrafoConstruccion((estado) => estado.tipoCatalogoActivo);
  const nodo = nodos.find((item) => item.id === idSeleccionado);
  const tipo = nodo?.data.cultivo.tipoCultivo ?? tipoCatalogoActivo;
  const definicion = tipo ? obtenerCultivoPorId(tipo) : null;
  const ficha = tipo ? obtenerFichaNutricional(tipo) : null;
  const porcentajes = tipo ? porcentajesPorcionCatalogo(tipo) : null;
  const hover = nodo
    ? fichaHoverDesdeNodo(nodo.data.cultivo)
    : tipo
      ? fichaHoverDesdeCatalogo(tipo)
      : null;

  return (
    <aside className="panel-trazabilidad" aria-label="Trazabilidad e información del cultivo">
      <header className="panel-trazabilidad__cabecera">
        <p className="panel-trazabilidad__kicker">Información de HerbaZest</p>
        {definicion && ficha ? (
          <div className="panel-trazabilidad__titulo-fila">
            <GlifoCultivo tipoCultivo={definicion.id} color={definicion.color} tamano="ficha" />
            <div>
              <h2 className="panel-trazabilidad__nombre">{definicion.nombre}</h2>
              <p className="panel-trazabilidad__cientifico">{ficha.nombre_cientifico}</p>
              <p className="panel-trazabilidad__meta">
                {ETIQUETAS_FAMILIA[definicion.familia]}
                {hover?.dias_cosecha != null ? ` · ${hover.dias_cosecha} d` : ""}
                {hover?.reposicionDiaL != null ? ` · ${hover.reposicionDiaL} L/d` : ""}
              </p>
            </div>
          </div>
        ) : (
          <p className="panel-trazabilidad__vacio">
            Selecciona un cultivo del catálogo o de un orificio: se carga su trazabilidad y el
            perfil nutricional (porcentajes para factibilidad).
          </p>
        )}
      </header>

      {definicion && ficha && porcentajes ? (
        <>
          <p className="panel-trazabilidad__resumen">{ficha.resumen}</p>
          <a
            className="panel-trazabilidad__enlace"
            href={ficha.url_herbazest}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil botánico en HerbaZest
            <ExternalLink className="panel-trazabilidad__enlace-icono" aria-hidden />
          </a>
          <p className="panel-trazabilidad__fuente">{ficha.fuente_nutricion}</p>

          <article className="ficha-herbazest">
            <h3 className="ficha-herbazest__titulo">Minerales</h3>
            <p className="ficha-herbazest__ayuda">
              En el tanque: mg/L de la receta. En la ficha: mg/100 g comestibles y % del valor
              diario de un adulto (FDA).
            </p>
            {hover ? (
              <ul className="ficha-herbazest__chips">
                {hover.minerales.map((mineral) => (
                  <li key={mineral.clave}>
                    {mineral.simbolo}{" "}
                    {mineral.concentracion == null
                      ? "—"
                      : formatearMedida(mineral.concentracion, "mg/L")}
                  </li>
                ))}
              </ul>
            ) : null}
            <FilasNutriente
              claves={GRUPOS_NUTRIENTE.minerales}
              porcentajes={porcentajes}
              por100g={ficha.por_100g}
            />
          </article>

          <article className="ficha-herbazest">
            <h3 className="ficha-herbazest__titulo">Vitaminas</h3>
            <p className="ficha-herbazest__ayuda">
              Porcentajes de la porción típica ({ficha.porcion_g} g) para factibilidad alimentaria.
              No entran al pipeline.
            </p>
            <FilasNutriente
              claves={GRUPOS_NUTRIENTE.vitaminas}
              porcentajes={porcentajes}
              por100g={ficha.por_100g}
            />
          </article>

          <article className="ficha-herbazest">
            <h3 className="ficha-herbazest__titulo">Minerales básicos de energía</h3>
            <p className="ficha-herbazest__ayuda">
              K, Mg y Fe: electrolitos y transporte de oxígeno. Energía de la porción:{" "}
              {formatearMedida(ficha.por_100g.energia_kcal * (ficha.porcion_g / 100), "kcal")}.
            </p>
            <FilasNutriente
              claves={GRUPOS_NUTRIENTE.minerales_energia}
              porcentajes={porcentajes}
              por100g={ficha.por_100g}
            />
          </article>
        </>
      ) : null}

      <PanelSeleccion />
    </aside>
  );
}
