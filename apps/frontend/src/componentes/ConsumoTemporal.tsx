import {
  ETIQUETAS_VARIABLES,
  HORIZONTES_PROYECCION,
  SIMBOLOS_MINERAL,
  consumoTemporalGrupo,
  consumoTemporalNodo,
  formatearMedida,
  formatearParInsumos,
  formatearReposicion,
  proyectarInsumos,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

/**
 * Reserva del tanque NFT (recircula) y agua a reponer por transpiración.
 * Masa elemental: mg = mg/L × L. No convierte a sales.
 */
export default function ConsumoTemporal() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const cultivos = nodos.map((nodo) => nodo.data.cultivo);
  const tubo = consumoTemporalGrupo(cultivos);
  const dia = proyectarInsumos(cultivos, 1);
  const seleccionado = cultivos.find((cultivo) => cultivo.id === idSeleccionado);
  const consumoNodo = seleccionado ? consumoTemporalNodo(seleccionado) : null;

  return (
    <section className="proyeccion">
      <p className="proyeccion__titulo">Agua del tubo</p>
      <p className="proyeccion__ayuda">
        El NFT recircula: la reserva se queda en el tanque. Lo que se gasta al día
        es la reposición (transpiración). Las sales del recuadro diario son las del
        agua que se añade, no un vaciado del depósito.
      </p>
      <p className="proyeccion__total">
        Reserva: {formatearParInsumos(tubo.litros, tubo.masaTanqueMg)}
      </p>
      <p className="proyeccion__total proyeccion__total--reposicion">
        Reposición: {formatearReposicion(tubo.reposicionDiaL, tubo.masaReposicionMg)}
      </p>
      {tubo.idsNodos.length > 0 && tubo.minerales.some((item) => item.masaReposicionMg != null) ? (
        <p className="proyeccion__minerales">
          {tubo.minerales.map((item) => (
            <span key={item.clave} className="proyeccion__mineral">
              {SIMBOLOS_MINERAL[item.clave]}{" "}
              {item.masaReposicionMg == null
                ? "—"
                : `${formatearMedida(item.masaReposicionMg, "mg")}/día`}
            </span>
          ))}
        </p>
      ) : null}
      <ul className="proyeccion__lista">
        {HORIZONTES_PROYECCION.map((horizonte) => {
          const dato = proyectarInsumos(cultivos, horizonte.dias);
          return (
            <li
              key={horizonte.id}
              className={`proyeccion__fila proyeccion__fila--${horizonte.id}`}
            >
              <p className="proyeccion__horizonte">{horizonte.etiqueta}</p>
              <p className="proyeccion__valores">
                Agua a reponer:{" "}
                {dato.reposicionL == null
                  ? "— L"
                  : formatearMedida(dato.reposicionL, "L")}
              </p>
              <p className="proyeccion__valores">
                Sales en esa agua:{" "}
                {dato.masaReposicionMg == null
                  ? "— mg"
                  : formatearMedida(dato.masaReposicionMg, "mg")}
              </p>
            </li>
          );
        })}
      </ul>
      {dia.omitidos > 0 ? (
        <p className="proyeccion__aviso">
          {dia.omitidos} cultivo(s) sin dato completo; no entran en el total.
        </p>
      ) : null}
      {consumoNodo ? (
        <div className="consumo-nodo">
          <p className="consumo-nodo__titulo">
            {consumoNodo.nombre}
            {consumoNodo.dias != null && consumoNodo.dias_cosecha != null
              ? ` · día ${consumoNodo.dias} de ${consumoNodo.dias_cosecha}`
              : ""}
          </p>
          <p className="consumo-nodo__ayuda">
            Reserva{" "}
            {consumoNodo.litros == null ? "—" : formatearMedida(consumoNodo.litros, "L")}
            {" · bebe "}
            {consumoNodo.reposicionDiaL == null
              ? "—"
              : `${formatearMedida(consumoNodo.reposicionDiaL, "L")}/día`}
            . Los mg del tanque no se tiran cada día.
          </p>
          <ul className="consumo-nodo__minerales">
            {consumoNodo.minerales.map((item) => (
              <li key={item.clave}>
                {SIMBOLOS_MINERAL[item.clave]} {ETIQUETAS_VARIABLES[item.clave]}:{" "}
                {item.concentracionMgL == null
                  ? "null"
                  : formatearMedida(item.concentracionMgL, "mg/L")}
                {" · tanque "}
                {item.masaRecambioMg == null
                  ? "null"
                  : formatearMedida(item.masaRecambioMg, "mg")}
                {" · reposición "}
                {item.masaReposicionMg == null
                  ? "null"
                  : `${formatearMedida(item.masaReposicionMg, "mg")}/día`}
              </li>
            ))}
          </ul>
          <p className="consumo-nodo__dia">
            Hasta cosecha:{" "}
            {consumoNodo.dias_restantes == null
              ? "null"
              : `${consumoNodo.dias_restantes} d`}
            {consumoNodo.reposicionHastaCosechaL != null
              ? ` · ${formatearMedida(consumoNodo.reposicionHastaCosechaL, "L")} de agua`
              : ""}
            {consumoNodo.masaHastaCosechaMg != null
              ? ` · ${formatearMedida(consumoNodo.masaHastaCosechaMg, "mg")} en reposición`
              : ""}
          </p>
          {consumoNodo.etapas.length > 0 ? (
            <ol className="consumo-nodo__etapas">
              {consumoNodo.etapas.map((etapa) => (
                <li
                  key={etapa.id}
                  className={
                    etapa.actual
                      ? "consumo-nodo__etapa consumo-nodo__etapa--actual"
                      : "consumo-nodo__etapa"
                  }
                >
                  {etapa.etiqueta} · {etapa.duracionDias} d (d {etapa.dias_desde}–
                  {etapa.dias_hasta}) ·{" "}
                  {etapa.reposicionEtapaL == null
                    ? "null"
                    : formatearMedida(etapa.reposicionEtapaL, "L")}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
