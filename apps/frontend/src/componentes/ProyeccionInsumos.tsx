import {
  HORIZONTES_PROYECCION,
  formatearParInsumos,
  proyectarInsumos,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function ProyeccionInsumos() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const cultivos = nodos.map((nodo) => nodo.data.cultivo);
  const dia = proyectarInsumos(cultivos, 1);

  return (
    <section className="proyeccion">
      <p className="proyeccion__titulo">Proyección de insumos</p>
      <p className="proyeccion__ayuda">
        Recambio diario de la reserva NFT. Masa elemental (mg = mg/L × L), no sales.
      </p>
      <ul className="proyeccion__lista">
        {HORIZONTES_PROYECCION.map((horizonte) => {
          const dato = proyectarInsumos(cultivos, horizonte.dias);
          return (
            <li
              key={horizonte.id}
              className={`proyeccion__fila proyeccion__fila--${horizonte.id}`}
            >
              <p className="proyeccion__horizonte">{horizonte.etiqueta}</p>
              <p className="proyeccion__valores">
                {formatearParInsumos(dato.litros, dato.masaMg)}
              </p>
            </li>
          );
        })}
      </ul>
      {dia.omitidos > 0 ? (
        <p className="proyeccion__aviso">
          {dia.omitidos} cultivo(s) sin dato completo; no entran en el total.
        </p>
      ) : null}
    </section>
  );
}
