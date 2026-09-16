import {
  CATALOGO_CULTIVOS,
  ETIQUETAS_FAMILIA,
  fichaHoverDesdeCatalogo,
  obtenerPlagaPorIdONombre,
} from "@hidroponico/tipos-compartidos";
import type { CSSProperties } from "react";
import { Bug, Droplets, Timer } from "lucide-react";
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
                <span className="tarjeta-cultivo__chips">
                  <span
                    className="tarjeta-cultivo__chip"
                    title={`${cultivo.proceso.dias_cosecha} días a cosecha`}
                  >
                    <Timer className="tarjeta-cultivo__chip-icono" aria-hidden />
                    {cultivo.proceso.dias_cosecha} d
                  </span>
                  <span
                    className="tarjeta-cultivo__chip"
                    title={`Reposición típica: ${cultivo.reposicion_dia_L} L/día. La reserva del tanque recircula.`}
                  >
                    <Droplets className="tarjeta-cultivo__chip-icono" aria-hidden />
                    {cultivo.reposicion_dia_L} L/d
                  </span>
                  <span
                    className={
                      cultivo.plagas_tipicas.length > 0
                        ? "tarjeta-cultivo__chip tarjeta-cultivo__chip--plaga"
                        : "tarjeta-cultivo__chip"
                    }
                    title={`${cultivo.plagas_tipicas.length} plagas típicas`}
                  >
                    <Bug className="tarjeta-cultivo__chip-icono" aria-hidden />
                    {cultivo.plagas_tipicas.length}
                  </span>
                </span>
              </button>
            </AnclaHoverCultivo>
        ))}
      </div>
    </aside>
  );
}
