import {
  ETIQUETAS_FAMILIA,
  GRUPOS_NUTRIENTE,
  SIMBOLOS_NUTRIENTE,
  ETIQUETAS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
  formatearMedida,
  fichasPlagasDeNodo,
  guiaDeCultivo,
  obtenerCultivoPorId,
  obtenerFichaNutricional,
  porcentajesPorcionCatalogo,
  type ClaveNutriente,
} from "@hidroponico/tipos-compartidos";
import { Download, ExternalLink } from "lucide-react";
import GlifoCultivo from "../iconos/GlifoCultivo";
import PanelSeleccion from "./PanelSeleccion";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { exportarFichaWord } from "../util/exportar-ficha-word";

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
  const guia = tipo ? guiaDeCultivo(tipo) : null;
  const ficha = tipo ? obtenerFichaNutricional(tipo) : null;
  const porcentajes = tipo ? porcentajesPorcionCatalogo(tipo) : null;
  const setMensajeEstado = usarGrafoConstruccion((estado) => estado.setMensajeEstado);
  const fichasSanitarias = nodo ? fichasPlagasDeNodo(nodo.data.cultivo.plagas) : [];

  const exportar = () => {
    if (!nodo || !definicion || !guia) {
      return;
    }
    setMensajeEstado("Generando ficha de Word…");
    void exportarFichaWord({
      cultivo: nodo.data.cultivo,
      definicion,
      guia,
      ficha,
      registrosSanitarios: nodo.data.cultivo.plagas ?? [],
    })
      .then(() => setMensajeEstado("Ficha de Word descargada."))
      .catch(() => setMensajeEstado("No se pudo generar la ficha de Word."));
  };

  return (
    <aside className="panel-trazabilidad" aria-label="Trazabilidad e información del cultivo">
      <header className="panel-trazabilidad__cabecera">
        {definicion ? (
          <div className="panel-trazabilidad__titulo-fila">
            <GlifoCultivo tipoCultivo={definicion.id} color={definicion.color} tamano="ficha" />
            <div>
              <h2 className="panel-trazabilidad__nombre">{definicion.nombre}</h2>
              {ficha ? <p className="panel-trazabilidad__cientifico">{ficha.nombre_cientifico}</p> : null}
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

      {nodo && definicion ? (
        <div className="panel-trazabilidad__seleccion" role="status">
          <span className="panel-trazabilidad__punto" aria-hidden />
          Nodo activo: {definicion.nombre}
        </div>
      ) : null}

      {definicion && guia ? (
        <>
          {ficha ? <p className="panel-trazabilidad__resumen">{ficha.resumen}</p> : null}
          <details className="seccion-plegable" open>
            <summary>Requerimientos de cultivo</summary>
            <div className="panel-trazabilidad__acordeon">
              <p><strong>Luz:</strong> {guia.luz}</p>
              <p><strong>Agua:</strong> {guia.agua}</p>
            </div>
          </details>
          <details className="seccion-plegable" open={fichasSanitarias.length > 0}>
            <summary>Diagnóstico y sanidad{fichasSanitarias.length ? ` · ${fichasSanitarias.length}` : ""}</summary>
            <div className="panel-trazabilidad__acordeon">
              <p>{guia.diagnostico}</p>
              {fichasSanitarias.length === 0 ? (
                <p className="panel-trazabilidad__vacio">No hay plagas ni enfermedades registradas en este nodo.</p>
              ) : fichasSanitarias.map((item) => (
                <article key={item.id} className="panel-trazabilidad__diagnostico">
                  <p><strong>{item.nombre}</strong> <span className="panel-trazabilidad__tipo">{item.tipo}</span></p>
                  <p><strong>Síntomas:</strong> {item.sintomas}</p>
                  <p><strong>Posible causa:</strong> {item.causa}</p>
                  <p><strong>Acción inicial:</strong> {item.solucion_plagas}</p>
                </article>
              ))}
              <p className="panel-trazabilidad__aviso">Información orientativa; confirme el diagnóstico antes de aplicar un tratamiento.</p>
            </div>
          </details>
          {ficha && porcentajes ? (
            <details className="seccion-plegable">
              <summary>Perfil nutricional</summary>
              <article className="ficha-herbazest">
                <p className="ficha-herbazest__subtitulo">Porción {ficha.porcion_g} g · {formatearMedida(ficha.por_100g.energia_kcal * (ficha.porcion_g / 100), "kcal")} · % valor diario</p>
                <p className="ficha-herbazest__grupo">Minerales</p>
                <FilasNutriente claves={GRUPOS_NUTRIENTE.minerales} porcentajes={porcentajes} por100g={ficha.por_100g} />
                <p className="ficha-herbazest__grupo">Vitaminas</p>
                <FilasNutriente claves={GRUPOS_NUTRIENTE.vitaminas} porcentajes={porcentajes} por100g={ficha.por_100g} />
                <a className="panel-trazabilidad__enlace" href={ficha.url_herbazest} target="_blank" rel="noreferrer" title={ficha.fuente_nutricion}>Perfil en HerbaZest <ExternalLink className="panel-trazabilidad__enlace-icono" aria-hidden /></a>
              </article>
            </details>
          ) : null}
        </>
      ) : null}

      {nodo ? (
        <>
          <button type="button" className="boton-secundario panel-trazabilidad__word" onClick={exportar}>
            <Download strokeWidth={2.1} aria-hidden /> Exportar ficha a Word
          </button>
          <details className="seccion-plegable" open>
          <summary>Editar cultivo</summary>
          <PanelSeleccion />
          </details>
        </>
      ) : null}
    </aside>
  );
}
