/**
 * Interpreta un texto de formulario como número o `null`.
 * Vacío o inválido queda en `null` (dato faltante), nunca se convierte en 0 por omisión.
 *
 * @param texto - Valor crudo del input.
 * @returns Número finito, o `null` si no hay dato usable.
 */
export function parsearNumeroONull(texto: string): number | null {
  const recortado = texto.trim().replace(",", ".");
  if (recortado === "") {
    return null;
  }
  const numero = Number(recortado);
  if (!Number.isFinite(numero)) {
    return null;
  }
  return numero;
}

/**
 * Indica si el texto aún es un borrador numérico (p. ej. "12." o "-") y no debe confirmarse.
 */
export function esBorradorNumerico(texto: string): boolean {
  const recortado = texto.trim().replace(",", ".");
  return recortado === "-" || recortado === "." || recortado === "-." || recortado.endsWith(".");
}

/**
 * Normaliza plagas: recorta, quita vacíos y duplicados.
 * @returns Lista con al menos un nombre, o `null` si no hay plagas.
 */
export function normalizarPlagas(plagas: string[] | null | undefined): string[] | null {
  if (!plagas) {
    return null;
  }
  const unicas: string[] = [];
  for (const plaga of plagas) {
    const nombre = plaga.trim();
    if (nombre.length === 0) {
      continue;
    }
    const yaEsta = unicas.some((item) => item.toLowerCase() === nombre.toLowerCase());
    if (!yaEsta) {
      unicas.push(nombre);
    }
  }
  return unicas.length === 0 ? null : unicas;
}
