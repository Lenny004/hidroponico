import {
  CLAVES_NUTRIENTE,
  CLAVES_VARIABLES_CULTIVO,
  ETIQUETAS_ETAPA_VIDA,
  ETIQUETAS_FAMILIA,
  ETIQUETAS_NUTRIENTE,
  ETIQUETAS_VARIABLES,
  SIMBOLOS_NUTRIENTE,
  UNIDAD_NODO,
  UNIDAD_NUTRIENTE,
  fichasPlagasDeNodo,
  formatearMedida,
  porcentajesPorcionCatalogo,
  resumenTrazabilidad,
  type ClaveNutriente,
  type DefinicionCultivo,
  type FichaNutricionalCultivo,
  type GuiaCultivo,
  type NodoCultivo,
} from "@hidroponico/tipos-compartidos";

const COLORES = {
  tinta: "17231D",
  verde: "2F6B52",
  verdeClaro: "EAF3EE",
  verdeMuyClaro: "F5F9F6",
  gris: "52615A",
  linea: "D9E3DC",
  blanco: "FFFFFF",
  grisFila: "F7F9F8",
} as const;

const FUENTE = "Aptos";
const ANCHO_TABLA = 9360;
const MARGEN_CELDA = { top: 120, bottom: 120, left: 150, right: 150 };
const BORDE_TABLA = {
  top: { style: "single" as const, size: 5, color: COLORES.linea },
  bottom: { style: "single" as const, size: 5, color: COLORES.linea },
  left: { style: "single" as const, size: 5, color: COLORES.linea },
  right: { style: "single" as const, size: 5, color: COLORES.linea },
  insideHorizontal: { style: "single" as const, size: 5, color: COLORES.linea },
  insideVertical: { style: "single" as const, size: 5, color: COLORES.linea },
};

function textoSeguro(valor: string | null | undefined, vacio = "Sin dato"): string {
  const texto = valor?.trim();
  return texto ? texto : vacio;
}

function porcentaje(valor: number | null | undefined): string {
  if (valor == null) {
    return "Sin dato";
  }
  return `${Math.round(valor * 10) / 10} %`;
}

function fechaParaArchivo(fecha: Date): string {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

/** Descarga una ficha editorial educativa y editable en Microsoft Word. */
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
  const {
    AlignmentType,
    Document,
    Footer,
    Header,
    PageNumber,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    VerticalAlignTable,
    WidthType,
  } = await import("docx");

  const estilos = {
    cuerpo: "FichaCuerpo",
    nota: "FichaNota",
    titulo: "FichaTitulo",
    subtitulo: "FichaSubtitulo",
    seccion: "FichaSeccion",
    tabla: "FichaTabla",
    tablaCabecera: "FichaTablaCabecera",
    metricaEtiqueta: "FichaMetricaEtiqueta",
    metricaValor: "FichaMetricaValor",
    viñeta: "FichaViñeta",
  } as const;

  const textoRun = (texto: string, opciones: Record<string, unknown> = {}) =>
    new TextRun({ font: FUENTE, ...opciones, text: texto });

  const parrafo = (texto: string, style: string = estilos.cuerpo) =>
    new Paragraph({ text: texto, style, widowControl: true });

  const parrafoEtiqueta = (etiqueta: string, valor: string) =>
    new Paragraph({
      style: estilos.cuerpo,
      widowControl: true,
      children: [
        textoRun(`${etiqueta}: `, { bold: true, color: COLORES.tinta }),
        textoRun(valor, { color: COLORES.tinta }),
      ],
    });

  const celda = ({
    children,
    width,
    fill,
    verticalAlign = VerticalAlignTable.CENTER,
  }: {
    children: InstanceType<typeof Paragraph>[];
    width: number;
    fill?: string;
    verticalAlign?: typeof VerticalAlignTable[keyof typeof VerticalAlignTable];
  }) =>
    new TableCell({
      children,
      width: { size: width, type: WidthType.DXA },
      margins: MARGEN_CELDA,
      verticalAlign,
      ...(fill ? { shading: { fill } } : {}),
    });

  const celdaTexto = (
    texto: string,
    width: number,
    opciones: {
      fill?: string;
      style?: string;
      bold?: boolean;
      color?: string;
      align?: typeof AlignmentType[keyof typeof AlignmentType];
    } = {},
  ) =>
    celda({
      width,
      fill: opciones.fill,
      children: [
        new Paragraph({
          style: opciones.style ?? estilos.tabla,
          alignment: opciones.align,
          children: [
            textoRun(texto, {
              bold: opciones.bold,
              color: opciones.color ?? COLORES.tinta,
            }),
          ],
        }),
      ],
    });

  const tabla = (filas: InstanceType<typeof TableRow>[], anchos: readonly number[]) =>
    new Table({
      rows: filas,
      width: { size: ANCHO_TABLA, type: WidthType.DXA },
      columnWidths: anchos,
      layout: TableLayoutType.FIXED,
      alignment: AlignmentType.CENTER,
      margins: MARGEN_CELDA,
      borders: BORDE_TABLA,
    });

  const filaCabecera = (valores: readonly string[], anchos: readonly number[]) =>
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: valores.map((valor, indice) =>
        celdaTexto(valor, anchos[indice] ?? anchos[anchos.length - 1], {
          fill: COLORES.verde,
          style: estilos.tablaCabecera,
          bold: true,
          color: COLORES.blanco,
        }),
      ),
    });

  const vida = resumenTrazabilidad(cultivo);
  const registros = registrosSanitarios.length ? registrosSanitarios : cultivo.plagas ?? [];
  const fichasSanitarias = fichasPlagasDeNodo([...registros]);
  const nombresCatalogados = new Set(fichasSanitarias.map((item) => item.nombre.toLowerCase()));
  const registrosNoCatalogados = registros.filter(
    (registro) => !nombresCatalogados.has(registro.trim().toLowerCase()),
  );
  const etapa = vida.etapa ? ETIQUETAS_ETAPA_VIDA[vida.etapa] : "Sin etapa definida";
  const familia = ETIQUETAS_FAMILIA[definicion.familia];
  const variables = CLAVES_VARIABLES_CULTIVO.map((clave) => {
    const valor = cultivo.variables[clave];
    return {
      etiqueta: ETIQUETAS_VARIABLES[clave],
      valor: valor == null ? "Sin dato" : formatearMedida(valor, UNIDAD_NODO[clave]),
      nota:
        clave.startsWith("mineral_")
          ? "Concentración de la solución"
          : clave === "oxigeno"
            ? "Oxígeno disuelto"
            : "Reserva recirculante NFT",
    };
  });

  const filasSolucion = [
    filaCabecera(["Parámetro", "Valor", "Lectura"], [3300, 1800, 4260]),
    ...variables.map((variable, indice) =>
      new TableRow({
        cantSplit: true,
        children: [
          celdaTexto(variable.etiqueta, 3300, { fill: indice % 2 ? COLORES.grisFila : COLORES.blanco }),
          celdaTexto(variable.valor, 1800, {
            fill: indice % 2 ? COLORES.grisFila : COLORES.blanco,
            bold: true,
            align: AlignmentType.RIGHT,
          }),
          celdaTexto(variable.nota, 4260, {
            fill: indice % 2 ? COLORES.grisFila : COLORES.blanco,
            color: COLORES.gris,
          }),
        ],
      }),
    ),
  ];

  const filasMetadatos = [
    new TableRow({
      cantSplit: true,
      children: [
        celdaTexto("Familia", 3120, { fill: COLORES.verdeMuyClaro, bold: true }),
        celdaTexto(familia, 3120, { fill: COLORES.verdeMuyClaro }),
        celdaTexto("Sistema", 1560, { fill: COLORES.verdeMuyClaro, bold: true }),
        celdaTexto(definicion.proceso.sistema, 1560, { fill: COLORES.verdeMuyClaro }),
      ],
    }),
    new TableRow({
      cantSplit: true,
      children: [
        celdaTexto("Fecha de alta", 3120, { fill: COLORES.blanco, bold: true }),
        celdaTexto(textoSeguro(cultivo.iniciado_en), 3120, { fill: COLORES.blanco }),
        celdaTexto("Etapa", 1560, { fill: COLORES.blanco, bold: true }),
        celdaTexto(etapa, 1560, { fill: COLORES.blanco }),
      ],
    }),
    new TableRow({
      cantSplit: true,
      children: [
        celdaTexto("Fecha de emisión", 3120, { fill: COLORES.verdeMuyClaro, bold: true }),
        celdaTexto(new Date().toLocaleDateString("es-SV"), 3120, { fill: COLORES.verdeMuyClaro }),
        celdaTexto("Días de vida", 1560, { fill: COLORES.verdeMuyClaro, bold: true }),
        celdaTexto(vida.dias == null ? "Sin dato" : String(vida.dias), 1560, { fill: COLORES.verdeMuyClaro }),
      ],
    }),
  ];

  const filasResumen = [
    new TableRow({
      cantSplit: true,
      children: [
        celda({
          width: 2340,
          fill: COLORES.verdeMuyClaro,
          children: [
            new Paragraph({ text: "Días a cosecha", style: estilos.metricaEtiqueta }),
            new Paragraph({ text: `${definicion.proceso.dias_cosecha} d`, style: estilos.metricaValor }),
          ],
        }),
        celda({
          width: 2340,
          fill: COLORES.verdeMuyClaro,
          children: [
            new Paragraph({ text: "Reserva NFT", style: estilos.metricaEtiqueta }),
            new Paragraph({
              text: formatearMedida(cultivo.variables.cantidad_sol ?? definicion.plantilla.cantidad_sol, "L"),
              style: estilos.metricaValor,
            }),
          ],
        }),
        celda({
          width: 2340,
          fill: COLORES.verdeMuyClaro,
          children: [
            new Paragraph({ text: "Oxígeno", style: estilos.metricaEtiqueta }),
            new Paragraph({
              text: formatearMedida(cultivo.variables.oxigeno ?? definicion.plantilla.oxigeno, "mg/L"),
              style: estilos.metricaValor,
            }),
          ],
        }),
        celda({
          width: 2340,
          fill: COLORES.verdeMuyClaro,
          children: [
            new Paragraph({ text: "Reposición diaria", style: estilos.metricaEtiqueta }),
            new Paragraph({ text: `${formatearMedida(definicion.reposicion_dia_L, "L")}/día`, style: estilos.metricaValor }),
          ],
        }),
      ],
    }),
  ];

  const filasNutricion = ficha
    ? [
        filaCabecera(["Nutriente", "Porción", "% valor diario"], [4080, 2400, 2880]),
        ...CLAVES_NUTRIENTE.map((clave: ClaveNutriente, indice) => {
          const porcion = (ficha.por_100g[clave] / 100) * ficha.porcion_g;
          const nombre = `${SIMBOLOS_NUTRIENTE[clave]} · ${ETIQUETAS_NUTRIENTE[clave]}`;
          return new TableRow({
            cantSplit: true,
            children: [
              celdaTexto(nombre, 4080, { fill: indice % 2 ? COLORES.grisFila : COLORES.blanco }),
              celdaTexto(formatearMedida(porcion, UNIDAD_NUTRIENTE[clave]), 2400, {
                fill: indice % 2 ? COLORES.grisFila : COLORES.blanco,
                align: AlignmentType.RIGHT,
              }),
              celdaTexto(porcentaje(porcentajesPorcionCatalogo(definicion.id)?.[clave]), 2880, {
                fill: indice % 2 ? COLORES.grisFila : COLORES.blanco,
                align: AlignmentType.RIGHT,
              }),
            ],
          });
        }),
      ]
    : [];

  const children = [
    new Paragraph({ text: "HIDROPÓNICO", style: "FichaKicker" }),
    new Paragraph({ text: "Ficha de cultivo hidropónico", style: estilos.titulo }),
    ...(ficha ? [new Paragraph({ text: ficha.nombre_cientifico, style: estilos.subtitulo })] : []),
    parrafo(
      `Ficha informativa de ${definicion.nombre} para consultar su ciclo, manejo, solución nutritiva y observaciones del nodo seleccionado.`,
      "FichaIntroduccion",
    ),
    tabla(filasMetadatos, [3120, 3120, 1560, 1560]),
    new Paragraph({ text: "Resumen del cultivo", style: estilos.seccion }),
    tabla(filasResumen, [2340, 2340, 2340, 2340]),
    new Paragraph({ text: "Ciclo y manejo", style: estilos.seccion }),
    parrafo(definicion.proceso.resumen),
    parrafoEtiqueta("Luz", guia.luz),
    parrafoEtiqueta("Agua", guia.agua),
    new Paragraph({ text: "Datos de la solución", style: estilos.seccion }),
    tabla(filasSolucion, [3300, 1800, 4260]),
    new Paragraph({ text: "Diagnóstico y sanidad", style: estilos.seccion }),
    new Paragraph({
      style: estilos.cuerpo,
      children: [
        textoRun("Lectura general. ", { bold: true }),
        textoRun(guia.diagnostico),
      ],
    }),
    ...(fichasSanitarias.length
      ? fichasSanitarias.map(
          (item) =>
            new Paragraph({
              style: estilos.cuerpo,
              children: [
                textoRun(`${item.nombre} · ${item.tipo}. `, { bold: true }),
                textoRun(`Síntomas: ${item.sintomas} Causa probable: ${item.causa} Acción inicial: ${item.solucion_plagas}`),
              ],
            }),
        )
      : [parrafo("No hay plagas o enfermedades catalogadas en este nodo. Mantenga una revisión visual periódica.", estilos.nota)]),
    ...(registrosNoCatalogados.length
      ? [parrafo(`Registros adicionales del nodo: ${registrosNoCatalogados.join(", ")}.`, estilos.nota)]
      : []),
    ...(cultivo.solucion_plagas
      ? [parrafoEtiqueta("Tratamiento registrado", cultivo.solucion_plagas)]
      : []),
    new Paragraph({ text: "Prevención recomendada", style: estilos.seccion }),
    ...guia.acciones_preventivas.map(
      (accion) => new Paragraph({ text: accion, style: estilos.viñeta, bullet: { level: 0 } }),
    ),
    ...(ficha
      ? [
          new Paragraph({ text: "Perfil nutricional", style: estilos.seccion }),
          parrafo(ficha.resumen),
          tabla(filasNutricion, [4080, 2400, 2880]),
          parrafo(`Porción de referencia: ${ficha.porcion_g} g. ${ficha.fuente_nutricion}`, estilos.nota),
        ]
      : []),
    new Paragraph({ text: "Observaciones", style: estilos.seccion }),
    parrafo(textoSeguro(cultivo.comentarios, "Sin notas registradas.")),
    new Paragraph({
      style: estilos.nota,
      children: [
        textoRun("Aviso. ", { bold: true, color: COLORES.tinta }),
        textoRun("Esta ficha es informativa. Ante daño progresivo, pérdida de raíces o posible enfermedad, consulte a un técnico agrícola."),
      ],
    }),
  ];

  const documento = new Document({
    title: `Ficha de cultivo hidropónico ${definicion.nombre}`,
    subject: "Ficha de manejo, solución nutritiva y trazabilidad del cultivo",
    creator: "Hidropónico",
    styles: {
      default: {
        document: {
          run: { font: FUENTE, size: 21, color: COLORES.tinta },
          paragraph: { spacing: { after: 120, line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: "FichaKicker",
          name: "Ficha kicker",
          basedOn: "Normal",
          run: { font: FUENTE, size: 16, bold: true, color: COLORES.verde },
          paragraph: { spacing: { after: 100 } },
        },
        {
          id: estilos.titulo,
          name: "Ficha title",
          basedOn: "Normal",
          run: { font: FUENTE, size: 34, bold: true, color: COLORES.tinta },
          paragraph: { spacing: { after: 80, line: 360 }, keepNext: true },
        },
        {
          id: estilos.subtitulo,
          name: "Ficha subtitle",
          basedOn: "Normal",
          run: { font: FUENTE, size: 22, italics: true, color: COLORES.gris },
          paragraph: { spacing: { after: 130 }, keepNext: true },
        },
        {
          id: "FichaIntroduccion",
          name: "Ficha introduction",
          basedOn: "Normal",
          run: { font: FUENTE, size: 21, color: COLORES.gris },
          paragraph: { spacing: { after: 170, line: 290 } },
        },
        {
          id: estilos.seccion,
          name: "Ficha section",
          basedOn: "Normal",
          run: { font: FUENTE, size: 24, bold: true, color: COLORES.tinta },
          paragraph: { spacing: { before: 250, after: 100, line: 280 }, keepNext: true },
        },
        {
          id: estilos.cuerpo,
          name: "Ficha body",
          basedOn: "Normal",
          run: { font: FUENTE, size: 21, color: COLORES.tinta },
          paragraph: { spacing: { after: 120, line: 290 } },
        },
        {
          id: estilos.nota,
          name: "Ficha note",
          basedOn: "Normal",
          run: { font: FUENTE, size: 17, italics: true, color: COLORES.gris },
          paragraph: { spacing: { after: 120, line: 250 } },
        },
        {
          id: estilos.tabla,
          name: "Ficha table",
          basedOn: "Normal",
          run: { font: FUENTE, size: 18, color: COLORES.tinta },
          paragraph: { spacing: { after: 0, line: 240 } },
        },
        {
          id: estilos.tablaCabecera,
          name: "Ficha table header",
          basedOn: "Normal",
          run: { font: FUENTE, size: 18, bold: true, color: COLORES.blanco },
          paragraph: { spacing: { after: 0, line: 240 } },
        },
        {
          id: estilos.metricaEtiqueta,
          name: "Ficha metric label",
          basedOn: "Normal",
          run: { font: FUENTE, size: 16, color: COLORES.gris },
          paragraph: { spacing: { after: 40, line: 220 } },
        },
        {
          id: estilos.metricaValor,
          name: "Ficha metric value",
          basedOn: "Normal",
          run: { font: FUENTE, size: 23, bold: true, color: COLORES.verde },
          paragraph: { spacing: { after: 0, line: 260 } },
        },
        {
          id: estilos.viñeta,
          name: "Ficha bullet",
          basedOn: "Normal",
          run: { font: FUENTE, size: 21, color: COLORES.tinta },
          paragraph: { spacing: { after: 70, line: 280 }, indent: { left: 360, hanging: 180 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1100, right: 1273, bottom: 1100, left: 1273, header: 560, footer: 560 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  textoRun("HIDROPÓNICO", { bold: true, size: 16, color: COLORES.verde }),
                  textoRun(`  ·  ${definicion.nombre}`, { size: 16, color: COLORES.gris }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    font: FUENTE,
                    size: 16,
                    color: COLORES.gris,
                    children: ["Ficha informativa  ·  Página ", PageNumber.CURRENT],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(documento);
  const enlace = document.createElement("a");
  const url = URL.createObjectURL(blob);
  enlace.href = url;
  enlace.download = `ficha-${definicion.id}-${fechaParaArchivo(new Date())}.docx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
