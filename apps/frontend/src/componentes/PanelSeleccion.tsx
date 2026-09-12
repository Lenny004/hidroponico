import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  CATALOGO_CULTIVOS,
  CATALOGO_PLAGAS,
  ETIQUETAS_VARIABLES,
  GRUPOS_VARIABLES,
  UNIDAD_AGREGADO,
  UNIDAD_NODO,
  obtenerCultivoPorId,
  obtenerPlagaPorIdONombre,
} from "@hidroponico/tipos-compartidos";
import CampoNumerico from "./CampoNumerico";
import ArbolPatricia from "./ArbolPatricia";
import ConsumoTemporal from "./ConsumoTemporal";
import FichaVidaCultivo from "./FichaVidaCultivo";
import { resumenGrupoDeNodo } from "../api/resumen-grupo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelSeleccion() {
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const actualizarTipoCultivo = usarGrafoConstruccion((estado) => estado.actualizarTipoCultivo);
  const actualizarVariable = usarGrafoConstruccion((estado) => estado.actualizarVariable);
  const actualizarTextoNodo = usarGrafoConstruccion((estado) => estado.actualizarTextoNodo);
  const actualizarPlagas = usarGrafoConstruccion((estado) => estado.actualizarPlagas);
  const actualizarTrazabilidad = usarGrafoConstruccion((estado) => estado.actualizarTrazabilidad);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const resultadoPipeline = usarGrafoConstruccion((estado) => estado.resultadoPipeline);

  const nodo = nodos.find((item) => item.id === idSeleccionado);
  const cultivo = nodo?.data.cultivo;
  const resumenGrupo = nodo ? resumenGrupoDeNodo(resultadoPipeline, nodo.id) : null;
  const nombre = cultivo
    ? (obtenerCultivoPorId(cultivo.tipoCultivo)?.nombre ?? cultivo.tipoCultivo)
    : null;

  return (
    <aside className="panel-detalle">
      <p className="panel-detalle__titulo">Detalle</p>
      <ConsumoTemporal />
      <ArbolPatricia />
      {!nodo || !cultivo || !nombre ? (
        <p className="panel-detalle__vacio">
          Haz click en un cultivo de los tubos o de la lista para ver y editar su ficha.
        </p>
      ) : (
        <form
          className="panel-detalle__formulario"
          onSubmit={(evento) => evento.preventDefault()}
        >
          <div>
            <p className="panel-detalle__nombre">{nombre}</p>
            <p className="panel-detalle__id">{nodo.id}</p>
            <button
              type="button"
              className="boton-peligro"
              onClick={() => quitarNodo(nodo.id)}
            >
              − Quitar cultivo
            </button>
          </div>

          <label className="campo">
            <span>Tipo de cultivo</span>
            <select
              value={cultivo.tipoCultivo}
              onChange={(evento) => actualizarTipoCultivo(nodo.id, evento.target.value)}
              className="campo__control"
            >
              {CATALOGO_CULTIVOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <FichaVidaCultivo
            cultivo={cultivo}
            onCambiarEtapa={(etapa) =>
              actualizarTrazabilidad(nodo.id, "etapa_vida", etapa)
            }
            onCambiarInicio={(fecha) =>
              actualizarTrazabilidad(nodo.id, "iniciado_en", fecha)
            }
          />

          <p className="panel-detalle__nota">
            Minerales y O₂ en mg/L (ppm). Solución en litros. El grupo dosifica mg =
            concentración × litros. Vacío = null.
          </p>

          {GRUPOS_VARIABLES.map((grupo) => (
            <fieldset key={grupo.titulo} className="grupo-campos">
              <legend className="grupo-campos__titulo">{grupo.titulo}</legend>
              {grupo.claves.map((clave) => (
                <CampoNumerico
                  key={`${nodo.id}-${clave}`}
                  id={`${nodo.id}-${clave}`}
                  etiqueta={ETIQUETAS_VARIABLES[clave]}
                  claveTecnica={clave}
                  unidadNodo={UNIDAD_NODO[clave]}
                  unidadAgregado={UNIDAD_AGREGADO[clave]}
                  valor={cultivo.variables[clave]}
                  totalGrupo={resumenGrupo?.totales[clave]}
                  onConfirmar={(valor) => actualizarVariable(nodo.id, clave, valor)}
                />
              ))}
            </fieldset>
          ))}

          <CampoPlagas
            idNodo={nodo.id}
            tipoCultivo={cultivo.tipoCultivo}
            plagas={cultivo.plagas ?? null}
            solucionActual={cultivo.solucion_plagas ?? null}
            onCambiar={(plagas) => actualizarPlagas(nodo.id, plagas)}
            onSolucion={(texto) =>
              actualizarTextoNodo(nodo.id, "solucion_plagas", texto)
            }
            plagasGrupo={resumenGrupo?.plagas}
            solucionGrupo={resumenGrupo?.solucion_plagas}
          />

          <label className="campo">
            <span>solucion_plagas</span>
            <textarea
              rows={2}
              value={cultivo.solucion_plagas ?? ""}
              placeholder="Vacío = null"
              onChange={(evento) =>
                actualizarTextoNodo(nodo.id, "solucion_plagas", evento.target.value)
              }
              className="campo__control campo__control--area"
            />
          </label>

          <label className="campo">
            <span>comentarios</span>
            <textarea
              rows={3}
              value={cultivo.comentarios ?? ""}
              placeholder="Vacío = null"
              onChange={(evento) =>
                actualizarTextoNodo(nodo.id, "comentarios", evento.target.value)
              }
              className="campo__control campo__control--area"
            />
          </label>
        </form>
      )}
    </aside>
  );
}

function CampoPlagas({
  idNodo,
  tipoCultivo,
  plagas,
  solucionActual,
  onCambiar,
  onSolucion,
  plagasGrupo,
  solucionGrupo,
}: {
  idNodo: string;
  tipoCultivo: string;
  plagas: string[] | null;
  solucionActual: string | null;
  onCambiar: (plagas: string[] | null) => void;
  onSolucion: (texto: string | null) => void;
  plagasGrupo?: string[] | null;
  solucionGrupo?: string[] | null;
}) {
  const [alta, setAlta] = useState("");
  const actuales = plagas ?? [];
  const definicion = obtenerCultivoPorId(tipoCultivo);
  const tipicas = (definicion?.plagas_tipicas ?? [])
    .map((id) => obtenerPlagaPorIdONombre(id))
    .filter((item): item is NonNullable<typeof item> => item != null);

  useEffect(() => {
    setAlta("");
  }, [idNodo]);

  const registrar = (nombre: string) => {
    const limpio = nombre.trim();
    if (!limpio) {
      return;
    }
    const catalogo = obtenerPlagaPorIdONombre(limpio);
    const etiqueta = catalogo?.nombre ?? limpio;
    onCambiar([...actuales, etiqueta]);
    if (!solucionActual && catalogo) {
      onSolucion(catalogo.solucion_plagas);
    }
  };

  const agregar = (evento?: FormEvent | KeyboardEvent) => {
    evento?.preventDefault();
    registrar(alta);
    setAlta("");
  };

  return (
    <fieldset className="grupo-campos">
      <legend className="grupo-campos__titulo">Plagas</legend>
      {tipicas.length > 0 ? (
        <div className="campo-plagas__bloque">
          <p className="campo-plagas__ayuda">Frecuentes en este cultivo</p>
          <div className="chip-lista">
            {tipicas.map((plaga) => {
              const yaEsta = actuales.some(
                (item) => item.toLowerCase() === plaga.nombre.toLowerCase(),
              );
              return (
                <button
                  key={plaga.id}
                  type="button"
                  disabled={yaEsta}
                  title={plaga.descripcion}
                  onClick={() => registrar(plaga.nombre)}
                  className="chip"
                >
                  + {plaga.nombre}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="chip-lista">
        {actuales.length === 0 ? (
          <span className="campo-plagas__vacio">Ninguna (null)</span>
        ) : (
          actuales.map((plaga) => (
            <button
              key={plaga}
              type="button"
              onClick={() => onCambiar(actuales.filter((item) => item !== plaga))}
              className="chip"
              title="Quitar plaga"
            >
              {plaga} ×
            </button>
          ))
        )}
      </div>
      {actuales.map((nombre) => {
        const ficha = obtenerPlagaPorIdONombre(nombre);
        if (!ficha) {
          return (
            <p key={nombre} className="campo-plagas__sin-ficha">
              {nombre}: sin ficha de catálogo (queda como texto libre).
            </p>
          );
        }
        return (
          <article key={ficha.id} className="ficha-plaga">
            <p className="ficha-plaga__nombre">{ficha.nombre}</p>
            <p className="ficha-plaga__texto">{ficha.descripcion}</p>
            <p className="ficha-plaga__texto">
              <span className="ficha-plaga__etiqueta">Síntomas:</span> {ficha.sintomas}
            </p>
            <p className="ficha-plaga__texto">
              <span className="ficha-plaga__etiqueta">solucion_plagas:</span>{" "}
              {ficha.solucion_plagas}
            </p>
          </article>
        );
      })}
      <div className="campo__fila">
        <input
          value={alta}
          list={`plagas-catalogo-${idNodo}`}
          placeholder="Añadir plaga"
          onChange={(evento) => setAlta(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              agregar(evento);
            }
          }}
          className="campo__control"
        />
        <datalist id={`plagas-catalogo-${idNodo}`}>
          {CATALOGO_PLAGAS.map((plaga) => (
            <option key={plaga.id} value={plaga.nombre} />
          ))}
        </datalist>
        <button type="button" onClick={() => agregar()} className="boton-secundario">
          Añadir
        </button>
      </div>
      {plagasGrupo !== undefined || solucionGrupo !== undefined ? (
        <p className="campo-plagas__grupo">
          Grupo: {plagasGrupo == null ? "plagas null" : plagasGrupo.join(", ") || "plagas null"}
          {" · "}
          {solucionGrupo == null
            ? "solucion_plagas null"
            : solucionGrupo.join(", ") || "solucion_plagas null"}
        </p>
      ) : null}
    </fieldset>
  );
}
