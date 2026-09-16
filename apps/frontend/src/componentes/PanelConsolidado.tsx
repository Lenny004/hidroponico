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

      {casoUso === "sanidad" ? <Sanidad cruce={sanidad} /> : null}

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
  const caudal = caudalNftDeReserva(reservaL, deposito);
  return (
    <div className="agroservicio">
      <FormularioDeposito />
      <p className="panel-consolidado__dato">
        Neto {volumen.netoL == null ? "—" : formatearMedida(volumen.netoL, "L")} · reserva{" "}
        {reservaL == null ? "—" : formatearMedida(reservaL, "L")}
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

function Sanidad({ cruce }: { cruce: ReturnType<typeof cruzarSanidad> }) {
  if (
    cruce.detectadas.length === 0 &&
    cruce.tipicasSinMarcar.length === 0 &&
    cruce.deficiencias.length === 0
  ) {
    return (
      <p className="panel-consolidado__ayuda">
        Sin plagas registradas. Revisa pulgón y mosca blanca en hoja; oídio en fruto.
      </p>
    );
  }
  return (
    <div className="sanidad">
      {cruce.detectadas.length > 0 ? (
        <ul className="agroservicio__lista">
          {cruce.detectadas.map((item) => (
            <li key={item.plaga.id}>
              <strong>{item.plaga.nombre}</strong>
              {` — ${item.plaga.sintomas} Causa: ${item.plaga.causa} Acción: ${item.plaga.solucion_plagas}`}
            </li>
          ))}
        </ul>
      ) : null}
      {cruce.tipicasSinMarcar.length > 0 ? (
        <>
          <p className="panel-consolidado__dato">Típicas del tipo, aún no marcadas</p>
          <ul className="agroservicio__lista">
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
          <ul className="agroservicio__lista">
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

