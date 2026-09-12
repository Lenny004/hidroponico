import { useEffect, useMemo, useState } from "react";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  ETIQUETAS_ETAPA_VIDA,
  obtenerCultivoPorId,
  resumenTrazabilidad,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../../store/usarGrafoConstruccion";
import { COLOR_LIENZO, usarTema } from "../../store/usarTema";
import { crearApuntadorOrificios, registrarResolverOrificio } from "./apuntador-orificio";
import ModuloNft from "./ModuloNft";
import { indiceOrificioDePosicion } from "./orificios-nft";
import type { CultivoEnOrificio } from "./tipos-orificio";

function CamaraYControles() {
  return (
    <>
      <OrthographicCamera makeDefault position={[6.2, 6.4, 14]} zoom={32} near={0.1} far={120} />
      <OrbitControls
        makeDefault
        target={[0, 3.2, 0]}
        enableDamping
        minZoom={16}
        maxZoom={80}
      />
    </>
  );
}

function FondoYLuces() {
  const tema = usarTema((estado) => estado.tema);
  const colorFondo = COLOR_LIENZO[tema];
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(colorFondo, 1);
  }, [colorFondo, gl]);

  return (
    <>
      <color attach="background" args={[colorFondo]} />
      <ambientLight intensity={tema === "claro" ? 0.82 : 0.7} />
      <directionalLight position={[-4, 11, 5]} intensity={tema === "claro" ? 1.15 : 1.12} />
      <directionalLight
        position={[4, 1.5, 5]}
        intensity={tema === "claro" ? 0.22 : 0.28}
        color={tema === "claro" ? "#fff4d6" : "#e8d5a8"}
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
