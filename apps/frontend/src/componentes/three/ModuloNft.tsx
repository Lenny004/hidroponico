import { useEffect, useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type Mesh } from "three";
import { FichaHoverDeNodo } from "../FichaHoverCultivo";
import {
  indiceOrificio,
  POSICIONES_X_ORIFICIO,
  POSICIONES_Y_TUBO,
} from "./orificios-nft";
import type { CultivoEnOrificio } from "./tipos-orificio";

const COLOR_TUBO = "#c9c4e8";
const COLOR_TUBO_OSCURO = "#9a94c2";
const COLOR_PILAR = "#2a2835";
const COLOR_PILAR_BASE = "#1c1b24";
const COLOR_DISTRIBUCION = "#b8b3d4";
const COLOR_COLECTORA = "#4f8fd9";
const COLOR_ESTANQUE = "#7a7d88";
const COLOR_AGUA = "#3d7ea6";
const COLOR_BOMBA = "#d9773a";
const COLOR_BOMBA_OSCURO = "#b4531a";
const COLOR_TIERRA = "#4e342e";
const COLOR_TALLO = "#3d7a38";
const COLOR_ANILLO = "#8d87b3";
const COLOR_ANILLO_HOVER = "#8fb56a";
const COLOR_ANILLO_SELECCION = "#ffffff";
const COLOR_ANILLO_GRUPO = "#d4a054";

const RADIO_CANAL = 0.36;
const LARGO_CANAL = 4.7;
const X_EXTREMO = LARGO_CANAL / 2;
const X_PILAR = 2.22;
const X_DISTRIBUCION = -2.58;
const X_COLECTORA = 2.58;
const Y_CANAL_SUP = POSICIONES_Y_TUBO[POSICIONES_Y_TUBO.length - 1];

type PropsModuloNft = {
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
};

/**
 * Torre NFT vertical: cinco canales apilados, red de distribución,
 * tubería colectora, bomba y estanque. Seis orificios por canal.
 */
export default function ModuloNft({
  cultivos,
  orificioHover,
  onOrificio,
  onHover,
  onQuitar,
}: PropsModuloNft) {
  return (
    <group position={[0, -1.15, 0]}>
      <EstanqueYBomba />
      <Bastidor />
      <RedDistribucion />
      <TuberiaColectora />
      {POSICIONES_Y_TUBO.map((y, tubo) => (
        <Tubo
          key={tubo}
          y={y}
          indiceBase={indiceOrificio(tubo, 0)}
          cultivos={cultivos}
          orificioHover={orificioHover}
          onOrificio={onOrificio}
          onHover={onHover}
          onQuitar={onQuitar}
        />
      ))}
    </group>
  );
}

function Bastidor() {
  const altura = Y_CANAL_SUP + 0.95;
  const yCentro = altura / 2 - 0.15;

  return (
    <group>
      <Pilar x={-X_PILAR} altura={altura} yCentro={yCentro} />
      <Pilar x={X_PILAR} altura={altura} yCentro={yCentro} />
      <mesh position={[0, altura - 0.22, -0.38]}>
        <boxGeometry args={[X_PILAR * 2 + 0.28, 0.16, 0.22]} />
        <meshLambertMaterial color={COLOR_PILAR} />
      </mesh>
    </group>
  );
}

function Pilar({
  x,
  altura,
  yCentro,
}: {
  x: number;
  altura: number;
  yCentro: number;
}) {
  return (
    <group position={[x, 0, -0.38]}>
      <mesh position={[0, yCentro, 0]}>
        <boxGeometry args={[0.28, altura, 0.28]} />
        <meshLambertMaterial color={COLOR_PILAR} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.46, 0.14, 0.46]} />
        <meshLambertMaterial color={COLOR_PILAR_BASE} />
      </mesh>
    </group>
  );
}

function RedDistribucion() {
  const yBase = 0.72;
  const largo = Y_CANAL_SUP - yBase;

  return (
    <group>
      <mesh position={[X_DISTRIBUCION, yBase + largo / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, largo, 12]} />
        <meshLambertMaterial color={COLOR_DISTRIBUCION} />
      </mesh>
      {POSICIONES_Y_TUBO.map((y) => (
        <group key={y}>
          <mesh position={[X_DISTRIBUCION, y, 0]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
          </mesh>
          <mesh
            position={[(X_DISTRIBUCION - X_EXTREMO) / 2, y, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[0.055, 0.055, Math.abs(-X_EXTREMO - X_DISTRIBUCION), 10]}
            />
            <meshLambertMaterial color={COLOR_DISTRIBUCION} />
          </mesh>
        </group>
      ))}
      <mesh
        position={[(X_DISTRIBUCION - 1.55) / 2, 0.55, 0.42]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.055, 0.055, Math.abs(X_DISTRIBUCION + 1.55), 10]} />
        <meshLambertMaterial color={COLOR_DISTRIBUCION} />
      </mesh>
      <mesh position={[X_DISTRIBUCION, 0.64, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 10]} />
        <meshLambertMaterial color={COLOR_DISTRIBUCION} />
      </mesh>
    </group>
  );
}

function TuberiaColectora() {
  const yBase = 0.55;
  const largo = Y_CANAL_SUP - yBase;

  return (
    <group>
      <mesh position={[X_COLECTORA, yBase + largo / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, largo, 12]} />
        <meshLambertMaterial color={COLOR_COLECTORA} />
      </mesh>
      {POSICIONES_Y_TUBO.map((y) => (
        <group key={y}>
          <mesh position={[X_COLECTORA, y, 0]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshLambertMaterial color={COLOR_COLECTORA} />
          </mesh>
          <mesh
            position={[(X_COLECTORA + X_EXTREMO) / 2, y, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.055, 0.055, X_COLECTORA - X_EXTREMO, 10]} />
            <meshLambertMaterial color={COLOR_COLECTORA} />
          </mesh>
        </group>
      ))}
      <mesh position={[X_COLECTORA, 0.42, 0.28]} rotation={[Math.PI / 2.4, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.62, 10]} />
        <meshLambertMaterial color={COLOR_COLECTORA} />
      </mesh>
      <mesh position={[1.35, 0.22, 0.52]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 2.4, 10]} />
        <meshLambertMaterial color={COLOR_COLECTORA} />
      </mesh>
    </group>
  );
}

function EstanqueYBomba() {
  return (
    <group>
      <mesh position={[0.15, 0.38, 0.55]}>
        <boxGeometry args={[1.55, 0.78, 1.15]} />
        <meshLambertMaterial color={COLOR_ESTANQUE} />
      </mesh>
      <mesh position={[0.15, 0.78, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.35, 0.95]} />
        <meshLambertMaterial color={COLOR_AGUA} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-1.55, 0.42, 0.55]}>
        <boxGeometry args={[0.72, 0.55, 0.55]} />
        <meshLambertMaterial color={COLOR_BOMBA} />
      </mesh>
      <mesh position={[-1.55, 0.78, 0.55]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.22, 12]} />
        <meshLambertMaterial color={COLOR_BOMBA_OSCURO} />
      </mesh>
      <mesh position={[-0.95, 0.28, 0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 10]} />
        <meshLambertMaterial color={COLOR_COLECTORA} />
      </mesh>
    </group>
  );
}

function Tubo({
  y,
  indiceBase,
  cultivos,
  orificioHover,
  onOrificio,
  onHover,
  onQuitar,
}: {
  y: number;
  indiceBase: number;
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
}) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_CANAL, RADIO_CANAL, LARGO_CANAL, 24]} />
        <meshLambertMaterial color={COLOR_TUBO} />
      </mesh>
      <mesh position={[-X_EXTREMO, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_CANAL + 0.01, RADIO_CANAL + 0.01, 0.12, 16]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>
      <mesh position={[X_EXTREMO, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_CANAL + 0.01, RADIO_CANAL + 0.01, 0.12, 16]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>
      {POSICIONES_X_ORIFICIO.map((x, hueco) => {
        const indice = indiceBase + hueco;
        return (
          <Orificio
            key={indice}
            indice={indice}
            x={x}
            cultivo={cultivos.get(indice) ?? null}
            hover={orificioHover === indice}
            onOrificio={onOrificio}
            onHover={onHover}
            onQuitar={onQuitar}
          />
        );
      })}
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
  onQuitar,
}: {
  indice: number;
  x: number;
  cultivo: CultivoEnOrificio | null;
  hover: boolean;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
}) {
  const activo = hover || cultivo?.seleccionado === true;
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [plantaVisible, setPlantaVisible] = useState<CultivoEnOrificio | null>(cultivo);
  const grupoPlanta = useRef<Group>(null);
  const anillo = useRef<Mesh>(null);
  const escalaPlanta = useRef(0);
  const pulsoAnillo = useRef(0);
  const idAnterior = useRef<string | null>(null);
  const saliendo = useRef(false);
  useCursor(hover);
  const yHueco = RADIO_CANAL + 0.01;

  useEffect(() => {
    if (cultivo) {
      if (idAnterior.current !== cultivo.id) {
        escalaPlanta.current = 0;
        pulsoAnillo.current = 1;
        saliendo.current = false;
      }
      idAnterior.current = cultivo.id;
      setPlantaVisible(cultivo);
      return;
    }
    idAnterior.current = null;
    saliendo.current = false;
  }, [cultivo]);

  useEffect(() => {
    if (!hover || !cultivo) {
      setMostrarFicha(false);
      return;
    }
    const espera = window.setTimeout(() => setMostrarFicha(true), 180);
    return () => window.clearTimeout(espera);
  }, [hover, cultivo]);

  useFrame((_, dt) => {
    const destino = cultivo ? 1 : 0;
    escalaPlanta.current = MathUtils.damp(escalaPlanta.current, destino, 12, dt);
    pulsoAnillo.current = MathUtils.damp(pulsoAnillo.current, 0, 7, dt);

    if (grupoPlanta.current) {
      const extra = cultivo?.seleccionado ? 0.08 : 0;
      grupoPlanta.current.scale.setScalar(Math.max(0, escalaPlanta.current * (1 + extra)));
    }
    if (anillo.current) {
      const base = activo ? 1.12 : 1;
      anillo.current.scale.setScalar(base + pulsoAnillo.current * 0.4);
    }
    if (!cultivo && escalaPlanta.current < 0.02 && plantaVisible && !saliendo.current) {
      saliendo.current = true;
      escalaPlanta.current = 0;
      setPlantaVisible(null);
    }
  });

  let colorAnillo = COLOR_ANILLO;
  if (cultivo?.seleccionado) {
    colorAnillo = COLOR_ANILLO_SELECCION;
  } else if (cultivo?.enGrupo) {
    colorAnillo = COLOR_ANILLO_GRUPO;
  } else if (hover && !cultivo) {
    colorAnillo = COLOR_ANILLO_HOVER;
  }

  const mostrarEtiqueta = Boolean(cultivo) && (hover || cultivo?.seleccionado === true);

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
      <mesh position={[0, yHueco + 0.05, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.7, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, yHueco + 0.06, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 0.14, 16]} />
        <meshLambertMaterial color={COLOR_TUBO_OSCURO} />
      </mesh>
      <mesh position={[0, yHueco + 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 20]} />
        <meshLambertMaterial color={COLOR_TIERRA} />
      </mesh>
      <mesh ref={anillo} position={[0, yHueco + 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.2, 24]} />
        <meshLambertMaterial color={colorAnillo} />
      </mesh>
      {plantaVisible ? (
        <>
          <group ref={grupoPlanta} scale={0}>
            <Planta
              colorPlanta={plantaVisible.color}
              escala={1.15 + 0.35 * (plantaVisible.progreso ?? 0.45)}
              atenuado={plantaVisible.atenuado}
              desfase={x + indice * 0.17}
              yBase={yHueco + 0.13}
            />
          </group>
          {mostrarEtiqueta ? (
            <Html position={[0, yHueco + 0.68, 0]} center>
              <div
                className={
                  plantaVisible.atenuado
                    ? "orificio-etiqueta orificio-etiqueta--filtrada"
                    : "orificio-etiqueta"
                }
              >
                <span>{plantaVisible.nombre}</span>
                <button
                  type="button"
                  className="orificio-quitar"
                  title={`Quitar ${plantaVisible.nombre}`}
                  aria-label={`Quitar ${plantaVisible.nombre}`}
                  onPointerDown={(evento) => evento.stopPropagation()}
                  onClick={(evento) => {
                    evento.stopPropagation();
                    onQuitar(plantaVisible.id);
                  }}
                >
                  ×
                </button>
              </div>
            </Html>
          ) : null}
          {mostrarFicha ? (
            <Html
              position={[0.85, yHueco + 0.35, 0.15]}
              center
              transform={false}
              zIndexRange={[80, 0]}
              style={{ pointerEvents: "none" }}
            >
              <FichaHoverDeNodo idNodo={plantaVisible.id} />
            </Html>
          ) : null}
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
  yBase,
}: {
  colorPlanta: string;
  escala: number;
  atenuado: boolean;
  desfase: number;
  yBase: number;
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
    <group position={[0, yBase, 0]} scale={escala}>
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
