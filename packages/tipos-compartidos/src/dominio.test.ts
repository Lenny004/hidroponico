import { describe, expect, it } from "vitest";
import { aristaCreariaCiclo } from "./grafo-dag";
import { idsComponenteConexa } from "./componente-conexa";
import { crearNodoDesdePlantilla } from "./factory-nodo";
import {
  CATALOGO_CULTIVOS,
  copiarVariablesDePlantilla,
  obtenerCultivoPorId,
} from "./catalogo-cultivos";
import { CLAVES_VARIABLES_CULTIVO } from "./nodo-cultivo";
import { agregarCategoriaEnGrupo, agregarCategoriasPorGrupos, agregarMasaMineralEnGrupo, agregarOxigenoDisueltoEnGrupo } from "./agregar-grupos";
import { agregarPlagasEnGrupo } from "./agregar-plagas";
import { grafoTieneCiclo } from "./grafo-dag";
import { serializarGrafoConstruccion, validarGrafoPersistido } from "./grafo-persistido";
import { conteoPorTipo } from "./conteo-por-tipo";
import { normalizarPlagas, parsearNumeroONull } from "./parsear-valores";
import {
  construirProceso,
  diasDeVida,
  etapaSugeridaPorDias,
  parsearEtapaVida,
  parsearFechaInicio,
  progresoCosecha,
} from "./etapas-vida";
import { obtenerPlagaPorIdONombre } from "./catalogo-plagas";
import { resumenTrazabilidad } from "./resumen-trazabilidad";
import {
  fichasPlantados,
  formatearParInsumos,
  formatearReposicion,
  masaMineralesNodo,
  proyectarInsumos,
} from "./proyeccion-insumos";
import { fichaHoverDesdeCatalogo, fichaHoverDesdeNodo } from "./ficha-hover-cultivo";
import {
  ArbolPatricia,
  arbolPatriciaDeNodos,
  bitEnClave,
  clavePatricia,
  primerBitDistinto,
  vistaArbolPatricia,
  comprimirVistaPorTipo,
  hojasDeVista,
} from "./arbol-patricia";
import {
  consumoTemporalGrupo,
  consumoTemporalNodo,
  diasRestantesCosecha,
} from "./consumo-temporal";
import {
  FICHAS_NUTRICIONALES,
  aporteDiaPlanta,
  consolidarAporteDiarioHumano,
  mediaAritmetica,
  mediaPonderada,
  obtenerFichaNutricional,
  porcentajeValorDiario,
  porcentajesPorcionCatalogo,
} from "./index";
import { parsearCasoUso } from "./casos-uso";

describe("aristaCreariaCiclo", () => {
  it("rechaza un bucle sobre el mismo nodo", () => {
    expect(aristaCreariaCiclo([], "a", "a")).toBe(true);
  });

  it("rechaza C→A cuando ya existe A→B→C", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "b", destinoId: "c" },
    ];
    expect(aristaCreariaCiclo(aristas, "c", "a")).toBe(true);
  });

  it("permite A→C cuando solo existe A→B", () => {
    const aristas = [{ origenId: "a", destinoId: "b" }];
    expect(aristaCreariaCiclo(aristas, "a", "c")).toBe(false);
  });

  it("permite un diamante acíclico y rechaza el cierre del ciclo", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "a", destinoId: "c" },
      { origenId: "b", destinoId: "d" },
      { origenId: "c", destinoId: "d" },
    ];
    expect(aristaCreariaCiclo(aristas, "b", "c")).toBe(false);
    expect(aristaCreariaCiclo(aristas, "d", "a")).toBe(true);
  });
});

describe("idsComponenteConexa", () => {
  it("agrupa nodos unidos sin importar la dirección de la arista", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "c", destinoId: "d" },
    ];
    expect(idsComponenteConexa(aristas, "b").sort()).toEqual(["a", "b"]);
    expect(idsComponenteConexa(aristas, "c").sort()).toEqual(["c", "d"]);
  });
});

describe("crearNodoDesdePlantilla", () => {
  it("copia mg/L y litros de la plantilla, no null", () => {
    const nodo = crearNodoDesdePlantilla("lechuga", "n1");
    const plantilla = obtenerCultivoPorId("lechuga")?.plantilla;
    expect(nodo?.tipoCultivo).toBe("lechuga");
    expect(CLAVES_VARIABLES_CULTIVO).toHaveLength(6);
    expect(nodo?.variables).toEqual(plantilla);
    expect(nodo?.variables.mineral_potasio).toBe(235);
    expect(nodo?.variables.cantidad_sol).toBe(4);
    expect(nodo?.variables.oxigeno).toBe(6);
    expect(nodo?.plagas).toBeNull();
    expect(nodo?.etapa_vida).toBeNull();
    expect(nodo?.iniciado_en).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("cubre los 10 cultivos con las 6 variables en número finito", () => {
    expect(CATALOGO_CULTIVOS).toHaveLength(10);
    for (const cultivo of CATALOGO_CULTIVOS) {
      for (const clave of CLAVES_VARIABLES_CULTIVO) {
        expect(Number.isFinite(cultivo.plantilla[clave])).toBe(true);
      }
      expect(cultivo.proceso.dias_cosecha).toBeGreaterThan(0);
      expect(cultivo.reposicion_dia_L).toBeGreaterThan(0);
      expect(cultivo.reposicion_dia_L).toBeLessThan(cultivo.plantilla.cantidad_sol);
      expect(cultivo.proceso.etapas.length).toBeGreaterThan(0);
      expect(cultivo.plagas_tipicas.length).toBeGreaterThan(0);
    }
  });

  it("usa receta de fruto distinta a la de hoja", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1");
    const tomate = crearNodoDesdePlantilla("tomate", "n2");
    expect(lechuga?.variables.mineral_potasio).toBe(235);
    expect(tomate?.variables.mineral_potasio).toBe(350);
    expect(tomate?.variables.cantidad_sol).toBe(8);
  });

  it("no comparte la referencia de la plantilla del catálogo", () => {
    const nodo = crearNodoDesdePlantilla("lechuga", "n1");
    expect(nodo).not.toBeNull();
    if (!nodo) {
      return;
    }
    nodo.variables.mineral_magnesio = 99;
    expect(obtenerCultivoPorId("lechuga")?.plantilla.mineral_magnesio).toBe(48.6);
    expect(copiarVariablesDePlantilla("lechuga")?.mineral_magnesio).toBe(48.6);
  });

  it("rechaza un tipo que no está en el catálogo", () => {
    expect(crearNodoDesdePlantilla("banano", "n1")).toBeNull();
    expect(copiarVariablesDePlantilla("banano")).toBeNull();
  });
});

describe("parsearNumeroONull", () => {
  it("trata vacío e inválido como null, no como 0", () => {
    expect(parsearNumeroONull("")).toBeNull();
    expect(parsearNumeroONull("  ")).toBeNull();
    expect(parsearNumeroONull("abc")).toBeNull();
  });

  it("acepta 0 explícito y decimales con coma", () => {
    expect(parsearNumeroONull("0")).toBe(0);
    expect(parsearNumeroONull("12,5")).toBe(12.5);
  });
});

describe("normalizarPlagas", () => {
  it("devuelve null si no queda ningún nombre", () => {
    expect(normalizarPlagas([])).toBeNull();
    expect(normalizarPlagas(["  ", ""])).toBeNull();
    expect(normalizarPlagas(null)).toBeNull();
  });

  it("elimina duplicados conservando el primero", () => {
    expect(normalizarPlagas(["Pulgón", "pulgón", "Araña"])).toEqual([
      "Pulgón",
      "Araña",
    ]);
  });
});

describe("agregarCategoriaEnGrupo", () => {
  it("suma litros cuando todos tienen número, incluido 0", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { cantidad_sol: 4 } },
      { id: "b", tipoCultivo: "lechuga", variables: { cantidad_sol: 0 } },
    ];
    expect(agregarCategoriaEnGrupo(nodos, "cantidad_sol")).toEqual({
      categoria: "cantidad_sol",
      total: 4,
      invalidadoPorNull: false,
    });
  });

  it("deja el grupo en null si un nodo no tiene el dato", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { cantidad_sol: 4 } },
      { id: "b", tipoCultivo: "tomate", variables: { cantidad_sol: null } },
    ];
    expect(agregarCategoriaEnGrupo(nodos, "cantidad_sol").total).toBeNull();
  });
});

describe("agregarMasaMineralEnGrupo", () => {
  it("calcula mg = mg/L × L y no suma concentraciones", () => {
    const nodos = [
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, cantidad_sol: 4 },
      },
      {
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, cantidad_sol: 4 },
      },
    ];
    const agregado = agregarMasaMineralEnGrupo(nodos, "mineral_magnesio");
    expect(agregado.masaMg).toBeCloseTo(388.8);
    expect(agregado.volumenL).toBe(8);
    expect(agregado.concentracionMgL).toBeCloseTo(48.6);
  });

  it("invalida si falta concentración o litros", () => {
    expect(
      agregarMasaMineralEnGrupo(
        [
          { id: "a", tipoCultivo: "lechuga", variables: { mineral_potasio: 235, cantidad_sol: 4 } },
          { id: "b", tipoCultivo: "lechuga", variables: { mineral_potasio: null, cantidad_sol: 4 } },
        ],
        "mineral_potasio",
      ).masaMg,
    ).toBeNull();
    expect(
      agregarMasaMineralEnGrupo(
        [
          { id: "a", tipoCultivo: "lechuga", variables: { mineral_hierro: 1, cantidad_sol: 4 } },
          { id: "b", tipoCultivo: "lechuga", variables: { mineral_hierro: 1, cantidad_sol: null } },
        ],
        "mineral_hierro",
      ).masaMg,
    ).toBeNull();
  });
});

describe("agregarOxigenoDisueltoEnGrupo", () => {
  it("usa el mínimo mg/L del tanque, no la suma", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { oxigeno: 6 } },
      { id: "b", tipoCultivo: "tomate", variables: { oxigeno: 5 } },
    ];
    expect(agregarOxigenoDisueltoEnGrupo(nodos).total).toBe(5);
  });

  it("queda null si falta un dato", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { oxigeno: 6 } },
      { id: "b", tipoCultivo: "tomate", variables: { oxigeno: null } },
    ];
    expect(agregarOxigenoDisueltoEnGrupo(nodos).total).toBeNull();
  });
});

describe("agregarCategoriasPorGrupos", () => {
  it("no mezcla minerales distintos y sigue si una categoría queda null", () => {
    const nodos = [
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 1, mineral_potasio: 5 },
      },
      {
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 2, mineral_potasio: null },
      },
      {
        id: "c",
        tipoCultivo: "tomate",
        variables: { mineral_magnesio: 9, mineral_potasio: 9 },
      },
    ];
    const aristas = [{ origenId: "a", destinoId: "b" }];
    const grupos = agregarCategoriasPorGrupos(nodos, aristas, [
      "mineral_magnesio",
      "mineral_potasio",
    ]);
    const grupoAb = grupos.find((grupo) => grupo.idsNodos.includes("a"));
    const grupoC = grupos.find((grupo) => grupo.idsNodos.includes("c"));
    expect(
      grupoAb?.categorias.find((item) => item.categoria === "mineral_magnesio")?.total,
    ).toBe(3);
    expect(
      grupoAb?.categorias.find((item) => item.categoria === "mineral_potasio")?.total,
    ).toBeNull();
    expect(
      grupoC?.categorias.find((item) => item.categoria === "mineral_potasio")?.total,
    ).toBe(9);
  });
});

describe("agregarPlagasEnGrupo", () => {
  it("une nombres y deja null si un nodo no tiene plagas", () => {
    const conDatos = agregarPlagasEnGrupo([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: {},
        plagas: ["Pulgón"],
        solucion_plagas: "aceite",
      },
      {
        id: "b",
        tipoCultivo: "tomate",
        variables: {},
        plagas: ["Mosca"],
        solucion_plagas: "aceite",
      },
    ]);
    expect(conDatos.plagas).toEqual(["Pulgón", "Mosca"]);
    expect(conDatos.solucion_plagas).toEqual(["aceite"]);

    const incompleto = agregarPlagasEnGrupo([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: {},
        plagas: ["Pulgón"],
        solucion_plagas: "aceite",
      },
      { id: "b", tipoCultivo: "tomate", variables: {}, plagas: null },
    ]);
    expect(incompleto.plagas).toBeNull();
    expect(incompleto.invalidadoPorNullPlagas).toBe(true);
  });
});

describe("conteoPorTipo", () => {
  it("cuenta nodos sin recorrer a mano", () => {
    const nodos = [
      { id: "1", tipoCultivo: "lechuga", variables: {} },
      { id: "2", tipoCultivo: "lechuga", variables: {} },
      { id: "3", tipoCultivo: "tomate", variables: {} },
    ];
    expect(conteoPorTipo(nodos)).toEqual({ lechuga: 2, tomate: 1 });
  });
});

describe("grafo persistido", () => {
  it("serializa el canvas sin color y rechaza ciclos", () => {
    const grafo = serializarGrafoConstruccion(
      [
        {
          id: "a",
          position: { x: 1, y: 2 },
          cultivo: {
            id: "a",
            tipoCultivo: "lechuga",
            variables: { mineral_magnesio: 3, mineral_potasio: null },
            plagas: [" Pulgón "],
            solucion_plagas: "  ",
          },
        },
      ],
      [{ id: "arista-a-b", origenId: "a", destinoId: "b" }],
    );
    expect(grafo.nodos[0]?.variables.mineral_magnesio).toBe(3);
    expect(grafo.nodos[0]?.plagas).toEqual(["Pulgón"]);
    expect(grafo.nodos[0]?.solucion_plagas).toBeNull();
    expect(grafo.nodos[0]?.etapa_vida).toBeNull();
    expect(grafo.nodos[0]?.iniciado_en).toBeNull();

    expect(grafoTieneCiclo([{ origenId: "a", destinoId: "b" }])).toBe(false);
    expect(
      grafoTieneCiclo([
        { origenId: "a", destinoId: "b" },
        { origenId: "b", destinoId: "a" },
      ]),
    ).toBe(true);

    const invalido = validarGrafoPersistido({
      nodos: [{ id: "a", tipoCultivo: "lechuga", variables: {} }],
      aristas: [{ id: "x", origenId: "a", destinoId: "fantasma" }],
    });
    expect(invalido.ok).toBe(false);
  });
});

describe("trazabilidad de vida", () => {
  it("cuenta días desde la fecha de alta y sugiere etapa", () => {
    expect(parsearFechaInicio("2026-09-07")).toBe("2026-09-07");
    expect(parsearFechaInicio("no-es-fecha")).toBeNull();
    expect(parsearEtapaVida("vegetativo")).toBe("vegetativo");
    expect(parsearEtapaVida("flor")).toBeNull();

    const ahora = new Date(2026, 8, 17);
    expect(diasDeVida("2026-09-07", ahora)).toBe(10);

    const proceso = construirProceso("hoja", 35, "test");
    expect(etapaSugeridaPorDias(proceso, 0)).toBe("germinacion");
    expect(etapaSugeridaPorDias(proceso, 15)).toBe("vegetativo");
    expect(etapaSugeridaPorDias(proceso, 40)).toBe("cosecha");
    expect(progresoCosecha(proceso, 35)).toBe(1);
  });

  it("usa etapa del nodo si existe y si no la sugerida", () => {
    const ahora = new Date(2026, 8, 21);
    const conEtapa = resumenTrazabilidad(
      { tipoCultivo: "lechuga", etapa_vida: "cosecha", iniciado_en: "2026-09-07" },
      ahora,
    );
    expect(conEtapa.dias).toBe(14);
    expect(conEtapa.etapa).toBe("cosecha");
    expect(conEtapa.etapaSugerida).toBe("vegetativo");

    const sinEtapa = resumenTrazabilidad(
      { tipoCultivo: "tomate", etapa_vida: null, iniciado_en: "2026-09-07" },
      ahora,
    );
    expect(sinEtapa.proceso?.familia).toBe("fruto");
    expect(sinEtapa.etapa).toBe(sinEtapa.etapaSugerida);
  });
});

describe("proyección de insumos", () => {
  it("calcula masa elemental de una lechuga (mg/L × L)", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1");
    expect(lechuga).not.toBeNull();
    expect(masaMineralesNodo(lechuga!)).toBeCloseTo((48.6 + 235 + 0.5 + 1) * 4);
  });

  it("deja masa en null si falta cantidad_sol o un mineral", () => {
    expect(
      masaMineralesNodo({
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, mineral_potasio: 235, mineral_manganeso: 0.5, mineral_hierro: 1, cantidad_sol: null },
      }),
    ).toBeNull();
    expect(
      masaMineralesNodo({
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, mineral_potasio: null, mineral_manganeso: 0.5, mineral_hierro: 1, cantidad_sol: 4 },
      }),
    ).toBeNull();
  });

  it("separa reserva del tanque y agua a reponer en 1, 7 y 30 días", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const tomate = crearNodoDesdePlantilla("tomate", "n2")!;
    const dia = proyectarInsumos([lechuga, tomate], 1);
    expect(dia.reservaL).toBe(12);
    expect(dia.reposicionL).toBeCloseTo(2.5);
    expect(dia.masaTanqueMg).toBeCloseTo((48.6 + 235 + 0.5 + 1) * 4 + (60 + 350 + 0.55 + 2) * 8);
    expect(dia.masaReposicionMg).toBeCloseTo((48.6 + 235 + 0.5 + 1) * 0.5 + (60 + 350 + 0.55 + 2) * 2);
    expect(dia.omitidos).toBe(0);
    expect(proyectarInsumos([lechuga, tomate], 7).reservaL).toBe(12);
    expect(proyectarInsumos([lechuga, tomate], 7).reposicionL).toBeCloseTo(17.5);
    expect(proyectarInsumos([lechuga, tomate], 30).reposicionL).toBeCloseTo(75);
  });

  it("omite nodos incompletos y no anula el resto", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const incompleto = {
      id: "x",
      tipoCultivo: "tomate",
      variables: { cantidad_sol: null },
    };
    const dia = proyectarInsumos([lechuga, incompleto], 1);
    expect(dia.reservaL).toBe(4);
    expect(dia.omitidos).toBe(1);
    expect(proyectarInsumos([], 7)).toEqual({
      reservaL: 0,
      reposicionL: 0,
      masaTanqueMg: 0,
      masaReposicionMg: 0,
      omitidos: 0,
    });
  });

  it("lista plantados y formatea el par L | mg", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const fichas = fichasPlantados([lechuga]);
    expect(fichas[0]?.nombre).toBe("Lechuga");
    expect(fichas[0]?.litros).toBe(4);
    expect(fichas[0]?.reposicionDiaL).toBe(0.5);
    expect(formatearParInsumos(39.2, 19200)).toBe("39.2 L | 19200 mg");
    expect(formatearParInsumos(null, null)).toBe("— L | — mg");
    expect(formatearReposicion(0.5, 142.55)).toBe("0.5 L/día | 142.55 mg/día");
  });
});

describe("ficha hover de cultivo", () => {
  it("arma la plantilla de lechuga con masa elemental", () => {
    const ficha = fichaHoverDesdeCatalogo("lechuga");
    expect(ficha?.nombre).toBe("Lechuga");
    expect(ficha?.litros).toBe(4);
    expect(ficha?.reposicionDiaL).toBe(0.5);
    expect(ficha?.minerales.find((item) => item.clave === "mineral_potasio")?.concentracion).toBe(235);
    expect(ficha?.masaTotalMg).toBeCloseTo((48.6 + 235 + 0.5 + 1) * 4);
    expect(fichaHoverDesdeCatalogo("no-existe")).toBeNull();
  });

  it("respeta null del nodo plantado", () => {
    const ficha = fichaHoverDesdeNodo({
      id: "n1",
      tipoCultivo: "tomate",
      variables: { mineral_hierro: 2, cantidad_sol: 8 },
    });
    expect(ficha.nombre).toBe("Tomate");
    expect(ficha.minerales.find((item) => item.clave === "mineral_hierro")?.masaMg).toBe(16);
    expect(ficha.minerales.find((item) => item.clave === "mineral_potasio")?.masaMg).toBeNull();
    expect(ficha.masaTotalMg).toBeNull();
  });
});

describe("árbol Patricia binario", () => {
  it("comparte prefijo y ramifica en el primer bit distinto", () => {
    expect(clavePatricia("lechuga", "n1")).toBe("lechuga/n1");
    expect(primerBitDistinto("lechuga/a", "lechuga/a")).toBeNull();
    expect(primerBitDistinto("aa", "ab")).toBeGreaterThanOrEqual(0);
    expect(bitEnClave("A", 0)).toBe(0);
    expect(bitEnClave("A", 1)).toBe(1);

    const arbol = new ArbolPatricia<string>();
    arbol.insertar("lechuga/n1", "a");
    arbol.insertar("lechuga/n2", "b");
    arbol.insertar("tomate/n3", "c");
    expect(arbol.buscar("lechuga/n2")).toBe("b");
    expect(arbol.buscar("fresa/x")).toBeNull();
    expect(arbol.hojas().map((hoja) => hoja.clave)).toEqual([
      "lechuga/n1",
      "lechuga/n2",
      "tomate/n3",
    ]);

    const raiz = arbol.obtenerRaiz();
    expect(raiz?.bit).not.toBeNull();
    const vista = vistaArbolPatricia(raiz, (valor, clave) => `${clave}:${valor}`);
    expect(vista?.esHoja).toBe(false);
    expect(vista?.hijos.length).toBeGreaterThan(0);
  });

  it("indexa nodos del grafo por tipo y deja el recambio en la hoja", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const tomate = crearNodoDesdePlantilla("tomate", "n2")!;
    const arbol = arbolPatriciaDeNodos([tomate, lechuga]);
    expect(arbol.buscar(clavePatricia("lechuga", "n1"))?.nombre).toBe("Lechuga");
    expect(arbol.buscar(clavePatricia("tomate", "n2"))?.masaDiaMg).toBeCloseTo(
      (60 + 350 + 0.55 + 2) * 8,
    );
  });

  it("comprime internos del mismo tipo a tipo → hojas", () => {
    const nodos = [
      crearNodoDesdePlantilla("lechuga", "n1")!,
      crearNodoDesdePlantilla("lechuga", "n2")!,
      crearNodoDesdePlantilla("tomate", "n3")!,
    ];
    const arbol = arbolPatriciaDeNodos(nodos);
    const cruda = vistaArbolPatricia(arbol.obtenerRaiz(), (hoja) => hoja.nombre);
    expect(cruda).not.toBeNull();
    const vista = comprimirVistaPorTipo(cruda!);
    expect(vista.esHoja).toBe(false);
    expect(hojasDeVista(vista)).toHaveLength(3);
    const grupos = vista.hijos.filter((hijo) => !hijo.esHoja || hijo.valor);
    const lechugas = grupos.filter((hijo) =>
      hojasDeVista(hijo).every((hoja) => hoja.valor?.tipoCultivo === "lechuga"),
    );
    expect(lechugas.length).toBeGreaterThanOrEqual(1);
    expect(hojasDeVista(lechugas[0]!).every((hoja) => hoja.esHoja)).toBe(true);
  });
});

describe("consumo temporal y recambio", () => {
  it("separa reserva del tanque y reposición diaria al unirse", () => {
    const ahora = new Date(2026, 8, 17);
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    lechuga.iniciado_en = "2026-09-07";
    const consumo = consumoTemporalNodo(lechuga, ahora);
    const masaTanque = (48.6 + 235 + 0.5 + 1) * 4;
    const masaReposicion = (48.6 + 235 + 0.5 + 1) * 0.5;
    expect(consumo.litros).toBe(4);
    expect(consumo.reposicionDiaL).toBe(0.5);
    expect(consumo.masaTanqueMg).toBeCloseTo(masaTanque);
    expect(consumo.masaDiaMg).toBeCloseTo(masaReposicion);
    expect(consumo.dias).toBe(10);
    expect(consumo.dias_restantes).toBe(25);
    expect(consumo.reposicionHastaCosechaL).toBeCloseTo(12.5);
    expect(consumo.masaHastaCosechaMg).toBeCloseTo(masaReposicion * 25);
    expect(consumo.etapas.reduce((acum, etapa) => acum + etapa.duracionDias, 0)).toBe(35);
    expect(consumo.minerales.find((item) => item.clave === "mineral_potasio")?.masaRecambioMg).toBe(
      235 * 4,
    );
    expect(consumo.minerales.find((item) => item.clave === "mineral_potasio")?.masaReposicionMg).toBe(
      235 * 0.5,
    );

    const tomate = crearNodoDesdePlantilla("tomate", "n2")!;
    const grupo = consumoTemporalGrupo([lechuga, tomate]);
    expect(grupo.litros).toBe(12);
    expect(grupo.reposicionDiaL).toBeCloseTo(2.5);
    expect(grupo.masaTanqueMg).toBeCloseTo(masaTanque + (60 + 350 + 0.55 + 2) * 8);
    expect(grupo.masaDiaMg).toBeCloseTo(masaReposicion + (60 + 350 + 0.55 + 2) * 2);
    expect(grupo.omitidos).toBe(0);
    expect(diasRestantesCosecha(40, 35)).toBe(0);
    expect(diasRestantesCosecha(null, 35)).toBeNull();
  });

  it("omite un nodo incompleto al sumar el tubo", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const incompleto = {
      id: "x",
      tipoCultivo: "tomate",
      variables: { cantidad_sol: null },
    };
    const grupo = consumoTemporalGrupo([lechuga, incompleto]);
    expect(grupo.litros).toBe(4);
    expect(grupo.omitidos).toBe(1);
    expect(consumoTemporalGrupo([]).masaDiaMg).toBe(0);
  });
});

describe("referencia diaria y consolidado humano", () => {
  it("convierte cantidad a % del valor diario y respeta null", () => {
    expect(porcentajeValorDiario(90, "vitamina_c")).toBe(100);
    expect(porcentajeValorDiario(null, "vitamina_c")).toBeNull();
    expect(mediaAritmetica([10, 20, null])).toBe(15);
    expect(mediaAritmetica([null, undefined])).toBeNull();
    expect(mediaPonderada([
      { valor: 10, peso: 1 },
      { valor: 30, peso: 3 },
    ])).toBe(25);
    expect(mediaPonderada([{ valor: 10, peso: 0 }])).toBeNull();
  });

  it("tiene ficha USDA para los 10 cultivos y omite tipos desconocidos", () => {
    expect(FICHAS_NUTRICIONALES).toHaveLength(10);
    expect(obtenerFichaNutricional("lechuga")?.nombre_cientifico).toBe("Lactuca sativa");
    expect(obtenerFichaNutricional("no-existe")).toBeNull();
    const c100 = porcentajesPorcionCatalogo("lechuga")?.vitamina_k;
    expect(c100).toBeGreaterThan(100);
    expect(aporteDiaPlanta("lechuga", "vitamina_c")).toBeCloseTo(9.2 * 0.05);
  });

  it("media aritmética y ponderado difieren con pesos distintos", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const tomate = crearNodoDesdePlantilla("tomate", "n2")!;
    const vacio = consolidarAporteDiarioHumano([]);
    expect(vacio.gramosDia).toBe(0);
    expect(vacio.metricas[0]?.mediaAritmeticaPct).toBeNull();

    const una = consolidarAporteDiarioHumano([lechuga]);
    const vitC = una.metricas.find((item) => item.clave === "vitamina_c");
    expect(una.gramosDia).toBe(5);
    expect(vitC?.mediaAritmeticaPct).toBeCloseTo(vitC?.ponderadoPct ?? 0);

    const mixto = consolidarAporteDiarioHumano([lechuga, tomate]);
    const metrica = mixto.metricas.find((item) => item.clave === "vitamina_c");
    expect(mixto.gramosDia).toBe(30);
    expect(metrica?.mediaAritmeticaPct).not.toBeNull();
    expect(metrica?.ponderadoPct).not.toBeNull();
    expect(metrica?.mediaAritmeticaPct).not.toBeCloseTo(metrica?.ponderadoPct ?? 0);
    expect(mixto.omitidos).toBe(0);
  });

  it("omite un tipo sin ficha y parsea casos de uso", () => {
    const lechuga = crearNodoDesdePlantilla("lechuga", "n1")!;
    const mixto = consolidarAporteDiarioHumano([
      lechuga,
      { id: "x", tipoCultivo: "desconocido" },
    ]);
    expect(mixto.omitidos).toBe(1);
    expect(mixto.gramosDia).toBe(5);
    expect(parsearCasoUso("agroservicio")).toBe("agroservicio");
    expect(parsearCasoUso("no")).toBeNull();
  });
});

describe("catálogo de plagas", () => {
  it("resuelve por id o nombre y ignora desconocidas", () => {
    expect(obtenerPlagaPorIdONombre("Pulgón")?.id).toBe("pulgon");
    expect(obtenerPlagaPorIdONombre("mosca_blanca")?.nombre).toBe("Mosca blanca");
    expect(obtenerPlagaPorIdONombre("alien")).toBeNull();
  });
});

