import {
  ETAPAS_VIDA,
  ETIQUETAS_ETAPA_VIDA,
  UNIDAD_NODO,
  alertasOperacion,
  calendarioOperativo,
  fechaInicioHoy,
  formatearMedida,
  obtenerCultivoPorId,
  plantillaParaEtapa,
  proyectarInsumos,
  volumenDeposito,
  contrastarReservaConDeposito,
  type MedicionOperativa,
} from "@hidroponico/tipos-compartidos";
import { Check, ClipboardCheck, History, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import { usarOperacion } from "../store/usarOperacion";

function fechaVisible(valor: string): string {
  const partes = valor.split("-").map(Number);
  if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) {
    return valor;
  }
  return new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
  });
}

function numeroONull(valor: string): number | null {
  if (!valor.trim()) {
    return null;
  }
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export default function PanelOperacion() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const deposito = usarGrafoConstruccion((estado) => estado.deposito);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const mediciones = usarOperacion((estado) => estado.mediciones);
  const tareasCompletadas = usarOperacion((estado) => estado.tareasCompletadas);
  const historial = usarOperacion((estado) => estado.historial);
  const registrarMedicion = usarOperacion((estado) => estado.registrarMedicion);
  const quitarMedicion = usarOperacion((estado) => estado.quitarMedicion);
  const alternarTarea = usarOperacion((estado) => estado.alternarTarea);
  const [formulario, setFormulario] = useState({ fecha: fechaInicioHoy(), ph: "", oxigeno_mgL: "", volumen_L: "", notas: "" });
  const [error, setError] = useState<string | null>(null);

  const cultivos = useMemo(() => nodos.map((nodo) => nodo.data.cultivo), [nodos]);
  const tareas = useMemo(() => calendarioOperativo(cultivos), [cultivos]);
  const alertas = useMemo(() => alertasOperacion(cultivos, deposito, mediciones), [cultivos, deposito, mediciones]);
  const proyeccion = useMemo(() => proyectarInsumos(cultivos, 1), [cultivos]);
  const volumen = useMemo(() => volumenDeposito(deposito), [deposito]);
  const contraste = useMemo(() => contrastarReservaConDeposito(proyeccion.reservaL, volumen.netoL), [proyeccion.reservaL, volumen.netoL]);
  const seleccionado = nodos.find((nodo) => nodo.id === idSeleccionado)?.data.cultivo ?? null;
  const definicionSeleccionada = seleccionado ? obtenerCultivoPorId(seleccionado.tipoCultivo) : null;
  const estadoTanque = contraste.estado.replaceAll("_", "-");

  const guardarMedicion = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const medicion: Omit<MedicionOperativa, "id"> = {
      fecha: formulario.fecha,
      ph: numeroONull(formulario.ph),
      oxigeno_mgL: numeroONull(formulario.oxigeno_mgL),
      volumen_L: numeroONull(formulario.volumen_L),
      notas: formulario.notas.trim() || null,
    };
    if (!medicion.fecha || (medicion.ph == null && medicion.oxigeno_mgL == null && medicion.volumen_L == null && !medicion.notas)) {
      setError("Registra al menos una medición o una nota.");
      return;
    }
    registrarMedicion(medicion);
    setError(null);
    setFormulario({ fecha: fechaInicioHoy(), ph: "", oxigeno_mgL: "", volumen_L: "", notas: "" });
  };

  return (
    <section className="operacion" aria-label="Operación real del cultivo">
      <header className="operacion__cabecera">
        <div>
          <p className="operacion__eyebrow">CONTROL DIARIO</p>
          <h3 className="operacion__titulo">Operación real</h3>
        </div>
        <span className="operacion__contador"><ClipboardCheck aria-hidden /> {tareas.length} tareas</span>
      </header>

      <div className="operacion__metricas" aria-label="Resumen operativo">
        <div className="operacion__metrica">
          <span>Reserva requerida</span>
          <strong>{proyeccion.reservaL == null ? "—" : formatearMedida(proyeccion.reservaL, "L")}</strong>
        </div>
        <div className="operacion__metrica">
          <span>Capacidad neta</span>
          <strong>{volumen.netoL == null ? "—" : formatearMedida(volumen.netoL, "L")}</strong>
        </div>
        <div className="operacion__metrica">
          <span>Estado del tanque</span>
          <strong className={`operacion__estado operacion__estado--${estadoTanque}`}>
            {contraste.estado === "cabe" ? "Cabe" : contraste.estado === "excede" ? "Excede" : "Pendiente"}
          </strong>
        </div>
      </div>

      <section className="operacion__alertas" aria-label="Alertas operativas">
        <div className="operacion__subtitulo-fila">
          <h4>Alertas</h4>
          <span>{alertas.filter((alerta) => alerta.severidad !== "info").length} requieren atención</span>
        </div>
        {alertas.length === 0 ? (
          <p className="operacion__vacio">Sin alertas operativas.</p>
        ) : (
          <ul className="operacion__lista">
            {alertas.map((alerta) => (
              <li key={alerta.id} className={`operacion__alerta operacion__alerta--${alerta.severidad}`}>
                {alerta.severidad === "info" ? <ClipboardCheck aria-hidden /> : <TriangleAlert aria-hidden />}
                <span><strong>{alerta.titulo}</strong><small>{alerta.detalle}</small></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="operacion__bloque" open>
        <summary>Calendario de tareas</summary>
        <ul className="operacion__tareas">
          {tareas.map((tarea) => {
            const clave = `${tarea.id}:${tarea.fechaObjetivo}`;
            const completa = tareasCompletadas.includes(clave);
            return (
              <li key={clave} className={completa ? "operacion__tarea operacion__tarea--completa" : "operacion__tarea"}>
                <button
                  type="button"
                  className="operacion__tarea-check"
                  aria-label={completa ? `Marcar pendiente: ${tarea.titulo}` : `Completar: ${tarea.titulo}`}
                  aria-pressed={completa}
                  onClick={() => alternarTarea(tarea.id, tarea.fechaObjetivo)}
                >
                  <Check aria-hidden />
                </button>
                <span className="operacion__tarea-contenido">
                  <strong>{tarea.titulo}</strong>
                  <small>{fechaVisible(tarea.fechaObjetivo)} · {tarea.descripcion}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </details>

      <details className="operacion__bloque">
        <summary>Recetas por etapa{definicionSeleccionada ? ` · ${definicionSeleccionada.nombre}` : ""}</summary>
        {!seleccionado || !definicionSeleccionada ? (
          <p className="operacion__vacio">Selecciona un cultivo para ver sus recetas de etapa.</p>
        ) : (
          <div className="operacion__tabla-wrap">
            <table className="operacion__tabla">
              <thead><tr><th>Etapa</th><th>Mg</th><th>K</th><th>O₂</th><th>Reserva</th></tr></thead>
              <tbody>
                {ETAPAS_VIDA.map((etapa) => {
                  const receta = plantillaParaEtapa(seleccionado.tipoCultivo, etapa);
                  return (
                    <tr key={etapa}>
                      <th scope="row">{ETIQUETAS_ETAPA_VIDA[etapa]}</th>
                      <td>{receta?.mineral_magnesio == null ? "—" : formatearMedida(receta.mineral_magnesio, UNIDAD_NODO.mineral_magnesio)}</td>
                      <td>{receta?.mineral_potasio == null ? "—" : formatearMedida(receta.mineral_potasio, UNIDAD_NODO.mineral_potasio)}</td>
                      <td>{receta?.oxigeno == null ? "—" : formatearMedida(receta.oxigeno, UNIDAD_NODO.oxigeno)}</td>
                      <td>{receta?.cantidad_sol == null ? "—" : formatearMedida(receta.cantidad_sol, UNIDAD_NODO.cantidad_sol)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <details className="operacion__bloque">
        <summary>Registrar medición</summary>
        <form className="operacion__formulario" onSubmit={guardarMedicion}>
          <label><span>Fecha</span><input type="date" value={formulario.fecha} onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })} /></label>
          <label><span>pH</span><input type="number" min="0" max="14" step="0.1" placeholder="5.5–6.5" value={formulario.ph} onChange={(evento) => setFormulario({ ...formulario, ph: evento.target.value })} /></label>
          <label><span>O₂ (mg/L)</span><input type="number" min="0" step="0.1" placeholder="5–8" value={formulario.oxigeno_mgL} onChange={(evento) => setFormulario({ ...formulario, oxigeno_mgL: evento.target.value })} /></label>
          <label><span>Volumen (L)</span><input type="number" min="0" step="0.1" placeholder="Medido" value={formulario.volumen_L} onChange={(evento) => setFormulario({ ...formulario, volumen_L: evento.target.value })} /></label>
          <label className="operacion__campo-ancho"><span>Nota</span><input type="text" placeholder="Ej. se repusieron 4 L" value={formulario.notas} onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })} /></label>
          {error ? <p className="operacion__error" role="alert">{error}</p> : null}
          <button type="submit" className="boton-secundario operacion__guardar"><Plus aria-hidden /> Guardar medición</button>
        </form>
      </details>

      <details className="operacion__bloque">
        <summary><History aria-hidden /> Mediciones registradas ({mediciones.length})</summary>
        {mediciones.length === 0 ? (
          <p className="operacion__vacio">Aún no hay mediciones registradas.</p>
        ) : (
          <ul className="operacion__historial">
            {mediciones.slice(0, 8).map((medicion) => <FilaMedicion key={medicion.id} medicion={medicion} onQuitar={() => quitarMedicion(medicion.id)} />)}
          </ul>
        )}
      </details>

      <details className="operacion__bloque">
        <summary><History aria-hidden /> Historial operativo ({historial.length})</summary>
        {historial.length === 0 ? (
          <p className="operacion__vacio">Los cambios y mediciones aparecerán aquí.</p>
        ) : (
          <ul className="operacion__historial">
            {historial.slice(0, 12).map((evento) => (
              <li key={evento.id} className="operacion__medicion">
                <div>
                  <strong>{fechaVisible(evento.fecha)} · {evento.tipo === "medicion" ? "Medición" : "Cambio"}</strong>
                  <small>{evento.descripcion}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}

function FilaMedicion({ medicion, onQuitar }: { medicion: MedicionOperativa; onQuitar: () => void }) {
  return (
    <li className="operacion__medicion">
      <div><strong>{fechaVisible(medicion.fecha)}</strong><small>{medicion.notas ?? "Sin nota"}</small></div>
      <span>pH {medicion.ph ?? "—"} · O₂ {medicion.oxigeno_mgL ?? "—"} · {medicion.volumen_L == null ? "—" : `${medicion.volumen_L} L`}</span>
      <button type="button" className="operacion__borrar" title="Eliminar medición" aria-label="Eliminar medición" onClick={onQuitar}><Trash2 aria-hidden /></button>
    </li>
  );
}
