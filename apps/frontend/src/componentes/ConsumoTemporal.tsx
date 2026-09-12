import {
  ETIQUETAS_VARIABLES,
  HORIZONTES_PROYECCION,
  SIMBOLOS_MINERAL,
  consumoTemporalGrupo,
  consumoTemporalNodo,
  formatearMedida,
  formatearParInsumos,
  proyectarInsumos,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

/**
 * Recambio del agua (limpieza de la reserva NFT) y consumo por tiempo del nodo
 * o del tubo al unirse. Masa elemental: mg = mg/L × L. No convierte a sales.
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
      <p className="proyeccion__titulo">Recambio del agua</p>
      <p className="proyeccion__ayuda">
        Limpieza diaria de la reserva NFT para renovar minerales. Cada planta es un nodo
        que suma al tubo al unirse.
      </p>
      <p className="proyeccion__total">
        Total del tubo: {formatearParInsumos(tubo.litros, tubo.masaDiaMg)}
        {tubo.masaDiaMg != null ? "/día" : ""}
      </p>
      {tubo.idsNodos.length > 0 && tubo.minerales.some((item) => item.masaRecambioMg != null) ? (
        <p className="proyeccion__minerales">
          {tubo.minerales.map((item) => (
            <span key={item.clave} className="proyeccion__mineral">
              {SIMBOLOS_MINERAL[item.clave]}{" "}
              {item.masaRecambioMg == null
                ? "—"
                : formatearMedida(item.masaRecambioMg, "mg")}
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
                {formatearParInsumos(dato.litros, dato.masaMg)}
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
            Medición del recambio (mg/L × L). El tiempo de cada etapa suma hacia la cosecha.
          </p>
          <ul className="consumo-nodo__minerales">
            {consumoNodo.minerales.map((item) => (
              <li key={item.clave}>
                {SIMBOLOS_MINERAL[item.clave]} {ETIQUETAS_VARIABLES[item.clave]}:{" "}
                {item.concentracionMgL == null
                  ? "null"
                  : formatearMedida(item.concentracionMgL, "mg/L")}
                {" · "}
                {item.masaRecambioMg == null
                  ? "null"
                  : `${formatearMedida(item.masaRecambioMg, "mg")}/día`}
              </li>
            ))}
          </ul>
          <p className="consumo-nodo__dia">
            Necesita al día:{" "}
            {consumoNodo.masaDiaMg == null
              ? "null"
              : formatearMedida(consumoNodo.masaDiaMg, "mg")}
            {consumoNodo.dias_restantes != null
              ? ` · ${consumoNodo.dias_restantes} d hasta cosecha`
              : ""}
            {consumoNodo.masaHastaCosechaMg != null
              ? ` · ${formatearMedida(consumoNodo.masaHastaCosechaMg, "mg")} restantes`
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
                  {etapa.masaEtapaMg == null
                    ? "null"
                    : formatearMedida(etapa.masaEtapaMg, "mg")}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
