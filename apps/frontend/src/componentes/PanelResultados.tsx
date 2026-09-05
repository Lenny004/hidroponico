import { ETIQUETAS_VARIABLES, type ClaveVariableCultivo } from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function etiquetaDe(clave: string): string {
  return (ETIQUETAS_VARIABLES as Record<string, string>)[clave] ?? clave;
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
    <section className="max-h-44 overflow-y-auto border-t border-borde bg-panel px-4 py-2 text-xs">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <p className="font-semibold">Resultado TREE.JS</p>
        <p className="text-muted">
          Conteo:{" "}
          {Object.entries(resultado.conteoPorTipo)
            .map(([tipo, n]) => `${tipo} × ${n}`)
            .join(" · ") || "sin nodos"}
        </p>
        {resultado.advertencias.length > 0 ? (
          <p className="text-amber-300">
            {resultado.advertencias.length} advertencia(s) · el pipeline no se bloqueó
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {resultado.motores.map((motor) => (
          <div key={motor.nombre} className="flex flex-col gap-1">
            <p className="text-acento">{motor.nombre}</p>
            {motor.grupos.map((grupo, indice) => {
              const ids = grupo.datos.idsNodos?.join(", ") ?? `grupo ${indice + 1}`;
              const totales = grupo.datos.totales ?? {};
              const tienePlagas = "plagas" in grupo.datos || "solucion_plagas" in grupo.datos;
              return (
                <p key={ids} className="text-muted">
                  [{ids}]{" "}
                  {Object.entries(totales).map(([clave, total]) => (
                    <span key={clave} className="mr-3">
                      {etiquetaDe(clave as ClaveVariableCultivo)}:{" "}
                      <span className={total == null ? "text-amber-300" : "text-texto"}>
                        {total == null ? "null" : `${total} ml`}
                      </span>{" "}
                    </span>
                  ))}
                  {tienePlagas ? (
                    <>
                      <span className="mr-3">
                        plagas:{" "}
                        <span
                          className={
                            grupo.datos.plagas == null ? "text-amber-300" : "text-texto"
                          }
                        >
                          {textoLista(grupo.datos.plagas)}
                        </span>{" "}
                      </span>
                      <span className="mr-3">
                        solucion_plagas:{" "}
                        <span
                          className={
                            grupo.datos.solucion_plagas == null
                              ? "text-amber-300"
                              : "text-texto"
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
