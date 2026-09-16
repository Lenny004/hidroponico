import { obtenerCultivoPorId, reposicionDiaDe } from "./catalogo-cultivos";
import type { NodoCultivo } from "./nodo-cultivo";
import { masaMineralesNodo } from "./proyeccion-insumos";

/**
 * Árbol Patricia binario (crit-bit): comprime prefijos y ramifica en el primer bit distinto.
 * Indexa cultivos del grafo; una hoja corresponde a un nodo plantado.
 */

export interface NodoPatricia<T> {
  /** Bit que distingue a los dos hijos. `null` = hoja. */
  bit: number | null;
  clave: string;
  valor: T | null;
  izquierdo: NodoPatricia<T> | null;
  derecho: NodoPatricia<T> | null;
}

export interface EntradaPatricia<T> {
  clave: string;
  valor: T;
}

export interface VistaPatricia<T> {
  id: string;
  bit: number | null;
  prefijo: string;
  esHoja: boolean;
  etiqueta: string;
  valor: T | null;
  hijos: VistaPatricia<T>[];
}

/**
 * Clave lexicográfica: el tipo queda de prefijo para que mismas plantas compartan rama.
 *
 * @param tipoCultivo - Id de catálogo (`lechuga`, …).
 * @param idNodo - Id del nodo en el grafo.
 */
export function clavePatricia(tipoCultivo: string, idNodo: string): string {
  return `${tipoCultivo}/${idNodo}`;
}

/**
 * Lee el bit `indice` (0 = MSB del primer carácter). Fuera de la clave cuenta como 0.
 */
export function bitEnClave(clave: string, indice: number): 0 | 1 {
  if (indice < 0) {
    return 0;
  }
  const byteIndex = Math.floor(indice / 8);
  if (byteIndex >= clave.length) {
    return 0;
  }
  const bitEnByte = 7 - (indice % 8);
  return ((clave.charCodeAt(byteIndex) >> bitEnByte) & 1) as 0 | 1;
}

/**
 * Primer bit donde `a` y `b` difieren. Claves iguales → `null`.
 */
export function primerBitDistinto(a: string, b: string): number | null {
  const maxBits = Math.max(a.length, b.length) * 8;
  for (let indice = 0; indice < maxBits; indice += 1) {
    if (bitEnClave(a, indice) !== bitEnClave(b, indice)) {
      return indice;
    }
  }
  return null;
}

function crearHoja<T>(clave: string, valor: T): NodoPatricia<T> {
  return {
    bit: null,
    clave,
    valor,
    izquierdo: null,
    derecho: null,
  };
}

function crearInterno<T>(bit: number): NodoPatricia<T> {
  return {
    bit,
    clave: "",
    valor: null,
    izquierdo: null,
    derecho: null,
  };
}

/**
 * Patricia binario mutable. Insertar una clave existente sustituye el valor (no duplica).
 */
export class ArbolPatricia<T> {
  private raiz: NodoPatricia<T> | null = null;

  /**
   * @returns `true` si no hay hojas.
   */
  get vacio(): boolean {
    return this.raiz == null;
  }

  /**
   * Raíz cruda para pruebas y para armar la vista. `null` si el árbol está vacío.
   */
  obtenerRaiz(): NodoPatricia<T> | null {
    return this.raiz;
  }

  /**
   * Baja por los bits hasta una hoja. Vacío → `null`.
   */
  buscar(clave: string): T | null {
    if (this.raiz == null) {
      return null;
    }
    const hoja = bajarHastaHoja(this.raiz, clave);
    return hoja.clave === clave ? hoja.valor : null;
  }

  /**
   * Inserta o actualiza. Prefijos compartidos se comprimen en un solo interno.
   *
   * @param clave - Cadena binaria lógica (UTF-16, MSB primero).
   * @param valor - Payload de la hoja.
   */
  insertar(clave: string, valor: T): void {
    if (this.raiz == null) {
      this.raiz = crearHoja(clave, valor);
      return;
    }
    const hallado = bajarHastaHoja(this.raiz, clave);
    if (hallado.clave === clave) {
      hallado.valor = valor;
      return;
    }
    const bit = primerBitDistinto(hallado.clave, clave);
    if (bit == null) {
      hallado.valor = valor;
      return;
    }
    this.raiz = insertarDesde(this.raiz, clave, bit, crearHoja(clave, valor));
  }

  /**
   * Recorre las hojas en orden de bits (lexicográfico ASCII).
   */
  hojas(): Array<{ clave: string; valor: T }> {
    const resultado: Array<{ clave: string; valor: T }> = [];
    recogerHojas(this.raiz, resultado);
    return resultado;
  }
}

function bajarHastaHoja<T>(nodo: NodoPatricia<T>, clave: string): NodoPatricia<T> {
  let actual = nodo;
  while (actual.bit != null && actual.izquierdo && actual.derecho) {
    actual = bitEnClave(clave, actual.bit) === 1 ? actual.derecho : actual.izquierdo;
  }
  return actual;
}

function insertarDesde<T>(
  nodo: NodoPatricia<T>,
  clave: string,
  bit: number,
  hojaNueva: NodoPatricia<T>,
): NodoPatricia<T> {
  if (nodo.bit == null || nodo.bit > bit) {
    const interno = crearInterno<T>(bit);
    if (bitEnClave(clave, bit) === 1) {
      interno.izquierdo = nodo;
      interno.derecho = hojaNueva;
    } else {
      interno.izquierdo = hojaNueva;
      interno.derecho = nodo;
    }
    return interno;
  }
  if (bitEnClave(clave, nodo.bit) === 1) {
    nodo.derecho = insertarDesde(nodo.derecho ?? nodo, clave, bit, hojaNueva);
  } else {
    nodo.izquierdo = insertarDesde(nodo.izquierdo ?? nodo, clave, bit, hojaNueva);
  }
  return nodo;
}

function recogerHojas<T>(
  nodo: NodoPatricia<T> | null,
  salida: Array<{ clave: string; valor: T }>,
): void {
  if (!nodo) {
    return;
  }
  if (nodo.bit == null) {
    if (nodo.valor != null) {
      salida.push({ clave: nodo.clave, valor: nodo.valor });
    }
    return;
  }
  recogerHojas(nodo.izquierdo, salida);
  recogerHojas(nodo.derecho, salida);
}

function prefijoComun(claves: string[]): string {
  if (claves.length === 0) {
    return "";
  }
  const primera = claves[0] ?? "";
  let largo = primera.length;
  for (const clave of claves) {
    let i = 0;
    while (i < largo && i < clave.length && clave[i] === primera[i]) {
      i += 1;
    }
    largo = i;
  }
  return primera.slice(0, largo);
}

function clavesDeHojas<T>(nodo: NodoPatricia<T>): string[] {
  const hojas: Array<{ clave: string; valor: T }> = [];
  recogerHojas(nodo, hojas);
  return hojas.map((hoja) => hoja.clave);
}

/**
 * Vista renderizable del Patricia: internos = prefijo comprimido, hojas = cultivos.
 *
 * @param raiz - Raíz del árbol, o `null` si no hay plantados.
 * @param etiquetaDe - Texto de una hoja a partir de su valor.
 */
export function vistaArbolPatricia<T>(
  raiz: NodoPatricia<T> | null,
  etiquetaDe: (valor: T, clave: string) => string,
): VistaPatricia<T> | null {
  if (!raiz) {
    return null;
  }
  return armarVista(raiz, etiquetaDe, "raiz");
}

function armarVista<T>(
  nodo: NodoPatricia<T>,
  etiquetaDe: (valor: T, clave: string) => string,
  id: string,
): VistaPatricia<T> {
  if (nodo.bit == null) {
    const valor = nodo.valor;
    return {
      id,
      bit: null,
      prefijo: nodo.clave,
      esHoja: true,
      etiqueta: valor != null ? etiquetaDe(valor, nodo.clave) : nodo.clave,
      valor,
      hijos: [],
    };
  }

  const prefijo = prefijoComun(clavesDeHojas(nodo));
  const tipo = prefijo.split("/")[0] ?? prefijo;
  const hijos: VistaPatricia<T>[] = [];
  if (nodo.izquierdo) {
    hijos.push(armarVista(nodo.izquierdo, etiquetaDe, `${id}-0`));
  }
  if (nodo.derecho) {
    hijos.push(armarVista(nodo.derecho, etiquetaDe, `${id}-1`));
  }

  return {
    id,
    bit: nodo.bit,
    prefijo,
    esHoja: false,
    etiqueta: tipo.length > 0 ? tipo : `bit ${nodo.bit}`,
    valor: null,
    hijos,
  };
}

/**
 * Construye un Patricia a partir de entradas. Orden de inserción no cambia el resultado.
 *
 * @param entradas - Claves únicas; duplicadas se quedan con el último valor.
 */
export function construirArbolPatricia<T>(entradas: ReadonlyArray<EntradaPatricia<T>>): ArbolPatricia<T> {
  const arbol = new ArbolPatricia<T>();
  for (const entrada of entradas) {
    arbol.insertar(entrada.clave, entrada.valor);
  }
  return arbol;
}

/**
 * Hojas de una vista, en el orden in-order del Patricia.
 *
 * @param vista - Nodo de la vista (interno o hoja).
 */
export function hojasDeVista<T>(vista: VistaPatricia<T>): VistaPatricia<T>[] {
  if (vista.esHoja) {
    return [vista];
  }
  return vista.hijos.flatMap((hijo) => hojasDeVista(hijo));
}

function tipoDeHoja(vista: VistaPatricia<HojaCultivoPatricia>): string | null {
  return vista.valor?.tipoCultivo ?? null;
}

function tiposEnVistaCultivo(vista: VistaPatricia<HojaCultivoPatricia>): Set<string> {
  const tipos = new Set<string>();
  for (const hoja of hojasDeVista(vista)) {
    const tipo = tipoDeHoja(hoja);
    if (tipo) {
      tipos.add(tipo);
    }
  }
  return tipos;
}

/**
 * Compacta internos que no cambian de `tipoCultivo`. El Patricia real sigue
 * ramificando por bits; la UI muestra tipo → hojas para poder hacer click.
 *
 * @param vista - Vista cruda de `vistaArbolPatricia`.
 */
export function comprimirVistaPorTipo(
  vista: VistaPatricia<HojaCultivoPatricia>,
): VistaPatricia<HojaCultivoPatricia> {
  if (vista.esHoja) {
    return vista;
  }
  const tipos = tiposEnVistaCultivo(vista);
  if (tipos.size <= 1) {
    return {
      ...vista,
      etiqueta: [...tipos][0] ?? vista.etiqueta,
      hijos: hojasDeVista(vista),
    };
  }
  return {
    ...vista,
    hijos: vista.hijos.map((hijo) => comprimirVistaPorTipo(hijo)),
  };
}

export interface HojaCultivoPatricia {
  id: string;
  tipoCultivo: string;
  nombre: string;
  color: string;
  litros: number | null;
  reposicionDiaL: number | null;
  masaDiaMg: number | null;
}

/**
 * Indexa los nodos del grafo de construcción. Arrastrar un cultivo añade una hoja;
 * el total del tubo se deriva aparte (`consumoTemporalGrupo`).
 *
 * @param nodos - Cultivos plantados.
 */
export function arbolPatriciaDeNodos(
  nodos: readonly NodoCultivo[],
): ArbolPatricia<HojaCultivoPatricia> {
  return construirArbolPatricia(
    nodos.map((nodo) => {
      const definicion = obtenerCultivoPorId(nodo.tipoCultivo);
      return {
        clave: clavePatricia(nodo.tipoCultivo, nodo.id),
        valor: {
          id: nodo.id,
          tipoCultivo: nodo.tipoCultivo,
          nombre: definicion?.nombre ?? nodo.tipoCultivo,
          color: definicion?.color ?? "#93a4c3",
          litros: nodo.variables.cantidad_sol ?? null,
          reposicionDiaL: reposicionDiaDe(nodo.tipoCultivo),
          masaDiaMg: masaMineralesNodo(nodo),
        },
      };
    }),
  );
}
