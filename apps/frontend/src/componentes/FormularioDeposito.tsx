import {
  FORMAS_DEPOSITO,
  RECIRCULACIONES_NFT_MAX,
  RECIRCULACIONES_NFT_MIN,
  esBorradorNumerico,
  parsearFormaDeposito,
  parsearNumeroONull,
  type FormaDeposito,
} from "@hidroponico/tipos-compartidos";
import { useEffect, useState } from "react";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

export default function FormularioDeposito() {
  const deposito = usarGrafoConstruccion((estado) => estado.deposito);
  const actualizar = usarGrafoConstruccion((estado) => estado.actualizarDeposito);

  return (
    <fieldset className="deposito">
      <legend className="deposito__titulo">Depósito físico</legend>
      <p className="deposito__ayuda">
        Capacidad del tanque (interior y nivel de trabajo). No sustituye los litros por planta.
      </p>
      <label className="campo">
        <span>Forma</span>
        <select
          className="campo__control"
          value={deposito.forma}
          onChange={(evento) => {
            const forma = parsearFormaDeposito(evento.target.value);
            if (forma) {
              actualizar({ forma });
            }
          }}
        >
          {FORMAS_DEPOSITO.map((forma) => (
            <option key={forma} value={forma}>
              {forma === "rectangular" ? "Rectangular" : "Cilindro"}
            </option>
          ))}
        </select>
      </label>
      {deposito.forma === "rectangular" ? (
        <>
          <CampoOpcional
            etiqueta="Largo interior"
            unidad="cm"
            valor={deposito.largo_cm}
            onConfirmar={(largo_cm) => actualizar({ largo_cm })}
          />
          <CampoOpcional
            etiqueta="Ancho interior"
            unidad="cm"
            valor={deposito.ancho_cm}
            onConfirmar={(ancho_cm) => actualizar({ ancho_cm })}
          />
        </>
      ) : (
        <CampoOpcional
          etiqueta="Diámetro interior"
          unidad="cm"
          valor={deposito.diametro_cm}
          onConfirmar={(diametro_cm) => actualizar({ diametro_cm })}
        />
      )}
      <CampoOpcional
        etiqueta="Altura de líquido"
        unidad="cm"
        valor={deposito.alto_liquido_cm}
        onConfirmar={(alto_liquido_cm) => actualizar({ alto_liquido_cm })}
      />
      <CampoOpcional
        etiqueta="Desplazamiento"
        unidad="L"
        valor={deposito.desplazamiento_L}
        placeholder="Equipo bajo el nivel"
        onConfirmar={(desplazamiento_L) => actualizar({ desplazamiento_L })}
      />
      <CampoOpcional
        etiqueta="Recirculaciones / h"
        unidad="1–2"
        valor={deposito.recirculaciones_h}
        onConfirmar={(valor) => {
          if (valor == null) {
            return;
          }
          actualizar({
            recirculaciones_h: Math.min(
              RECIRCULACIONES_NFT_MAX,
              Math.max(RECIRCULACIONES_NFT_MIN, valor),
            ),
          });
        }}
      />
    </fieldset>
  );
}

function CampoOpcional({
  etiqueta,
  unidad,
  valor,
  placeholder,
  onConfirmar,
}: {
  etiqueta: string;
  unidad: string;
  valor: number | null;
  placeholder?: string;
  onConfirmar: (valor: number | null) => void;
}) {
  const [texto, setTexto] = useState(valor == null ? "" : String(valor));
  useEffect(() => {
    setTexto(valor == null ? "" : String(valor));
  }, [valor]);
  const confirmar = (crudo: string) => {
    if (esBorradorNumerico(crudo)) {
      return;
    }
    onConfirmar(parsearNumeroONull(crudo));
  };
  return (
    <label className="campo">
      <span>
        {etiqueta} <span className="campo__unidad">({unidad})</span>
      </span>
      <input
        className="campo__control"
        inputMode="decimal"
        placeholder={placeholder ?? "Vacío = sin dato"}
        value={texto}
        onChange={(evento) => {
          const siguiente = evento.target.value;
          setTexto(siguiente);
          confirmar(siguiente);
        }}
        onBlur={() => onConfirmar(parsearNumeroONull(texto))}
      />
    </label>
  );
}

export function etiquetaForma(forma: FormaDeposito): string {
  return forma === "cilindro" ? "cilindro" : "prisma";
}
