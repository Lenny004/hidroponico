/**
 * Catálogo informativo de plagas frecuentes en NFT.
 * Los nodos siguen guardando nombres en `plagas` (lista libre); esto aporta ficha y solución típica.
 */
export interface DefinicionPlaga {
  id: string;
  nombre: string;
  tipo: "plaga" | "enfermedad";
  descripcion: string;
  sintomas: string;
  causa: string;
  solucion_plagas: string;
}

export const CATALOGO_PLAGAS = [
  {
    id: "pulgon",
    nombre: "Pulgón",
    tipo: "plaga",
    descripcion:
      "Áfidos que colonizan brotes y envés. Extraen savia y excretan melaza que favorece hongos.",
    sintomas: "Hojas rizadas, melaza pegajosa, colonias verdes o negras en brotes.",
    causa: "Brotes tiernos y poco recambio de aire; hormigas que los cuidan.",
    solucion_plagas: "Jabón potásico al envés; retirar focos; trampas amarillas.",
  },
  {
    id: "mosca_blanca",
    nombre: "Mosca blanca",
    tipo: "plaga",
    descripcion:
      "Adultos blancos que vuelan al mover la planta. Debilitan el cultivo y transmiten virus.",
    sintomas: "Nubes al tocar la planta, envés con ninfas, amarilleo.",
    causa: "Ambiente cálido y plantas estresadas; entra por ventanas y mallas rotas.",
    solucion_plagas: "Trampas amarillas; jabón potásico; eliminar hojas muy afectadas.",
  },
  {
    id: "arana_roja",
    nombre: "Araña roja",
    tipo: "plaga",
    descripcion:
      "Ácaro en ambientes secos. Teje tela fina y pica el haz hasta broncear la hoja.",
    sintomas: "Punteado clorótico, bronceado, telaraña en envés.",
    causa: "Aire seco y hojas polvorientas; típico en época seca tropical.",
    solucion_plagas: "Subir humedad relativa; azufre o aceite de neem; aislar el nodo.",
  },
  {
    id: "trips",
    nombre: "Trips",
    tipo: "plaga",
    descripcion:
      "Insectos raspan el tejido y dejan plateado. Entran en flores de fruto.",
    sintomas: "Manchas plateadas, puntos negros de excremento, deformación de brotes.",
    causa: "Flores abiertas y follaje denso; se esconden en el envés.",
    solucion_plagas: "Trampas azules; retirar flores dañadas; jabón potásico.",
  },
  {
    id: "minador",
    nombre: "Minador",
    tipo: "plaga",
    descripcion:
      "Larva que abre galerías en el mesófilo. Reduce área fotosintética.",
    sintomas: "Serpentinas claras en la hoja; larva visible a contraluz.",
    causa: "Adultos que ponen huevos en hoja; más frecuente en tomate y apio.",
    solucion_plagas: "Cortar y retirar hojas minadas; no compostar el material infestado.",
  },
  {
    id: "mildiu",
    nombre: "Mildiu",
    tipo: "enfermedad",
    descripcion:
      "Hongo de ambientes húmedos y poco recambio de aire. Avance rápido en hoja.",
    sintomas: "Manchas aceitosas en haz y polvillo grisáceo en envés.",
    causa: "Alta humedad y poco recambio de aire en el canal NFT.",
    solucion_plagas: "Bajar humedad; más aireación; retirar tejido enfermo.",
  },
  {
    id: "oidio",
    nombre: "Oídio",
    tipo: "enfermedad",
    descripcion:
      "Polvillo blanco en hoja y tallo. Prefiere días templados y humedad media.",
    sintomas: "Polvo blanco, hojas que se secan de borde a centro.",
    causa: "Días templados con humedad media; follaje apretado.",
    solucion_plagas: "Bicarbonato o azufre; no mojar el follaje; separar plantas.",
  },
  {
    id: "mosca_del_suelo",
    nombre: "Mosca del suelo",
    tipo: "plaga",
    descripcion:
      "Bradysia en sustrato o canal con materia orgánica. Las larvas dañan raíces jóvenes.",
    sintomas: "Adultos alrededor del canal; plántulas que se marchitan sin causa foliar.",
    causa: "Materia orgánica en cubos o solución estancada en el canal.",
    solucion_plagas: "Trampas amarillas; limpiar restos; no dejar solución estancada.",
  },
  {
    id: "botritis",
    nombre: "Botritis",
    tipo: "enfermedad",
    descripcion: "Hongo que pudre tejidos tiernos, flores o frutos cuando hay humedad alta y ventilación insuficiente.",
    sintomas: "Moho gris, pudrición blanda y zonas acuosas en hojas, flores o frutos.",
    causa: "Follaje mojado, restos vegetales y poca circulación de aire.",
    solucion_plagas: "Aislar y retirar tejido afectado; mejorar ventilación; desinfectar herramientas y evitar mojar el follaje.",
  },
  {
    id: "fusarium",
    nombre: "Marchitez por Fusarium",
    tipo: "enfermedad",
    descripcion: "Enfermedad vascular que puede entrar por raíces y comprometer el transporte de agua.",
    sintomas: "Marchitez persistente pese a tener solución, amarilleo y raíces o tallos con zonas oscuras.",
    causa: "Material vegetal o sistema contaminado; agua cálida y estrés de raíces favorecen el problema.",
    solucion_plagas: "Aislar la planta, no reutilizar material afectado y limpiar/desinfectar el sistema antes de replantar.",
  },
  {
    id: "pudricion-raiz",
    nombre: "Pudrición de raíz",
    tipo: "enfermedad",
    descripcion: "Daño radicular asociado a baja oxigenación, agua demasiado caliente o microorganismos oportunistas.",
    sintomas: "Raíces marrones o viscosas, olor desagradable, crecimiento detenido y marchitez.",
    causa: "Solución estancada, temperatura elevada, residuos orgánicos o falta de oxígeno disuelto.",
    solucion_plagas: "Mejorar aireación y circulación, retirar raíces dañadas, renovar solución y sanitizar canal y depósito.",
  },
  {
    id: "mancha-bacteriana",
    nombre: "Mancha bacteriana",
    tipo: "enfermedad",
    descripcion: "Lesiones bacterianas que se dispersan con salpicaduras, manipulación y herramientas contaminadas.",
    sintomas: "Manchas oscuras con halo amarillo, lesiones en tallos o frutos y avance después de manipular plantas mojadas.",
    causa: "Semilla, agua o herramientas contaminadas; alta humedad sobre el follaje.",
    solucion_plagas: "Retirar hojas afectadas, desinfectar herramientas, mejorar ventilación y evitar trabajar con follaje mojado.",
  },
] as const satisfies readonly DefinicionPlaga[];

export type IdPlagaCatalogo = (typeof CATALOGO_PLAGAS)[number]["id"];

/**
 * Busca una plaga del catálogo por id o por nombre (sin distinguir mayúsculas).
 * @returns La ficha, o `null` si no está en la lista blanca.
 */
export function obtenerPlagaPorIdONombre(valor: string): DefinicionPlaga | null {
  const clave = valor.trim().toLowerCase();
  if (clave.length === 0) {
    return null;
  }
  return (
    CATALOGO_PLAGAS.find(
      (plaga) => plaga.id === clave || plaga.nombre.toLowerCase() === clave,
    ) ?? null
  );
}
