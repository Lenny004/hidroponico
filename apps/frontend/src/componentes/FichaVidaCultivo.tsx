import {
  ETAPAS_VIDA,
  ETIQUETAS_ETAPA_VIDA,
  fechaInicioHoy,
  obtenerCultivoPorId,
  resumenTrazabilidad,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";

export default function FichaVidaCultivo({
  cultivo,
  onCambiarEtapa,
  onCambiarInicio,
}: {
  cultivo: NodoCultivo;
  onCambiarEtapa: (etapa: string | null) => void;
  onCambiarInicio: (fecha: string | null) => void;
}) {
  const definicion = obtenerCultivoPorId(cultivo.tipoCultivo);
  const vida = resumenTrazabilidad(cultivo);
  if (!definicion || !vida.proceso) {
    return null;
  }

  const pct = vida.progreso == null ? null : Math.round(vida.progreso * 100);
  const etapaSelect = cultivo.etapa_vida ?? "";

  return (
    <section className="ficha-vida">
      <fieldset className="grupo-campos">
        <legend className="grupo-campos__titulo">Ciclo</legend>
        <p className="ficha-vida__ayuda">{vida.proceso.sistema}</p>
        {vida.dias != null ? (
          <p className="ficha-vida__dato">
            Día {vida.dias} de {vida.proceso.dias_cosecha}
            {vida.etapa ? ` · ${ETIQUETAS_ETAPA_VIDA[vida.etapa]}` : ""}
            {pct != null ? ` · ${pct}%` : ""}
          </p>
        ) : (
          <p className="ficha-vida__dato ficha-vida__dato--vacio">
            Sin fecha de alta: el ciclo no avanza.
          </p>
        )}
        {pct != null ? (
          <div className="progreso">
            <div
              className="progreso__barra"
              style={{ width: `${pct}%`, backgroundColor: definicion.color }}
            />
          </div>
        ) : null}
        <label className="campo">
          <span>Etapa</span>
          <select
            value={etapaSelect}
            onChange={(evento) => onCambiarEtapa(evento.target.value || null)}
            className="campo__control"
          >
            <option value="">
              Automática
              {vida.etapaSugerida
                ? ` (${ETIQUETAS_ETAPA_VIDA[vida.etapaSugerida]})`
                : ""}
            </option>
            {ETAPAS_VIDA.map((etapa) => (
              <option key={etapa} value={etapa}>
                {ETIQUETAS_ETAPA_VIDA[etapa]}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Fecha de alta</span>
          <div className="campo__fila">
            <input
              type="date"
              value={cultivo.iniciado_en ?? ""}
              onChange={(evento) => onCambiarInicio(evento.target.value || null)}
              className="campo__control"
            />
            <button
              type="button"
              onClick={() => onCambiarInicio(fechaInicioHoy())}
              className="boton-secundario boton-secundario--compacto"
            >
              Hoy
            </button>
          </div>
        </label>
        <details className="ficha-vida__calendario">
          <summary>Calendario del ciclo</summary>
          <ol className="ficha-vida__etapas">
          {vida.proceso.etapas.map((etapa) => {
            const activa = vida.etapa === etapa.id;
            return (
              <li
                key={etapa.id}
                className={
                  activa
                    ? "ficha-vida__etapa ficha-vida__etapa--actual"
                    : "ficha-vida__etapa"
                }
              >
                {ETIQUETAS_ETAPA_VIDA[etapa.id]} · d {etapa.dias_desde}–{etapa.dias_hasta}
              </li>
            );
          })}
          </ol>
        </details>
      </fieldset>

      {vida.proceso.resumen ? (
        <p className="ficha-vida__resumen">{vida.proceso.resumen}</p>
      ) : null}
    </section>
  );
}
