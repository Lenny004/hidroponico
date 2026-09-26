import {
  AGROSERVICIO_EL_SALVADOR,
  CLAVES_NUTRIENTE,
  ETIQUETAS_NUTRIENTE,
  SIMBOLOS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
  caudalNftDeReserva,
  consolidarAporteDiarioHumano,
  consumoTemporalGrupo,
  contrastarReservaConDeposito,
  cruzarSanidad,
  formatearHolgura,
  formatearMedida,
  obtenerCasoUso,
  obtenerCultivoPorId,
  obtenerPlagaPorIdONombre,
  ocupacionDeposito,
  proyectarInsumos,
  volumenDeposito,
  type ClaveNutriente,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarInterfaz } from "../store/usarInterfaz";
import FormularioDeposito from "./FormularioDeposito";

function textoPct(valor: number | null | undefined): string {
  if (valor == null) {
    return "—";
  }
  return `${Math.round(valor * 10) / 10} %`;
}

function anchoBarra(valor: number | null | undefined): number {
  if (valor == null) {
    return 0;
  }
  return Math.min(100, Math.max(0, valor));
}

const CLAVES_TABLA: ClaveNutriente[] = CLAVES_NUTRIENTE.filter(
  (clave) => clave !== "energia_kcal",
);

export default function PanelConsolidado() {
  const casoUso = usarInterfaz((estado) => estado.casoUso);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const deposito = usarGrafoConstruccion((estado) => estado.deposito);
  const cultivos = nodos.map((nodo) => nodo.data.cultivo);
  const consolidado = consolidarAporteDiarioHumano(cultivos);
  const caso = obtenerCasoUso(casoUso);
  const consumo = consumoTemporalGrupo(cultivos);
  const insumos = proyectarInsumos(cultivos, 1);
  const sanidad = cruzarSanidad(cultivos);

  return (
    <section className="panel-consolidado" aria-label="Consolidado diario">
      <h2 className="panel-consolidado__titulo">
        {caso?.titulo ?? "Cosecha y referencia humana"}
      </h2>
      {caso && casoUso !== "nutricion" ? (
        <p className="panel-consolidado__ayuda">{caso.ayuda}</p>
      ) : null}

      {casoUso === "agroservicio" ? (
        <Agroservicio tipos={cultivos.map((item) => item.tipoCultivo)} />
      ) : null}

      {casoUso === "sanidad" ? <Sanidad cruce={sanidad} nodos={cultivos} /> : null}

      {casoUso === "hidraulica" ? (
        <Hidraulica
          reservaL={insumos.reservaL}
          deposito={deposito}
        />
      ) : null}

      {casoUso === "insumos" ? (
        <p className="panel-consolidado__dato">
          Reposición {insumos.reposicionL == null ? "—" : formatearMedida(insumos.reposicionL, "L")}
          /día · reserva{" "}
          {insumos.reservaL == null ? "—" : formatearMedida(insumos.reservaL, "L")}
        </p>
      ) : null}

      {casoUso === "oxigeno" ? (
        <p className="panel-consolidado__dato">
          El tanque usa el mínimo de O₂ del grupo (banda típica NFT 5–8 mg/L). El detalle está en
          Cálculos.
        </p>
      ) : null}

      {casoUso === "minerales" ? (
        <p className="panel-consolidado__dato">
          Masa del día (reposición):{" "}
          {consumo.masaDiaMg == null ? "—" : formatearMedida(consumo.masaDiaMg, "mg")}.
        </p>
      ) : null}

      {casoUso !== "nutricion" ? null : nodos.length === 0 ? (
        <p className="panel-consolidado__vacio">
          Planta cultivos para ver cuánto cubre la cosecha de un día.
        </p>
      ) : (
        <>
          <p className="panel-consolidado__dato">
            Cosecha estimada:{" "}
            {consolidado.gramosDia == null
              ? "—"
              : formatearMedida(consolidado.gramosDia, "g")}
            /día
            {consolidado.omitidos > 0
              ? ` · ${consolidado.omitidos} planta(s) sin ficha nutricional`
              : ""}
          </p>
          <div className="panel-consolidado__tabla-envoltorio">
            <table className="tabla-consolidado">
              <thead>
                <tr>
                  <th>Nutriente</th>
                  <th title="Cada planta vale igual">Media</th>
                  <th title="Pesa por gramos cosechados al día">Ponderado</th>
                  <th>Total / día</th>
                </tr>
              </thead>
              <tbody>
                {CLAVES_TABLA.map((clave) => {
                  const metrica = consolidado.metricas.find((item) => item.clave === clave);
                  return (
                    <tr key={clave}>
                      <td>
                        {SIMBOLOS_NUTRIENTE[clave]} {ETIQUETAS_NUTRIENTE[clave]}
                        <div className="tabla-consolidado__pista" aria-hidden>
                          <div
                            className="tabla-consolidado__relleno"
                            style={{ width: `${anchoBarra(metrica?.ponderadoPct)}%` }}
                          />
                        </div>
                      </td>
                      <td>{textoPct(metrica?.mediaAritmeticaPct)}</td>
                      <td>{textoPct(metrica?.ponderadoPct)}</td>
                      <td>
                        {metrica?.totalCantidad == null
                          ? "—"
                          : formatearMedida(metrica.totalCantidad, UNIDAD_NUTRIENTE[clave])}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Agroservicio({ tipos }: { tipos: string[] }) {
  const unicos = [...new Set(tipos)];
  const recomendados = new Set<string>(AGROSERVICIO_EL_SALVADOR.cultivos_recomendados);
  return (
    <div className="agroservicio">
      <p className="agroservicio__entidad">{AGROSERVICIO_EL_SALVADOR.entidad}</p>
      <p className="panel-consolidado__ayuda">{AGROSERVICIO_EL_SALVADOR.clima}</p>
      <ul className="agroservicio__lista">
        {AGROSERVICIO_EL_SALVADOR.nft.map((nota) => (
          <li key={nota}>{nota}</li>
        ))}
      </ul>
      {unicos.length > 0 ? (
        <p className="panel-consolidado__dato">
          En el tubo:{" "}
          {unicos
            .map((id) => {
              const nombre = obtenerCultivoPorId(id)?.nombre ?? id;
              return recomendados.has(id) ? `${nombre} (apto NFT SV)` : nombre;
            })
            .join(" · ")}
        </p>
      ) : (
        <p className="panel-consolidado__ayuda">
          Lechuga, albahaca, menta, rúcula, espinaca y acelga arrancan mejor en NFT tropical.
        </p>
      )}
      <p className="agroservicio__enlaces">
        <a href={AGROSERVICIO_EL_SALVADOR.url_mag} target="_blank" rel="noreferrer">
          MAG
        </a>
        {" · "}
        <a href={AGROSERVICIO_EL_SALVADOR.url_centa} target="_blank" rel="noreferrer">
          CENTA
        </a>
      </p>
    </div>
  );
}

function Hidraulica({
  reservaL,
  deposito,
}: {
  reservaL: number | null;
  deposito: Parameters<typeof volumenDeposito>[0];
}) {
  const volumen = volumenDeposito(deposito);
  const contraste = contrastarReservaConDeposito(reservaL, volumen.netoL);
  const ocupacion = ocupacionDeposito(reservaL, volumen.netoL);
  const caudal = caudalNftDeReserva(reservaL, deposito);
  return (
    <div className="agroservicio">
      <FormularioDeposito />
      <p className="panel-consolidado__dato">
        Neto {volumen.netoL == null ? "—" : formatearMedida(volumen.netoL, "L")} · reserva{" "}
        {reservaL == null ? "—" : formatearMedida(reservaL, "L")}
      </p>
      <p className="panel-consolidado__dato">
        Ocupación {ocupacion.porcentaje == null ? "—" : `${ocupacion.porcentaje.toFixed(1)} %`}
        {ocupacion.libreL == null
          ? ""
          : ` · ${formatearMedida(Math.max(0, ocupacion.libreL), "L")} libres`}
      </p>
      <p
        className={
          contraste.estado === "excede"
            ? "panel-consolidado__aviso"
            : "panel-consolidado__ayuda"
        }
      >
        {contraste.estado === "sin_deposito"
          ? "Completa largo, ancho y altura de líquido (o diámetro) para el neto."
          : contraste.estado === "reserva_incompleta"
            ? "Faltan litros en el tubo; el contraste espera a que no haya null."
            : contraste.estado === "excede"
              ? `No cabe: ${formatearHolgura(contraste.holguraL)}.`
              : `Cabe: ${formatearHolgura(contraste.holguraL)}.`}
      </p>
      <p className="panel-consolidado__dato">
        Caudal NFT {caudal.recirculaciones_h}×/h:{" "}
        {caudal.entregado_Lph == null ? "—" : formatearMedida(caudal.entregado_Lph, "L/h")}
        {caudal.etiqueta_Lph == null
          ? ""
          : ` · etiqueta ~${formatearMedida(caudal.etiqueta_Lph, "L/h")}`}
      </p>
    </div>
  );
}

function Sanidad({
  cruce,
  nodos,
}: {
  cruce: ReturnType<typeof cruzarSanidad>;
  nodos: Parameters<typeof cruzarSanidad>[0];
}) {
  const actualizarPlagas = usarGrafoConstruccion((estado) => estado.actualizarPlagas);
  const actualizarTextoNodo = usarGrafoConstruccion((estado) => estado.actualizarTextoNodo);

  const cargarEscenario = () => {
    const objetivos = nodos.filter((nodo) => !nodo.plagas?.length);
    const seleccionados = objetivos.length > 0 ? objetivos : nodos.slice(0, 2);
    seleccionados.forEach((nodo) => {
      const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
      const idPlaga = definicion?.plagas_tipicas[0] ?? "pulgon";
      const plaga = obtenerPlagaPorIdONombre(idPlaga);
      if (!plaga) {
        return;
      }
      const actuales = nodo.plagas ?? [];
      const yaRegistrada = actuales.some((item) => item.toLowerCase() === plaga.nombre.toLowerCase());
      const siguientes = yaRegistrada ? actuales : [...actuales, plaga.nombre];
      actualizarPlagas(nodo.id, siguientes);
      if (!nodo.solucion_plagas) {
        actualizarTextoNodo(nodo.id, "solucion_plagas", plaga.solucion_plagas);
      }
    });
  };

  const hayDatos =
    cruce.detectadas.length > 0 ||
    cruce.tipicasSinMarcar.length > 0 ||
    cruce.deficiencias.length > 0;

  return (
    <div className="sanidad">
      <div className="sanidad__cabecera">
        <div>
          <p className="panel-consolidado__dato">Simulador de sanidad NFT</p>
          <p className="panel-consolidado__ayuda">
            Carga un brote educativo usando la primera plaga típica de cada cultivo. El escenario
            se guarda en las fichas y puede editarse desde el panel del cultivo.
          </p>
        </div>
        <button type="button" className="boton-secundario" onClick={cargarEscenario} disabled={nodos.length === 0}>
          {hayDatos ? "Añadir escenario" : "Simular brote"}
        </button>
      </div>
      {nodos.length === 0 ? (
        <p className="panel-consolidado__ayuda">Planta al menos un cultivo para iniciar la simulación.</p>
      ) : null}
      {cruce.detectadas.length > 0 ? (
        <div className="sanidad__resumen">
          <span>{cruce.detectadas.length} plaga(s) detectada(s)</span>
          <span>
            {new Set(cruce.detectadas.flatMap((item) => item.nodos)).size} planta(s) afectada(s)
          </span>
        </div>
      ) : null}
      {!hayDatos ? (
        <p className="panel-consolidado__ayuda">
          No hay incidencias cargadas. Pulsa “Simular brote” para probar el diagnóstico y las acciones.
        </p>
      ) : null}
      {cruce.detectadas.length > 0 ? (
        <div className="sanidad__tarjetas">
          {cruce.detectadas.map((item) => (
            <article key={item.plaga.id} className="sanidad__tarjeta">
              <div className="sanidad__tarjeta-titulo">
                <strong>{item.plaga.nombre}</strong>
                <span>{item.nodos.length} planta(s)</span>
              </div>
              <p><b>Síntomas:</b> {item.plaga.sintomas}</p>
              <p><b>Causa probable:</b> {item.plaga.causa}</p>
              <p><b>Acción:</b> {item.plaga.solucion_plagas}</p>
            </article>
          ))}
        </div>
      ) : null}
      {cruce.tipicasSinMarcar.length > 0 ? (
        <>
          <p className="panel-consolidado__dato">Típicas del tipo, aún no marcadas</p>
          <ul className="sanidad__lista-riesgos">
            {cruce.tipicasSinMarcar.map((item) => (
              <li key={`${item.tipoCultivo}-${item.plaga.id}`}>
                {item.nombreCultivo}: {item.plaga.nombre} — {item.plaga.sintomas}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {cruce.deficiencias.length > 0 ? (
        <>
          <p className="panel-consolidado__dato">Minerales por debajo de la receta de etapa</p>
          <ul className="sanidad__lista-riesgos">
            {cruce.deficiencias.map((item) => (
              <li key={item.ficha.id}>
                <strong>{item.ficha.nombre}</strong>
                {` — ${item.ficha.sintomas} Causa: ${item.ficha.causa} Acción: ${item.ficha.accion}`}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

