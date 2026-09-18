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
      camera={{ position: [10.6, 5.3, 13.2], fov: 42, near: 0.1, far: 200 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(COLOR_LIENZO[usarTema.getState().tema], 1);
        camera.lookAt(0, 3.0, 0.35);
      }}
      onPointerMissed={(evento) => {
        const destino = evento.target;
        if (
          destino instanceof Element &&
          destino.closest(".barra-acciones-cultivo, .controles-lienzo, button, input, select, textarea")
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
