import { useRef } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { POSICIONES_X_ORIFICIO } from "./orificios-nft";
import type { CultivoEnOrificio } from "./tipos-orificio";

const COLOR_TUBO = "#c9c4e8";
const COLOR_TUBO_OSCURO = "#9a94c2";
const COLOR_TIERRA = "#4e342e";
const COLOR_TALLO = "#3d7a38";
const COLOR_ANILLO = "#8d87b3";
const COLOR_ANILLO_HOVER = "#34d399";
const COLOR_ANILLO_SELECCION = "#ffffff";
const COLOR_ANILLO_GRUPO = "#fcd34d";

type PropsModuloNft = {
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
};

/**
 * Módulo NFT isométrico: un tubo, dos pilares y seis orificios.
 * Cada hueco vacío es un ancla para un nodo de cultivo.
 */
export default function ModuloNft({
  cultivos,
  orificioHover,
  onOrificio,
  onHover,
}: PropsModuloNft) {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[0, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 4.7, 24]} />
        <meshLambertMaterial color={COLOR_TUBO} />
      </mesh>
      <mesh position={[-2.35, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.37, 0.37, 0.12, 16]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>
      <mesh position={[2.35, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.37, 0.37, 0.12, 16]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>

      <Pilar x={-1.72} />
      <Pilar x={1.72} />

      {POSICIONES_X_ORIFICIO.map((x, indice) => (
        <Orificio
          key={indice}
          indice={indice}
          x={x}
          cultivo={cultivos.get(indice) ?? null}
          hover={orificioHover === indice}
          onOrificio={onOrificio}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

function Pilar({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.28, 1.15, 0.28]} />
        <meshLambertMaterial color={COLOR_TUBO} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.44, 0.12, 0.44]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>
    </group>
  );
}

function Orificio({
  indice,
  x,
  cultivo,
  hover,
  onOrificio,
  onHover,
}: {
  indice: number;
  x: number;
  cultivo: CultivoEnOrificio | null;
  hover: boolean;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
}) {
  const activo = hover || cultivo?.seleccionado === true;
  useCursor(hover);

  let colorAnillo = COLOR_ANILLO;
  if (cultivo?.seleccionado) {
    colorAnillo = COLOR_ANILLO_SELECCION;
  } else if (cultivo?.enGrupo) {
    colorAnillo = COLOR_ANILLO_GRUPO;
  } else if (hover && !cultivo) {
    colorAnillo = COLOR_ANILLO_HOVER;
  }

  return (
    <group
      position={[x, 0, 0]}
      userData={{ indiceOrificio: indice }}
      onPointerOver={(evento) => {
        evento.stopPropagation();
        onHover(indice);
      }}
      onPointerOut={(evento) => {
        evento.stopPropagation();
        onHover(null);
      }}
      onClick={(evento) => {
        evento.stopPropagation();
        onOrificio(indice);
      }}
      onPointerDown={(evento) => evento.stopPropagation()}
    >
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.7, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 20]} />
        <meshLambertMaterial color={COLOR_TIERRA} />
      </mesh>
      <mesh position={[0, 1.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, activo ? 0.22 : 0.2, 24]} />
        <meshLambertMaterial color={colorAnillo} />
      </mesh>
      {cultivo ? (
        <>
          <Planta
            colorPlanta={cultivo.color}
            escala={1.15 + 0.35 * (cultivo.progreso ?? 0.45)}
            atenuado={cultivo.atenuado}
            desfase={x}
          />
          <Html position={[0, 1.72, 0]} center style={{ pointerEvents: "none" }}>
            <div
              className={
                cultivo.atenuado
                  ? "orificio-etiqueta orificio-etiqueta--filtrada"
                  : "orificio-etiqueta"
              }
            >
              {cultivo.nombre}
            </div>
          </Html>
        </>
      ) : null}
    </group>
  );
}

function Planta({
  colorPlanta,
  escala,
  atenuado,
  desfase,
}: {
  colorPlanta: string;
  escala: number;
  atenuado: boolean;
  desfase: number;
}) {
  const hojas = useRef<Group>(null);
  const opacidad = atenuado ? 0.28 : 1;

  useFrame((estado) => {
    if (!hojas.current) {
      return;
    }
    hojas.current.rotation.z =
      Math.sin(estado.clock.elapsedTime * 1.35 + desfase) * 0.07;
  });

  return (
    <group position={[0, 1.18, 0]} scale={escala}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.02, 0.028, 0.28, 6]} />
        <meshLambertMaterial
          color={COLOR_TALLO}
          transparent={atenuado}
          opacity={opacidad}
        />
      </mesh>
      <group ref={hojas} position={[0, 0.26, 0]}>
        <Hoja
          posicion={[0.1, 0.04, 0.02]}
          rotacion={[-0.5, 0.6, 0.4]}
          color={colorPlanta}
          atenuado={atenuado}
          opacidad={opacidad}
        />
        <Hoja
          posicion={[-0.08, 0.05, 0.08]}
          rotacion={[-0.4, -0.8, -0.35]}
          color={colorPlanta}
          atenuado={atenuado}
          opacidad={opacidad}
        />
        <Hoja
          posicion={[0.02, 0.08, -0.1]}
          rotacion={[0.55, 0.15, 0.2]}
          color={colorPlanta}
          atenuado={atenuado}
          opacidad={opacidad}
        />
      </group>
    </group>
  );
}

function Hoja({
  posicion,
  rotacion,
  color,
  atenuado,
  opacidad,
}: {
  posicion: [number, number, number];
  rotacion: [number, number, number];
  color: string;
  atenuado: boolean;
  opacidad: number;
}) {
  return (
    <mesh position={posicion} rotation={rotacion} scale={[1, 0.32, 0.72]}>
      <sphereGeometry args={[0.13, 10, 8]} />
      <meshLambertMaterial color={color} transparent={atenuado} opacity={opacidad} />
    </mesh>
  );
}
