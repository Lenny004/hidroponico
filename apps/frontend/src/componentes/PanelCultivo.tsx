import {
  CATALOGO_CULTIVOS,
  ETIQUETAS_FAMILIA,
  fichaHoverDesdeCatalogo,
  obtenerPlagaPorIdONombre,
} from "@hidroponico/tipos-compartidos";
import type { CSSProperties } from "react";
import AnclaHoverCultivo from "./AnclaHoverCultivo";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelCultivo() {
  const busqueda = usarGrafoConstruccion((estado) => estado.busquedaCatalogo);
  const tipoActivo = usarGrafoConstruccion((estado) => estado.tipoCatalogoActivo);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const setTipoCatalogoActivo = usarGrafoConstruccion((estado) => estado.setTipoCatalogoActivo);
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
    setTipoCatalogoActivo(tipoCultivo);
    agregarNodo(tipoCultivo);
  };

  return (
    <aside className="panel-cultivo">
      <div>
        <h2 className="panel-cultivo__titulo">Catálogo</h2>
        <p className="panel-cultivo__ayuda">Arrastra al tubo, o pulsa para plantar.</p>
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
                style={
                  {
                    "--color-cultivo": cultivo.color,
                  } as CSSProperties
                }
              >
                <GlifoCultivo tipoCultivo={cultivo.id} color={cultivo.color} />
                <span className="tarjeta-cultivo__nombre">{cultivo.nombre}</span>
                <span className="tarjeta-cultivo__familia">
                  {ETIQUETAS_FAMILIA[cultivo.familia]}
                </span>
              </button>
            </AnclaHoverCultivo>
        ))}
      </div>
    </aside>
  );
}
