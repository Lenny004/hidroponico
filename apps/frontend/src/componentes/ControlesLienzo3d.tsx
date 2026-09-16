import { Check, Minus, Plus } from "lucide-react";
import { usarInterfaz } from "../store/usarInterfaz";

export default function ControlesLienzo3d() {
  const zoom = usarInterfaz((estado) => estado.zoom);
  const anclado = usarInterfaz((estado) => estado.anclado);
  const acercar = usarInterfaz((estado) => estado.acercar);
  const alejar = usarInterfaz((estado) => estado.alejar);
  const alternarAnclado = usarInterfaz((estado) => estado.alternarAnclado);

  return (
    <div
      className="controles-lienzo"
      role="toolbar"
      aria-label="Vista 3D"
      onPointerDown={(evento) => evento.stopPropagation()}
    >
      <button
        type="button"
        className="controles-lienzo__boton"
        title="Alejar"
        aria-label="Alejar"
        onClick={alejar}
      >
        <Minus strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className="controles-lienzo__boton"
        title="Acercar"
        aria-label="Acercar"
        onClick={acercar}
      >
        <Plus strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={
          anclado
            ? "controles-lienzo__boton controles-lienzo__boton--activo"
            : "controles-lienzo__boton"
        }
        title={anclado ? "Desanclar cámara" : "Anclar para que no se mueva"}
        aria-pressed={anclado}
        aria-label={anclado ? "Desanclar cámara" : "Anclar cámara"}
        onClick={alternarAnclado}
      >
        <Check strokeWidth={2.25} />
      </button>
      <span className="controles-lienzo__zoom" aria-hidden>
        {Math.round((zoom / 32) * 100)}%
      </span>
    </div>
  );
}
