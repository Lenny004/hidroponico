import { useMemo, useState } from "react";
import {
  calcularRegresionLineal,
  estimarRegresionLineal,
  type PuntoRegresion,
} from "@hidroponico/tipos-compartidos";

interface PuntoFormulario {
  x: string;
  y: string;
}

const PUNTO_VACIO: PuntoFormulario = { x: "", y: "" };

function numero(valor: string): number | null {
  const resultado = Number(valor.replace(",", "."));
  return valor.trim() !== "" && Number.isFinite(resultado) ? resultado : null;
}

function puntosValidos(formulario: PuntoFormulario[]): PuntoRegresion[] {
  return formulario.flatMap((punto) => {
    const x = numero(punto.x);
    const y = numero(punto.y);
    return x == null || y == null ? [] : [{ x, y }];
  });
}

function escala(valor: number, minimo: number, maximo: number, tamano: number, margen: number): number {
  if (maximo === minimo) {
    return tamano / 2;
  }
  return margen + ((valor - minimo) / (maximo - minimo)) * (tamano - margen * 2);
}

/** Panel de captura y visualización de observaciones para una regresión lineal. */
export default function PanelRegresion() {
  const [formulario, setFormulario] = useState<PuntoFormulario[]>([
    { ...PUNTO_VACIO },
    { ...PUNTO_VACIO },
  ]);
  const [xProyeccion, setXProyeccion] = useState("");
  const puntos = useMemo(() => puntosValidos(formulario), [formulario]);
  const regresion = useMemo(() => calcularRegresionLineal(puntos), [puntos]);

  const actualizar = (indice: number, campo: keyof PuntoFormulario, valor: string) => {
    setFormulario((actual) =>
      actual.map((punto, posicion) =>
        posicion === indice ? { ...punto, [campo]: valor } : punto,
      ),
    );
  };

  const limpiar = () => setFormulario([{ ...PUNTO_VACIO }, { ...PUNTO_VACIO }]);

  return (
    <section className="panel-regresion" aria-label="Regresión lineal">
      <p className="panel-regresion__ayuda">
        Agrega observaciones históricas, por ejemplo día y litros de reposición. La regresión no
        modifica los datos del grafo.
      </p>
      <div className="panel-regresion__tabla">
        <div className="panel-regresion__cabecera" aria-hidden>
          <span>X</span>
          <span>Y</span>
          <span />
        </div>
        {formulario.map((punto, indice) => (
          <div className="panel-regresion__fila" key={indice}>
            <input
              inputMode="decimal"
              aria-label={`Valor X ${indice + 1}`}
              placeholder="día"
              value={punto.x}
              onChange={(evento) => actualizar(indice, "x", evento.target.value)}
            />
            <input
              inputMode="decimal"
              aria-label={`Valor Y ${indice + 1}`}
              placeholder="medición"
              value={punto.y}
              onChange={(evento) => actualizar(indice, "y", evento.target.value)}
            />
            <button
              type="button"
              className="panel-regresion__quitar"
              aria-label={`Quitar observación ${indice + 1}`}
              onClick={() => setFormulario((actual) => actual.filter((_, posicion) => posicion !== indice))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="panel-regresion__agregar"
        onClick={() => setFormulario((actual) => [...actual, { ...PUNTO_VACIO }])}
      >
        + Agregar observación
      </button>
      <button type="button" className="panel-regresion__limpiar" onClick={limpiar}>
        Limpiar observaciones
      </button>
      {regresion ? <ResultadoRegresion regresion={regresion} /> : (
        <p className="panel-regresion__vacio">Se necesitan dos puntos con valores X distintos.</p>
      )}
      {regresion ? (
        <div className="panel-regresion__proyeccion">
          <label>
            <span>Proyectar Y para X</span>
            <input
              inputMode="decimal"
              placeholder="Ej. 14"
              value={xProyeccion}
              onChange={(evento) => setXProyeccion(evento.target.value)}
            />
          </label>
          {numero(xProyeccion) == null ? (
            <p>Escribe un valor de X para obtener una estimación.</p>
          ) : (
            <strong>
              Y estimada: {estimarRegresionLineal(regresion, numero(xProyeccion)!).toFixed(3)}
            </strong>
          )}
        </div>
      ) : null}
    </section>
  );
}

function ResultadoRegresion({ regresion }: { regresion: NonNullable<ReturnType<typeof calcularRegresionLineal>> }) {
  const ancho = 280;
  const alto = 150;
  const margen = 18;
  const minimoY = regresion.minimoY === regresion.maximoY ? regresion.minimoY - 1 : regresion.minimoY;
  const maximoY = regresion.minimoY === regresion.maximoY ? regresion.maximoY + 1 : regresion.maximoY;
  const puntos = regresion.puntos.map((punto) => ({
    x: escala(punto.x, regresion.minimoX, regresion.maximoX, ancho, margen),
    y: alto - escala(punto.y, minimoY, maximoY, alto, margen),
  }));
  const xInicial = escala(regresion.minimoX, regresion.minimoX, regresion.maximoX, ancho, margen);
  const xFinal = escala(regresion.maximoX, regresion.minimoX, regresion.maximoX, ancho, margen);
  const yInicial = alto - escala(
    estimarRegresionLineal(regresion, regresion.minimoX),
    minimoY,
    maximoY,
    alto,
    margen,
  );
  const yFinal = alto - escala(
    estimarRegresionLineal(regresion, regresion.maximoX),
    minimoY,
    maximoY,
    alto,
    margen,
  );

  return (
    <div className="panel-regresion__resultado">
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Puntos y recta de regresión">
        <line x1={xInicial} y1={yInicial} x2={xFinal} y2={yFinal} className="panel-regresion__recta" />
        {puntos.map((punto, indice) => (
          <circle key={indice} cx={punto.x} cy={punto.y} r="3.5" className="panel-regresion__punto" />
        ))}
      </svg>
      <dl className="panel-regresion__metricas">
        <div><dt>Pendiente</dt><dd>{regresion.pendiente.toFixed(3)} Y/X</dd></div>
        <div><dt>Intercepto</dt><dd>{regresion.intercepto.toFixed(3)} Y</dd></div>
        <div><dt>R²</dt><dd>{regresion.rCuadrado.toFixed(3)}</dd></div>
      </dl>
      <p className="panel-regresion__ecuacion">
        Ecuación: Y = {regresion.intercepto.toFixed(3)} + {regresion.pendiente.toFixed(3)}X
      </p>
      <p className="panel-regresion__nota">R² indica ajuste estadístico; no demuestra causalidad.</p>
    </div>
  );
}
