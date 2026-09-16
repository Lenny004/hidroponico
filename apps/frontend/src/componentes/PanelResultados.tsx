import {
  CLAVES_MINERALES,
  ETIQUETAS_VARIABLES,
  SIMBOLOS_MINERAL,
  UNIDAD_AGREGADO,
  formatearMedida,
  obtenerCultivoPorId,
  obtenerPlagaPorIdONombre,
  type ClaveMineral,
  type ClaveVariableCultivo,
} from "@hidroponico/tipos-compartidos";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Beaker,
  Bug,
  CheckCircle2,
  Droplets,
  FlaskConical,
} from "lucide-react";
import type { ResultadoMotorApi, ResultadoPipelineApi } from "../api/pipeline";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion, type NodoFlujo } from "../store/usarGrafoConstruccion";

const UUID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const ETIQUETAS_CLAVE_AVISO: Record<string, string> = {
  mineral_magnesio: "Magnesio",
  mineral_potasio: "Potasio",
  mineral_manganeso: "Manganeso",
  mineral_hierro: "Hierro",
  cantidad_sol: "reserva del tanque",
  solucion_plagas: "tratamiento",
  oxigeno: "oxígeno",
};

const MOTORES: Record<
  string,
  { titulo: string; ayuda: string; icono: LucideIcon }
> = {
  minerales: {
    titulo: "Minerales",
    ayuda: "Masa disuelta en la reserva: mg = mg/L × L",
    icono: FlaskConical,
  },
  oxigeno: {
    titulo: "Oxígeno",
    ayuda: "Disuelto en el tanque compartido",
    icono: Droplets,
  },
  insumos: {
    titulo: "Solución",
    ayuda: "Litros de reserva NFT del grupo",
    icono: Beaker,
  },
  plagas: {
    titulo: "Plagas",
    ayuda: "Detecciones y tratamiento del grupo",
    icono: Bug,
  },
};

function etiquetaDe(clave: string): string {
  return (ETIQUETAS_VARIABLES as Record<string, string>)[clave] ?? clave;
}

function unidadDe(clave: string): string {
  return (UNIDAD_AGREGADO as Record<string, string>)[clave] ?? "";
}

function simboloDe(clave: string): string {
  return (SIMBOLOS_MINERAL as Record<string, string>)[clave] ?? "";
}

function listarNombres(nombres: string[]): string {
  if (nombres.length === 0) {
    return "sin cultivos";
  }
  if (nombres.length === 1) {
    return nombres[0];
  }
  if (nombres.length === 2) {
    return `${nombres[0]} y ${nombres[1]}`;
  }
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

function etiquetaNodo(nodos: NodoFlujo[], id: string): string {
  const nodo = nodos.find((item) => item.id === id);
  const tipo = nodo?.data.cultivo.tipoCultivo;
  const nombre = tipo
    ? (obtenerCultivoPorId(tipo)?.nombre ?? tipo)
    : "cultivo";
  if (!tipo) {
    return nombre;
  }
  const mismos = nodos.filter((item) => item.data.cultivo.tipoCultivo === tipo);
  if (mismos.length <= 1) {
    return nombre;
  }
  return `${nombre} ${mismos.findIndex((item) => item.id === id) + 1}`;
}

function humanizarAdvertencia(texto: string, nodos: NodoFlujo[]): string {
  const nombreDe = (id: string) => etiquetaNodo(nodos, id);
  const resumirIds = (ids: string[]): string =>
    ids.length > 3
      ? `todo el grupo (${ids.length} cultivos)`
      : listarNombres(ids.map(nombreDe));

  let salida = texto.replace(
    /(?:en todos los nodos del grupo |para el grupo )?\[[^\]]+\]/g,
    (match) => {
      const bloque = match.match(/\[[^\]]+\]/)?.[0] ?? "[]";
      const ids = bloque
        .slice(1, -1)
        .split(",")
        .map((parte) => parte.trim())
        .filter(Boolean);
      const quien = resumirIds(ids);
      if (match.includes("todos los nodos") || match.includes("para el grupo")) {
        return `en ${quien}`;
      }
      return quien;
    },
  );
  salida = salida.replace(UUID, (id) => nombreDe(id));
  for (const [clave, etiqueta] of Object.entries(ETIQUETAS_CLAVE_AVISO)) {
    salida = salida.replaceAll(clave, etiqueta);
  }
  salida = salida
    .replaceAll("requiere mg/L y litros", "necesita concentración (mg/L) y litros")
    .replaceAll("en null", "sin dato")
    .replace(/oxígeno del grupo usa el mínimo/i, "El tanque usa el oxígeno más bajo:")
    .replaceAll("Motor ", "El motor ")
    .replace(/\s+/g, " ")
    .trim();
  return salida.length === 0 ? texto : salida[0].toUpperCase() + salida.slice(1);
}

function etiquetaPlaga(valor: string): string {
  return obtenerPlagaPorIdONombre(valor)?.nombre ?? valor;
}

function datoVolumen(grupo: ResultadoMotorApi): number | null | undefined {
  const volumen = grupo.datos.volumen_L;
  return typeof volumen === "number" || volumen == null ? volumen : undefined;
}

export default function PanelResultados() {
  const resultado = usarGrafoConstruccion((estado) => estado.resultadoPipeline);
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);

  if (!resultado) {
    return (
      <section className="panel-resultados panel-resultados--vacio" aria-label="Resumen del tubo">
        <div>
          <p className="panel-resultados__kicker">Resumen del tubo</p>
          <p className="panel-resultados__vacio">
            Pulsa Pipeline o un motor para calcular el grupo.
          </p>
        </div>
      </section>
    );
  }

  const avisos = resultado.advertencias;
  const hayAvisos = avisos.length > 0;
  const cultivos = Object.entries(resultado.conteoPorTipo);

  return (
    <section className="panel-resultados" aria-label="Resumen del tubo">
      <header className="panel-resultados__cabecera">
        <div className="panel-resultados__intro">
          <p className="panel-resultados__kicker">Resumen del tubo</p>
          {cultivos.length > 0 ? (
            <ul className="panel-resultados__cultivos">
              {cultivos.map(([tipo, cantidad]) => {
                const definicion = obtenerCultivoPorId(tipo);
                const primero = nodos.find((nodo) => nodo.data.cultivo.tipoCultivo === tipo);
                return (
                  <li key={tipo}>
                    <button
                      type="button"
                      className="panel-resultados__chip"
                      onClick={() => primero && seleccionar(primero.id)}
                      disabled={!primero}
                    >
                      <GlifoCultivo
                        tipoCultivo={tipo}
                        color={definicion?.color ?? "var(--color-acento)"}
                        tamano="chip"
                      />
                      <span>{definicion?.nombre ?? tipo}</span>
                      <span className="panel-resultados__chip-cuenta">× {cantidad}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel-resultados__titulo">Sin cultivos en el cálculo</p>
          )}
        </div>
        <div className="panel-resultados__estado">
          <p
            className={
              resultado.bloqueado
                ? "panel-resultados__badge panel-resultados__badge--bloqueo"
                : hayAvisos
                  ? "panel-resultados__badge panel-resultados__badge--aviso"
                  : "panel-resultados__badge panel-resultados__badge--ok"
            }
          >
            {resultado.bloqueado ? (
              <AlertTriangle className="panel-resultados__badge-icono" strokeWidth={2.25} />
            ) : hayAvisos ? (
              <AlertTriangle className="panel-resultados__badge-icono" strokeWidth={2.25} />
            ) : (
              <CheckCircle2 className="panel-resultados__badge-icono" strokeWidth={2.25} />
            )}
            {resultado.bloqueado
              ? "Cálculo detenido"
              : hayAvisos
                ? `${avisos.length} aviso${avisos.length === 1 ? "" : "s"} · el resto se calculó`
                : "Cálculo completo"}
          </p>
          {hayAvisos ? (
            <details className="panel-resultados__avisos">
              <summary>Ver qué falta</summary>
              <ul>
                {avisos.map((aviso, indice) => (
                  <li key={`${aviso}-${indice}`}>{humanizarAdvertencia(aviso, nodos)}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </header>

      <div className="panel-resultados__motores">
        {resultado.motores.map((motor) => (
          <TarjetaMotor
            key={motor.nombre}
            motor={motor}
            nodos={nodos}
            onSeleccionar={seleccionar}
          />
        ))}
      </div>
    </section>
  );
}

function TarjetaMotor({
  motor,
  nodos,
  onSeleccionar,
}: {
  motor: ResultadoPipelineApi["motores"][number];
  nodos: NodoFlujo[];
  onSeleccionar: (id: string) => void;
}) {
  const meta = MOTORES[motor.nombre] ?? {
    titulo: motor.nombre,
    ayuda: "Resultado del motor",
    icono: FlaskConical,
  };
  const Icono = meta.icono;

  return (
    <article className={`panel-resultados__motor panel-resultados__motor--${motor.nombre}`}>
      <header className="panel-resultados__motor-cabecera">
        <span className="panel-resultados__motor-icono" aria-hidden>
          <Icono strokeWidth={2.25} />
        </span>
        <div title={meta.ayuda}>
          <p className="panel-resultados__motor-nombre">{meta.titulo}</p>
        </div>
      </header>
      {motor.grupos.map((grupo, indice) => (
        <GrupoMotor
          key={grupo.datos.idsNodos?.join("-") ?? `${motor.nombre}-${indice}`}
          grupo={grupo}
          motor={motor.nombre}
          varios={motor.grupos.length > 1}
          indice={indice}
          nodos={nodos}
          onSeleccionar={onSeleccionar}
        />
      ))}
    </article>
  );
}

function GrupoMotor({
  grupo,
  motor,
  varios,
  indice,
  nodos,
  onSeleccionar,
}: {
  grupo: ResultadoMotorApi;
  motor: string;
  varios: boolean;
  indice: number;
  nodos: NodoFlujo[];
  onSeleccionar: (id: string) => void;
}) {
  const ids = grupo.datos.idsNodos ?? [];
  const totales = grupo.datos.totales ?? {};
  const volumen = datoVolumen(grupo);
  const tienePlagas = motor === "plagas" || "plagas" in grupo.datos || "solucion_plagas" in grupo.datos;
  const clavesMinerales = CLAVES_MINERALES.filter((clave) => clave in totales);
  const otrasClaves = Object.keys(totales).filter(
    (clave) => !CLAVES_MINERALES.includes(clave as ClaveMineral),
  );

  return (
    <div className="panel-resultados__grupo">
      {varios ? (
        <div className="panel-resultados__grupo-cabecera">
          <p className="panel-resultados__grupo-titulo">
            Grupo {indice + 1}
            {ids.length > 0 ? ` · ${ids.length} cultivo${ids.length === 1 ? "" : "s"}` : ""}
          </p>
          {ids.length > 0 && ids.length <= 4 ? (
            <ul className="panel-resultados__miembros">
              {ids.map((id) => {
                const nodo = nodos.find((item) => item.id === id);
                const tipo = nodo?.data.cultivo.tipoCultivo ?? "";
                const color = obtenerCultivoPorId(tipo)?.color ?? "var(--color-acento)";
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="panel-resultados__miembro"
                      title={`Seleccionar ${etiquetaNodo(nodos, id)}`}
                      onClick={() => onSeleccionar(id)}
                    >
                      <GlifoCultivo tipoCultivo={tipo} color={color} tamano="chip" />
                      {etiquetaNodo(nodos, id)}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
      {volumen != null ? (
        <p className="panel-resultados__volumen">Tanque: {formatearMedida(volumen, "L")}</p>
      ) : null}
      {clavesMinerales.length > 0 ? (
        <ul className="panel-resultados__metricas">
          {clavesMinerales.map((clave) => (
            <Metrica
              key={clave}
              clave={clave}
              valor={totales[clave] ?? null}
              simbolo={simboloDe(clave)}
            />
          ))}
        </ul>
      ) : null}
      {otrasClaves.length > 0 ? (
        <ul className="panel-resultados__metricas panel-resultados__metricas--simples">
          {otrasClaves.map((clave) => (
            <Metrica
              key={clave}
              clave={clave}
              valor={totales[clave] ?? null}
              simbolo={simboloDe(clave)}
            />
          ))}
        </ul>
      ) : null}
      {tienePlagas ? (
        <div className="panel-resultados__plagas">
          <DatoLista
            etiqueta="Detectadas"
            valores={grupo.datos.plagas}
            vacio="Ninguna"
          />
          <DatoLista
            etiqueta="Tratamiento"
            valores={grupo.datos.solucion_plagas}
            vacio="Sin tratamiento"
          />
        </div>
      ) : null}
      {!grupo.exitoso ? (
        <p className="panel-resultados__fallo">Este motor falló; los demás siguieron.</p>
      ) : null}
    </div>
  );
}

function Metrica({
  clave,
  valor,
  simbolo,
}: {
  clave: string;
  valor: number | null;
  simbolo: string;
}) {
  const nulo = valor == null;
  return (
    <li
      className={
        nulo
          ? "panel-resultados__metrica panel-resultados__metrica--nula"
          : "panel-resultados__metrica"
      }
    >
      <p className="panel-resultados__metrica-etiqueta">
        {simbolo ? <span className="panel-resultados__metrica-simbolo">{simbolo}</span> : null}
        {etiquetaDe(clave as ClaveVariableCultivo)}
      </p>
      {nulo ? (
        <p className="panel-resultados__metrica-valor panel-resultados__metrica-valor--nulo">
          Sin dato
        </p>
      ) : (
        <p className="panel-resultados__metrica-valor">
          {formatearMedida(valor, unidadDe(clave))}
        </p>
      )}
    </li>
  );
}

function DatoLista({
  etiqueta,
  valores,
  vacio,
}: {
  etiqueta: string;
  valores: string[] | null | undefined;
  vacio: string;
}) {
  if (valores == null) {
    return (
      <p className="panel-resultados__lista-texto">
        <span>{etiqueta}</span>
        <strong className="panel-resultados__metrica-valor--nulo">Sin dato</strong>
      </p>
    );
  }
  if (valores.length === 0) {
    return (
      <p className="panel-resultados__lista-texto">
        <span>{etiqueta}</span>
        <strong>{vacio}</strong>
      </p>
    );
  }
  return (
    <div className="panel-resultados__lista-bloque">
      <p className="panel-resultados__lista-etiqueta">{etiqueta}</p>
      <ul className="panel-resultados__pills">
        {valores.map((valor) => (
          <li key={valor} className="panel-resultados__pill">
            {etiquetaPlaga(valor)}
          </li>
        ))}
      </ul>
    </div>
  );
}
