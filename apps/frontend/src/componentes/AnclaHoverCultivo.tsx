import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { FichaHoverCultivo as DatosFicha } from "@hidroponico/tipos-compartidos";
import FichaHoverCultivo from "./FichaHoverCultivo";

const RETARDO_MS = 180;
const ANCHO_FICHA = 272;
const ALTO_FICHA = 300;

export default function AnclaHoverCultivo({
  ficha,
  className,
  children,
}: {
  ficha: DatosFicha | null;
  className?: string;
  children: ReactNode;
}) {
  const anclaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const cancelar = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const colocar = () => {
    const caja = anclaRef.current?.getBoundingClientRect();
    if (!caja) {
      return;
    }
    let left = caja.right + 10;
    if (left + ANCHO_FICHA > window.innerWidth - 8) {
      left = caja.left - ANCHO_FICHA - 10;
    }
    if (left < 8) {
      left = 8;
    }
    let top = caja.top + caja.height / 2 - ALTO_FICHA / 2;
    if (top < 8) {
      top = 8;
    }
    if (top + ALTO_FICHA > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - ALTO_FICHA - 8);
    }
    setCoords({ top, left });
  };

  const mostrar = () => {
    if (!ficha) {
      return;
    }
    cancelar();
    timerRef.current = window.setTimeout(() => {
      colocar();
      setVisible(true);
    }, RETARDO_MS);
  };

  const ocultar = () => {
    cancelar();
    setVisible(false);
  };

  useEffect(() => () => cancelar(), []);

  return (
    <div
      ref={anclaRef}
      className={className ? `ancla-hover ${className}` : "ancla-hover"}
      onMouseEnter={mostrar}
      onMouseLeave={ocultar}
      onFocusCapture={mostrar}
      onBlurCapture={ocultar}
      onDragStart={ocultar}
    >
      {children}
      {visible && ficha
        ? createPortal(
            <div
              className="ancla-hover__globo"
              style={{ top: coords.top, left: coords.left }}
              role="tooltip"
            >
              <FichaHoverCultivo ficha={ficha} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
