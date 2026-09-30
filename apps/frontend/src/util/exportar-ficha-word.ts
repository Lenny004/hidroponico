import {
  CLAVES_VARIABLES_CULTIVO,
  ETIQUETAS_VARIABLES,
  UNIDAD_NODO,
  formatearMedida,
  resumenTrazabilidad,
  type DefinicionCultivo,
  type FichaNutricionalCultivo,
  type GuiaCultivo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";

/** Descarga una ficha clínica-educativa editable en Microsoft Word. */
export async function exportarFichaWord({
  cultivo,
  definicion,
  guia,
  ficha,
  registrosSanitarios,
}: {
  cultivo: NodoCultivo;
  definicion: DefinicionCultivo;
  guia: GuiaCultivo;
  ficha: FichaNutricionalCultivo | null;
  registrosSanitarios: readonly string[];
}): Promise<void> {
  // Se carga solo al exportar para no penalizar la vista 3D inicial.
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
  const parrafoEtiqueta = (etiqueta: string, valor: string) =>
    new Paragraph({
      children: [new TextRun({ text: `${etiqueta}: `, bold: true }), new TextRun(valor)],
    });
  const lista = (valores: readonly string[]) =>
    valores.map((valor) => new Paragraph({ text: valor, bullet: { level: 0 } }));
  const vida = resumenTrazabilidad(cultivo);
  const variables = CLAVES_VARIABLES_CULTIVO.map((clave) => {
    const valor = cultivo.variables[clave];
    return parrafoEtiqueta(
      ETIQUETAS_VARIABLES[clave],
      valor == null ? "Sin dato" : formatearMedida(valor, UNIDAD_NODO[clave]),
    );
  });
  const diagnostico = registrosSanitarios.length
    ? `Se registraron: ${registrosSanitarios.join(", ")}. Revise los síntomas antes de aplicar cualquier tratamiento.`
    : "No hay plagas o enfermedades registradas. Mantenga una revisión visual periódica de hojas, tallos y raíces.";

  const documento = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Ficha de cultivo hidropónico", heading: HeadingLevel.TITLE }),
          new Paragraph({ text: definicion.nombre, heading: HeadingLevel.HEADING_1 }),
          ...(ficha ? [new Paragraph({ text: ficha.nombre_cientifico })] : []),
          parrafoEtiqueta("Fecha de emisión", new Date().toLocaleDateString("es-SV")),
          new Paragraph({ text: "Estado de la planta", heading: HeadingLevel.HEADING_2 }),
          parrafoEtiqueta("Etapa", vida.etapa ?? "Sin etapa definida"),
          parrafoEtiqueta("Fecha de alta", cultivo.iniciado_en ?? "Sin dato"),
          parrafoEtiqueta("Días de vida", vida.dias == null ? "Sin dato" : String(vida.dias)),
          new Paragraph({ text: "Requerimientos", heading: HeadingLevel.HEADING_2 }),
          parrafoEtiqueta("Luz", guia.luz),
          parrafoEtiqueta("Agua", guia.agua),
          new Paragraph({ text: "Datos de la solución", heading: HeadingLevel.HEADING_2 }),
          ...variables,
          new Paragraph({ text: "Diagnóstico orientativo", heading: HeadingLevel.HEADING_2 }),
          new Paragraph(guia.diagnostico),
          new Paragraph(diagnostico),
          new Paragraph({ text: "Prevención recomendada", heading: HeadingLevel.HEADING_2 }),
          ...lista(guia.acciones_preventivas),
          new Paragraph({ text: "Observaciones", heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cultivo.comentarios ?? "Sin notas registradas."),
          new Paragraph({
            children: [
              new TextRun({ text: "Aviso: ", bold: true }),
              new TextRun("Esta ficha es informativa. Ante daño progresivo, pérdida de raíces o posible enfermedad, consulte a un técnico agrícola."),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(documento);
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `ficha-${definicion.id}-${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(enlace.href);
}
