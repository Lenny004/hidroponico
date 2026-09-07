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

describe("catálogo de plagas", () => {
  it("resuelve por id o nombre y ignora desconocidas", () => {
    expect(obtenerPlagaPorIdONombre("Pulgón")?.id).toBe("pulgon");
    expect(obtenerPlagaPorIdONombre("mosca_blanca")?.nombre).toBe("Mosca blanca");
    expect(obtenerPlagaPorIdONombre("alien")).toBeNull();
  });
});

