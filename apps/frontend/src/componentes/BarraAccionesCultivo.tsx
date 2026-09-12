import { useEffect, useState } from "react";
import { CANTIDAD_ORIFICIOS } from "./three/orificios-nft";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function BarraAccionesCultivo() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const tipoCatalogoActivo = usarGrafoConstruccion((estado) => estado.tipoCatalogoActivo);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const vaciarTubo = usarGrafoConstruccion((estado) => estado.vaciarTubo);
  const [confirmarReset, setConfirmarReset] = useState(false);

  const tipoParaAgregar =
    tipoCatalogoActivo ??
    nodos.find((nodo) => nodo.id === idSeleccionado)?.data.cultivo.tipoCultivo ??
    nodos.at(-1)?.data.cultivo.tipoCultivo ??
    null;
  const tubosLlenos = nodos.length >= CANTIDAD_ORIFICIOS;
  const puedeAgregar = Boolean(tipoParaAgregar) && !tubosLlenos;

  useEffect(() => {
    if (nodos.length === 0) {
      setConfirmarReset(false);
    }
  }, [nodos.length]);

  useEffect(() => {
    if (!confirmarReset) {
      return;
    }
    const espera = window.setTimeout(() => setConfirmarReset(false), 4000);
    return () => window.clearTimeout(espera);
  }, [confirmarReset]);

  let tituloAgregar = "Elige un cultivo del panel izquierdo";
  if (tubosLlenos) {
    tituloAgregar = `Los tubos NFT están llenos (${CANTIDAD_ORIFICIOS} orificios).`;
  } else if (tipoParaAgregar) {
    tituloAgregar = "Colocar en el siguiente orificio libre";
  }

  return (
    <div
      className="barra-acciones-cultivo"
      role="toolbar"
      aria-label="Cultivos de los tubos"
      onPointerDown={(evento) => evento.stopPropagation()}
      onPointerUp={(evento) => evento.stopPropagation()}
    >
      <button
        type="button"
        className="barra-acciones-cultivo__boton barra-acciones-cultivo__boton--agregar"
        disabled={!puedeAgregar}
        title={tituloAgregar}
        onClick={() => {
          if (tipoParaAgregar) {
            setConfirmarReset(false);
            agregarNodo(tipoParaAgregar);
          }
        }}
      >
        + Agregar
      </button>
      <button
        type="button"
        className="barra-acciones-cultivo__boton barra-acciones-cultivo__boton--quitar"
        disabled={!idSeleccionado}
        title={idSeleccionado ? "Quitar el cultivo seleccionado" : "Selecciona un cultivo de los tubos"}
        onClick={() => {
          if (idSeleccionado) {
            setConfirmarReset(false);
            quitarNodo(idSeleccionado);
          }
        }}
      >
        − Quitar
      </button>
      <button
        type="button"
        className={
          confirmarReset
            ? "barra-acciones-cultivo__boton barra-acciones-cultivo__boton--resetear barra-acciones-cultivo__boton--resetear-confirmar"
            : "barra-acciones-cultivo__boton barra-acciones-cultivo__boton--resetear"
        }
        disabled={nodos.length === 0}
        title={confirmarReset ? "Confirmar: vaciar todos los orificios" : "Vaciar todos los orificios"}
        aria-pressed={confirmarReset}
        onClick={() => {
          if (nodos.length === 0) {
            return;
          }
          if (!confirmarReset) {
            setConfirmarReset(true);
            return;
          }
          vaciarTubo();
          setConfirmarReset(false);
        }}
      >
        {confirmarReset ? "¿Vaciar?" : "○ Resetear"}
      </button>
    </div>
  );
}
