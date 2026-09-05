import { CATALOGO_CULTIVOS } from "@hidroponico/tipos-compartidos";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelCultivo() {
  const busqueda = usarGrafoConstruccion((estado) => estado.busquedaCatalogo);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const cultivos = CATALOGO_CULTIVOS.filter((cultivo) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return cultivo.nombre.toLowerCase().includes(q) || cultivo.id.includes(q);
  });

  const colocarCultivo = (tipoCultivo: string) => {
    const cantidad = usarGrafoConstruccion.getState().nodos.length;
    agregarNodo(tipoCultivo, {
      x: 80 + (cantidad % 4) * 180,
      y: 80 + Math.floor(cantidad / 4) * 140,
    });
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-3 border-r border-borde bg-panel p-3">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Cultivo
        </p>
        <p className="mt-1 text-xs text-muted">Arrastra o haz click para crear un nodo</p>
      </div>
      <div className="grid grid-cols-2 gap-2 overflow-y-auto">
        {cultivos.map((cultivo) => (
            <button
              key={cultivo.id}
              type="button"
              draggable
              onClick={() => colocarCultivo(cultivo.id)}
              onDragStart={(evento) => {
                evento.dataTransfer.setData(
                  "application/hidroponico-cultivo",
                  cultivo.id,
                );
                evento.dataTransfer.effectAllowed = "move";
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-borde bg-lienzo/60 p-2 text-center hover:border-acento"
            >
              <GlifoCultivo tipoCultivo={cultivo.id} color={cultivo.color} />
              <span className="text-[11px] font-medium">{cultivo.nombre}</span>
            </button>
        ))}
      </div>
    </aside>
  );
}
