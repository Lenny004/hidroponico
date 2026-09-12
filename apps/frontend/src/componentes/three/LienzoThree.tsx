import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { usarGrafoConstruccion } from "../../store/usarGrafoConstruccion";
import { COLOR_LIENZO, usarTema } from "../../store/usarTema";
import EscenaNft from "./EscenaNft";

/**
 * Lienzo 3D de los tubos NFT. Un solo WebGL; los cultivos se anclan a orificios.
 */
export default function LienzoThree({
  origenEventos,
}: {
  origenEventos: RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      className="lienzo__three"
      eventSource={origenEventos as RefObject<HTMLElement>}
      eventPrefix="client"
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [6.2, 6.4, 14], zoom: 32, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor(COLOR_LIENZO[usarTema.getState().tema], 1);
      }}
      onPointerMissed={(evento) => {
        const destino = evento.target;
        if (
          destino instanceof Element &&
          destino.closest(".barra-acciones-cultivo, button, input, select, textarea")
        ) {
          return;
        }
        usarGrafoConstruccion.getState().seleccionar(null);
      }}
    >
      <EscenaNft />
    </Canvas>
  );
}
