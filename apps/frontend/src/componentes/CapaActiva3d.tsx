import { CircleCheck, MousePointer2, X } from "lucide-react";
import { obtenerCultivoPorId } from "@hidroponico/tipos-compartidos";
import type { CSSProperties } from "react";
import { indiceOrificioDePosicion } from "./three/orificios-nft";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

/** Estado persistente de la selección dentro del lienzo 3D. */
export default function CapaActiva3d() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);
  const nodo = nodos.find((item) => item.id === idSeleccionado);

  if (!nodo) {
    return (
      <div className="capa-activa capa-activa--vacia" role="status">
        <MousePointer2 aria-hidden />
        <span>
          <strong>Sin cultivo activo</strong>
          <small>Haz clic sobre una planta para ver y editar sus datos.</small>
        </span>
      </div>
    );
  }

  const { cultivo, color } = nodo.data;
  const orificio = indiceOrificioDePosicion(nodo.position.x);
  const nombre = obtenerCultivoPorId(cultivo.tipoCultivo)?.nombre ?? cultivo.tipoCultivo.replaceAll("-", " ");

  return (
    <section
      className="capa-activa"
      style={{ "--color-capa-activa": color } as CSSProperties}
      aria-label={`Capa activa: ${nombre}`}
    >
      <CircleCheck className="capa-activa__icono" aria-hidden />
      <div className="capa-activa__texto">
        <p>Capa activa</p>
        <strong>{nombre}</strong>
        <small>{orificio == null ? "Cultivo seleccionado" : `Orificio ${orificio + 1} · datos visibles a la derecha`}</small>
      </div>
      <button
        type="button"
        className="capa-activa__cerrar"
        title="Quitar selección activa"
        aria-label="Quitar selección activa"
        onClick={() => seleccionar(null)}
      >
        <X aria-hidden />
      </button>
    </section>
  );
}
