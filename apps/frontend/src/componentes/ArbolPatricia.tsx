import { useMemo, useState } from "react";
import {
  arbolPatriciaDeNodos,
  comprimirVistaPorTipo,
  fichaHoverDesdeNodo,
  formatearMedida,
  hojasDeVista,
  obtenerCultivoPorId,
  vistaArbolPatricia,
  type HojaCultivoPatricia,
  type VistaPatricia,
} from "@hidroponico/tipos-compartidos";
import AnclaHoverCultivo from "./AnclaHoverCultivo";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function tiposEnVista(vista: VistaPatricia<HojaCultivoPatricia>, salida: Set<string>): void {
  if (vista.valor) {
    salida.add(vista.valor.tipoCultivo);
  }
  for (const hijo of vista.hijos) {
    tiposEnVista(hijo, salida);
  }
}

function etiquetaRama(vista: VistaPatricia<HojaCultivoPatricia>): string {
  const tipos = new Set<string>();
  tiposEnVista(vista, tipos);
  if (tipos.size === 1) {
    const id = [...tipos][0] ?? vista.etiqueta;
    return obtenerCultivoPorId(id)?.nombre ?? id;
  }
  return "Grafo";
}

function RamaPatricia({
  vista,
  profundidad,
}: {
  vista: VistaPatricia<HojaCultivoPatricia>;
  profundidad: number;
}) {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const filtroLienzo = usarGrafoConstruccion((estado) => estado.filtroLienzo);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const setFiltroLienzo = usarGrafoConstruccion((estado) => estado.setFiltroLienzo);
  const [abierta, setAbierta] = useState(true);

  if (vista.esHoja && vista.valor) {
    const hoja = vista.valor;
    const seleccionado = hoja.id === idSeleccionado;
    const nodo = nodos.find((item) => item.id === hoja.id);
    const reserva =
      hoja.litros == null ? "— L reserva" : `${formatearMedida(hoja.litros, "L")} reserva`;
    const reposicion =
      hoja.reposicionDiaL == null
        ? "— L/día"
        : `${formatearMedida(hoja.reposicionDiaL, "L")}/día`;
    return (
      <li className="patricia__fila">
        <AnclaHoverCultivo ficha={nodo ? fichaHoverDesdeNodo(nodo.data.cultivo) : null}>
          <button
            type="button"
            className={
              seleccionado ? "patricia__item patricia__item--activo" : "patricia__item"
            }
            onClick={() => {
              setFiltroLienzo("");
              seleccionar(seleccionado ? null : hoja.id);
            }}
          >
            <GlifoCultivo tipoCultivo={hoja.tipoCultivo} color={hoja.color} tamano="lista" />
            <span className="patricia__cuerpo">
              <span className="patricia__nombre">{hoja.nombre}</span>
              <span className="patricia__meta">
                {reserva} · {reposicion}
              </span>
            </span>
          </button>
        </AnclaHoverCultivo>
        <button
          type="button"
          className="patricia__quitar"
          title={`Quitar ${hoja.nombre}`}
          aria-label={`Quitar ${hoja.nombre}`}
          onClick={() => quitarNodo(hoja.id)}
        >
          ×
        </button>
      </li>
    );
  }

  const tipos = new Set<string>();
  tiposEnVista(vista, tipos);
  const tipoUnico = tipos.size === 1 ? [...tipos][0] : null;
  const filtroActivo = tipoUnico != null && filtroLienzo.trim().toLowerCase() === tipoUnico;
  const nombreRama = etiquetaRama(vista);

  return (
    <li className="patricia__rama">
      <div className="patricia__rama-cabecera">
        <button
          type="button"
          className="patricia__plegar"
          aria-expanded={abierta}
          onClick={() => setAbierta((valor) => !valor)}
        >
          {abierta ? "▾" : "▸"}
        </button>
        <button
          type="button"
          className={
            filtroActivo ? "patricia__interno patricia__interno--activo" : "patricia__interno"
          }
          title={
            tipoUnico
              ? "Filtrar el tubo a esta rama"
              : "Rama mixta: elige una hoja para renderizar"
          }
          onClick={() => {
            if (!tipoUnico) {
              return;
            }
            setFiltroLienzo(filtroActivo ? "" : tipoUnico);
          }}
        >
          <span className="patricia__nombre">{nombreRama}</span>
          <span className="patricia__meta">{hojasDeVista(vista).length} cultivos</span>
        </button>
      </div>
      {abierta ? (
        <ul className="patricia__hijos" style={{ paddingLeft: profundidad > 0 ? "0.75rem" : 0 }}>
          {vista.hijos.map((hijo) => (
            <RamaPatricia key={hijo.id} vista={hijo} profundidad={profundidad + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Árbol Patricia del grafo de construcción. Click en una hoja selecciona y renderiza
 * el cultivo en el tubo; click en una rama filtra esa familia.
 */
export default function ArbolPatricia() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const vista = useMemo(() => {
    const arbol = arbolPatriciaDeNodos(nodos.map((nodo) => nodo.data.cultivo));
    const cruda = vistaArbolPatricia(arbol.obtenerRaiz(), (hoja) => hoja.nombre);
    return cruda ? comprimirVistaPorTipo(cruda) : null;
  }, [nodos]);

  return (
    <section className="patricia">
      <p className="patricia__titulo">Grafo Patricia</p>
      <p className="patricia__ayuda">
        Árbol binario del grafo. Arrastra un cultivo y se indexa. Click en la hoja para
        renderizarlo en el tubo.
      </p>
      {vista == null ? (
        <p className="patricia__vacio">Ningún cultivo en los tubos.</p>
      ) : (
        <ul className="patricia__lista">
          <RamaPatricia vista={vista} profundidad={0} />
        </ul>
      )}
    </section>
  );
}
