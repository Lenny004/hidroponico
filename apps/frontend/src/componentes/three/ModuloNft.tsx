import { useEffect, useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, MathUtils, type Group, type Mesh } from "three";
import { FichaHoverDeNodo } from "../FichaHoverCultivo";
import {
  indiceOrificio,
  POSICIONES_X_ORIFICIO,
  POSICIONES_Y_TUBO,
} from "./orificios-nft";
import type { CultivoEnOrificio } from "./tipos-orificio";
import { tramoTuberia, type TramoTuberia, type Vec3 } from "./tuberia";

const COLOR_PVC = "#f4f0e6";
const COLOR_PVC_CANTO = "#ddd6c8";
const COLOR_BASTIDOR = "#efebe1";
const COLOR_PIE = "#d4cfc3";
const COLOR_RIEGO = "#1c1c1c";
const COLOR_CODO = "#111111";
const COLOR_CUBETA = "#2b2b2b";
const COLOR_CUBETA_BORDE = "#3a3a3a";
const COLOR_AGUA_FILM = "#4aa3c4";
const COLOR_BOMBA = "#1f1f1f";
const COLOR_MACETA = "#2a2a2a";
const COLOR_ARCILLA = "#6b5344";
const COLOR_TALLO = "#3d7a38";
const COLOR_ANILLO = "#c9c2b0";
const COLOR_ANILLO_HOVER = "#7d9b5c";
const COLOR_ANILLO_SELECCION = "#ffffff";
const COLOR_ANILLO_GRUPO = "#d4a054";

const LARGO_CANAL = 4.7;
const RADIO_TUBO = 0.27;
const X_EXTREMO = LARGO_CANAL / 2;
const X_A = 2.2;
const Y_CIMA = 8.15;
const Z_BASE = 1.7;
const Z_CIMA = 0.2;
const RADIO_PATA = 0.055;
const RADIO_RIEGO = 0.042;
const Y_MACETA = RADIO_TUBO + 0.05;

function zFrente(y: number): number {
  const t = Math.min(1, Math.max(0, y / Y_CIMA));
  return Z_BASE * (1 - t) + Z_CIMA * t;
}

function zAtras(y: number): number {
  return -zFrente(y);
}

const PATAS_A: TramoTuberia[] = [
  tramoTuberia([-X_A, 0.04, Z_BASE], [-X_A, Y_CIMA, Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([X_A, 0.04, Z_BASE], [X_A, Y_CIMA, Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([-X_A, 0.04, -Z_BASE], [-X_A, Y_CIMA, -Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([X_A, 0.04, -Z_BASE], [X_A, Y_CIMA, -Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([-X_A, Y_CIMA, Z_CIMA], [X_A, Y_CIMA, Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([-X_A, Y_CIMA, -Z_CIMA], [X_A, Y_CIMA, -Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([-X_A, Y_CIMA, Z_CIMA], [-X_A, Y_CIMA, -Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia([X_A, Y_CIMA, Z_CIMA], [X_A, Y_CIMA, -Z_CIMA], RADIO_PATA, COLOR_BASTIDOR),
  tramoTuberia(
    [-X_A, 3.2, zFrente(3.2)],
    [-X_A, 3.2, zAtras(3.2)],
    0.04,
    COLOR_BASTIDOR,
  ),
  tramoTuberia([X_A, 3.2, zFrente(3.2)], [X_A, 3.2, zAtras(3.2)], 0.04, COLOR_BASTIDOR),
];

const X_BUCLE = X_EXTREMO + 0.32;
const X_CUBETA = -0.15;
const Z_CUBETA = zFrente(POSICIONES_Y_TUBO[0]) + 1.05;
const Y_BOMBA = 0.92;

function manguerasNft(): { tramos: TramoTuberia[]; codos: Vec3[] } {
  const tramos: TramoTuberia[] = [];
  const codos: Vec3[] = [];
  const yInf = POSICIONES_Y_TUBO[0];
  const zInf = zFrente(yInf);

  tramos.push(
    tramoTuberia([X_CUBETA - 0.55, Y_BOMBA, Z_CUBETA], [X_CUBETA - 0.55, Y_BOMBA, zInf], RADIO_RIEGO, COLOR_RIEGO),
    tramoTuberia(
      [X_CUBETA - 0.55, Y_BOMBA, zInf],
      [-X_A, Y_BOMBA, zFrente(Y_BOMBA)],
      RADIO_RIEGO,
      COLOR_RIEGO,
    ),
  );
  codos.push(
    [X_CUBETA - 0.55, Y_BOMBA, Z_CUBETA],
    [X_CUBETA - 0.55, Y_BOMBA, zInf],
    [-X_A, Y_BOMBA, zFrente(Y_BOMBA)],
  );

  for (let i = 0; i < POSICIONES_Y_TUBO.length; i += 1) {
    const y = POSICIONES_Y_TUBO[i];
    const z = zFrente(y);
    const alimentacion: Vec3 = [-X_A, y, z];
    const entrada: Vec3 = [-X_EXTREMO, y, z];
    const salida: Vec3 = [X_EXTREMO, y, z];
    const bucle: Vec3 = [X_BUCLE, y, z];
    tramos.push(tramoTuberia(alimentacion, entrada, RADIO_RIEGO, COLOR_RIEGO));
    tramos.push(tramoTuberia(salida, bucle, RADIO_RIEGO, COLOR_RIEGO));
    codos.push(alimentacion, entrada, salida, bucle);

    if (i < POSICIONES_Y_TUBO.length - 1) {
      const ySig = POSICIONES_Y_TUBO[i + 1];
      const zSig = zFrente(ySig);
      tramos.push(tramoTuberia(bucle, [X_BUCLE, ySig, zSig], RADIO_RIEGO, COLOR_RIEGO));
    }
  }

  const ySup = POSICIONES_Y_TUBO[POSICIONES_Y_TUBO.length - 1];
  tramos.push(
    tramoTuberia([-X_A, Y_BOMBA, zFrente(Y_BOMBA)], [-X_A, ySup, zFrente(ySup)], RADIO_RIEGO, COLOR_RIEGO),
  );
  tramos.push(
    tramoTuberia(
      [X_BUCLE, yInf, zInf],
      [X_CUBETA + 0.42, 0.55, Z_CUBETA],
      RADIO_RIEGO,
      COLOR_RIEGO,
    ),
  );
  codos.push([X_CUBETA + 0.42, 0.55, Z_CUBETA]);

  return { tramos, codos };
}

const MANGUERAS = manguerasNft();

type PropsModuloNft = {
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
};

/**
 * Pirámide NFT tipo A-frame: tubos PVC en la cara frontal, patas abiertas y cubeta.
 */
export default function ModuloNft({
  cultivos,
  orificioHover,
  onOrificio,
  onHover,
  onQuitar,
}: PropsModuloNft) {
  return (
    <group>
      <BastidorA />
      <CubetaYBomba />
      <RedHidraulica />
      {POSICIONES_Y_TUBO.map((y, tubo) => (
        <TuboPvc
          key={tubo}
          y={y}
          z={zFrente(y)}
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

function BastidorA() {
  const pies: Vec3[] = [
    [-X_A, 0.05, Z_BASE],
    [X_A, 0.05, Z_BASE],
    [-X_A, 0.05, -Z_BASE],
    [X_A, 0.05, -Z_BASE],
  ];

  return (
    <group>
      {PATAS_A.map((tramo, indice) => (
        <mesh key={indice} position={tramo.position} quaternion={tramo.quaternion}>
          <cylinderGeometry args={[tramo.radio, tramo.radio, tramo.largo, 10]} />
          <meshStandardMaterial color={tramo.color} roughness={0.48} metalness={0.12} />
        </mesh>
      ))}
      {pies.map((pie, indice) => (
        <mesh key={`pie-${indice}`} position={pie}>
          <cylinderGeometry args={[0.1, 0.12, 0.08, 12]} />
          <meshStandardMaterial color={COLOR_PIE} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function RedHidraulica() {
  return (
    <group>
      {MANGUERAS.tramos.map((tramo, indice) => (
        <mesh key={indice} position={tramo.position} quaternion={tramo.quaternion}>
          <cylinderGeometry args={[tramo.radio, tramo.radio, tramo.largo, 10]} />
          <meshStandardMaterial color={tramo.color} roughness={0.4} />
        </mesh>
      ))}
      {MANGUERAS.codos.map((punto, indice) => (
        <mesh key={`codo-${indice}`} position={punto}>
          <sphereGeometry args={[RADIO_RIEGO + 0.016, 10, 8]} />
          <meshStandardMaterial color={COLOR_CODO} roughness={0.38} />
        </mesh>
      ))}
    </group>
  );
}

function CubetaYBomba() {
  const radio = 0.5;
  const alto = 0.95;
  const yAgua = alto * 0.7;

  return (
    <group position={[X_CUBETA, 0, Z_CUBETA]}>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[radio, radio * 0.92, alto, 24, 1, true]} />
        <meshStandardMaterial color={COLOR_CUBETA} roughness={0.72} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radio * 0.92, 24]} />
        <meshStandardMaterial color={COLOR_CUBETA} roughness={0.72} />
      </mesh>
      <mesh position={[0, alto - 0.02, 0]}>
        <cylinderGeometry args={[radio + 0.025, radio + 0.01, 0.06, 24]} />
        <meshStandardMaterial color={COLOR_CUBETA_BORDE} roughness={0.58} />
      </mesh>
      <mesh position={[0, yAgua, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radio * 0.84, 24]} />
        <meshStandardMaterial
          color={COLOR_AGUA_FILM}
          transparent
          opacity={0.72}
          roughness={0.08}
          metalness={0.2}
        />
      </mesh>
      <group position={[-0.58, 0, 0.08]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.28, 0.2, 0.18]} />
          <meshStandardMaterial color={COLOR_BOMBA} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.14, 10]} />
          <meshStandardMaterial color={COLOR_RIEGO} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function TuboPvc({
  y,
  z,
  indiceBase,
  cultivos,
  orificioHover,
  onOrificio,
  onHover,
  onQuitar,
}: {
  y: number;
  z: number;
  indiceBase: number;
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
}) {
  return (
    <group position={[0, y, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_TUBO, RADIO_TUBO, LARGO_CANAL, 24]} />
        <meshStandardMaterial color={COLOR_PVC} roughness={0.36} />
      </mesh>
      <mesh position={[-X_EXTREMO, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_TUBO + 0.025, RADIO_TUBO + 0.025, 0.14, 20]} />
        <meshStandardMaterial color={COLOR_PVC_CANTO} roughness={0.4} />
      </mesh>
      <mesh position={[X_EXTREMO, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RADIO_TUBO + 0.025, RADIO_TUBO + 0.025, 0.14, 20]} />
        <meshStandardMaterial color={COLOR_PVC_CANTO} roughness={0.4} />
      </mesh>
      <mesh position={[-X_EXTREMO - 0.02, 0, 0]}>
        <sphereGeometry args={[RADIO_TUBO + 0.02, 12, 10]} />
        <meshStandardMaterial color={COLOR_PVC_CANTO} roughness={0.4} />
      </mesh>
      <mesh position={[X_EXTREMO + 0.02, 0, 0]}>
        <sphereGeometry args={[RADIO_TUBO + 0.02, 12, 10]} />
        <meshStandardMaterial color={COLOR_PVC_CANTO} roughness={0.4} />
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
  } else if (hover) {
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
      <mesh position={[0, Y_MACETA + 0.12, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.72, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, Y_MACETA, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.22, 14]} />
        <meshStandardMaterial color={COLOR_MACETA} roughness={0.7} />
      </mesh>
      <mesh position={[0, Y_MACETA + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.145, 18]} />
        <meshStandardMaterial color={COLOR_ARCILLA} roughness={0.9} />
      </mesh>
      <mesh ref={anillo} position={[0, Y_MACETA + 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.19, 24]} />
        <meshStandardMaterial color={colorAnillo} roughness={0.45} />
      </mesh>
      {plantaVisible ? (
        <>
          <group ref={grupoPlanta} scale={0}>
            <Planta
              colorPlanta={plantaVisible.color}
              familia={plantaVisible.familia}
              escala={1.4 + 0.45 * (plantaVisible.progreso ?? 0.45)}
              atenuado={plantaVisible.atenuado}
              desfase={x + indice * 0.17}
              yBase={Y_MACETA + 0.1}
            />
          </group>
          {mostrarEtiqueta ? (
            <Html position={[0, Y_MACETA + 0.72, 0]} center>
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
              position={[0.85, Y_MACETA + 0.4, 0.15]}
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
  familia,
  escala,
  atenuado,
  desfase,
  yBase,
}: {
  colorPlanta: string;
  familia: CultivoEnOrificio["familia"];
  escala: number;
  atenuado: boolean;
  desfase: number;
  yBase: number;
}) {
  const hojas = useRef<Group>(null);
  const opacidad = atenuado ? 0.28 : 1;
  const talloAlto = familia === "fruto" ? 0.42 : familia === "aroma" ? 0.3 : 0.2;

  useFrame((estado) => {
    if (!hojas.current) {
      return;
    }
    hojas.current.rotation.y = Math.sin(estado.clock.elapsedTime * 0.8 + desfase) * 0.12;
    hojas.current.rotation.z = Math.sin(estado.clock.elapsedTime * 1.2 + desfase) * 0.05;
  });

  return (
    <group position={[0, yBase, 0]} scale={escala}>
      <mesh position={[0, talloAlto / 2, 0]}>
        <cylinderGeometry args={[0.016, 0.024, talloAlto, 6]} />
        <meshStandardMaterial
          color={COLOR_TALLO}
          transparent={atenuado}
          opacity={opacidad}
          roughness={0.7}
        />
      </mesh>
      <group ref={hojas} position={[0, talloAlto * 0.72, 0]}>
        {hojasDeFamilia(familia).map((hoja, indice) => (
          <Hoja
            key={indice}
            posicion={hoja.posicion}
            rotacion={hoja.rotacion}
            escala={hoja.escala}
            color={colorPlanta}
            atenuado={atenuado}
            opacidad={opacidad}
          />
        ))}
        {familia === "fruto" ? (
          <mesh position={[0.07, 0.16, 0.04]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial
              color={colorPlanta}
              transparent={atenuado}
              opacity={opacidad}
              roughness={0.45}
            />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

function hojasDeFamilia(familia: CultivoEnOrificio["familia"]): Array<{
  posicion: Vec3;
  rotacion: Vec3;
  escala: Vec3;
}> {
  if (familia === "aroma") {
    return [
      { posicion: [0.08, 0.02, 0.04], rotacion: [-0.35, 0.5, 0.5], escala: [1, 0.28, 0.55] },
      { posicion: [-0.07, 0.05, 0.06], rotacion: [-0.3, -0.7, -0.4], escala: [0.9, 0.25, 0.5] },
      { posicion: [0.04, 0.1, -0.07], rotacion: [0.4, 0.2, 0.15], escala: [0.85, 0.22, 0.48] },
      { posicion: [-0.05, 0.14, -0.03], rotacion: [0.25, -0.4, -0.2], escala: [0.75, 0.2, 0.42] },
      { posicion: [0.02, 0.18, 0.05], rotacion: [-0.15, 0.3, 0.1], escala: [0.65, 0.18, 0.38] },
    ];
  }
  if (familia === "fruto") {
    return [
      { posicion: [0.12, 0.02, 0.03], rotacion: [-0.55, 0.7, 0.35], escala: [1.1, 0.28, 0.7] },
      { posicion: [-0.1, 0.04, 0.08], rotacion: [-0.45, -0.85, -0.3], escala: [1, 0.26, 0.65] },
      { posicion: [0.03, 0.08, -0.12], rotacion: [0.6, 0.1, 0.2], escala: [0.95, 0.24, 0.6] },
      { posicion: [-0.06, 0.14, -0.04], rotacion: [0.3, -0.35, -0.15], escala: [0.8, 0.22, 0.5] },
    ];
  }
  return [
    { posicion: [0.1, 0.01, 0.04], rotacion: [-0.85, 0.4, 0.2], escala: [1.15, 0.22, 0.85] },
    { posicion: [-0.09, 0.02, 0.07], rotacion: [-0.8, -0.55, -0.15], escala: [1.1, 0.2, 0.82] },
    { posicion: [0.02, 0.03, -0.11], rotacion: [0.9, 0.05, 0.1], escala: [1.05, 0.2, 0.8] },
    { posicion: [0.08, 0.05, -0.05], rotacion: [-0.4, 0.9, 0.25], escala: [0.95, 0.18, 0.7] },
    { posicion: [-0.07, 0.05, -0.06], rotacion: [-0.35, -0.9, -0.2], escala: [0.9, 0.18, 0.68] },
    { posicion: [0.01, 0.08, 0.02], rotacion: [-0.15, 0.2, 0], escala: [0.7, 0.16, 0.55] },
  ];
}

function Hoja({
  posicion,
  rotacion,
  escala,
  color,
  atenuado,
  opacidad,
}: {
  posicion: Vec3;
  rotacion: Vec3;
  escala: Vec3;
  color: string;
  atenuado: boolean;
  opacidad: number;
}) {
  return (
    <mesh position={posicion} rotation={rotacion} scale={escala}>
      <sphereGeometry args={[0.14, 10, 8]} />
      <meshStandardMaterial
        color={color}
        transparent={atenuado}
        opacity={opacidad}
        roughness={0.55}
      />
    </mesh>
  );
}
