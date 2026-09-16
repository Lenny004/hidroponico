import {
  fichaHoverDesdeNodo,
  fichasPlantados,
} from "@hidroponico/tipos-compartidos";
import AnclaHoverCultivo from "./AnclaHoverCultivo";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function CatalogoPlantado() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const fichas = fichasPlantados(nodos.map((nodo) => nodo.data.cultivo));

  return (
    <section className="catalogo-plantado">
      <p className="catalogo-plantado__titulo">Plantados</p>
      {fichas.length === 0 ? (
        <p className="catalogo-plantado__vacio">Ningún cultivo en los tubos.</p>
      ) : (
        <ul className="catalogo-plantado__lista">
          {fichas.map((ficha) => {
            const seleccionado = ficha.id === idSeleccionado;
            const nodo = nodos.find((item) => item.id === ficha.id);
            return (
              <li key={ficha.id} className="catalogo-plantado__fila">
                <AnclaHoverCultivo
                  ficha={nodo ? fichaHoverDesdeNodo(nodo.data.cultivo) : null}
                >
                  <button
                    type="button"
                    className={
                      seleccionado
                        ? "catalogo-plantado__item catalogo-plantado__item--activo"
                        : "catalogo-plantado__item"
                    }
                    onClick={() => seleccionar(seleccionado ? null : ficha.id)}
                  >
                    <GlifoCultivo
                      tipoCultivo={ficha.tipoCultivo}
                      color={ficha.color}
                      tamano="lista"
                    />
                    <span className="catalogo-plantado__cuerpo">
                      <span className="catalogo-plantado__nombre">{ficha.nombre}</span>
                    </span>
                  </button>
                </AnclaHoverCultivo>
                <button
                  type="button"
                  className="catalogo-plantado__quitar"
                  title={`Quitar ${ficha.nombre}`}
                  aria-label={`Quitar ${ficha.nombre}`}
                  onClick={() => quitarNodo(ficha.id)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
