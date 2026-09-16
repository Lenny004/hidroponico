import {
  ETIQUETAS_FAMILIA,
  GRUPOS_NUTRIENTE,
  SIMBOLOS_NUTRIENTE,
  ETIQUETAS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
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
  return `${redondeado} %`;
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
        const titulo =
          crudo != null
            ? `${formatearMedida(crudo, UNIDAD_NUTRIENTE[clave])} /100 g`
            : undefined;
        return (
          <li key={clave} className="ficha-herbazest__fila" title={titulo}>
            <div className="ficha-herbazest__fila-texto">
              <span>
                <strong>{SIMBOLOS_NUTRIENTE[clave]}</strong> {ETIQUETAS_NUTRIENTE[clave]}
              </span>
              <span>{textoPct(pct)}</span>
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

  return (
    <aside className="panel-trazabilidad" aria-label="Trazabilidad e información del cultivo">
      <header className="panel-trazabilidad__cabecera">
        {definicion && ficha ? (
          <div className="panel-trazabilidad__titulo-fila">
            <GlifoCultivo tipoCultivo={definicion.id} color={definicion.color} tamano="ficha" />
            <div>
              <h2 className="panel-trazabilidad__nombre">{definicion.nombre}</h2>
              <p className="panel-trazabilidad__cientifico">{ficha.nombre_cientifico}</p>
              <p className="panel-trazabilidad__meta">{ETIQUETAS_FAMILIA[definicion.familia]}</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="panel-trazabilidad__nombre">Ficha del cultivo</h2>
            <p className="panel-trazabilidad__vacio">
              Elige una planta del catálogo o toca un orificio del tubo.
            </p>
          </>
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
            title={ficha.fuente_nutricion}
          >
            Perfil en HerbaZest
            <ExternalLink className="panel-trazabilidad__enlace-icono" aria-hidden />
          </a>

          <article className="ficha-herbazest">
            <h3 className="ficha-herbazest__titulo">Perfil nutricional</h3>
            <p className="ficha-herbazest__subtitulo">
              Porción {ficha.porcion_g} g ·{" "}
              {formatearMedida(
                ficha.por_100g.energia_kcal * (ficha.porcion_g / 100),
                "kcal",
              )}{" "}
              · % valor diario
            </p>
            <p className="ficha-herbazest__grupo">Minerales</p>
            <FilasNutriente
              claves={GRUPOS_NUTRIENTE.minerales}
              porcentajes={porcentajes}
              por100g={ficha.por_100g}
            />
            <p className="ficha-herbazest__grupo">Vitaminas</p>
            <FilasNutriente
              claves={GRUPOS_NUTRIENTE.vitaminas}
              porcentajes={porcentajes}
              por100g={ficha.por_100g}
            />
          </article>
        </>
      ) : null}

      {nodo ? (
        <details className="seccion-plegable" open>
          <summary>Editar cultivo</summary>
          <PanelSeleccion />
        </details>
      ) : null}
    </aside>
  );
}
