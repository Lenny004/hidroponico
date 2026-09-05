import { CLAVES_VARIABLES_CULTIVO, obtenerCultivoPorId } from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelSeleccion() {
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const nodo = nodos.find((item) => item.id === idSeleccionado);
  const nombre = nodo
    ? (obtenerCultivoPorId(nodo.data.cultivo.tipoCultivo)?.nombre ??
      nodo.data.cultivo.tipoCultivo)
    : null;

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-borde bg-panel p-3">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        Detalle
      </p>
      {!nodo || !nombre ? (
        <p className="text-sm text-muted">
          Haz click en un nodo para ver su ficha. La edición completa llega en la Fase 2.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-lg font-semibold">{nombre}</p>
            <p className="break-all text-[11px] text-muted">{nodo.id}</p>
          </div>
          <p className="text-xs text-muted">
            Variables en solo lectura (propuesta de 15 categorías, no confirmada).
          </p>
          <dl className="grid grid-cols-1 gap-1 text-xs">
            {CLAVES_VARIABLES_CULTIVO.map((clave) => (
              <div
                key={clave}
                className="flex items-center justify-between gap-2 rounded-md border border-borde px-2 py-1"
              >
                <dt className="text-muted">{clave}</dt>
                <dd>{nodo.data.cultivo.variables[clave] ?? "null"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </aside>
  );
}
