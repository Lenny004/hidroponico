import {
  AGROSERVICIO_EL_SALVADOR,
  CLAVES_NUTRIENTE,
  ETIQUETAS_NUTRIENTE,
  SIMBOLOS_NUTRIENTE,
  UNIDAD_NUTRIENTE,
  consolidarAporteDiarioHumano,
  consumoTemporalGrupo,
  formatearMedida,
  obtenerCasoUso,
  obtenerCultivoPorId,
  obtenerPlagaPorIdONombre,
  proyectarInsumos,
  type ClaveNutriente,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarInterfaz } from "../store/usarInterfaz";

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
  const resultado = usarGrafoConstruccion((estado) => estado.resultadoPipeline);
  const cultivos = nodos.map((nodo) => nodo.data.cultivo);
  const consolidado = consolidarAporteDiarioHumano(cultivos);
  const caso = obtenerCasoUso(casoUso);
  const consumo = consumoTemporalGrupo(cultivos);
  const insumos = proyectarInsumos(cultivos, 1);

  return (
    <section className="panel-consolidado" aria-label="Consolidado diario">
      <p className="panel-consolidado__kicker">Consolidado al día</p>
      <h2 className="panel-consolidado__titulo">
        {caso?.titulo ?? "Cosecha y referencia humana"}
      </h2>
      <p className="panel-consolidado__ayuda">
        {casoUso === "nutricion"
          ? "Media aritmética: cada planta vale igual. Ponderado: pesa por gramos cosechados al día, frente al valor diario (VD) de un adulto."
          : caso?.ayuda}
      </p>

      {casoUso === "agroservicio" ? (
        <Agroservicio tipos={cultivos.map((item) => item.tipoCultivo)} />
      ) : null}

      {casoUso === "sanidad" ? (
        <Sanidad
          plagasNodo={cultivos.flatMap((item) => item.plagas ?? [])}
          plagasPipeline={resultado?.motores.find((motor) => motor.nombre === "plagas")}
        />
      ) : null}

      {casoUso === "insumos" ? (
        <p className="panel-consolidado__dato">
          Reposición {insumos.reposicionL == null ? "—" : formatearMedida(insumos.reposicionL, "L")}
          /día · reserva{" "}
          {insumos.reservaL == null ? "—" : formatearMedida(insumos.reservaL, "L")} · masa de
          recambio{" "}
          {consumo.masaDiaMg == null ? "—" : formatearMedida(consumo.masaDiaMg, "mg")}
        </p>
      ) : null}

      {casoUso === "oxigeno" ? (
        <p className="panel-consolidado__dato">
          El tanque usa el mínimo de O₂ del grupo. Revisa el panel de cálculos para el valor
          agregado.
        </p>
      ) : null}

      {casoUso === "minerales" ? (
        <p className="panel-consolidado__dato">
          Masa elemental del día (reposición):{" "}
          {consumo.masaDiaMg == null ? "—" : formatearMedida(consumo.masaDiaMg, "mg")}. El detalle
          por Mg, K, Mn y Fe está en el menú hamburguesa.
        </p>
      ) : null}

      {nodos.length === 0 ? (
        <p className="panel-consolidado__vacio">
          Planta cultivos en los tubos para ver cuánto cubre la cosecha de un día respecto a lo
          que un humano necesita.
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
                  <th>Media</th>
                  <th>Ponderado</th>
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

function Sanidad({
  plagasNodo,
  plagasPipeline,
}: {
  plagasNodo: string[];
  plagasPipeline:
    | { grupos: Array<{ datos: { plagas?: string[] | null } }> }
    | undefined;
}) {
  const delPipeline = plagasPipeline?.grupos.flatMap((grupo) => grupo.datos.plagas ?? []) ?? [];
  const nombres = [...new Set([...plagasNodo, ...delPipeline])];
  if (nombres.length === 0) {
    return (
      <p className="panel-consolidado__ayuda">
        Sin plagas registradas. Revisa pulgón y mosca blanca en hoja; oídio en fruto.
      </p>
    );
  }
  return (
    <ul className="agroservicio__lista">
      {nombres.map((nombre) => {
        const ficha = obtenerPlagaPorIdONombre(nombre);
        return (
          <li key={nombre}>
            <strong>{ficha?.nombre ?? nombre}</strong>
            {ficha ? ` — ${ficha.solucion_plagas}` : ""}
          </li>
        );
      })}
    </ul>
  );
}

