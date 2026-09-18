import { useEffect, useMemo, useState } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  ETIQUETAS_ETAPA_VIDA,
  obtenerCultivoPorId,
  resumenTrazabilidad,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../../store/usarGrafoConstruccion";
import { usarInterfaz, ZOOM_INICIAL } from "../../store/usarInterfaz";
import { COLOR_LIENZO, usarTema } from "../../store/usarTema";
import { crearApuntadorOrificios, registrarResolverOrificio } from "./apuntador-orificio";
import ModuloNft from "./ModuloNft";
import { indiceOrificioDePosicion } from "./orificios-nft";
import type { CultivoEnOrificio } from "./tipos-orificio";

function SincronizarZoom({ zoom }: { zoom: number }) {
  const camera = useThree((estado) => estado.camera);
  const size = useThree((estado) => estado.size);

  useEffect(() => {
    if ("isOrthographicCamera" in camera && camera.isOrthographicCamera) {
      camera.left = size.width / -2;
      camera.right = size.width / 2;
      camera.top = size.height / 2;
      camera.bottom = size.height / -2;
      camera.zoom = zoom;
    } else {
      camera.zoom = zoom / ZOOM_INICIAL;
    }
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width, zoom]);
  return null;
}

function CamaraYControles() {
  const zoom = usarInterfaz((estado) => estado.zoom);
  const anclado = usarInterfaz((estado) => estado.anclado);

  return (
    <>
      <SincronizarZoom zoom={zoom} />
      <OrbitControls
        makeDefault
        target={[0, 3.0, 0.35]}
        enableDamping
        dampingFactor={0.08}
        enabled={!anclado}
        enableRotate={!anclado}
        enablePan={!anclado}
        enableZoom={!anclado}
        minDistance={6}
        maxDistance={28}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
      />
    </>
  );
}

function FondoYLuces() {
  const tema = usarTema((estado) => estado.tema);
  const colorFondo = COLOR_LIENZO[tema];
  const claro = tema === "claro";
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(colorFondo, 1);
  }, [colorFondo, gl]);

  return (
    <>
      <color attach="background" args={[colorFondo]} />
      <hemisphereLight
        color={claro ? "#f3efe2" : "#4a4538"}
        groundColor={claro ? "#b7a888" : "#1a1814"}
        intensity={claro ? 0.7 : 0.45}
      />
      <ambientLight intensity={claro ? 0.42 : 0.32} />
      <directionalLight
        position={[7, 12, 6]}
        intensity={claro ? 1.35 : 1.05}
        color={claro ? "#fff6e4" : "#f0d9a8"}
      />
      <directionalLight
        position={[-5, 3, 4]}
        intensity={claro ? 0.28 : 0.22}
        color={claro ? "#d7e4ff" : "#8aa0c4"}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0.2]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={claro ? "#d2c6ae" : "#2a261c"} roughness={0.95} />
      </mesh>
      <ContactShadows
        position={[0, -0.025, 0.35]}
        opacity={claro ? 0.38 : 0.5}
        scale={10}
        blur={2.4}
        far={6}
      />
    </>
  );
}

function RegistrarApuntador() {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    const resolver = crearApuntadorOrificios(camera, gl, () => scene.children);
    registrarResolverOrificio(resolver);
    return () => registrarResolverOrificio(null);
  }, [camera, gl, scene]);

  return null;
}

export default function EscenaNft() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const idsGrupo = usarGrafoConstruccion((estado) => estado.idsGrupo);
  const idSeleccionado = usarGrafoConstruccion((estado) => estado.idSeleccionado);
  const filtroLienzo = usarGrafoConstruccion((estado) => estado.filtroLienzo);
  const seleccionar = usarGrafoConstruccion((estado) => estado.seleccionar);
  const quitarNodo = usarGrafoConstruccion((estado) => estado.quitarNodo);
  const [orificioHover, setOrificioHover] = useState<number | null>(null);

  const cultivos = useMemo(() => {
    const mapa = new Map<number, CultivoEnOrificio>();
    const filtro = filtroLienzo.trim().toLowerCase();
    for (const nodo of nodos) {
      const indice = indiceOrificioDePosicion(nodo.position.x);
      if (indice == null) {
        continue;
      }
      const definicion = obtenerCultivoPorId(nodo.data.cultivo.tipoCultivo);
      const nombre = definicion?.nombre ?? nodo.data.cultivo.tipoCultivo;
      const trazabilidad = resumenTrazabilidad(nodo.data.cultivo);
      const etapaNombre = trazabilidad.etapa ? ETIQUETAS_ETAPA_VIDA[trazabilidad.etapa] : null;
      const plagas = nodo.data.cultivo.plagas ?? [];
      const coincideFiltro =
        filtro.length === 0 ||
        nombre.toLowerCase().includes(filtro) ||
        nodo.data.cultivo.tipoCultivo.toLowerCase().includes(filtro) ||
        (etapaNombre?.toLowerCase().includes(filtro) ?? false) ||
        plagas.some((plaga) => plaga.toLowerCase().includes(filtro));
      mapa.set(indice, {
        id: nodo.id,
        nombre,
        color: nodo.data.color,
        familia: definicion?.familia ?? "hoja",
        seleccionado: nodo.id === idSeleccionado,
        enGrupo: idsGrupo.includes(nodo.id),
        atenuado: !coincideFiltro,
        progreso: trazabilidad.progreso,
      });
    }
    return mapa;
  }, [filtroLienzo, idSeleccionado, idsGrupo, nodos]);

  useEffect(() => {
    const onTecla = (evento: KeyboardEvent) => {
      if (evento.key !== "Delete" && evento.key !== "Backspace") {
        return;
      }
      const destino = evento.target;
      if (
        destino instanceof HTMLInputElement ||
        destino instanceof HTMLTextAreaElement ||
        destino instanceof HTMLSelectElement
      ) {
        return;
      }
      const seleccionado = usarGrafoConstruccion.getState().idSeleccionado;
      if (seleccionado) {
        evento.preventDefault();
        quitarNodo(seleccionado);
      }
    };
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [quitarNodo]);

  const onOrificio = (indice: number) => {
    const ocupante = cultivos.get(indice);
    if (ocupante) {
      seleccionar(ocupante.id);
      return;
    }
    seleccionar(null);
  };

  return (
    <>
      <CamaraYControles />
      <RegistrarApuntador />
      <FondoYLuces />
      <ModuloNft
        cultivos={cultivos}
        orificioHover={orificioHover}
        onOrificio={onOrificio}
        onHover={setOrificioHover}
        onQuitar={quitarNodo}
      />
    </>
  );
}
