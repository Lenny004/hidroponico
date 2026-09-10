import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function BarraAccionesCultivo() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const tipoCatalogoActivo = usarGrafoConstruccion((estado) => estado.tipoCatalogoActivo);
  const agregarNodo = usarGrafoConstruccion((estado) => estado.agregarNodo);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const vaciarTubo = usarGrafoConstruccion((estado) => estado.vaciarTubo);

  const tipoParaAgregar =
    tipoCatalogoActivo ??
    nodos.find((nodo) => nodo.id === idSeleccionado)?.data.cultivo.tipoCultivo ??
    null;

  return (
    <div className="barra-acciones-cultivo" role="toolbar" aria-label="Cultivos de los tubos">
      <button
        type="button"
        className="barra-acciones-cultivo__boton barra-acciones-cultivo__boton--agregar"
        disabled={!tipoParaAgregar}
        title={
          tipoParaAgregar
            ? "Colocar otro cultivo del tipo elegido"
            : "Elige un cultivo del panel izquierdo"
        }
        onClick={() => {
          if (tipoParaAgregar) {
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
            quitarNodo(idSeleccionado);
          }
        }}
      >
        − Quitar
      </button>
      <button
        type="button"
        className="barra-acciones-cultivo__boton barra-acciones-cultivo__boton--resetear"
        disabled={nodos.length === 0}
        title="Vaciar todos los orificios"
        onClick={() => {
          if (nodos.length === 0) {
            return;
          }
          if (window.confirm("¿Vaciar todos los cultivos de los tubos NFT?")) {
            vaciarTubo();
          }
        }}
      >
        ○ Resetear
      </button>
    </div>
  );
}
