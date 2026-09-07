import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { usarGrafoConstruccion } from "../../store/usarGrafoConstruccion";
import EscenaNft from "./EscenaNft";

/**
 * Lienzo 3D del tubo NFT. Un solo WebGL; los cultivos se anclan a orificios.
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
      camera={{ position: [5.2, 5.8, 8.4], zoom: 22, near: 0.1, far: 80 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0b1220", 1);
      }}
      onPointerMissed={() => {
        usarGrafoConstruccion.getState().seleccionar(null);
      }}
    >
      <EscenaNft />
    </Canvas>
  );
}
