import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  CATALOGO_CULTIVOS,
  ETIQUETAS_VARIABLES,
  GRUPOS_VARIABLES,
  obtenerCultivoPorId,
} from "@hidroponico/tipos-compartidos";
import CampoNumerico from "./CampoNumerico";
import { resumenGrupoDeNodo } from "../api/resumen-grupo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function PanelSeleccion() {
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const actualizarTipoCultivo = usarGrafoConstruccion((estado) => estado.actualizarTipoCultivo);
  const actualizarVariable = usarGrafoConstruccion((estado) => estado.actualizarVariable);
  const actualizarTextoNodo = usarGrafoConstruccion((estado) => estado.actualizarTextoNodo);
  const actualizarPlagas = usarGrafoConstruccion((estado) => estado.actualizarPlagas);
  const resultadoPipeline = usarGrafoConstruccion((estado) => estado.resultadoPipeline);

  const nodo = nodos.find((item) => item.id === idSeleccionado);
  const cultivo = nodo?.data.cultivo;
  const resumenGrupo = nodo ? resumenGrupoDeNodo(resultadoPipeline, nodo.id) : null;
  const nombre = cultivo
    ? (obtenerCultivoPorId(cultivo.tipoCultivo)?.nombre ?? cultivo.tipoCultivo)
    : null;

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-borde bg-panel p-3">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        Detalle
      </p>
      {!nodo || !cultivo || !nombre ? (
        <p className="text-sm text-muted">
          Haz click en un nodo para ver y editar su ficha.
        </p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(evento) => evento.preventDefault()}
        >
          <div>
            <p className="text-lg font-semibold">{nombre}</p>
            <p className="break-all text-[11px] text-muted">{nodo.id}</p>
          </div>

          <label className="flex flex-col gap-1 text-xs">
            <span>Tipo de cultivo</span>
            <select
              value={cultivo.tipoCultivo}
              onChange={(evento) => actualizarTipoCultivo(nodo.id, evento.target.value)}
              className="rounded-lg border border-borde bg-lienzo px-2 py-1.5 text-sm outline-none focus:border-acento"
            >
              {CATALOGO_CULTIVOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <p className="text-[11px] text-muted">
            Cada campo es de esta planta. El total del grupo conectado aparece debajo al calcular.
          </p>

          {GRUPOS_VARIABLES.map((grupo) => (
            <fieldset key={grupo.titulo} className="flex flex-col gap-2">
              <legend className="text-xs font-semibold tracking-wide text-muted uppercase">
                {grupo.titulo}
              </legend>
              {grupo.claves.map((clave) => (
                <CampoNumerico
                  key={`${nodo.id}-${clave}`}
                  id={`${nodo.id}-${clave}`}
                  etiqueta={ETIQUETAS_VARIABLES[clave]}
                  claveTecnica={clave}
                  valor={cultivo.variables[clave]}
                  totalGrupo={resumenGrupo?.totales[clave]}
                  onConfirmar={(valor) => actualizarVariable(nodo.id, clave, valor)}
                />
              ))}
            </fieldset>
          ))}

          <CampoPlagas
            idNodo={nodo.id}
            plagas={cultivo.plagas ?? null}
            onCambiar={(plagas) => actualizarPlagas(nodo.id, plagas)}
            plagasGrupo={resumenGrupo?.plagas}
            solucionGrupo={resumenGrupo?.solucion_plagas}
          />

          <label className="flex flex-col gap-1 text-xs">
            <span>solucion_plagas</span>
            <textarea
              rows={2}
              value={cultivo.solucion_plagas ?? ""}
              placeholder="Vacío = null"
              onChange={(evento) =>
                actualizarTextoNodo(nodo.id, "solucion_plagas", evento.target.value)
              }
              className="resize-y rounded-lg border border-borde bg-lienzo px-2 py-1.5 text-sm outline-none placeholder:text-muted/50 focus:border-acento"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span>comentarios</span>
            <textarea
              rows={3}
              value={cultivo.comentarios ?? ""}
              placeholder="Vacío = null"
              onChange={(evento) =>
                actualizarTextoNodo(nodo.id, "comentarios", evento.target.value)
              }
              className="resize-y rounded-lg border border-borde bg-lienzo px-2 py-1.5 text-sm outline-none placeholder:text-muted/50 focus:border-acento"
            />
          </label>
        </form>
      )}
    </aside>
  );
}

function CampoPlagas({
  idNodo,
  plagas,
  onCambiar,
  plagasGrupo,
  solucionGrupo,
}: {
  idNodo: string;
  plagas: string[] | null;
  onCambiar: (plagas: string[] | null) => void;
  plagasGrupo?: string[] | null;
  solucionGrupo?: string[] | null;
}) {
  const [alta, setAlta] = useState("");
  const actuales = plagas ?? [];

  useEffect(() => {
    setAlta("");
  }, [idNodo]);

  const agregar = (evento?: FormEvent | KeyboardEvent) => {
    evento?.preventDefault();
    const nombre = alta.trim();
    if (!nombre) {
      return;
    }
    onCambiar([...actuales, nombre]);
    setAlta("");
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold tracking-wide text-muted uppercase">
        Plagas
      </legend>
      <div className="flex flex-wrap gap-1">
        {actuales.length === 0 ? (
          <span className="text-xs text-muted">Ninguna (null)</span>
        ) : (
          actuales.map((plaga) => (
            <button
              key={plaga}
              type="button"
              onClick={() => onCambiar(actuales.filter((item) => item !== plaga))}
              className="rounded-full border border-borde bg-lienzo px-2 py-0.5 text-xs hover:border-acento"
              title="Quitar plaga"
            >
              {plaga} ×
            </button>
          ))
        )}
      </div>
      <div className="flex gap-1">
        <input
          value={alta}
          placeholder="Añadir plaga"
          onChange={(evento) => setAlta(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              agregar(evento);
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-borde bg-lienzo px-2 py-1.5 text-sm outline-none placeholder:text-muted/50 focus:border-acento"
        />
        <button
          type="button"
          onClick={() => agregar()}
          className="rounded-lg border border-borde px-2 text-sm hover:border-acento"
        >
          Añadir
        </button>
      </div>
      {plagasGrupo !== undefined || solucionGrupo !== undefined ? (
        <p className="text-[11px] text-acento">
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
