import { useEffect, useState } from "react";
import {
  esBorradorNumerico,
  formatearMedida,
  parsearNumeroONull,
} from "@hidroponico/tipos-compartidos";

type PropsCampoNumerico = {
  id: string;
  etiqueta: string;
  claveTecnica: string;
  unidadNodo: string;
  unidadAgregado: string;
  valor: number | null | undefined;
  totalGrupo?: number | null;
  onConfirmar: (valor: number | null) => void;
};

/**
 * Input de variable numérica. Vacío confirma `null`; no convierte ausencia en 0.
 */
export default function CampoNumerico({
  id,
  etiqueta,
  claveTecnica,
  unidadNodo,
  unidadAgregado,
  valor,
  totalGrupo,
  onConfirmar,
}: PropsCampoNumerico) {
  const [texto, setTexto] = useState(valor == null ? "" : String(valor));

  useEffect(() => {
    setTexto(valor == null ? "" : String(valor));
  }, [valor, id]);

  const confirmar = (crudo: string) => {
    if (esBorradorNumerico(crudo)) {
      return;
    }
    onConfirmar(parsearNumeroONull(crudo));
  };

  return (
    <label className="campo" title={claveTecnica}>
      <span className="campo__cabecera">
        <span>
          {etiqueta}{" "}
          <span className="campo__unidad">({unidadNodo})</span>
        </span>
      </span>
      <input
        value={texto}
        inputMode="decimal"
        placeholder="Vacío = sin dato"
        onChange={(evento) => {
          const siguiente = evento.target.value;
          setTexto(siguiente);
          confirmar(siguiente);
        }}
        onBlur={() => onConfirmar(parsearNumeroONull(texto))}
        className="campo__control"
      />
      {totalGrupo !== undefined ? (
        <span className={totalGrupo == null ? "campo__grupo campo__grupo--nulo" : "campo__grupo"}>
          {totalGrupo == null
            ? "Grupo: sin dato"
            : `Grupo: ${formatearMedida(totalGrupo, unidadAgregado)}`}
        </span>
      ) : null}
    </label>
  );
}
