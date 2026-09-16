export function descargarTexto(contenido: string, nombre: string, tipo: string): void {
  const blob = new Blob([contenido], { type });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
