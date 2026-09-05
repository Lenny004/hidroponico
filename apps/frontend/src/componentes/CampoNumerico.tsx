import { useEffect, useState } from "react";
import {
  esBorradorNumerico,
  parsearNumeroONull,
} from "@hidroponico/tipos-compartidos";

type PropsCampoNumerico = {
  id: string;
  etiqueta: string;
  claveTecnica: string;
  valor: number | null | undefined;
  onConfirmar: (valor: number | null) => void;
};

/**
 * Input de variable numérica. Vacío confirma `null`; no convierte ausencia en 0.
 */
export default function CampoNumerico({
  id,
  etiqueta,
  claveTecnica,
  valor,
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
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span>{etiqueta}</span>
        <span className="font-mono text-[10px] text-muted">{claveTecnica}</span>
      </span>
      <input
        value={texto}
        inputMode="decimal"
        placeholder="null"
        onChange={(evento) => {
          const siguiente = evento.target.value;
          setTexto(siguiente);
          confirmar(siguiente);
        }}
        onBlur={() => onConfirmar(parsearNumeroONull(texto))}
        className="rounded-lg border border-borde bg-lienzo px-2 py-1.5 text-sm outline-none placeholder:text-muted/50 focus:border-acento"
      />
    </label>
  );
}
