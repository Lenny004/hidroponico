import {
  CATALOGO_CULTIVOS,
  fichaHoverDesdeCatalogo,
  obtenerPlagaPorIdONombre,
} from "@hidroponico/tipos-compartidos";
import AnclaHoverCultivo from "./AnclaHoverCultivo";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelCultivo() {
  const busqueda = usarGrafoConstruccion((estado) => estado.busquedaCatalogo);
  const tipoActivo = usarGrafoConstruccion((estado) => estado.tipoCatalogoActivo);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const cultivos = CATALOGO_CULTIVOS.filter((cultivo) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) {
      return true;
    }
    if (cultivo.nombre.toLowerCase().includes(q) || cultivo.id.includes(q)) {
      return true;
    }
    if (cultivo.proceso.resumen.toLowerCase().includes(q)) {
      return true;
    }
    return cultivo.plagas_tipicas.some((id) => {
      const plaga = obtenerPlagaPorIdONombre(id);
      return plaga?.nombre.toLowerCase().includes(q) || id.includes(q);
    });
  });

  const colocarCultivo = (tipoCultivo: string) => {
    agregarNodo(tipoCultivo);
  };

  return (
    <aside className="panel-cultivo">
      <div>
        <p className="panel-cultivo__titulo">Cultivo</p>
        <p className="panel-cultivo__ayuda">
          Arrastra un cultivo a un orificio o usa Agregar / Quitar
        </p>
      </div>
      <div className="panel-cultivo__rejilla">
        {cultivos.map((cultivo) => (
            <AnclaHoverCultivo
              key={cultivo.id}
              ficha={fichaHoverDesdeCatalogo(cultivo.id)}
            >
              <button
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
                className={
                  tipoActivo === cultivo.id
                    ? "tarjeta-cultivo tarjeta-cultivo--activa"
                    : "tarjeta-cultivo"
                }
              >
                <GlifoCultivo tipoCultivo={cultivo.id} color={cultivo.color} />
                <span className="tarjeta-cultivo__nombre">{cultivo.nombre}</span>
                <span className="tarjeta-cultivo__meta">
                  {cultivo.proceso.dias_cosecha} d · {cultivo.plagas_tipicas.length} plagas
                </span>
              </button>
            </AnclaHoverCultivo>
        ))}
      </div>
    </aside>
  );
}
