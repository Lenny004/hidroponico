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
import { tramoTuberia, type TramoTuberia, type Vec3 } from "./tuberia";

const COLOR_CANAL = "#efeae0";
const COLOR_CANAL_CANTO = "#cfc8b8";
const COLOR_BASTIDOR = "#6a7180";
const COLOR_BASTIDOR_BASE = "#4d5460";
const COLOR_RIEGO = "#2b2b2b";
const COLOR_CODO = "#1f1f1f";
const COLOR_RETORNO = "#3c434c";
const COLOR_TANQUE = "#2c3b36";
const COLOR_TANQUE_BORDE = "#3d524b";
const COLOR_AGUA = "#3a8fb5";
const COLOR_AGUA_FILM = "#4aa3c4";
const COLOR_BOMBA = "#d9773a";
const COLOR_BOMBA_OSCURO = "#9a4b16";
const COLOR_MACETA = "#2a2a2a";
const COLOR_ARCILLA = "#6b5344";
const COLOR_TALLO = "#3d7a38";
const COLOR_ANILLO = "#b7b09d";
const COLOR_ANILLO_HOVER = "#7d9b5c";
const COLOR_ANILLO_SELECCION = "#ffffff";
const COLOR_ANILLO_GRUPO = "#d4a054";

const LARGO_CANAL = 4.7;
const ALTO_CANAL = 0.26;
const ANCHO_CANAL = 0.72;
const X_EXTREMO = LARGO_CANAL / 2;
const X_PILAR = 2.18;
const X_RISER = -2.52;
const X_RETORNO = 2.52;
const Z_TANQUE = 1.16;
const Y_CANAL_SUP = POSICIONES_Y_TUBO[POSICIONES_Y_TUBO.length - 1];
const Y_TAPA = ALTO_CANAL / 2;

const RADIO_RIEGO = 0.048;
const RADIO_RETORNO = 0.055;

const TUBERIA_IMPULSION: TramoTuberia[] = [
  tramoTuberia([-1.42, 0.78, 1.82], [-1.42, 0.78, 0], RADIO_RIEGO, COLOR_RIEGO),
  tramoTuberia([-1.42, 0.78, 0], [X_RISER, 0.78, 0], RADIO_RIEGO, COLOR_RIEGO),
  tramoTuberia([X_RISER, 0.72, 0], [X_RISER, Y_CANAL_SUP + 0.18, 0], RADIO_RIEGO, COLOR_RIEGO),
];

const TUBERIA_RETORNO: TramoTuberia[] = [
  tramoTuberia([X_RETORNO, 0.42, 0], [X_RETORNO, Y_CANAL_SUP + 0.06, 0], RADIO_RETORNO, COLOR_RETORNO),
  tramoTuberia([X_RETORNO, 0.42, 0], [X_RETORNO, 0.42, Z_TANQUE], RADIO_RETORNO, COLOR_RETORNO),
  tramoTuberia([X_RETORNO, 0.42, Z_TANQUE], [0.85, 0.42, Z_TANQUE], RADIO_RETORNO, COLOR_RETORNO),
];

const LATERALES_CANAL: TramoTuberia[] = POSICIONES_Y_TUBO.flatMap((y) => [
  tramoTuberia([X_RISER, y, 0], [-X_EXTREMO, y, 0], RADIO_RIEGO, COLOR_RIEGO),
  tramoTuberia([X_EXTREMO, y, 0], [X_RETORNO, y, 0], RADIO_RETORNO, COLOR_RETORNO),
]);

const CODOS: Vec3[] = [
  [-1.42, 0.78, 1.82],
  [-1.42, 0.78, 0],
  [X_RISER, 0.78, 0],
  [X_RISER, Y_CANAL_SUP + 0.18, 0],
  [X_RETORNO, 0.42, 0],
  [X_RETORNO, 0.42, Z_TANQUE],
  [0.85, 0.42, Z_TANQUE],
  ...POSICIONES_Y_TUBO.flatMap((y): Vec3[] => [
    [X_RISER, y, 0],
    [X_RETORNO, y, 0],
  ]),
];

type PropsModuloNft = {
  cultivos: Map<number, CultivoEnOrificio>;
  orificioHover: number | null;
  onOrificio: (indice: number) => void;
  onHover: (indice: number | null) => void;
  onQuitar: (id: string) => void;
};

/**
 * Banco NFT: canaletas PVC, macetas de malla, tanque de recirculación y bomba.
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
      <TanqueYBomba />
      <Bastidor />
      <RedHidraulica />
      {POSICIONES_Y_TUBO.map((y, tubo) => (
        <CanalNft
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
  const altura = Y_CANAL_SUP + 0.55;
  const yCentro = altura / 2;

  return (
    <group>
      <Pilar x={-X_PILAR} z={-0.46} altura={altura} yCentro={yCentro} />
      <Pilar x={X_PILAR} z={-0.46} altura={altura} yCentro={yCentro} />
      <Pilar x={-X_PILAR} z={0.46} altura={altura} yCentro={yCentro} />
      <Pilar x={X_PILAR} z={0.46} altura={altura} yCentro={yCentro} />
      <mesh position={[0, altura - 0.08, -0.46]}>
        <boxGeometry args={[X_PILAR * 2 + 0.22, 0.1, 0.12]} />
        <meshStandardMaterial color={COLOR_BASTIDOR} roughness={0.55} metalness={0.35} />
      </mesh>
      {POSICIONES_Y_TUBO.map((y) => (
        <mesh key={y} position={[0, y - 0.28, -0.46]}>
          <boxGeometry args={[X_PILAR * 2 + 0.12, 0.07, 0.1]} />
          <meshStandardMaterial color={COLOR_BASTIDOR} roughness={0.55} metalness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Pilar({
  x,
  z,
  altura,
  yCentro,
}: {
  x: number;
  z: number;
  altura: number;
  yCentro: number;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, yCentro, 0]}>
        <boxGeometry args={[0.12, altura, 0.12]} />
        <meshStandardMaterial color={COLOR_BASTIDOR} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.28]} />
        <meshStandardMaterial color={COLOR_BASTIDOR_BASE} roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}

function RedHidraulica() {
  return (
    <group>
      {[...TUBERIA_IMPULSION, ...TUBERIA_RETORNO, ...LATERALES_CANAL].map((tramo, indice) => (
        <mesh
          key={indice}
          position={tramo.position}
          quaternion={tramo.quaternion}
        >
          <cylinderGeometry args={[tramo.radio, tramo.radio, tramo.largo, 12]} />
          <meshStandardMaterial color={tramo.color} roughness={0.42} />
        </mesh>
      ))}
      {CODOS.map((punto, indice) => (
        <mesh key={`codo-${indice}`} position={punto}>
          <sphereGeometry args={[RADIO_RIEGO + 0.018, 12, 10]} />
          <meshStandardMaterial color={COLOR_CODO} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function TanqueYBomba() {
  const largo = 2.05;
  const ancho = 1.08;
  const alto = 0.7;
  const espesor = 0.07;
  const yAgua = alto * 0.58;

  return (
    <group position={[0, 0, Z_TANQUE]}>
      <mesh position={[0, espesor / 2, 0]}>
        <boxGeometry args={[largo, espesor, ancho]} />
        <meshStandardMaterial color={COLOR_TANQUE} roughness={0.68} />
      </mesh>
      <mesh position={[0, alto / 2, -(ancho / 2) + espesor / 2]}>
        <boxGeometry args={[largo, alto, espesor]} />
        <meshStandardMaterial color={COLOR_TANQUE} roughness={0.68} />
      </mesh>
      <mesh position={[0, alto / 2, ancho / 2 - espesor / 2]}>
        <boxGeometry args={[largo, alto, espesor]} />
        <meshStandardMaterial color={COLOR_TANQUE} roughness={0.68} />
      </mesh>
      <mesh position={[-(largo / 2) + espesor / 2, alto / 2, 0]}>
        <boxGeometry args={[espesor, alto, ancho]} />
        <meshStandardMaterial color={COLOR_TANQUE} roughness={0.68} />
      </mesh>
      <mesh position={[largo / 2 - espesor / 2, alto / 2, 0]}>
        <boxGeometry args={[espesor, alto, ancho]} />
        <meshStandardMaterial color={COLOR_TANQUE} roughness={0.68} />
      </mesh>
      <mesh position={[0, alto - 0.02, -(ancho / 2) + espesor / 2]}>
        <boxGeometry args={[largo + 0.06, 0.05, 0.1]} />
        <meshStandardMaterial color={COLOR_TANQUE_BORDE} roughness={0.6} />
      </mesh>
      <mesh position={[0, alto - 0.02, ancho / 2 - espesor / 2]}>
        <boxGeometry args={[largo + 0.06, 0.05, 0.1]} />
        <meshStandardMaterial color={COLOR_TANQUE_BORDE} roughness={0.6} />
      </mesh>
      <mesh position={[0, yAgua / 2 + 0.04, 0]}>
        <boxGeometry args={[largo - espesor * 2 - 0.04, yAgua, ancho - espesor * 2 - 0.04]} />
        <meshStandardMaterial
          color={COLOR_AGUA}
          transparent
          opacity={0.55}
          roughness={0.12}
          metalness={0.18}
        />
      </mesh>
      <mesh position={[0, yAgua + 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[largo - espesor * 2 - 0.08, ancho - espesor * 2 - 0.08]} />
        <meshStandardMaterial
          color={COLOR_AGUA_FILM}
          transparent
          opacity={0.7}
          roughness={0.08}
          metalness={0.22}
        />
      </mesh>
      <group position={[-1.42, 0, 0.66]}>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.42, 16]} />
          <meshStandardMaterial color={COLOR_BOMBA} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.16, 12]} />
          <meshStandardMaterial color={COLOR_BOMBA_OSCURO} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 10]} />
          <meshStandardMaterial color={COLOR_RIEGO} roughness={0.42} />
        </mesh>
      </group>
    </group>
  );
}

function CanalNft({
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
      <mesh position={[0, -ALTO_CANAL / 2 + 0.035, 0]}>
        <boxGeometry args={[LARGO_CANAL, 0.07, ANCHO_CANAL]} />
        <meshStandardMaterial color={COLOR_CANAL} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, -ANCHO_CANAL / 2 + 0.03]}>
        <boxGeometry args={[LARGO_CANAL, ALTO_CANAL, 0.06]} />
        <meshStandardMaterial color={COLOR_CANAL} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, ANCHO_CANAL / 2 - 0.03]}>
        <boxGeometry args={[LARGO_CANAL, ALTO_CANAL, 0.06]} />
        <meshStandardMaterial color={COLOR_CANAL} roughness={0.38} />
      </mesh>
      <mesh position={[0, -ALTO_CANAL / 2 + 0.1, 0]}>
        <boxGeometry args={[LARGO_CANAL - 0.14, 0.07, ANCHO_CANAL - 0.16]} />
        <meshStandardMaterial
          color={COLOR_AGUA_FILM}
          transparent
          opacity={0.5}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[-X_EXTREMO - 0.03, 0, 0]}>
        <boxGeometry args={[0.08, ALTO_CANAL + 0.04, ANCHO_CANAL + 0.04]} />
        <meshStandardMaterial color={COLOR_CANAL_CANTO} roughness={0.4} />
      </mesh>
      <mesh position={[X_EXTREMO + 0.03, 0, 0]}>
        <boxGeometry args={[0.08, ALTO_CANAL + 0.04, ANCHO_CANAL + 0.04]} />
        <meshStandardMaterial color={COLOR_CANAL_CANTO} roughness={0.4} />
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
  const yMaceta = Y_TAPA + 0.08;

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
      <mesh position={[0, yMaceta + 0.12, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.72, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, yMaceta, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.22, 14]} />
        <meshStandardMaterial color={COLOR_MACETA} roughness={0.7} />
      </mesh>
      <mesh position={[0, yMaceta + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.145, 18]} />
        <meshStandardMaterial color={COLOR_ARCILLA} roughness={0.9} />
      </mesh>
      <mesh ref={anillo} position={[0, yMaceta + 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
              yBase={yMaceta + 0.1}
            />
          </group>
          {mostrarEtiqueta ? (
            <Html position={[0, yMaceta + 0.72, 0]} center>
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
              position={[0.85, yMaceta + 0.4, 0.15]}
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
