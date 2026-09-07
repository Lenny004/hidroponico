import {
  ETIQUETAS_VARIABLES,
  UNIDAD_AGREGADO,
  formatearMedida,
  type ClaveVariableCultivo,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function etiquetaDe(clave: string): string {
  return (ETIQUETAS_VARIABLES as Record<string, string>)[clave] ?? clave;
}

function unidadDe(clave: string): string {
  return (UNIDAD_AGREGADO as Record<string, string>)[clave] ?? "";
}

function textoLista(valores: string[] | null | undefined): string {
  if (valores == null) {
    return "null";
  }
  return valores.join(", ");
}

export default function PanelResultados() {
  const resultado = usarGrafoConstruccion((estado) => estado.resultadoPipeline);
  if (!resultado) {
    return null;
  }

  return (
    <section className="panel-resultados">
      <div className="panel-resultados__cabecera">
        <p className="panel-resultados__titulo">Resultado TREE.JS</p>
        <p className="panel-resultados__conteo">
          Conteo:{" "}
          {Object.entries(resultado.conteoPorTipo)
            .map(([tipo, n]) => `${tipo} × ${n}`)
            .join(" · ") || "sin nodos"}
        </p>
        {resultado.advertencias.length > 0 ? (
          <p className="panel-resultados__aviso">
            {resultado.advertencias.length} advertencia(s) · el pipeline no se bloqueó
          </p>
        ) : null}
      </div>
      <div className="panel-resultados__lista">
        {resultado.motores.map((motor) => (
          <div key={motor.nombre} className="panel-resultados__motor">
            <p className="panel-resultados__motor-nombre">{motor.nombre}</p>
            {motor.grupos.map((grupo, indice) => {
              const ids = grupo.datos.idsNodos?.join(", ") ?? `grupo ${indice + 1}`;
              const totales = grupo.datos.totales ?? {};
              const tienePlagas = "plagas" in grupo.datos || "solucion_plagas" in grupo.datos;
              return (
                <p key={ids} className="panel-resultados__grupo">
                  [{ids}]{" "}
                  {Object.entries(totales).map(([clave, total]) => (
                    <span key={clave} className="panel-resultados__dato">
                      {etiquetaDe(clave as ClaveVariableCultivo)}:{" "}
                      <span
                        className={
                          total == null
                            ? "panel-resultados__valor panel-resultados__valor--nulo"
                            : "panel-resultados__valor"
                        }
                      >
                        {total == null
                          ? "null"
                          : formatearMedida(total, unidadDe(clave))}
                      </span>{" "}
                    </span>
                  ))}
                  {tienePlagas ? (
                    <>
                      <span className="panel-resultados__dato">
                        plagas:{" "}
                        <span
                          className={
                            grupo.datos.plagas == null
                              ? "panel-resultados__valor panel-resultados__valor--nulo"
                              : "panel-resultados__valor"
                          }
                        >
                          {textoLista(grupo.datos.plagas)}
                        </span>{" "}
                      </span>
                      <span className="panel-resultados__dato">
                        solucion_plagas:{" "}
                        <span
                          className={
                            grupo.datos.solucion_plagas == null
                              ? "panel-resultados__valor panel-resultados__valor--nulo"
                              : "panel-resultados__valor"
                          }
                        >
                          {textoLista(grupo.datos.solucion_plagas)}
                        </span>
                      </span>
                    </>
                  ) : null}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
