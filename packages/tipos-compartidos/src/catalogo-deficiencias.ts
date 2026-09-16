import type { ClaveMineral } from "./nodo-cultivo";

/**
 * Fichas educativas de deficiencia de los cuatro minerales del boceto.
 * Texto propio. No cubre N, P, Ca ni micros fuera de Mn/Fe.
 */
export interface DefinicionDeficiencia {
  id: ClaveMineral;
  nombre: string;
  sintomas: string;
  causa: string;
  accion: string;
}

export const CATALOGO_DEFICIENCIAS: readonly DefinicionDeficiencia[] = [
  {
    id: "mineral_magnesio",
    nombre: "Magnesio",
    sintomas: "Clorosis internervial en hojas viejas; nervios siguen verdes.",
    causa: "Poco Mg en la solución o K muy alto que compite por absorción.",
    accion: "Subir mineral_magnesio hacia la receta de etapa; no vaciar el campo a 0.",
  },
  {
    id: "mineral_potasio",
    nombre: "Potasio",
    sintomas: "Bordes quemados en hojas maduras; fruto blando o mal cuajado.",
    causa: "Receta vegetativa en floración, o reserva diluida tras mucha reposición de agua.",
    accion: "En fruto, aplicar la receta de floración (más K). Revisar litros de tanque.",
  },
  {
    id: "mineral_manganeso",
    nombre: "Manganeso",
    sintomas: "Moteado en hojas jóvenes; crecimiento lento sin plaga visible.",
    causa: "Mn bajo en la solución diluida del tanque compartido.",
    accion: "Ajustar mineral_manganeso a la plantilla (hoja ~0,5 mg/L; fruto ~0,5–0,55).",
  },
  {
    id: "mineral_hierro",
    nombre: "Hierro",
    sintomas: "Hojas nuevas amarillas con nervios verdes (clorosis férrica).",
    causa: "Fe bajo en la receta, o solución que no se recambia.",
    accion: "Subir mineral_hierro a la receta de etapa (hoja 1 mg/L; fruto 1,5–2).",
  },
];

export function obtenerDeficiencia(clave: string): DefinicionDeficiencia | null {
  return CATALOGO_DEFICIENCIAS.find((ficha) => ficha.id === clave) ?? null;
}
